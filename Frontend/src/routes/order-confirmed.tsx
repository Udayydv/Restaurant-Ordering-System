import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { restaurant, telHref } from "@/data/restaurant";
import { getAuthToken } from "@/lib/auth";
import { API_URL } from "@/lib/api-config";

type ConfirmSearch = { id?: string | undefined };

export const Route = createFileRoute("/order-confirmed")({
  validateSearch: (search: Record<string, unknown>): ConfirmSearch => ({
    id: typeof search["id"] === "string" ? search["id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Order Confirmed — Tripathi Veg Restaurant" },
      {
        name: "description",
        content: "Your pure veg order is confirmed and is being freshly prepared.",
      },
      { property: "og:title", content: "Order Confirmed — Tripathi Veg Restaurant" },
      { property: "og:description", content: "Your food is being freshly prepared." },
    ],
  }),
  component: OrderConfirmed,
});

type ServerOrder = {
  _id: string;
  orderNumber?: string;
  items: { name: string; priceType: string; quantity: number; itemTotal: number }[];
  totalAmount: number;
  orderMode: "delivery" | "pickup";
  paymentMethod: "pay_at_restaurant" | "upi_on_delivery";
};

function OrderConfirmed() {
  const { id } = Route.useSearch();
  const [order, setOrder] = useState<ServerOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!cancelled && response.ok && data.success) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error("Load confirmed order error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-leaf" />
      <h1 className="mt-5 font-display text-3xl font-black">Order Confirmed!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thank you for ordering directly from {restaurant.brandName}. Your food is being freshly
        prepared right now.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading your order…</p>
      ) : order ? (
        <div className="mt-8 rounded-3xl border bg-card p-6 text-left shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Order ID
            </span>
            <span className="font-display font-extrabold">
              {order.orderNumber || order._id}
            </span>
          </div>
          <ul className="mt-4 space-y-2 border-t pt-4 text-sm">
            {order.items.map((i, idx) => (
              <li key={`${i.name}-${idx}`} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {i.name} ({i.priceType}) × {i.quantity}
                </span>
                <span className="shrink-0 font-semibold">₹{i.itemTotal}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 font-display text-lg font-extrabold">
            <span>
              Total{" "}
              {order.paymentMethod === "pay_at_restaurant"
                ? "(Pay at Restaurant)"
                : "(UPI on Delivery)"}
            </span>
            <span>₹{order.totalAmount}</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {order.orderMode === "delivery"
              ? "Home delivery — our rider will call you on arrival."
              : "Self pickup — we'll message you when it's ready."}
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="rounded-full px-7 font-bold">
          <Link to="/menu">Order Again</Link>
        </Button>
        <a
          href={telHref(restaurant.phones[0])}
          className="inline-flex items-center gap-2 rounded-full border px-7 py-2.5 text-sm font-bold hover:bg-muted"
        >
          <Phone className="h-4 w-4" />
          Call Restaurant
        </a>
      </div>
    </div>
  );
}
