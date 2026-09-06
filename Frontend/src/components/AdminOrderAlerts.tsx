import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

import {
  ensureAdminSocketRoom,
  getSocket,
} from "@/lib/socket";
import { API_URL } from "@/lib/api-config";
import { getAuthToken, useAuth } from "@/lib/auth";
import {
  isAdminAlertAudioReady,
  playAdminOrderBell,
  unlockAdminAlertAudio,
} from "@/lib/admin-alert-audio";

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

type AlertApiOrder = {
  _id: string;
  orderNumber?: string;
  totalAmount: number;
  orderMode: "delivery" | "pickup";
  notes?: string;
  createdAt: string;
  user?: { name?: string; phone?: string };
  address?: { name?: string; phone?: string };
};

const ORIGINAL_TITLE = "Tripathi Veg Restaurant — Admin";
const CURSOR_KEY = "tvr-admin-order-alert-cursor-v1";
const KNOWN_IDS_KEY = "tvr-admin-order-alert-known-v1";
const UNREAD_KEY = "tvr-admin-order-alert-unread-v1";
const LAST_SEEN_AT_KEY = "tvr-admin-order-alert-last-seen-at-v1";
const MAX_KNOWN_IDS = 200;

function loadKnownIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const parsed = JSON.parse(localStorage.getItem(KNOWN_IDS_KEY) || "[]");
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function loadUnread(): IncomingOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(UNREAD_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

function toIncomingOrder(order: AlertApiOrder): IncomingOrder {
  return {
    _id: String(order._id),
    orderNumber: order.orderNumber,
    totalAmount: Number(order.totalAmount || 0),
    orderMode: order.orderMode,
    notes: order.notes,
    createdAt: order.createdAt,
    customerName: order.user?.name || order.address?.name || "Customer",
    customerPhone: order.user?.phone || order.address?.phone || "",
  };
}

export default function AdminOrderAlerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const [unread, setUnread] = useState<IncomingOrder[]>(loadUnread);
  const [open, setOpen] = useState(false);
  const [soundReady, setSoundReady] = useState(() =>
    typeof window !== "undefined" ? isAdminAlertAudioReady() : false,
  );
  const [ringing, setRinging] = useState(false);

  const titleFlashRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownOrderIdsRef = useRef<Set<string>>(loadKnownIds());
  const cursorRef = useRef<string | null>(
    typeof window !== "undefined" ? localStorage.getItem(CURSOR_KEY) : null,
  );
  const pollInFlightRef = useRef(false);
  const lastSeenAtRef = useRef<number>(
    typeof window !== "undefined"
      ? Number(localStorage.getItem(LAST_SEEN_AT_KEY) || 0)
      : 0,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(UNREAD_KEY, JSON.stringify(unread.slice(0, 20)));
  }, [unread]);

  useEffect(() => {
    if (user?.role !== "admin") return;

    const token = getAuthToken();
    if (!token) return;

    ensureAdminSocketRoom(token);
    const socket = getSocket();

    const persistKnownId = (orderId: string) => {
      const current = knownOrderIdsRef.current;
      current.add(orderId);

      const ids = Array.from(current);
      if (ids.length > MAX_KNOWN_IDS) {
        knownOrderIdsRef.current = new Set(ids.slice(-MAX_KNOWN_IDS));
      }

      localStorage.setItem(
        KNOWN_IDS_KEY,
        JSON.stringify(Array.from(knownOrderIdsRef.current)),
      );
    };

    const enableAlerts = async () => {
      const ready = await unlockAdminAlertAudio();
      setSoundReady(ready);
    };

    // A genuine interaction grants audio/notification permission once. The
    // shared AudioContext survives admin route changes, unlike V3.
    document.addEventListener("pointerdown", enableAlerts, true);
    document.addEventListener("keydown", enableAlerts, true);

    const playOrderAlert = async () => {
      setRinging(true);
      window.setTimeout(() => setRinging(false), 2200);

      const played = await playAdminOrderBell();
      setSoundReady(played || isAdminAlertAudioReady());

      if (!played) {
        console.warn(
          "Order received but browser audio is suspended. Click the admin page once to re-enable sound.",
        );
      }

      try {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(
            "New order! Please check the admin panel.",
          );
          utterance.rate = 1;
          utterance.volume = 1;
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error("Speech alert error:", error);
      }
    };

    const markLastSeenAt = (createdAt?: string) => {
      const timestamp = createdAt ? Date.parse(createdAt) : NaN;
      if (!Number.isFinite(timestamp) || timestamp <= lastSeenAtRef.current) return;
      lastSeenAtRef.current = timestamp;
      localStorage.setItem(LAST_SEEN_AT_KEY, String(timestamp));
    };

    const announceOrder = (order: IncomingOrder) => {
      const orderId = String(order._id || "");
      markLastSeenAt(order.createdAt);
      if (!orderId || knownOrderIdsRef.current.has(orderId)) return;

      persistKnownId(orderId);
      setUnread((previous) => [order, ...previous].slice(0, 20));
      void playOrderAlert();

      toast.success(
        `New order from ${order.customerName} — ₹${order.totalAmount}`,
        {
          duration: 10000,
          action: {
            label: "View",
            onClick: () => navigateRef.current({ to: "/admin/orders" }),
          },
        },
      );

      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("New order received!", {
            body: `${order.customerName} — ₹${order.totalAmount} — ${
              order.orderMode === "delivery" ? "Delivery" : "Pickup"
            }`,
            requireInteraction: true,
            tag: `tripathi-order-${orderId}`,
          });
        } catch (error) {
          console.error("Browser notification failed:", error);
        }
      }

      if (document.hidden && !titleFlashRef.current) {
        let flipped = false;
        titleFlashRef.current = setInterval(() => {
          document.title = flipped
            ? ORIGINAL_TITLE
            : "NEW ORDER! — Tripathi Admin";
          flipped = !flipped;
        }, 1000);
      }
    };

    const onNewOrder = (order: IncomingOrder) => {
      announceOrder(order);
    };

    socket.on("orders:new", onNewOrder);

    /**
     * Durable reconciliation. The cursor is stored in localStorage, so a page
     * remount, route change, browser freeze or socket reconnect cannot turn a
     * genuinely new order into a silent "baseline" order.
     */
    const reconcileOrders = async () => {
      if (pollInFlightRef.current) return;

      const currentToken = getAuthToken();
      if (!currentToken) return;

      ensureAdminSocketRoom(currentToken);
      pollInFlightRef.current = true;

      try {
        let cursor = cursorRef.current;

        // Drain several batches in the extremely unlikely event that more
        // than 100 orders arrived while this admin page was inactive.
        for (let batch = 0; batch < 10; batch += 1) {
          const query = cursor
            ? `?after=${encodeURIComponent(cursor)}`
            : "";

          const response = await fetch(`${API_URL}/admin/orders/alerts${query}`, {
            headers: { Authorization: `Bearer ${currentToken}` },
            cache: "no-store",
          });

          const data = await response.json();

          if (!response.ok || !data.success || !Array.isArray(data.orders)) {
            throw new Error(data.message || "Unable to reconcile order alerts");
          }

          if (data.latestCreatedAt) {
            markLastSeenAt(String(data.latestCreatedAt));
          }

          // First install only: establish the current latest order as the
          // durable cursor. After this point the cursor is never reset on
          // route changes/remounts, so future orders cannot be swallowed.
          if (!cursor) {
            cursor = data.cursor ? String(data.cursor) : null;
            cursorRef.current = cursor;
            if (cursor) localStorage.setItem(CURSOR_KEY, cursor);
            break;
          }

          for (const rawOrder of data.orders as AlertApiOrder[]) {
            announceOrder(toIncomingOrder(rawOrder));
          }

          if (data.cursor) {
            cursor = String(data.cursor);
            cursorRef.current = cursor;
            localStorage.setItem(CURSOR_KEY, cursor);
          }

          if (!data.hasMore) break;
        }
      } catch (error) {
        console.error("Admin order durable reconciliation failed:", error);

        // Independent safety net: if the dedicated alerts endpoint is ever
        // unavailable, compare the normal admin orders feed against a durable
        // createdAt watermark. This keeps a backend route/proxy error from
        // silently disabling new-order alerts.
        try {
          const fallbackResponse = await fetch(`${API_URL}/admin/orders`, {
            headers: { Authorization: `Bearer ${currentToken}` },
            cache: "no-store",
          });
          const fallbackData = await fallbackResponse.json();

          if (
            fallbackResponse.ok &&
            fallbackData.success &&
            Array.isArray(fallbackData.orders)
          ) {
            const rows = (fallbackData.orders as AlertApiOrder[])
              .slice()
              .sort(
                (a, b) =>
                  Date.parse(a.createdAt || "") - Date.parse(b.createdAt || ""),
              );

            if (!lastSeenAtRef.current) {
              const latest = rows[rows.length - 1];
              if (latest) markLastSeenAt(latest.createdAt);
            } else {
              for (const rawOrder of rows) {
                const createdAt = Date.parse(rawOrder.createdAt || "");
                if (
                  Number.isFinite(createdAt) &&
                  createdAt > lastSeenAtRef.current
                ) {
                  announceOrder(toIncomingOrder(rawOrder));
                }
              }
            }
          }
        } catch (fallbackError) {
          console.error("Admin order snapshot fallback failed:", fallbackError);
        }
      } finally {
        pollInFlightRef.current = false;
      }
    };

    void reconcileOrders();

    // Fast fallback while the tab is allowed to run. Chrome can throttle this
    // in hidden tabs after several minutes, which is why focus/visibility,
    // reconnect and persisted-cursor reconciliation are also mandatory.
    const pollTimer = window.setInterval(() => {
      void reconcileOrders();
    }, 5000);

    const reconcileNow = () => {
      if (document.visibilityState === "visible") {
        // Chrome may suspend media while a tab is idle/backgrounded. Resume
        // both prepared audio paths as soon as the admin returns.
        void unlockAdminAlertAudio().then((ready) => setSoundReady(ready));
        void reconcileOrders();
      }
    };

    const onSocketConnect = () => {
      void reconcileOrders();
    };

    const onPageShow = () => {
      void reconcileOrders();
    };

    const onOnline = () => {
      void reconcileOrders();
    };

    socket.on("connect", onSocketConnect);
    window.addEventListener("focus", reconcileNow);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", reconcileNow);

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
      socket.off("connect", onSocketConnect);
      window.clearInterval(pollTimer);
      window.removeEventListener("focus", reconcileNow);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", reconcileNow);
      document.removeEventListener("visibilitychange", stopFlash);
      document.removeEventListener("pointerdown", enableAlerts, true);
      document.removeEventListener("keydown", enableAlerts, true);
      if (titleFlashRef.current) {
        clearInterval(titleFlashRef.current);
        titleFlashRef.current = null;
      }

      // IMPORTANT: do NOT leave admin-room and do NOT close the shared audio
      // context here. AdminNavigation is remounted between admin routes. Only
      // a real logout should leave the global admin socket room.
    };
  }, [user?.role]);

  if (user?.role !== "admin") return null;

  const clearUnread = () => {
    setUnread([]);
    if (typeof window !== "undefined") {
      localStorage.setItem(UNREAD_KEY, "[]");
    }
  };

  const handleBellClick = async () => {
    const ready = await unlockAdminAlertAudio();
    setSoundReady(ready);
    setOpen((value) => !value);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void handleBellClick()}
        className="relative grid h-10 w-10 place-items-center rounded-full border bg-background transition hover:bg-muted"
        aria-label="Order notifications"
        title={soundReady ? "Order notifications" : "Click to enable order sound"}
      >
        <Bell className={`h-5 w-5 ${ringing ? "animate-bounce" : ""}`} />

        {!soundReady && (
          <span
            className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-background"
            title="Click once to enable order sound"
          />
        )}

        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[11px] font-bold text-destructive-foreground">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border bg-background p-3 shadow-xl">
          <div className="flex items-center justify-between px-1 pb-2">
            <div>
              <p className="text-sm font-bold">New orders</p>
              {!soundReady && (
                <p className="text-[11px] font-medium text-amber-600">
                  Click the bell/page once to enable sound.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close notifications"
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
              {unread.map((order) => (
                <button
                  key={order._id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigateRef.current({ to: "/admin/orders" });
                  }}
                  className="block w-full rounded-xl border bg-muted/40 p-3 text-left text-sm hover:bg-muted"
                >
                  <p className="font-bold">
                    {order.customerName} — ₹{order.totalAmount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.orderMode === "delivery" ? "Delivery" : "Pickup"}
                    {order.notes ? ` — "${order.notes}"` : ""}
                  </p>
                </button>
              ))}
            </div>
          )}

          {unread.length > 0 && (
            <button
              type="button"
              onClick={clearUnread}
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
