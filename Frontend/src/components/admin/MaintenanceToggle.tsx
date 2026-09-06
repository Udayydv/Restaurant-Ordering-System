import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wrench } from "lucide-react";

import { getAuthToken } from "@/lib/auth";
import { API_URL } from "@/lib/api-config";

export default function MaintenanceToggle() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setMaintenanceMode(data.settings.maintenanceMode);
          setMessage(data.settings.maintenanceMessage);
        }
      } catch (error) {
        console.error("Load settings error:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (patch: {
    maintenanceMode?: boolean;
    maintenanceMessage?: string;
  }) => {
    try {
      setSaving(true);
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update settings");
      }
      setMaintenanceMode(data.settings.maintenanceMode);
      setMessage(data.settings.maintenanceMessage);
      toast.success("Settings updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        maintenanceMode
          ? "border-destructive/40 bg-destructive/5"
          : "bg-background"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wrench className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-bold">Maintenance Mode</p>
            <p className="text-xs text-muted-foreground">
              {maintenanceMode
                ? "Customers currently see the maintenance page instead of the site."
                : "Site is running normally for customers."}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => save({ maintenanceMode: !maintenanceMode })}
          className={`relative h-8 w-14 shrink-0 rounded-full transition disabled:opacity-60 ${
            maintenanceMode ? "bg-destructive" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
              maintenanceMode ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      <div className="mt-4">
        {editingMessage ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await save({ maintenanceMessage: message });
                  setEditingMessage(false);
                }}
                className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground"
              >
                Save message
              </button>
              <button
                type="button"
                onClick={() => setEditingMessage(false)}
                className="rounded-full border px-4 py-1.5 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingMessage(true)}
            className="text-left text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Edit maintenance message: "{message.slice(0, 60)}
            {message.length > 60 ? "..." : ""}"
          </button>
        )}
      </div>
    </div>
  );
}
