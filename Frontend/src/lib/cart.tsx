import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getAuthToken, useAuth } from "./auth";
import type { PriceType } from "@/data/menu";
import { API_URL } from "@/lib/api-config";

export type CartLine = {
  key: string;
  itemId: string;
  // Stable menu slug retained as a fallback when an old/stale browser
  // cart does not yet have the current MongoDB ObjectId.
  productSlug?: string;
  name: string;
  image: string;
  variant: string;
  price: number;
  qty: number;
  // Stable backend price key. The customer menu supports only
  // Regular, Half and Full, so the display label and backend tier
  // now map one-to-one instead of relying on variant position.
  priceType?: PriceType;
  section?: "restaurant" | "sip-n-scoop";
};

type CartSection = "restaurant" | "sip-n-scoop";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  linesFor: (section: CartSection) => CartLine[];
  countFor: (section: CartSection) => number;
  subtotalFor: (section: CartSection) => number;

  add: (
    line: Omit<CartLine, "key" | "qty">,
    qty?: number,
  ) => void;

  setQty: (key: string, qty: number) => void;

  remove: (key: string) => void;

  clear: () => void;
  clearSection: (section: CartSection) => void;

  qtyOf: (itemId: string) => number;

  isOpen: boolean;
  setOpen: (v: boolean) => void;

  syncWithBackend: (section?: CartSection) => Promise<number | null>;
};

const CartContext = createContext<CartContextValue | null>(null);

// New namespace intentionally invalidates carts saved before the menu/schema migration.
const STORAGE_PREFIX = "tvr-cart-v2-half-full";

/*
 * The cart is namespaced per logged-in user (and separately for
 * guests). Without this, the cart lived under one global localStorage
 * key shared by every account that ever logged in on this browser —
 * so logging in as a different person would still show the previous
 * person's cart. Scoping the key by user id keeps each account's cart
 * completely separate.
 */
const storageKeyFor = (userId: string | null) =>
  userId ? `${STORAGE_PREFIX}:${userId}` : `${STORAGE_PREFIX}:guest`;

/*
 * Convert the visible portion label directly to the backend price key.
 * There is deliberately no positional mapping anymore: "Full" always
 * means prices.full, "Half" always means prices.half, and single-price
 * dishes use prices.regular. This is the core fix for the old cart-sync
 * bug where a displayed Full portion could be sent as Family/another tier.
 */
export const getPriceTypeForVariant = (variant: string): PriceType => {
  const value = String(variant || "").trim().toLowerCase();

  if (value === "half" || value.includes("half")) return "half";
  if (value === "full" || value.includes("full")) return "full";
  return "regular";
};

const resolvePriceTypeForLine = (line: CartLine): PriceType => {
  if (
    line.priceType === "regular" ||
    line.priceType === "half" ||
    line.priceType === "full"
  ) {
    return line.priceType;
  }

  return getPriceTypeForVariant(line.variant);
};

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, hydrated: authHydrated } = useAuth();

  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const previousKey = useRef<string | null>(null);

  /*
   * Load the correct per-user cart whenever the logged-in user
   * changes (login, logout, or switching accounts on this device).
   * This is what actually prevents one user's cart from appearing in
   * another user's session.
   */
  useEffect(() => {
    if (!authHydrated) return;

    const key = storageKeyFor(user?.id ?? null);

    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      // Sip n Scoop is temporarily paused. Discard any previously saved Sip n Scoop
      // lines so they cannot block or collide with normal restaurant checkout.
      let restored: CartLine[] = Array.isArray(parsed)
        ? parsed.filter((line: CartLine) => (line.section || "restaurant") === "restaurant")
        : [];
      const guestKey = storageKeyFor(null);
      if (user?.id && previousKey.current === guestKey) {
        const guest: CartLine[] = JSON.parse(localStorage.getItem(guestKey) || "[]");
        if (Array.isArray(guest) && guest.length) {
          const merged = [...restored];
          for (const line of guest) {
            if ((line.section || "restaurant") !== "restaurant") continue;
            const existing = merged.find((item) => item.key === line.key);
            if (existing) existing.qty += line.qty;
            else merged.push(line);
          }
          restored = merged;
          localStorage.removeItem(guestKey);
        }
      }
      setLines(restored);
    } catch {
      localStorage.removeItem(key);
      setLines([]);
    }

    previousKey.current = key;
    setActiveKey(key);
    setHydrated(true);
  }, [user?.id, authHydrated]);

  /*
   * Save the local cart under the currently active (per-user) key.
   */
  useEffect(() => {
    if (!hydrated || !activeKey || activeKey !== storageKeyFor(user?.id ?? null)) return;

    localStorage.setItem(
      activeKey,
      JSON.stringify(lines),
    );
  }, [lines, hydrated, activeKey, user?.id]);

  /*
   * Sync local cart with backend MongoDB cart.
   *
   * This is called before placing an order.
   */
  const syncWithBackend = useCallback(async (section?: CartSection): Promise<number | null> => {
    const token = getAuthToken();
    if (!token) return null;
    const selectedLines = section ? lines.filter((line) => (line.section || "restaurant") === section) : lines;
    const response = await fetch(API_URL + "/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ items: selectedLines.map((line) => ({
        productId: line.itemId, productSlug: line.productSlug, productName: line.name,
        quantity: line.qty, priceType: resolvePriceTypeForLine(line),
      })) }),
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Backend returned an unexpected response (${response.status}). Check VITE_API_URL/Render deployment. ${text.slice(0, 80)}`);
    }
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to synchronize cart");
    const currentPrices = data.prices as { productId: string; productSlug?: string; priceType: PriceType; price: number }[];
    const updated = lines.map((line) => {
      if (section && (line.section || "restaurant") !== section) return line;
      const current = currentPrices.find((price) =>
        (price.productId === line.itemId || (Boolean(price.productSlug) && (price.productSlug === line.productSlug || price.productSlug === line.itemId))) &&
        price.priceType === resolvePriceTypeForLine(line));
      return current ? { ...line, price: current.price } : line;
    });
    if (updated.some((line, index) => line.price !== lines[index]?.price)) {
      setLines(updated);
      throw new Error("Menu prices have changed. Your cart has been updated; please review the total and place your order again.");
    }
    return data.cartVersion;
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = (
      line,
      qty = 1,
    ) => {
      if ((line.section || "restaurant") === "sip-n-scoop") return;
      const key = `${line.itemId}__${line.variant}`;

      setLines((prev) => {
        const found = prev.find(
          (l) => l.key === key,
        );

        if (found) {
          return prev.map((l) =>
            l.key === key
              ? {
                  ...l,
                  qty: l.qty + qty,
                }
              : l,
          );
        }

        return [
          ...prev,
          {
            ...line,
            key,
            qty,
          },
        ];
      });
    };

    return {
      lines,
      linesFor: (section) => lines.filter((line) => (line.section || "restaurant") === section),
      countFor: (section) => lines.filter((line) => (line.section || "restaurant") === section).reduce((sum, line) => sum + line.qty, 0),
      subtotalFor: (section) => lines.filter((line) => (line.section || "restaurant") === section).reduce((sum, line) => sum + line.qty * line.price, 0),

      count: lines.reduce(
        (sum, line) =>
          sum + line.qty,
        0,
      ),

      subtotal: lines.reduce(
        (sum, line) =>
          sum + line.qty * line.price,
        0,
      ),

      add,

      setQty: (key, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter(
                (line) =>
                  line.key !== key,
              )
            : prev.map((line) =>
                line.key === key
                  ? {
                      ...line,
                      qty,
                    }
                  : line,
              ),
        ),

      remove: (key) =>
        setLines((prev) =>
          prev.filter(
            (line) =>
              line.key !== key,
          ),
        ),

      clear: () => {
        setLines([]);
      },
      clearSection: (section) => {
        setLines((prev) => prev.filter((line) => (line.section || "restaurant") !== section));
      },

      qtyOf: (itemId) =>
        lines
          .filter(
            (line) =>
              line.itemId === itemId,
          )
          .reduce(
            (sum, line) =>
              sum + line.qty,
            0,
          ),

      isOpen,
      setOpen,

      syncWithBackend,
    };
  }, [lines, isOpen, syncWithBackend]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error(
      "useCart must be used inside CartProvider",
    );
  }

  return ctx;
}
