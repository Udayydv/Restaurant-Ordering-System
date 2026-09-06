import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getAuthToken } from "@/lib/auth";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

type Customer = {
  _id: string;
  name?: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpent: number;
};

type CustomerOrder = {
  _id: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
};

import { API_URL } from "@/lib/api-config";

function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [customerOrders, setCustomerOrders] = useState<
    CustomerOrder[]
  >([]);

  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadCustomers = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error("Admin authentication required");
      }

      const response = await fetch(
        `${API_URL}/admin/customers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to fetch customers",
        );
      }

      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Customers error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch customers",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomerOrders = async (customer: Customer) => {
    try {
      setSelectedCustomer(customer);
      setOrdersLoading(true);
      setCustomerOrders([]);

      const token = getAuthToken();

      if (!token) {
        throw new Error("Admin authentication required");
      }

      const response = await fetch(
        `${API_URL}/admin/customers/${customer._id}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to fetch customer orders",
        );
      }

      setCustomerOrders(data.orders || []);
    } catch (err) {
      console.error("Customer orders error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to fetch customer orders",
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeCustomerOrders = () => {
    if (ordersLoading) return;

    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  const stats = useMemo(() => {
    return {
      total: customers.length,
      verified: customers.filter(
        (customer) => customer.isVerified,
      ).length,
      totalOrders: customers.reduce(
        (sum, customer) => sum + customer.totalOrders,
        0,
      ),
      totalSpent: customers.reduce(
        (sum, customer) => sum + customer.totalSpent,
        0,
      ),
    };
  }, [customers]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />

          <p className="mt-4 text-muted-foreground">
            Loading customers...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-4 text-2xl font-bold">
            Unable to load customers
          </h1>

          <p className="mt-2 text-muted-foreground">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadCustomers()}
            className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-extrabold">
              Customers
            </h1>

            <p className="mt-2 text-muted-foreground">
              Manage customers and view their order history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadCustomers(true)}
            disabled={refreshing}
            className="rounded-full border bg-background px-5 py-2.5 text-sm font-bold shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={stats.total}
          />

          <StatCard
            title="Verified Customers"
            value={stats.verified}
          />

          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
          />

          <StatCard
            title="Total Customer Spending"
            value={`₹${stats.totalSpent}`}
          />
        </div>

        {/* Search */}
        <div className="mt-8 rounded-2xl border bg-background p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search customers by name or phone..."
            className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Result count */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredCustomers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {customers.length}
            </span>{" "}
            customers
          </p>
        </div>

        {/* Customers */}
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-background p-12 text-center">
              <div className="text-5xl">👤</div>

              <h2 className="mt-4 text-xl font-bold">
                No customers found
              </h2>

              <p className="mt-2 text-muted-foreground">
                Try changing your search.
              </p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer._id}
                customer={customer}
                onViewOrders={() =>
                  loadCustomerOrders(customer)
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Customer Orders Modal */}
      {selectedCustomer && (
        <CustomerOrdersModal
          customer={selectedCustomer}
          orders={customerOrders}
          loading={ordersLoading}
          onClose={closeCustomerOrders}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-3xl font-extrabold">
        {value}
      </p>
    </div>
  );
}

function CustomerCard({
  customer,
  onViewOrders,
}: {
  customer: Customer;
  onViewOrders: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Customer
          </p>

          <h2 className="mt-1 text-xl font-extrabold">
            {customer.name || "Unnamed Customer"}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {customer.phone}
          </p>
        </div>

        <span
          className={
            customer.isVerified
              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
              : "rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700"
          }
        >
          {customer.isVerified ? "Verified" : "Unverified"}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Orders
          </p>

          <p className="mt-1 text-xl font-extrabold">
            {customer.totalOrders}
          </p>
        </div>

        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Total Spent
          </p>

          <p className="mt-1 text-xl font-extrabold">
            ₹{customer.totalSpent}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Joined{" "}
        {new Date(customer.createdAt).toLocaleDateString()}
      </p>

      <button
        type="button"
        onClick={onViewOrders}
        className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
      >
        View Orders
      </button>
    </div>
  );
}

function CustomerOrdersModal({
  customer,
  orders,
  loading,
  onClose,
}: {
  customer: Customer;
  orders: CustomerOrder[];
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-background shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Customer Orders
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              {customer.name || "Unnamed Customer"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {customer.phone}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full px-3 py-2 text-xl hover:bg-muted disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Orders */}
        <div className="p-5">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />

                <p className="mt-4 text-sm text-muted-foreground">
                  Loading orders...
                </p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border p-10 text-center">
              <div className="text-4xl">📦</div>

              <h3 className="mt-3 font-bold">
                No orders found
              </h3>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-2xl border p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold">
                        Order #{order._id.slice(-6)}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(
                          order.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="font-extrabold">
                        ₹{order.totalAmount}
                      </p>

                      <span className="mt-1 inline-block rounded-full bg-muted px-3 py-1 text-xs font-bold capitalize">
                        {order.orderStatus.replaceAll(
                          "_",
                          " ",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-background p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-xl border px-5 py-3 text-sm font-bold transition hover:bg-muted disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminCustomers;