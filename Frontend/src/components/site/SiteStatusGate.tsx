import { useEffect, useState, type ReactNode } from "react";
import { ChefHat, Clock, Wrench } from "lucide-react";

import { API_URL } from "@/lib/api-config";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/lib/auth";
import { restaurant } from "@/data/restaurant";

type PublicSettings = {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  isRestaurantOpen: boolean;
  openTime: string;
  closeTime: string;
};

function to12h(time: string) {
  const [hStr, m] = time.split(":");
  let h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
}

function MaintenancePage({ message }: { message: string }) {
  const { setLoginOpen } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-saffron/20 via-background to-leaf/10 px-4">
      <div className="max-w-lg text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-saffron/20 text-saffron-foreground shadow-soft">
          <Wrench className="h-12 w-12 animate-bounce text-primary" />
        </div>

        <h1 className="mt-8 font-display text-3xl font-black md:text-4xl">
          We'll be right back!
        </h1>

        <p className="mt-2 text-lg font-bold text-primary">
          Website Under Maintenance
        </p>

        <p className="mt-4 text-muted-foreground">{message}</p>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
          <ChefHat className="h-4 w-4" />
          <span>{restaurant.brandName}</span>
        </div>

        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="mt-6 text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Admin login
        </button>
      </div>
    </div>
  );
}

function ClosedPage({
  openTime,
  closeTime,
}: {
  openTime: string;
  closeTime: string;
}) {
  const { setLoginOpen } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-leaf/15 via-background to-saffron/15 px-4">
      <div className="max-w-lg text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-leaf/20 shadow-soft">
          <Clock className="h-12 w-12 text-leaf" />
        </div>

        <h1 className="mt-8 font-display text-3xl font-black md:text-4xl">
          We're closed right now
        </h1>

        <p className="mt-4 text-muted-foreground">
          Sorry for the inconvenience! Our kitchen is resting at the moment.
          Please place your order between{" "}
          <span className="font-bold text-foreground">
            {to12h(openTime)}
          </span>{" "}
          and{" "}
          <span className="font-bold text-foreground">
            {to12h(closeTime)}
          </span>
          , and we'll get it to you fresh and hot.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
          <ChefHat className="h-4 w-4" />
          <span>{restaurant.brandName}</span>
        </div>

        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="mt-6 text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Admin login
        </button>
      </div>
    </div>
  );
}

/*
 * Wraps the whole site. Fetches the public settings once on load and
 * subscribes to live "settings:changed" updates (so an admin flipping
 * maintenance mode on/off is reflected instantly for every visitor,
 * no refresh needed). Admins always pass through untouched — they
 * need access to the site (and the admin panel) specifically to turn
 * maintenance mode back off or manage orders outside hours.
 */
export function SiteStatusGate({ children }: { children: ReactNode }) {
  const { user, hydrated } = useAuth();
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);
        const data = await response.json();
        if (!cancelled && data.success) setSettings(data.settings);
      } catch (error) {
        console.error("Load site settings error:", error);
      }
    };

    load();

    const socket = getSocket();
    const onChanged = (partial: Partial<PublicSettings>) => {
      setSettings((prev) => (prev ? { ...prev, ...partial } : prev));
    };
    socket.on("settings:changed", onChanged);

    // Re-check the "is it open right now" flag every minute so the
    // closed page appears/disappears right at opening/closing time
    // without anyone needing to reload.
    const interval = setInterval(load, 60_000);

    return () => {
      cancelled = true;
      socket.off("settings:changed", onChanged);
      clearInterval(interval);
    };
  }, []);

  // Wait for auth to hydrate before deciding whether to bypass the
  // gate for an admin, so we don't flash the gate for a split second
  // on every load for a logged-in admin.
  if (!hydrated || !settings) {
    return <>{children}</>;
  }

  const isAdmin = user?.role === "admin";

  if (!isAdmin && settings.maintenanceMode) {
    return <MaintenancePage message={settings.maintenanceMessage} />;
  }

  if (!isAdmin && !settings.isRestaurantOpen) {
    return (
      <ClosedPage openTime={settings.openTime} closeTime={settings.closeTime} />
    );
  }

  return <>{children}</>;
}
