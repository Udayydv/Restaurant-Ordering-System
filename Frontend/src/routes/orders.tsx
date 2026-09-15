import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAuthToken, useAuth } from "@/lib/auth";
import { API_URL } from "@/lib/api-config";
import { getSocket, ensureUserSocketRoom } from "@/lib/socket";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Tripathi Veg Restaurant" },
      {
        name: "description",
        content: "Track your current orders and browse your full order history.",
      },
    ],
  }),
  component: OrdersPage,
});

type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type ServerOrder = {
  _id: string;
  orderNumber?: string;
  createdAt: string;
  orderStatus: OrderStatus;
  totalAmount: number;
  orderMode: "delivery" | "pickup";
  orderType?: "restaurant" | "sip-n-scoop";
  items: { name: string; quantity: number; itemTotal: number; section?: "restaurant" | "sip-n-scoop" }[];
};

const statusStyles: Record<OrderStatus, string> = {
  placed: "bg-saffron/20 text-saffron-foreground",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-amber-100 text-amber-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-leaf/20 text-leaf",
  cancelled: "bg-muted text-muted-foreground",
};

const statusLabels: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function dateKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function OrdersPage() {
  const { user, setLoginOpen } = useAuth();
  const [orders, setOrders] = useState<ServerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setOrders([]);
    setLoading(Boolean(userId));
    if (!userId) return;
    const token = getAuthToken();
    if (!token) { setLoading(false); return; }
    const loadOrders = async () => {
      try {
        const response = await fetch(API_URL + "/orders/my-orders", {
          headers: { Authorization: "Bearer " + token }, signal: controller.signal,
        });
        const data = await response.json();
        if (!cancelled && response.ok && data.success) setOrders(data.orders || []);
      } catch (error) {
        if (!cancelled) console.error("Load orders error:", error);
      } finally { if (!cancelled) setLoading(false); }
    };
    const socket = getSocket();
    ensureUserSocketRoom(token);
    const refresh = () => { void loadOrders(); };
    const onStatusChanged = (payload: { _id: string; orderStatus: OrderStatus }) => {
      setOrders((prev) => prev.map((order) => order._id === payload._id ? { ...order, orderStatus: payload.orderStatus } : order));
    };
    refresh();
    socket.on("connect", refresh);
    socket.on("order:status-changed", onStatusChanged);
    return () => {
      cancelled = true; controller.abort();
      socket.off("connect", refresh);
      socket.off("order:status-changed", onStatusChanged);
    };
  }, [userId]);

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, ServerOrder[]>();

    for (const order of orders) {
      const key = dateKey(order.createdAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(order);
    }

    return Array.from(groups.entries());
  }, [orders]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-extrabold">
          You're not logged in
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Login to see your order history.
        </p>
        <Button
          className="mt-6 rounded-full px-7 font-bold"
          onClick={() => setLoginOpen(true)}
        >
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-3">
        <Package className="h-7 w-7 text-primary" />
        <h1 className="font-display text-3xl font-black">My Orders</h1>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Your full order history, grouped by day.
      </p>

      {loading ? (
        <p className="mt-10 text-center text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border bg-card p-10 text-center shadow-soft">
          <p className="text-muted-foreground">No orders yet.</p>
          <Link
            to="/menu"
            className="mt-4 inline-block font-bold text-primary hover:underline"
          >
            Browse the menu
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {groupedByDate.map(([date, dayOrders]) => (
            <section key={date}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {date}
              </h2>
              <div className="space-y-3">
                {dayOrders.map((o) => (
                  <div
                    key={o._id}
                    className="rounded-3xl border bg-card p-5 shadow-soft"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-display font-extrabold">{o.orderNumber || o._id}</span>
                        <span className="ml-2 rounded-full border px-2 py-0.5 text-[10px] font-black">{(o.orderType === "sip-n-scoop" || o.items.some((i) => i.section === "sip-n-scoop")) ? "🍨 SIP N SCOOP" : "🍽️ RESTAURANT"}</span>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[o.orderStatus]}`}
                      >
                        {statusLabels[o.orderStatus]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-display font-bold">₹{o.totalAmount}</p>
                      <span className="text-xs text-muted-foreground capitalize">
                        {o.orderMode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
