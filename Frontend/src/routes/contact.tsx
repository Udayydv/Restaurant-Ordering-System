import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { restaurant, telHref } from "@/data/restaurant";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Location — Tripathi Veg Restaurant" },
      {
        name: "description",
        content:
          "Call Tripathi Veg Restaurant on 9695968758 or 8853281356 for orders, catering and table bookings. Open daily.",
      },
      { property: "og:title", content: "Contact Tripathi Veg Restaurant" },
      {
        property: "og:description",
        content: "Call, WhatsApp or visit us for pure veg food and catering.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-black sm:text-4xl">Contact Us</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Call us directly for orders, bulk catering or any question about the menu.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {restaurant.phones.map((p) => (
          <a
            key={p}
            href={telHref(p)}
            className="flex items-center gap-4 rounded-3xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Phone className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Call to order
              </span>
              <span className="block font-display text-xl font-extrabold">{p}</span>
            </span>
          </a>
        ))}

        <a
          href={`https://wa.me/91${restaurant.phones[0]}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-3xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-leaf text-primary-foreground">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              WhatsApp
            </span>
            <span className="block font-display text-xl font-extrabold">Chat with us</span>
          </span>
        </a>

        <div className="flex items-center gap-4 rounded-3xl border bg-card p-5 shadow-soft">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary">
            <Clock className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Opening hours
            </span>
            <span className="block font-semibold">{restaurant.openingHours}</span>
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border bg-card p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-display text-lg font-bold">Visit the restaurant</p>
            <p className="mt-1 text-sm text-muted-foreground">{restaurant.address}</p>
            <Button asChild variant="secondary" className="mt-4 rounded-full font-bold">
              <a href={restaurant.mapsUrl} target="_blank" rel="noreferrer">
                Open in Google Maps
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
