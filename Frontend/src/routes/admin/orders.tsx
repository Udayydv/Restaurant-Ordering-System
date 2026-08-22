import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/auth";
import { getSocket } from "@/lib/socket";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type Order = {
  _id: string;
  orderNumber?: string;
  createdAt: string;
  orderStatus: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  notes?: string;

  items: {
    name: string;
    price: number;
    priceType: string;
    quantity: number;
    itemTotal: number;
  }[];

  user?: {
    _id: string;
    name?: string;
    phone?: string;
  };

  address: {
    name: string;
    phone: string;
    addressLine: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
};

import { API_URL } from "@/lib/api-config";

const STATUS_OPTIONS: OrderStatus[] = [
  "placed",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | OrderStatus
  >("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null,
  );
  const [view, setView] = useState<"live" | "history">("live");

  const loadOrders = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error("Admin authentication required");
      }

      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch orders");
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error("Orders error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch orders",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();

    /*
     * Live updates: a brand-new order appears at the top of the list
     * instantly (with a "NEW" badge — see OrderCard), and a status
     * change made from another admin device/tab reflects here too,
     * without needing a manual refresh.
     */
    const socket = getSocket();
    socket.emit("join:admin");

    const onNewOrder = (incoming: { _id: string }) => {
      // Don't have the full order shape from the socket payload —
      // simplest correct approach is to just refetch the list.
      loadOrders(true);
      void incoming;
    };

    const onOrderUpdated = (payload: { _id: string; orderStatus: OrderStatus }) => {
      setOrders((current) =>
        current.map((order) =>
          order._id === payload._id
            ? { ...order, orderStatus: payload.orderStatus }
            : order,
        ),
      );
    };

    socket.on("orders:new", onNewOrder);
    socket.on("orders:updated", onOrderUpdated);

    return () => {
      socket.off("orders:new", onNewOrder);
      socket.off("orders:updated", onOrderUpdated);
    };
  }, []);

  const updateStatus = async (
    orderId: string,
    status: OrderStatus,
  ) => {
    try {
      setUpdatingOrderId(orderId);

      const token = getAuthToken();

      if (!token) {
        throw new Error("Admin authentication required");
      }

      const response = await fetch(
        `${API_URL}/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update order status",
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: status,
                ...(data.order || {}),
              }
            : order,
        ),
      );
    } catch (err) {
      console.error("Status update error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        order.orderStatus === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const customerName =
        order.user?.name ||
        order.address?.name ||
        "";

      const customerPhone =
        order.user?.phone ||
        order.address?.phone ||
        "";

      const orderNumber =
        order.orderNumber ||
        order._id;

      return (
        orderNumber.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerPhone.includes(query)
      );
    });
  }, [orders, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      placed: orders.filter(
        (order) => order.orderStatus === "placed",
      ).length,
      confirmed: orders.filter(
        (order) => order.orderStatus === "confirmed",
      ).length,
      preparing: orders.filter(
        (order) => order.orderStatus === "preparing",
      ).length,
      out_for_delivery: orders.filter(
        (order) => order.orderStatus === "out_for_delivery",
      ).length,
      delivered: orders.filter(
        (order) => order.orderStatus === "delivered",
      ).length,
      cancelled: orders.filter(
        (order) => order.orderStatus === "cancelled",
      ).length,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="mt-4 text-muted-foreground">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-4 text-2xl font-bold">
            Unable to load orders
          </h1>

          <p className="mt-2 text-muted-foreground">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadOrders()}
            className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-extrabold">
              Orders
            </h1>

            <p className="mt-2 text-muted-foreground">
              Manage customer orders and update their status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="rounded-full border bg-background px-5 py-2.5 text-sm font-bold shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Live / History tabs */}
        <div className="mt-6 inline-flex rounded-full border bg-background p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setView("live")}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${
              view === "live"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Live Orders (Today)
          </button>
          <button
            type="button"
            onClick={() => setView("history")}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${
              view === "history"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            📅 History by Date
          </button>
        </div>

        {view === "history" ? (
          <OrderHistoryTab />
        ) : (
        <>
        {/* Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="All Orders"
            value={counts.all}
            onClick={() => setStatusFilter("all")}
            active={statusFilter === "all"}
          />

          <SummaryCard
            title="Placed"
            value={counts.placed}
            onClick={() => setStatusFilter("placed")}
            active={statusFilter === "placed"}
          />

          <SummaryCard
            title="Preparing"
            value={counts.preparing}
            onClick={() => setStatusFilter("preparing")}
            active={statusFilter === "preparing"}
          />

          <SummaryCard
            title="Delivered"
            value={counts.delivered}
            onClick={() => setStatusFilter("delivered")}
            active={statusFilter === "delivered"}
          />
        </div>

        {/* Search and filter */}
        <div className="mt-8 rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by order number, customer or phone..."
              className="h-11 flex-1 rounded-xl border bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-primary"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | OrderStatus,
                )
              }
              className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">
                All Statuses ({counts.all})
              </option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)} (
                  {counts[status]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result count */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {orders.length}
            </span>{" "}
            orders
          </p>
        </div>

        {/* Orders */}
        <div className="mt-4 space-y-5">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border bg-background p-12 text-center">
              <div className="text-5xl">📦</div>

              <h2 className="mt-4 text-xl font-bold">
                No orders found
              </h2>

              <p className="mt-2 text-muted-foreground">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                updating={updatingOrderId === order._id}
                onStatusChange={updateStatus}
              />
            ))
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  onClick,
  active,
}: {
  title: string;
  value: number;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border bg-background p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? "ring-2 ring-primary" : ""
      }`}
    >
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-3xl font-extrabold">
        {value}
      </p>
    </button>
  );
}

function OrderCard({
  order,
  updating,
  onStatusChange,
}: {
  order: Order;
  updating: boolean;
  onStatusChange: (
    orderId: string,
    status: OrderStatus,
  ) => void;
}) {
  const customerName =
    order.user?.name ||
    order.address?.name ||
    "Customer";

  const customerPhone =
    order.user?.phone ||
    order.address?.phone ||
    "No phone";

  return (
    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      {/* Top */}
      <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {order.orderStatus === "placed" && (
              <span className="animate-pulse rounded-lg bg-destructive px-2.5 py-1 text-xs font-black tracking-wide text-destructive-foreground">
                NEW
              </span>
            )}

            <h2 className="text-lg font-extrabold">
              #{order.orderNumber || order._id.slice(-8)}
            </h2>

            <StatusBadge status={order.orderStatus} />
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-sm text-muted-foreground">
            Total Amount
          </p>

          <p className="text-2xl font-extrabold">
            ₹{order.totalAmount}
          </p>
        </div>
      </div>

      {/* Customer */}
      <div className="grid gap-6 border-b p-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Customer
          </p>

          <p className="mt-2 font-bold">
            {customerName}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            📞 {customerPhone}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Delivery Address
          </p>

          <p className="mt-2 text-sm leading-6">
            {order.address.addressLine}
            {order.address.landmark
              ? `, ${order.address.landmark}`
              : ""}
            <br />
            {order.address.city}, {order.address.state} -{" "}
            {order.address.pincode}
          </p>
        </div>
      </div>

      {/* Customer note / special instructions */}
      {order.notes && (
        <div className="border-b bg-saffron/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            📝 Customer note
          </p>
          <p className="mt-2 text-sm font-medium">{order.notes}</p>
        </div>
      )}

      {/* Items */}
      <div className="border-b p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Order Items
        </p>

        <div className="mt-4 space-y-3">
          {order.items.map((item, index) => (
            <div
              key={`${order._id}-${index}`}
              className="flex items-center justify-between gap-4 rounded-xl bg-muted/40 p-3"
            >
              <div>
                <p className="font-semibold">
                  {item.name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {item.priceType !== "regular"
                    ? `${formatPriceType(item.priceType)} • `
                    : ""}
                  ₹{item.price} × {item.quantity}
                </p>
              </div>

              <p className="font-bold">
                ₹{item.itemTotal}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment + totals */}
      <div className="grid gap-6 border-b p-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Payment
          </p>

          <p className="mt-2 font-semibold">
            {order.paymentMethod === "pay_at_restaurant"
              ? "Pay at Restaurant"
              : order.paymentMethod === "upi_on_delivery"
                ? "UPI on Delivery"
                : order.paymentMethod}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Status: {formatPaymentStatus(order.paymentStatus)}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Subtotal
            </span>

            <span>₹{order.subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Delivery
            </span>

            <span>₹{order.deliveryCharge}</span>
          </div>

          <div className="flex justify-between border-t pt-2 text-base font-extrabold">
            <span>Total</span>

            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Status controls */}
      <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold">
            Update Order Status
          </p>

          <p className="text-xs text-muted-foreground">
            Changes are saved immediately.
          </p>
        </div>

        <select
          value={order.orderStatus}
          disabled={updating}
          onChange={(event) =>
            onStatusChange(
              order._id,
              event.target.value as OrderStatus,
            )
          }
          className="h-11 rounded-xl border bg-background px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  return (
    <span className="rounded-full border px-3 py-1 text-xs font-bold">
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    placed: "Placed",
    confirmed: "Confirmed",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return labels[status];
}

function formatPriceType(priceType: string) {
  if (priceType === "half") return "Half";
  if (priceType === "full") return "Full";
  return "";
}

function formatPaymentStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
 * Order history by date. Every order already stores its own
 * createdAt — "today" on the Live Orders tab and any past day here
 * both come from the exact same Order collection, just filtered
 * differently. So the dashboard naturally starts at zero every
 * midnight with no separate reset step, and a full day's totals stay
 * permanently available by picking that date here.
 */
function toDateInputValue(d: Date) {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(d.getTime() + IST_OFFSET_MS);
  return ist.toISOString().slice(0, 10);
}

type OrderHistoryResult = {
  count: number;
  revenue: number;
  statusCounts: Record<string, number>;
  orders: Order[];
};

function OrderHistoryTab() {
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrderHistoryResult | null>(null);

  const load = async (d: string) => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();
      if (!token) throw new Error("Admin authentication required");

      const response = await fetch(
        `${API_URL}/admin/orders/history?date=${d}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Read as text first — if the server returns an HTML error page
      // (e.g. a 404 from an old deploy that doesn't have this route
      // yet) response.json() would throw a confusing "Unexpected
      // token <" error. Reading as text first lets us surface the
      // real HTTP status instead.
      const rawText = await response.text();
      let data: Partial<OrderHistoryResult> & {
        success?: boolean;
        message?: string;
      } = {};

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Server returned an unexpected response (HTTP ${response.status}). ` +
            "This usually means the backend hasn't been redeployed with this feature yet.",
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          `${data.message || "Unable to fetch history"} (HTTP ${response.status})`,
        );
      }

      setResult(data as OrderHistoryResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to fetch history",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-background p-4 shadow-sm">
        <label className="text-sm font-bold" htmlFor="history-date">
          Pick a date
        </label>
        <input
          id="history-date"
          type="date"
          value={date}
          max={toDateInputValue(new Date())}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <p className="mt-8 text-center text-muted-foreground">Loading...</p>
      ) : error ? (
        <p className="mt-8 text-center text-destructive">{error}</p>
      ) : result ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Orders that day</p>
              <p className="mt-2 text-3xl font-extrabold">{result.count}</p>
            </div>
            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Total revenue</p>
              <p className="mt-2 text-3xl font-extrabold">
                ₹{result.revenue}
              </p>
            </div>
            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="mt-2 text-3xl font-extrabold">
                {result.statusCounts.delivered || 0}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {result.orders.length === 0 ? (
              <div className="rounded-2xl border bg-background p-12 text-center">
                <div className="text-5xl">📭</div>
                <h2 className="mt-4 text-xl font-bold">
                  No orders on this date
                </h2>
              </div>
            ) : (
              result.orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  updating={false}
                  onStatusChange={() => {}}
                />
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}