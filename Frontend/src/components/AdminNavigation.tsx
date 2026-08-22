import { Link } from "@tanstack/react-router";
import AdminOrderAlerts from "@/components/AdminOrderAlerts";

export default function AdminNavigation() {
  const linkClass =
    "rounded-lg px-4 py-2 text-sm font-semibold transition hover:bg-muted";

  const activeClass =
    "rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground";

  return (
    <nav className="border-b bg-background shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">

        <Link
          to="/admin"
          activeProps={{
            className: activeClass,
          }}
          inactiveProps={{
            className: linkClass,
          }}
        >
          🏠 Dashboard
        </Link>

        <Link
          to="/admin/orders"
          activeProps={{
            className: activeClass,
          }}
          inactiveProps={{
            className: linkClass,
          }}
        >
          📦 Orders
        </Link>

        <Link
          to="/admin/products"
          activeProps={{
            className: activeClass,
          }}
          inactiveProps={{
            className: linkClass,
          }}
        >
          🍽️ Products
        </Link>

        <Link
          to="/admin/categories"
          activeProps={{
            className: activeClass,
          }}
          inactiveProps={{
            className: linkClass,
          }}
        >
          📂 Categories
        </Link>

        <Link
          to="/admin/customers"
          activeProps={{
            className: activeClass,
          }}
          inactiveProps={{
            className: linkClass,
          }}
        >
          👥 Customers
        </Link>

        <Link
          to="/admin/catering"
          activeProps={{
            className: activeClass,
          }}
          inactiveProps={{
            className: linkClass,
          }}
        >
          🎉 Catering
        </Link>

        <div className="ml-auto">
          <AdminOrderAlerts />
        </div>

      </div>
    </nav>
  );
}