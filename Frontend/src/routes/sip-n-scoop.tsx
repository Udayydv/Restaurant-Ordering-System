import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sip-n-scoop")({
  head: () => ({
    meta: [
      { title: "Sip n Scoop — Coming Soon | Tripathi Veg Restaurant" },
      {
        name: "description",
        content: "Sip n Scoop is coming soon to Tripathi Veg Restaurant.",
      },
    ],
  }),
  component: SipNScoopComingSoonPage,
});

function SipNScoopComingSoonPage() {
  return (
    <div className="relative min-h-[calc(100vh-7rem)] overflow-hidden bg-slate-950 text-white">
      {/* A deliberately blurred preview keeps the feature visible without exposing unfinished ordering UI. */}
      <div className="absolute inset-0 scale-105 select-none opacity-55 blur-[10px]" aria-hidden="true">
        <div className="absolute -left-20 top-8 h-80 w-80 rounded-full bg-fuchsia-500/30" />
        <div className="absolute -right-20 top-28 h-80 w-80 rounded-full bg-cyan-400/20" />
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-[2.5rem] border border-white/15 bg-white/10 p-8 sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-200">Tripathi presents</p>
            <h1 className="mt-3 font-display text-5xl font-black sm:text-7xl">Sip n Scoop</h1>
            <p className="mt-5 max-w-2xl text-lg text-white/75">Ice creams, chilled drinks and water — a new experience is on the way.</p>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {['🍦 Ice Creams', '🥤 Cold Drinks', '💧 Chilled Water', '🍨 Frozen Treats'].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/10 p-6 text-center font-bold">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-16 backdrop-blur-[2px]">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/20 bg-slate-950/75 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10">
            <Clock3 className="h-8 w-8 text-fuchsia-200" />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-fuchsia-200">Sip n Scoop</p>
          <h1 className="mt-2 font-display text-4xl font-black sm:text-5xl">Coming Soon</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/70 sm:text-base">
            We are getting Sip n Scoop ready for you. Until then, restaurant food ordering continues normally without any changes.
          </p>
          <Button asChild size="lg" className="mt-7 rounded-full px-8 font-black">
            <Link to="/menu">Order Food</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
