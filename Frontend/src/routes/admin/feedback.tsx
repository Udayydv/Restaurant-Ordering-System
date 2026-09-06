import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";

import { getAuthToken, useAuth } from "@/lib/auth";
import { API_URL } from "@/lib/api-config";
import AdminNavigation from "@/components/AdminNavigation";

export const Route = createFileRoute("/admin/feedback")({
  component: AdminFeedback,
});

type FeedbackItem = {
  _id: string;
  name: string;
  phone: string;
  websiteRating: number;
  foodRating: number;
  comments: string;
  createdAt: string;
};

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= n ? "fill-primary text-primary" : "fill-none text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function AdminFeedback() {
  const { user, hydrated } = useAuth();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [avgWebsite, setAvgWebsite] = useState(0);
  const [avgFood, setAvgFood] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hydrated) return;

    if (user?.role !== "admin") {
      setLoading(false);
      setError("Admin access required");
      return;
    }

    const load = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/admin/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load feedback");
        }

        setItems(data.feedback || []);
        setAvgWebsite(data.avgWebsite || 0);
        setAvgFood(data.avgFood || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load feedback");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, hydrated]);

  return (
    <div>
      <AdminNavigation />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-extrabold">Customer Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Website experience and food quality ratings from customers.
        </p>

        {loading ? (
          <p className="mt-8 text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="mt-8 text-destructive">{error}</p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">Total responses</p>
                <p className="mt-2 text-3xl font-extrabold">{items.length}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">Avg. website rating</p>
                <p className="mt-2 text-3xl font-extrabold">{avgWebsite || "—"}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">Avg. food rating</p>
                <p className="mt-2 text-3xl font-extrabold">{avgFood || "—"}</p>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="mt-8 text-muted-foreground">No feedback yet.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {items.map((f) => (
                  <div key={f._id} className="rounded-2xl border bg-background p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">
                        {f.name || "Anonymous"}
                        {f.phone && (
                          <span className="ml-2 text-sm font-medium text-muted-foreground">
                            +91 {f.phone}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(f.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground">Website</p>
                        <Stars n={f.websiteRating} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Food quality</p>
                        <Stars n={f.foodRating} />
                      </div>
                    </div>
                    {f.comments && (
                      <p className="mt-3 text-sm">{f.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
