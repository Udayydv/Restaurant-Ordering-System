import { createFileRoute, Link } from "@tanstack/react-router";

import heroImage from "@/assets/hero-collage.jpg";
import { Button } from "@/components/ui/button";
import { restaurant, trustBadges, whyDirect } from "@/data/restaurant";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Tripathi Restaurant & Caterers" },
      {
        name: "description",
        content:
          "Tripathi Restaurant & Caterers serves 100% pure vegetarian, freshly prepared, hygienic food with ghar jaisa swad.",
      },
      { property: "og:title", content: "About Tripathi Restaurant & Caterers" },
      {
        property: "og:description",
        content: "Pure veg, freshly prepared, hygienic — ghar jaisa swad since day one.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {restaurant.legalName}
        </p>
        <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
          Ghar Jaisa Swad, Ab Ghar Tak
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {restaurant.brandName} is a 100% pure vegetarian kitchen. Every dish is cooked only
          after you order it — no pre-packed food, no shortcuts. From a simple Ghar Ki Thali to a
          full Super Deluxe Thali, from Chole Bhature to Paneer Butter Masala, we cook the way
          food is cooked at home: fresh masalas, clean oil and generous portions.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Alongside the restaurant, we run a full catering service for birthdays, kitty parties,
          office functions and family gatherings — cooked fresh and served hot at your doorstep.
        </p>
      </header>

      <img
        src={heroImage}
        alt="Spread of freshly prepared Indian vegetarian dishes"
        className="mt-8 h-64 w-full rounded-4xl object-cover shadow-card sm:h-80"
      />

      <div className="mt-8 flex flex-wrap gap-3">
        {trustBadges.map((b) => (
          <span
            key={b.label}
            className="rounded-full border bg-card px-4 py-2 text-sm font-bold shadow-soft"
          >
            {b.icon} {b.label}
          </span>
        ))}
      </div>

      <h2 className="mt-12 font-display text-2xl font-extrabold">What we promise</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {whyDirect.map((w) => (
          <div key={w.title} className="rounded-3xl border bg-card p-5 shadow-soft">
            <span className="text-3xl">{w.icon}</span>
            <h3 className="mt-3 font-display text-lg font-bold">{w.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{w.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild size="lg" className="rounded-full px-7 font-bold">
          <Link to="/menu">See the Menu</Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="rounded-full px-7 font-bold">
          <Link to="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  );
}
