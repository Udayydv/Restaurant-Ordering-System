import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronRight, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Tripathi Veg Restaurant" },
      {
        name: "description",
        content: "Manage your saved delivery details and view your past orders.",
      },
      { property: "og:title", content: "My Account — Tripathi Veg Restaurant" },
      { property: "og:description", content: "Saved details and past orders." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, setLoginOpen, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [address, setAddress] = useState(user?.address ?? "");

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-extrabold">You're not logged in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Login with your mobile number to save your address and see past orders.
        </p>
        <Button className="mt-6 rounded-full px-7 font-bold" onClick={() => setLoginOpen(true)}>
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-black">My Account</h1>

      {user.role === "admin" && (
        <Link
          to="/admin"
          className="mt-6 flex items-center justify-between rounded-3xl border-2 border-primary bg-accent p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <LayoutDashboard className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-lg font-extrabold">
                Admin Dashboard
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage orders, products, categories and more.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      )}

      <section className="mt-8 rounded-3xl border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-extrabold">Saved details</h2>
        <div className="mt-4 grid gap-4">
          <div className="space-y-2">
            <Label>Mobile number</Label>
            <Input value={user.phone} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ac-name">Name</Label>
            <Input id="ac-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ac-address">Default delivery address</Label>
            <Textarea
              id="ac-address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              className="rounded-full px-6 font-bold"
              onClick={() => {
                updateProfile({ name, address });
                toast.success("Details saved");
              }}
            >
              Save
            </Button>
            <Button variant="secondary" className="rounded-full px-6 font-bold" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </section>

      <Link
        to="/orders"
        className="mt-6 flex items-center justify-between rounded-3xl border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div>
          <h2 className="font-display text-lg font-extrabold">My Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View your full order history and track current orders.
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>
    </div>
  );
}
