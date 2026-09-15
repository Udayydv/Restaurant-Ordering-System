import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { getAuthToken, useAuth } from "@/lib/auth";
import { API_URL } from "@/lib/api-config";
import AdminNavigation from "@/components/AdminNavigation";
import MaintenanceToggle from "@/components/admin/MaintenanceToggle";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
};

function AdminDashboard() {
  const { user, hydrated } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = getAuthToken();

        if (!token) {
          throw new Error("Admin authentication required");
        }

        const response = await fetch(
          `${API_URL}/admin/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load dashboard",
          );
        }

        setStats(data.stats);
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    if (!hydrated) {
      return;
    }

    if (user?.role === "admin") {
      loadStats();
    } else {
      setLoading(false);
      setError("Admin access required");
    }
  }, [user, hydrated]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNavigation />
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Admin Panel
          </p>

          <h1 className="mt-1 text-3xl font-extrabold">
            Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Welcome back, {user?.name || "Admin"}.
          </p>
        </div>

        <div className="mb-8">
          <MaintenanceToggle />
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Orders"
            value={stats?.totalOrders ?? 0}
          />

          <StatCard
            title="Pending Orders"
            value={stats?.pendingOrders ?? 0}
          />

          <StatCard
            title="Preparing"
            value={stats?.preparingOrders ?? 0}
          />

          <StatCard
            title="Out for Delivery"
            value={stats?.outForDeliveryOrders ?? 0}
          />

          <StatCard
            title="Delivered"
            value={stats?.deliveredOrders ?? 0}
          />

          <StatCard
            title="Cancelled"
            value={stats?.cancelledOrders ?? 0}
          />

          <StatCard
            title="Customers"
            value={stats?.totalCustomers ?? 0}
          />

          <StatCard
            title="Total Revenue"
            value={`₹${stats?.totalRevenue ?? 0}`}
          />

        </div>

        {/* Today's Statistics */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border bg-background p-6">
            <p className="text-sm text-muted-foreground">
              Today's Orders
            </p>

            <p className="mt-2 text-3xl font-extrabold">
              {stats?.todayOrders ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-background p-6">
            <p className="text-sm text-muted-foreground">
              Today's Revenue
            </p>

            <p className="mt-2 text-3xl font-extrabold">
              ₹{stats?.todayRevenue ?? 0}
            </p>
          </div>

        </div>

        {/* Admin Navigation */}
        <div className="mt-8">
          <h2 className="text-xl font-extrabold">
            Manage Restaurant
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Quickly access different sections of your admin panel.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <AdminActionCard
              title="Orders"
              description="View and manage customer orders."
              href="/admin/orders"
              icon="📦"
            />

            <AdminActionCard
              title="Products"
              description="Add, edit and manage menu products."
              href="/admin/products"
              icon="🍽️"
            />

            <AdminActionCard
              title="Categories"
              description="Manage your restaurant categories."
              href="/admin/categories"
              icon="📂"
            />

            <AdminActionCard
              title="Customers"
              description="View customers and their orders."
              href="/admin/customers"
              icon="👥"
            />

          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
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

function AdminActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border bg-background p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">

        <div>
          <h3 className="text-lg font-extrabold">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="text-3xl transition-transform group-hover:scale-110">
          {icon}
        </div>

      </div>

      <div className="mt-5 text-sm font-bold text-primary">
        Manage →
      </div>
    </Link>
  );
}