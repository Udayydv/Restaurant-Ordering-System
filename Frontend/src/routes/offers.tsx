import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { offers, restaurant } from "@/data/restaurant";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Deals — Tripathi Veg Restaurant" },
      {
        name: "description",
        content:
          "Live offers at Tripathi Veg Restaurant: catering from ₹999 for 6 people, flat ₹5 delivery and thali meals from ₹60.",
      },
      { property: "og:title", content: "Offers & Deals — Tripathi Veg Restaurant" },
      {
        property: "og:description",
        content: "Catering from ₹999, flat ₹5 delivery and thalis from ₹60.",
      },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Save more</p>
        <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">Offers & Deals</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ordering direct from {restaurant.brandName} always costs less than ordering through an
          app. Here's what's running right now.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {offers.map((o) => (
          <article
            key={o.title}
            className="flex flex-col rounded-3xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="text-4xl">{o.icon}</span>
            <h2 className="mt-4 font-display text-xl font-extrabold">{o.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{o.text}</p>
            <Button asChild className="mt-6 w-fit rounded-full px-6 font-bold">
              <Link to={o.cta.to}>{o.cta.label}</Link>
            </Button>
          </article>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Offers are subject to availability and may change without notice. Please confirm on call
        for large or custom orders.
      </p>
    </div>
  );
}
