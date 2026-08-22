import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { getAuthToken, useAuth } from "@/lib/auth";
import { API_URL } from "@/lib/api-config";
import { getSocket } from "@/lib/socket";
import AdminNavigation from "@/components/AdminNavigation";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/catering")({
  component: AdminCatering,
});

type Enquiry = {
  _id: string;
  name: string;
  phone: string;
  date: string;
  guests: string;
  occasion: string;
  notes: string;
  status: "new" | "contacted" | "confirmed" | "cancelled";
  createdAt: string;
};

const statusStyles: Record<Enquiry["status"], string> = {
  new: "bg-saffron/20 text-saffron-foreground",
  contacted: "bg-blue-100 text-blue-800",
  confirmed: "bg-leaf/20 text-leaf",
  cancelled: "bg-muted text-muted-foreground",
};

function AdminCatering() {
  const { user, hydrated } = useAuth();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnquiries = async () => {
    try {
      const token = getAuthToken();

      if (!token) throw new Error("Admin authentication required");

      const response = await fetch(`${API_URL}/admin/catering`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load enquiries");
      }

      setEnquiries(data.enquiries || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load enquiries",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Live updates: as soon as a customer submits the catering form
   * anywhere on the site, it appears here instantly without a page
   * refresh — pushed via Socket.io.
   */
  useEffect(() => {
    if (!hydrated) return;

    if (user?.role !== "admin") {
      setLoading(false);
      setError("Admin access required");
      return;
    }

    loadEnquiries();

    const socket = getSocket();
    socket.emit("join:admin");

    const onNew = (enquiry: Enquiry) => {
      setEnquiries((prev) => [enquiry, ...prev]);
      toast.success(`New catering enquiry from ${enquiry.name}`);
    };

    socket.on("catering:new", onNew);

    return () => {
      socket.off("catering:new", onNew);
      socket.emit("leave:admin");
    };
  }, [user, hydrated]);

  const updateStatus = async (id: string, status: Enquiry["status"]) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/admin/catering/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update enquiry");
      }

      setEnquiries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status } : e)),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update enquiry",
      );
    }
  };

  return (
    <div>
      <AdminNavigation />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-extrabold">Catering Enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New submissions from the catering page appear here in real time.
        </p>

        {loading ? (
          <p className="mt-8 text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="mt-8 text-destructive">{error}</p>
        ) : enquiries.length === 0 ? (
          <p className="mt-8 text-muted-foreground">No enquiries yet.</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {enquiries.map((enq) => (
              <div
                key={enq._id}
                className="rounded-2xl border bg-card p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-extrabold">
                      {enq.name}{" "}
                      <span className="text-sm font-medium text-muted-foreground">
                        · +91 {enq.phone}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {enq.occasion || "—"} · {enq.guests || "?"} guests ·{" "}
                      {enq.date || "date not given"}
                    </p>
                    {enq.notes && (
                      <p className="mt-2 max-w-xl text-sm">{enq.notes}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(enq.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[enq.status]}`}
                  >
                    {enq.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(["new", "contacted", "confirmed", "cancelled"] as const).map(
                    (s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={enq.status === s ? "default" : "secondary"}
                        className="rounded-full text-xs font-bold capitalize"
                        onClick={() => updateStatus(enq._id, s)}
                      >
                        {s}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
