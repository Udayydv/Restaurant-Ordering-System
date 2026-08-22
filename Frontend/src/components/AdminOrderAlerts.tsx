import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

import { getSocket } from "@/lib/socket";
import { getAuthToken, useAuth } from "@/lib/auth";

type IncomingOrder = {
  _id: string;
  orderNumber?: string;
  totalAmount: number;
  orderMode: "delivery" | "pickup";
  notes?: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
};

const ORIGINAL_TITLE = "Tripathi Veg Restaurant — Admin";

/*
 * A SINGLE, persistent AudioContext shared across every alert. This
 * matters: browsers suspend a freshly-created AudioContext unless
 * it's tied to a recent user click — creating a brand-new one for
 * every order (like the previous version did) meant only the very
 * first alert could actually make sound, and every alert after that
 * silently did nothing. Reusing one context (and explicitly resuming
 * it) fixes that, so it rings on every single order, not just the
 * first.
 */
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }
  return sharedAudioCtx;
}

/*
 * Plays a loud, attention-grabbing alert when a new order comes in —
 * a phone-style double-ring tone plus a spoken "New order!"
 * announcement — so an admin whose phone is in their pocket still
 * gets a strong audible cue as long as this admin tab is open. Also
 * flashes the browser tab title and shows a real OS-level
 * notification (if permission was granted) so it's noticeable even
 * if the admin is on a different tab.
 *
 * Note: a website cannot make a phone physically ring/vibrate like a
 * native call — this is the strongest equivalent achievable from the
 * browser without installing a native push-notification app.
 */
function playOrderAlert() {
  try {
    const ctx = getAudioContext();

    // Resume in case the browser suspended it (happens if there
    // hasn't been a click since the page loaded).
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const playBeep = (startTime: number, freq: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.value = freq;

      // Much louder peak (was 0.3, now near max headroom at 0.85)
      // with a fast attack so it cuts through immediately.
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.85, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    };

    // Phone-style "ring-ring... ring-ring" pattern, repeated twice,
    // over about 3.5 seconds — loud and unmistakable.
    const now = ctx.currentTime;
    const ringPattern = [0, 0.18, 0.9, 1.08, 2.0, 2.18, 2.9, 3.08];
    ringPattern.forEach((offset) => playBeep(now + offset, 1046, 0.16));
  } catch (error) {
    console.error("Order alert sound error:", error);
  }

  try {
    if ("speechSynthesis" in window) {
      // Cancel anything already queued so overlapping orders don't
      // pile up a backlog of announcements.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        "New order! New order! Please check the admin panel.",
      );
      utterance.rate = 1;
      utterance.volume = 1;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error("Speech alert error:", error);
  }
}

export default function AdminOrderAlerts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [unread, setUnread] = useState<IncomingOrder[]>([]);
  const [open, setOpen] = useState(false);

  const titleFlashRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Unlock/resume the shared audio context on the admin's first
    // click anywhere on the page — this is what lets the very first
    // order alert (before any interaction) actually play sound
    // instead of being silently blocked by the browser's autoplay
    // policy.
    const unlockAudio = () => {
      try {
        const ctx = getAudioContext();
        if (ctx.state === "suspended") ctx.resume();
      } catch (error) {
        console.error("Audio unlock error:", error);
      }
    };
    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);

    const socket = getSocket();
    const token = getAuthToken();

    socket.emit("join:admin");
    if (token) socket.emit("join:user", token);

    const onNewOrder = (order: IncomingOrder) => {
      setUnread((prev) => [order, ...prev].slice(0, 20));

      playOrderAlert();

      toast.success(
        `New order from ${order.customerName} — ₹${order.totalAmount}`,
        {
          duration: 8000,
          action: {
            label: "View",
            onClick: () => navigate({ to: "/admin/orders" }),
          },
        },
      );

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🔔 New order received!", {
          body: `${order.customerName} · ₹${order.totalAmount} · ${
            order.orderMode === "delivery" ? "Delivery" : "Pickup"
          }`,
        });
      }

      // Flash the tab title until the admin comes back to this tab.
      if (document.hidden && !titleFlashRef.current) {
        let flipped = false;
        titleFlashRef.current = setInterval(() => {
          document.title = flipped
            ? ORIGINAL_TITLE
            : "🔔 New Order! — Tripathi Admin";
          flipped = !flipped;
        }, 1000);
      }
    };

    socket.on("orders:new", onNewOrder);

    const stopFlash = () => {
      if (document.visibilityState === "visible" && titleFlashRef.current) {
        clearInterval(titleFlashRef.current);
        titleFlashRef.current = null;
        document.title = ORIGINAL_TITLE;
      }
    };

    document.addEventListener("visibilitychange", stopFlash);

    return () => {
      socket.off("orders:new", onNewOrder);
      document.removeEventListener("visibilitychange", stopFlash);
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
      if (titleFlashRef.current) clearInterval(titleFlashRef.current);
    };
  }, [user?.role, navigate]);

  if (user?.role !== "admin") return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-full border bg-background transition hover:bg-muted"
        aria-label="Order notifications"
      >
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[11px] font-bold text-destructive-foreground">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border bg-background p-3 shadow-xl">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-sm font-bold">New orders</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {unread.length === 0 ? (
            <p className="px-1 py-4 text-center text-sm text-muted-foreground">
              No new orders since you last checked.
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {unread.map((o) => (
                <button
                  key={o._id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: "/admin/orders" });
                  }}
                  className="block w-full rounded-xl border bg-muted/40 p-3 text-left text-sm hover:bg-muted"
                >
                  <p className="font-bold">
                    {o.customerName} · ₹{o.totalAmount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.orderMode === "delivery" ? "Delivery" : "Pickup"}
                    {o.notes ? ` · "${o.notes}"` : ""}
                  </p>
                </button>
              ))}
            </div>
          )}

          {unread.length > 0 && (
            <button
              type="button"
              onClick={() => setUnread([])}
              className="mt-2 w-full rounded-full bg-muted px-3 py-2 text-xs font-bold hover:bg-muted/70"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
