import { createFileRoute } from "@tanstack/react-router";
import { Check, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import cateringImage from "@/assets/catering-spread.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  cateringMenu,
  cateringOccasions,
  cateringPackages,
  restaurant,
  telHref,
} from "@/data/restaurant";
import { API_URL } from "@/lib/api-config";
import { getAuthToken } from "@/lib/auth";

export const Route = createFileRoute("/catering")({
  head: () => ({
    meta: [
      { title: "Veg Catering for Parties & Events — Tripathi Restaurant & Caterers" },
      {
        name: "description",
        content:
          "Pure veg catering for birthdays, kitty parties, office functions and family gatherings. Packages from ₹999 for 6 people.",
      },
      { property: "og:title", content: "Veg Catering — Tripathi Restaurant & Caterers" },
      {
        property: "og:description",
        content: "Doorstep vegetarian catering from ₹999 for 6 people.",
      },
    ],
  }),
  component: CateringPage,
});

function CateringPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    guests: "",
    occasion: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !/^\d{10}$/.test(form.phone)) {
      toast.error("Please enter your name and a valid 10-digit mobile number");
      return;
    }

    /*
     * Send the enquiry to the backend so it shows up on the admin
     * dashboard in real time (via Socket.io), in addition to the
     * existing WhatsApp hand-off below.
     */
    try {
      setSubmitting(true);

      const token = getAuthToken();

      const response = await fetch(`${API_URL}/catering`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit enquiry");
      }
    } catch (error) {
      console.error("Catering enquiry error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit your enquiry. Please call us instead.",
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(false);

    const message = `Catering enquiry%0AName: ${form.name}%0APhone: ${form.phone}%0ADate: ${form.date}%0AGuests: ${form.guests}%0AOccasion: ${form.occasion}%0ANotes: ${form.notes}`;
    window.open(`https://wa.me/91${restaurant.phones[0]}?text=${message}`, "_blank");
    toast.success("Enquiry sent! Our team will reach out shortly.");
  };

  return (
    <div>
      <section className="relative overflow-hidden">
        <img
          src={cateringImage}
          alt="Vegetarian catering buffet with paneer, dal, rice and rotis"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/92 to-ink/50" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-cream sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">
            {restaurant.legalName}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-black sm:text-5xl">
            Pure Veg Catering for Every Celebration
          </h1>
          <p className="mt-4 max-w-xl text-sm text-cream/85 sm:text-base">
            Freshly cooked, hygienically served, delivered to your doorstep — starting at just
            ₹999 for 6 people.
          </p>
          <Button asChild size="lg" className="mt-7 rounded-full px-7 font-bold">
            <a href="#catering-enquiry">Get a Free Quote</a>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">We cater for</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cateringOccasions.map((o) => (
            <div
              key={o.label}
              className="rounded-2xl border bg-card p-4 text-center shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <span className="text-3xl">{o.icon}</span>
              <p className="mt-2 text-sm font-bold">{o.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Catering packages</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Indicative pricing — final quote depends on menu selection and location.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {(["standard", "premium"] as const).map((tier) => (
              <div key={tier} className="rounded-3xl border bg-card p-6 shadow-card">
                <h3 className="font-display text-xl font-extrabold capitalize">
                  {tier} Package
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tier === "standard"
                    ? "Dal, sabzi, rice, roti, salad & papad"
                    : "Paneer, kofta, pulao, raita, sweet & more"}
                </p>
                <ul className="mt-5 space-y-3">
                  {cateringPackages[tier].map((p) => (
                    <li
                      key={p.people}
                      className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3"
                    >
                      <span className="text-sm font-semibold">{p.people} people</span>
                      <span className="font-display text-lg font-extrabold">₹{p.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Popular catering menu</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cateringMenu.map((m) => (
            <li key={m} className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3">
              <Check className="h-4 w-4 shrink-0 text-leaf" />
              <span className="text-sm font-semibold">{m}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="catering-enquiry" className="mx-auto max-w-3xl scroll-mt-28 px-4 pb-16">
        <div className="rounded-4xl border bg-card p-6 shadow-card sm:p-10">
          <h2 className="font-display text-2xl font-extrabold">Get a catering quote</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill this in and we'll confirm your menu and price on WhatsApp or call.
          </p>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="c-name">Your name</Label>
              <Input id="c-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-phone">Mobile number</Label>
              <Input
                id="c-phone"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-date">Event date</Label>
              <Input
                id="c-date"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-guests">Number of guests</Label>
              <Input
                id="c-guests"
                inputMode="numeric"
                value={form.guests}
                onChange={(e) => set("guests", e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-occasion">Occasion</Label>
              <Input
                id="c-occasion"
                placeholder="Birthday, kitty party, office function…"
                value={form.occasion}
                onChange={(e) => set("occasion", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-notes">Menu preference / notes</Label>
              <Textarea
                id="c-notes"
                rows={4}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button type="submit" size="lg" className="rounded-full px-7 font-bold" disabled={submitting}>
                {submitting ? "Sending..." : "Send Enquiry"}
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-full px-7 font-bold">
                <a href={telHref(restaurant.phones[0])}>
                  <Phone className="mr-1.5 h-4 w-4" /> {restaurant.phones[0]}
                </a>
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
