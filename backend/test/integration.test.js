import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import { createRequire } from "node:module";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Admin from "../src/models/Admin.js";
import Order from "../src/models/Order.js";
import Cart from "../src/models/Cart.js";
import Address from "../src/models/Address.js";
import Category from "../src/models/Category.js";
import SiteSettings from "../src/models/SiteSettings.js";
import { syncMenuDatabase } from "../src/services/menuSync.js";
import { initSocket } from "../src/socket.js";
import { randomBytes, randomUUID } from "node:crypto";

const uri = process.env.TEST_MONGO_URI;
test("isolated frontend/backend API regressions", { skip: !uri }, async (t) => {
  assert.match(uri, /^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/tripathi_test_[a-z_]+(?:\?|$)/, "Tests require an explicitly named local test database");
  process.env.JWT_SECRET = randomBytes(32).toString("hex");
  process.env.RESTAURANT_OPEN_TIME = "00:00";
  process.env.RESTAURANT_CLOSE_TIME = "00:00";
  process.env.ADMIN_PHONE = "9000000001";
  await mongoose.connect(uri);
  await syncMenuDatabase({ preserveOperationalFlags: true });
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  const server = http.createServer(app);
  const io = initSocket(server, app.get("allowedOrigins"));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => { await new Promise((resolve) => io.close(resolve)); server.closeAllConnections(); await mongoose.disconnect(); });
  const base = "http://127.0.0.1:" + server.address().port;
  const request = async (path, token, body, method = body ? "POST" : "GET", extraHeaders = {}) => {
    const response = await fetch(base + "/api" + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}), ...extraHeaders }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, data: await response.json(), headers: response.headers };
  };
  const signup = async (phone) => { const res = await request("/auth/register", null, { phone, name: "Test Customer", password: "TestSecret123" }); assert.equal(res.status, 201); return res.data; };
  let customer, admin, product, order;
  await t.test("API health, CORS, catalog and non-escalating registration", async () => {
    const health = await request("/health", null, null, "GET", { Origin: "http://localhost:8080" });
    assert.equal(health.status, 200); assert.equal(health.headers.get("access-control-allow-origin"), "http://localhost:8080");
    const catalog = await request("/products"); assert.equal(catalog.status, 200); assert.equal(catalog.data.products.length, 165);
    product = catalog.data.products.find((p) => p.section === "restaurant" && p.prices.regular > 0);
    admin = await signup(process.env.ADMIN_PHONE); assert.equal(admin.user.role, "customer");
    await User.updateOne({ _id: admin.user.id }, { role: "admin" });
    admin = (await request("/auth/login", null, { phone: process.env.ADMIN_PHONE, password: "TestSecret123" })).data;
    customer = await signup("9000000002");
    assert.ok([401,403].includes((await request("/admin/orders", customer.token)).status));
  });
  await t.test("admin alerts and date history route correctly, even with no orders", async () => {
    assert.equal((await request("/admin/me", admin.token)).status, 200);
    const alerts = await request("/admin/orders/alerts", admin.token); assert.equal(alerts.status, 200); assert.equal(alerts.data.cursor, "000000000000000000000000");
    assert.equal((await request("/admin/orders/history?date=2026-09-14", admin.token)).status, 200);
    assert.equal((await request("/admin/orders/history?date=2026-02-30", admin.token)).status, 400);
  });
  await t.test("profile changes persist, and role cannot be edited", async () => {
    const saved = await request("/auth/profile", customer.token, { name: "Saved Name", address: "Saved delivery address", role: "admin" }, "PATCH");
    assert.equal(saved.status, 200); const me = await request("/auth/me", customer.token);
    assert.equal(me.data.user.name, "Saved Name"); assert.equal(me.data.user.address, "Saved delivery address"); assert.equal(me.data.user.role, "customer");
  });
  const replace = async (quantity = 1, selected = product) => request("/cart", customer.token, { items: [{ productId: selected._id, priceType: "regular", quantity }] }, "PUT");
  await t.test("cart replacement validates before mutation and rejects stale checkout", async () => {
    const first = await replace(); assert.equal(first.status, 200);
    assert.equal(first.data.prices[0].price, product.prices.regular);
    const bad = await request("/cart", customer.token, { items: [{ productId: product._id, priceType: "regular", quantity: -1 }] }, "PUT"); assert.equal(bad.status, 400);
    assert.equal((await request("/cart", customer.token)).data.cart.items.length, 1);
    const newer = await replace(2);
    const stale = await request("/orders", customer.token, { orderMode: "pickup", cartVersion: first.data.cartVersion }); assert.equal(stale.status, 409);
    assert.ok(newer.data.cartVersion > first.data.cartVersion);
  });
  await t.test("maintenance blocks direct checkout", async () => {
    await request("/admin/settings", admin.token, { maintenanceMode: true }, "PATCH");
    assert.equal((await request("/orders", customer.token, { orderMode: "pickup" })).status, 503);
    await request("/admin/settings", admin.token, { maintenanceMode: false }, "PATCH");
  });
  await t.test("checkout retries create one order, and prices are server-authoritative", async () => {
    const cart = await replace(2); const key = randomUUID();
    const body = { orderMode: "pickup", cartVersion: cart.data.cartVersion, totalAmount: 1, deliveryCharge: 999 };
    const results = await Promise.all([request("/orders", customer.token, body, "POST", { "Idempotency-Key": key }), request("/orders", customer.token, body, "POST", { "Idempotency-Key": key })]);
    for (const result of results) assert.ok([200,201].includes(result.status), JSON.stringify(result));
    assert.equal(results[0].data.order._id, results[1].data.order._id);
    order = results[0].data.order; assert.equal(order.totalAmount, product.prices.regular * 2); assert.equal(order.deliveryCharge, 0);
    assert.equal(await Order.countDocuments({ user: customer.user.id }), 1);
  });
  await t.test("addresses reject ownership mutation; orders enforce account ownership", async () => {
    const created = await request("/addresses", customer.token, { name: "Test", phone: "9000000002", addressLine: "Test street", city: "Test", state: "Test", pincode: "242001" });
    assert.equal(created.status, 201);
    await replace();
    assert.equal((await request("/orders", customer.token, { orderMode: "delivery", addressId: created.data.address._id })).status, 400);
    const updated = await request("/addresses/" + created.data.address._id, customer.token, { user: admin.user.id, name: "Changed" }, "PUT"); assert.equal(updated.status, 200); assert.equal(String(updated.data.address.user), customer.user.id);
    const other = await signup("9000000003");
    assert.equal((await request("/orders/" + order._id, other.token)).status, 404);
  });
  await t.test("WELCOME50 cannot be used twice and database rejects racing redemptions", async () => {
    const cart = await replace(Math.ceil(399 / product.prices.regular));
    const placed = await request("/orders", customer.token, { orderMode: "pickup", cartVersion: cart.data.cartVersion, couponCode: "WELCOME50" }); assert.equal(placed.status, 201);
    assert.equal(placed.data.order.discountAmount, 50);
    await replace(Math.ceil(399 / product.prices.regular));
    assert.equal((await request("/orders", customer.token, { orderMode: "pickup", couponCode: "WELCOME50" })).status, 400);
    const duplicate = { ...placed.data.order }; delete duplicate._id; delete duplicate.__v; duplicate.cartSnapshot = randomUUID(); duplicate.orderNumber = randomUUID();
    await assert.rejects(Order.create(duplicate), (error) => error.code === 11000);
  });
  await t.test("Sip n Scoop range, price and delivery-only rules", async () => {
    const catalog = (await request("/products")).data.products; const sip = catalog.find((p) => p.section === "sip-n-scoop");
    await replace(1, sip);
    assert.equal((await request("/orders", customer.token, { orderMode: "pickup" })).status, 400);
    const address = await request("/addresses", customer.token, { name: "Test", phone: "9000000002", addressLine: "Test street", city: "Test", state: "Test", pincode: "242001", latitude: 27.85140844, longitude: 79.95466821 });
    const placed = await request("/orders", customer.token, { orderMode: "delivery", addressId: address.data.address._id }); assert.equal(placed.status, 201); assert.equal(placed.data.order.deliveryCharge, 10);
    const quote = await request("/addresses/delivery-quote?latitude=28&longitude=80&service=sip-n-scoop", customer.token); assert.equal(quote.data.deliverable, false);
  });
  await t.test("seed restart preserves category settings", async () => {
    const category = await Category.findOne(); await Category.updateOne({ _id: category._id }, { isActive: false, description: "Admin edit" });
    await syncMenuDatabase({ preserveOperationalFlags: true }); const after = await Category.findById(category._id);
    assert.equal(after.isActive, false); assert.equal(after.description, "Admin edit");
  });
  await t.test("customer receives status updates and leaves rooms", async () => {
    const require = createRequire(new URL("../../Frontend/package.json", import.meta.url)); const { io: clientIO } = require("socket.io-client");
    const socket = clientIO(base, { transports: ["polling"] });
    t.after(() => socket.disconnect());
    await new Promise((resolve) => socket.on("connect", resolve)); socket.emit("join:user", customer.token);
    const waitUntil = async (predicate) => { for (let i=0;i<100;i++) { if (predicate()) return; await new Promise((resolve)=>setTimeout(resolve,20)); } throw Error("Socket room timeout"); };
    await waitUntil(() => io.sockets.adapter.rooms.get("user-" + customer.user.id)?.size === 1);
    const event = new Promise((resolve) => socket.once("order:status-changed", resolve));
    assert.equal((await request("/admin/orders/" + order._id + "/status", admin.token, { status: "preparing" }, "PATCH")).status, 200);
    assert.equal((await event).orderStatus, "preparing");
    socket.emit("leave:user"); await waitUntil(() => !io.sockets.adapter.rooms.has("user-" + customer.user.id)); socket.disconnect();
  });
  await t.test("password changes revoke existing sessions and demotion revokes admin access", async () => {
    assert.equal((await request("/auth/change-password", customer.token, { currentPassword: "TestSecret123", newPassword: "ChangedSecret123" })).status, 200);
    assert.equal((await request("/auth/me", customer.token)).status, 401);
    await User.updateOne({ _id: admin.user.id }, { role: "customer" }); assert.ok([401,403].includes((await request("/admin/orders", admin.token)).status));
  });
});
