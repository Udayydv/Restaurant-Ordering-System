import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Phone, Star } from "lucide-react";

import heroImage from "@/assets/hero-collage.jpg";
import cateringImage from "@/assets/catering-spread.jpg";
import { FoodCard } from "@/components/food/FoodCard";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/lib/catalog";
import { restaurant, reviews, telHref, trustBadges, whyDirect } from "@/data/restaurant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tripathi Veg Restaurant — Ghar Jaisa Swad, Ab Ghar Tak" },
      {
        name: "description",
        content:
          "Pure veg thalis, paneer specials, parathas, chinese & more from Tripathi Restaurant & Caterers. Order direct, save on your first order, and get nearby delivery.",
      },
      { property: "og:title", content: "Tripathi Veg Restaurant — Pure Veg Food Delivery" },
      {
        property: "og:description",
        content: "Freshly cooked pure vegetarian food delivered hot. Order direct and save.",
      },
    ],
  }),
  component: Home,
});

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        )}
        <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{title}</h2>
      </div>
      {action && (
        <Link
          to={action.to}
          className="shrink-0 text-sm font-bold text-primary hover:underline"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

function Home() {
  const { menu, categories } = useCatalog();
  const thaliItems = menu.filter((item) => item.categories.includes("thali")).slice(0, 4);
  const bestsellerItems = menu
    .filter((item) => item.tags?.includes("bestseller"))
    .slice(0, 8);
  const specialItems = menu
    .filter((item) => item.tags?.includes("special"))
    .slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Assorted Indian vegetarian dishes served at Tripathi Veg Restaurant"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/75 to-ink/40" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:py-28">
          <div className="max-w-2xl text-cream">
            <span className="inline-flex items-center gap-2 rounded-full bg-cream/15 px-3 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
              🥗 100% Pure Vegetarian
            </span>
            <h1 className="mt-5 font-display text-4xl font-black leading-[1.05] sm:text-6xl">
              {restaurant.brandName}
            </h1>
            <p className="mt-4 font-display text-xl font-bold text-saffron sm:text-2xl">
              {restaurant.tagline}
            </p>
            <p className="mt-3 max-w-lg text-sm text-cream/80 sm:text-base">
              {restaurant.subTagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7 text-base font-bold">
                <Link to="/menu">
                  Order Now <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-7 text-base font-bold"
              >
                <a href={telHref(restaurant.phones[0])}>
                  <Phone className="mr-1.5 h-4 w-4" /> Call to Order
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {trustBadges.map((b) => (
                <span key={b.label} className="text-sm font-semibold text-cream/90">
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FIRST ORDER OFFER */}
      <section className="border-b bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-background/90 p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                🎁 New customer offer
              </p>
              <h2 className="mt-1 font-display text-2xl font-black">
                Get ₹50 OFF above ₹399
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use coupon <span className="font-extrabold text-foreground">WELCOME50</span> at checkout. One use per account.
              </p>
            </div>
            <Button asChild className="shrink-0 rounded-full px-7 font-bold">
              <Link to="/menu">Order & Save ₹50</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="hide-scrollbar flex gap-3 overflow-x-auto">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/menu"
                search={{ category: c.id }}
                className="flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border bg-background px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-soft"
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[11px] font-bold">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SIP N SCOOP */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-card sm:px-10 sm:py-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest">
                Coming soon
              </span>
              <h2 className="mt-4 font-display text-3xl font-black sm:text-4xl">
                Sip n Scoop
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/75 sm:text-base">
                Ice creams, cold drinks and chilled water are coming soon. Restaurant food ordering remains available as usual.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white/10 px-3 py-2">🍦 50+ frozen treats</span>
                <span className="rounded-full bg-white/10 px-3 py-2">🥤 Cold Drinks</span>
                <span className="rounded-full bg-white/10 px-3 py-2">✨ Launching soon</span>
              </div>
            </div>
            <Button asChild size="lg" variant="secondary" className="relative rounded-full px-8 font-black">
              <Link to="/sip-n-scoop">Coming Soon</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading
          eyebrow="Most loved"
          title="Bestsellers"
          action={{ label: "See full menu", to: "/menu" }}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {bestsellerItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
        </div>
      </section>

      {/* THALIS */}
      <section className="bg-cream py-12">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Complete meals"
            title="Our Thalis"
            action={{ label: "All thalis", to: "/menu" }}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {thaliItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* TODAY'S SPECIAL */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading eyebrow="Chef picks" title="Today's Special" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {specialItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* WHY DIRECT */}
      <section className="bg-ink py-14 text-cream">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">
            Why order direct
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
            Better price for you. Better support for us.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyDirect.map((w) => (
              <div key={w.title} className="rounded-3xl bg-cream/10 p-5 backdrop-blur">
                <span className="text-3xl">{w.icon}</span>
                <h3 className="mt-3 font-display text-lg font-bold">{w.title}</h3>
                <p className="mt-1 text-sm text-cream/75">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATERING */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid items-center gap-8 overflow-hidden rounded-4xl border bg-card shadow-card lg:grid-cols-2">
          <img
            src={cateringImage}
            alt="Vegetarian catering buffet spread for parties and functions"
            className="h-64 w-full object-cover lg:h-full"
          />
          <div className="p-6 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Catering & parties
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
              Full veg catering starting ₹999 for 6 people
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Birthdays, kitty parties, office functions, family gatherings — we cook fresh and
              serve at your doorstep.
            </p>
            <Button asChild size="lg" className="mt-6 rounded-full px-7 font-bold">
              <Link to="/catering">Get a Catering Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-cream py-14">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading eyebrow="Happy customers" title="What people say" />
          <div className="grid gap-4 sm:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="rounded-3xl border bg-card p-6 shadow-soft">
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-saffron text-saffron" />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm text-muted-foreground">{r.text}</blockquote>
                <figcaption className="mt-4 font-display font-bold">{r.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="rounded-4xl bg-primary px-6 py-10 text-center text-primary-foreground sm:px-12">
          <h2 className="font-display text-2xl font-black sm:text-4xl">Hungry right now?</h2>
          <p className="mt-2 text-sm opacity-90 sm:text-base">
            Freshly cooked pure veg food, with nearby delivery starting at ₹5.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-full px-7 font-bold">
              <Link to="/menu">Order Online</Link>
            </Button>
            {restaurant.phones.map((p) => (
              <Button
                key={p}
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/40 bg-transparent px-7 font-bold text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <a href={telHref(p)}>
                  <Phone className="mr-1.5 h-4 w-4" /> {p}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
