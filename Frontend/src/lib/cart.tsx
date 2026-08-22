import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getAuthToken, useAuth } from "./auth";

export type CartLine = {
  key: string;
  itemId: string;
  name: string;
  image: string;
  variant: string;
  price: number;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;

  add: (
    line: Omit<CartLine, "key" | "qty">,
    qty?: number,
  ) => void;

  setQty: (key: string, qty: number) => void;

  remove: (key: string) => void;

  clear: () => void;

  qtyOf: (itemId: string) => number;

  isOpen: boolean;
  setOpen: (v: boolean) => void;

  syncWithBackend: () => Promise<boolean>;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_PREFIX = "tvr-cart-v1";

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

import { API_URL } from "@/lib/api-config";

/*
 * Convert the frontend variant name into the
 * priceType expected by the backend.
 */
const getPriceType = (variant: string) => {
  const value = String(variant || "").trim().toLowerCase();

  if (value.includes("half")) {
    return "half";
  }

  if (value.includes("full")) {
    return "full";
  }

  return "regular";
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
      setLines(raw ? (JSON.parse(raw) as CartLine[]) : []);
    } catch {
      localStorage.removeItem(key);
      setLines([]);
    }

    setActiveKey(key);
    setHydrated(true);
  }, [user?.id, authHydrated]);

  /*
   * Save the local cart under the currently active (per-user) key.
   */
  useEffect(() => {
    if (!hydrated || !activeKey) return;

    localStorage.setItem(
      activeKey,
      JSON.stringify(lines),
    );
  }, [lines, hydrated, activeKey]);

  /*
   * Sync local cart with backend MongoDB cart.
   *
   * This is called before placing an order.
   */
  const syncWithBackend = async (): Promise<boolean> => {
    try {
      const token = getAuthToken();

      if (!token) {
        console.error(
          "Cannot sync cart: authentication token missing",
        );

        return false;
      }

      /*
       * First get the existing backend cart.
       */
      const cartResponse = await fetch(
        `${API_URL}/cart`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const cartData = await cartResponse.json();

      if (!cartResponse.ok || !cartData.success) {
        console.error(
          "Unable to fetch backend cart:",
          cartData,
        );

        return false;
      }

      const backendItems =
        cartData.cart?.items || [];

      /*
       * Synchronize every local cart item.
       */
      for (const line of lines) {
        const priceType = getPriceType(
          line.variant,
        );

        const existingItem = backendItems.find(
          (item: any) =>
            String(item.product?._id || item.product) ===
              String(line.itemId) &&
            item.priceType === priceType,
        );

        /*
         * If item already exists in backend,
         * update it to the exact local quantity.
         */
        if (existingItem) {
          const response = await fetch(
            `${API_URL}/cart/items/${line.itemId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                quantity: line.qty,
                priceType,
              }),
            },
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            console.error(
              "Unable to update cart item:",
              data,
            );

            return false;
          }
        } else {
          /*
           * Otherwise add the item to MongoDB cart.
           */
          const response = await fetch(
            `${API_URL}/cart/items`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                productId: line.itemId,
                quantity: line.qty,
                priceType,
              }),
            },
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            console.error(
              "Unable to add cart item:",
              data,
            );

            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error(
        "Cart synchronization error:",
        error,
      );

      return false;
    }
  };

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = (
      line,
      qty = 1,
    ) => {
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
  }, [lines, isOpen]);

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