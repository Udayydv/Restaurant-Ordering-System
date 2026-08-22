import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserProfile = {
  id: string;
  phone: string;
  name: string;
  role: "customer" | "admin";
  address?: string;
};

export type PastOrder = {
  id: string;
  placedAt: string;
  items: {
    name: string;
    variant: string;
    qty: number;
    price: number;
  }[];
  total: number;
  mode: "delivery" | "pickup";
  payment: "cod" | "upi";
};

type AuthContextValue = {
  user: UserProfile | null;
  hydrated: boolean;
  orders: PastOrder[];
  loginOpen: boolean;
  setLoginOpen: (v: boolean) => void;

  register: (phone: string, password: string, name: string) => Promise<boolean>;
  login: (phone: string, password: string) => Promise<boolean>;

  updateProfile: (patch: Partial<UserProfile>) => void;
  addOrder: (order: PastOrder) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

import { API_URL } from "@/lib/api-config";

const TOKEN_KEY = "tvr-auth-token";
const USER_KEY = "tvr-user-v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  // Order history now lives on the server (see /orders/my-orders) and
  // is fetched fresh per logged-in user wherever it's shown — this
  // in-memory list is only used as a lightweight local cache for the
  // current session, and is never persisted to shared localStorage
  // (that was the cause of one user's order history leaking into the
  // next person's session on a shared/public device).
  const [orders, setOrders] = useState<PastOrder[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /*
   * Restore authentication when the application starts.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem(USER_KEY);
        const token = localStorage.getItem(TOKEN_KEY);

        /*
         * First restore the cached user immediately.
         * This prevents the admin role from disappearing while
         * /auth/me is being checked.
         */
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser) as UserProfile;

            if (
              parsedUser &&
              parsedUser.id &&
              parsedUser.phone &&
              (parsedUser.role === "admin" ||
                parsedUser.role === "customer")
            ) {
              setUser(parsedUser);
            }
          } catch {
            localStorage.removeItem(USER_KEY);
          }
        }

        /*
         * If there is no token, we're simply not logged in.
         */
        if (!token) {
          return;
        }

        /*
         * Verify the token with the backend.
         */
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
          return;
        }

        const data = await response.json();

        if (!data.success || !data.user) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
          return;
        }

        /*
         * IMPORTANT:
         * Always take the role from the backend.
         */
        const backendUser: UserProfile = {
          id: String(data.user.id),
          phone: String(data.user.phone),
          name: data.user.name || "",
          role: data.user.role === "admin" ? "admin" : "customer",
        };

        setUser(backendUser);
        localStorage.setItem(USER_KEY, JSON.stringify(backendUser));
      } catch (error) {
        console.error(
          "Authentication initialization error:",
          error,
        );
      } finally {
        setHydrated(true);
      }
    };

    initializeAuth();
  }, []);

  /*
   * Keep user in localStorage.
   */
  useEffect(() => {
    if (!hydrated) return;

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user, hydrated]);

  /*
   * Register a new account (phone + password). Password is hashed
   * server-side with bcrypt before storage — it's sent over HTTPS in
   * production and never persisted anywhere on the client.
   */
  const register = async (
    phone: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password, name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create account");
      }

      if (!data.token || !data.user) {
        throw new Error("Signup response is missing authentication data");
      }

      applySession(data.token, data.user);

      return true;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  /*
   * Login with phone + password.
   */
  const login = async (
    phone: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid mobile number or password");
      }

      if (!data.token || !data.user) {
        throw new Error("Login response is missing authentication data");
      }

      applySession(data.token, data.user);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  /*
   * Shared session bootstrap for both register() and login().
   *
   * IMPORTANT: whenever the logged-in user changes (a new person logs
   * in on this browser/device), we drop any locally-cached order
   * history from a previous session so it can never bleed into the
   * new user's view. Cart clearing on user switch is handled inside
   * CartProvider, which watches `user.id`.
   */
  const applySession = (
    token: string,
    rawUser: { id: string; phone: string; name?: string; role: string },
  ) => {
    localStorage.setItem(TOKEN_KEY, token);

    const loggedInUser: UserProfile = {
      id: String(rawUser.id),
      phone: String(rawUser.phone),
      name: rawUser.name || "",
      role: rawUser.role === "admin" ? "admin" : "customer",
    };

    setOrders([]);
    setUser(loggedInUser);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
  };

  const updateProfile = (
    patch: Partial<UserProfile>,
  ) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            ...patch,
          }
        : prev,
    );
  };

  const addOrder = (order: PastOrder) => {
    setOrders((prev) => [
      order,
      ...prev,
    ]);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setOrders([]);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      orders,
      loginOpen,
      setLoginOpen,
      register,
      login,
      updateProfile,
      addOrder,
      logout,
    }),
    [
      user,
      orders,
      loginOpen,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return ctx;
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}
