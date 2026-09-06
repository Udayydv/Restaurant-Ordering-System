import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { FoodCard } from "@/components/food/FoodCard";
import { Input } from "@/components/ui/input";
import { useCatalog } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type MenuSearch = { category?: string | undefined };

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Menu — Tripathi Veg Restaurant | Pure Veg Online Ordering" },
      {
        name: "description",
        content:
          "Browse the full pure-veg menu: paneer specials, thalis, dal, rice, parathas, chinese, maggi, raita and hot beverages.",
      },
      { property: "og:title", content: "Menu — Tripathi Veg Restaurant" },
      {
        property: "og:description",
        content: "Paneer, thalis, parathas, chinese and more — order direct with ₹5 delivery.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState("");
  const { menu, categories } = useCatalog();

  const active = category && categories.some((c) => c.id === category) ? category : "all";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      active === "all"
        ? menu
        : menu.filter((m) => m.categories.includes(active));
    if (!q) return base;
    return base.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.ingredients.toLowerCase().includes(q),
    );
  }, [active, query, menu]);

  const grouped = useMemo(() => {
    if (active !== "all") return null;
    return categories
      .map((c) => ({ category: c, items: visible.filter((m) => m.categories.includes(c.id)) }))
      .filter((g) => g.items.length > 0);
  }, [active, visible, categories]);

  const select = (id: string) =>
    navigate({ search: id === "all" ? {} : { category: id } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header>
        <h1 className="font-display text-3xl font-black sm:text-4xl">Our Menu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          100% pure vegetarian • freshly cooked after you order • flat ₹5 delivery
        </p>
      </header>

      <div className="sticky top-[104px] z-30 -mx-4 mt-6 bg-background/95 px-4 py-3 backdrop-blur-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for paneer, thali, maggi…"
            className="h-12 rounded-full pl-11"
            aria-label="Search the menu"
          />
        </div>
        <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {[{ id: "all", label: "All", icon: "🍽️" }, ...categories].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => select(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                active === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No dishes matched "{query}". Try another search.
        </p>
      )}

      {grouped ? (
        <div className="mt-6 space-y-12">
          {grouped.map((g) => (
            <section key={g.category.id} id={g.category.id} className="scroll-mt-48">
              <h2 className="mb-4 font-display text-xl font-extrabold sm:text-2xl">
                {g.category.icon} {g.category.label}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {g.items.map((item) => (
                  <FoodCard key={`${g.category.id}-${item.id}`} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
