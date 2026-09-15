import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sip-n-scoop/checkout")({
  head: () => ({
    meta: [{ title: "Sip n Scoop — Coming Soon | Tripathi" }],
  }),
  component: SipNScoopCheckoutPaused,
});

function SipNScoopCheckoutPaused() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-4xl items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-[2rem] border bg-card p-8 text-center shadow-card sm:p-12">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent">
          <Clock3 className="h-7 w-7" />
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Sip n Scoop</p>
        <h1 className="mt-2 font-display text-4xl font-black">Coming Soon</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Sip n Scoop ordering and checkout are temporarily paused while we finish the experience. Restaurant ordering is available as usual.
        </p>
        <Button asChild size="lg" className="mt-7 rounded-full px-8 font-black">
          <Link to="/menu">Order Restaurant Food</Link>
        </Button>
      </div>
    </div>
  );
}
