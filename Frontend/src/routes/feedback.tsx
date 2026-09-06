import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAuthToken, useAuth } from "@/lib/auth";
import { API_URL } from "@/lib/api-config";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Share Feedback — Tripathi Veg Restaurant" },
      {
        name: "description",
        content: "Tell us how we're doing — website experience and food quality.",
      },
    ],
  }),
  component: FeedbackPage,
});

function StarPicker({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="transition hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                n <= value
                  ? "fill-primary text-primary"
                  : "fill-none text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function FeedbackPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [websiteRating, setWebsiteRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (websiteRating === 0 || foodRating === 0) {
      toast.error("Please rate both the website and the food");
      return;
    }

    try {
      setSubmitting(true);

      const token = getAuthToken();

      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          websiteRating,
          foodRating,
          comments: comments.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit feedback");
      }

      setSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit feedback",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="text-5xl">🙏</div>
        <h1 className="mt-4 font-display text-2xl font-extrabold">
          Thank you!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your feedback helps us serve you better. We really appreciate it.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-3xl font-black">Share Your Feedback</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Are you satisfied with our website and food quality? Let us know —
        it takes less than a minute.
      </p>

      <div className="mt-8 space-y-6 rounded-3xl border bg-card p-6 shadow-soft">
        <StarPicker
          label="How was your experience using our website?"
          value={websiteRating}
          onChange={setWebsiteRating}
        />
        <StarPicker
          label="How satisfied are you with the food quality?"
          value={foodRating}
          onChange={setFoodRating}
        />

        <div className="space-y-2">
          <Label htmlFor="fb-name">Name (optional)</Label>
          <Input
            id="fb-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fb-phone">Mobile number (optional)</Label>
          <Input
            id="fb-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit number"
            maxLength={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fb-comments">
            Anything you'd like us to improve? (optional)
          </Label>
          <Textarea
            id="fb-comments"
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Tell us what you loved or what we can do better..."
          />
        </div>

        <Button
          className="w-full rounded-full font-bold"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
    </div>
  );
}
