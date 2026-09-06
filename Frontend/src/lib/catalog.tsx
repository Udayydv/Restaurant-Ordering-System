import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  categories as staticCategories,
  menu as staticMenu,
  type Category,
  type MenuItem,
} from "@/data/menu";
import fallbackImage from "@/assets/hero-collage.jpg";
import { API_URL } from "@/lib/api-config";
import { getSocket } from "@/lib/socket";

type BackendProduct = {
  _id: string;
  slug?: string;
  name: string;
  description?: string;
  category: string;
  image?: string;
  prices: { regular?: number; half?: number; full?: number };
  isAvailable: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
};

type BackendCategory = {
  _id: string;
  name: string;
  slug?: string;
  icon?: string;
  isActive: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const staticSlugs = new Set(staticMenu.map((m) => m.id));
const hasSupportedPrice = (p: BackendProduct) =>
  ["regular", "half", "full"].some(
    (key) => typeof p.prices?.[key as keyof BackendProduct["prices"]] === "number",
  );
// Slugs that belonged to the previous curated menu but were removed by
// the 2026-09-06 menu refresh. Suppress them even if the database seed
// migration has not been run yet, so customers never see stale dishes.
const retiredStaticSlugs = new Set<string>([
  "boondi-raita",
  "charitravan-chai",
  "cheese-maggi-masala",
  "chilli-potato",
  "dal-fry",
  "dal-punjabi-tadka",
  "rajma-4-roti"
]);
const staticCategoryIds = new Set(staticCategories.map((c) => c.id));
const retiredCategoryIds = new Set([
  "paneer",
  "aloo",
  "veg",
  "dal",
  "maggi",
  "beverages",
]);

const productToMenuItem = (p: BackendProduct): MenuItem => {
  const variants: MenuItem["variants"] = [];

  if (typeof p.prices?.regular === "number") {
    variants.push({ label: "Regular", price: p.prices.regular });
  }
  if (typeof p.prices?.half === "number") {
    variants.push({ label: "Half", price: p.prices.half });
  }
  if (typeof p.prices?.full === "number") {
    variants.push({ label: "Full", price: p.prices.full });
  }

  const safeVariants: MenuItem["variants"] =
    variants.length > 0 ? variants : [{ label: "Regular", price: null }];

  return {
    id: p.slug || p._id,
    backendId: p._id,
    name: p.name,
    description: p.description || "",
    ingredients: p.description || "",
    image: p.image || fallbackImage,
    categories: [slugify(p.category)],
    variants: safeVariants,
    rating: 4.5,
    tags: p.isBestseller ? ["bestseller"] : undefined,
  };
};

type CatalogContextValue = {
  menu: MenuItem[];
  categories: Category[];
  loading: boolean;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [extraProducts, setExtraProducts] = useState<BackendProduct[]>([]);
  const [extraCategories, setExtraCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/products?available=true`),
        fetch(`${API_URL}/categories`),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      if (productsRes.ok && productsData.success) {
        setExtraProducts(productsData.products || []);
      }

      if (categoriesRes.ok && categoriesData.success) {
        setExtraCategories(categoriesData.categories || []);
      }
    } catch (error) {
      console.error("Catalog load error:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Load once on mount, then keep in sync in real time: whenever the
   * admin creates/edits/removes a category or product, the backend
   * broadcasts a Socket.io event and every connected customer browser
   * refetches automatically — no page refresh needed.
   */
  useEffect(() => {
    load();

    const socket = getSocket();

    const onProductsChanged = () => load();
    const onCategoriesChanged = () => load();

    socket.on("products:changed", onProductsChanged);
    socket.on("categories:changed", onCategoriesChanged);

    return () => {
      socket.off("products:changed", onProductsChanged);
      socket.off("categories:changed", onCategoriesChanged);
    };
  }, []);

  const value = useMemo<CatalogContextValue>(() => {
    // Only merge in products that don't already exist in the curated
    // static menu (matched by slug) — this is what makes newly
    // admin-added items show up for customers, while items that were
    // already part of the original curated menu keep their rich
    // static content (images, descriptions) untouched.
    const newProducts = extraProducts.filter(
      (p) =>
        hasSupportedPrice(p) &&
        (!p.slug ||
          (!staticSlugs.has(p.slug) && !retiredStaticSlugs.has(p.slug))),
    );

    // Enrich curated static dishes with the real MongoDB ObjectId from
    // the live backend. The UI keeps its stable slug in `id` (so images,
    // thali descriptions and local content still work), while checkout
    // sends `backendId` to the cart API.
    const backendBySlug = new Map(
      extraProducts
        .filter((p) => p.slug && hasSupportedPrice(p))
        .map((p) => [p.slug!, p]),
    );

    const curatedMenu: MenuItem[] = staticMenu.map((item) => {
      const backendProduct = backendBySlug.get(item.id);
      return backendProduct
        ? { ...item, backendId: backendProduct._id }
        : item;
    });

    const mergedMenu: MenuItem[] = [
      ...curatedMenu,
      ...newProducts.map(productToMenuItem),
    ];

    const newCategories: Category[] = extraCategories
      .filter((c) => {
        const id = slugify(c.name);
        return !staticCategoryIds.has(id) && !retiredCategoryIds.has(id);
      })
      .map((c) => ({
        id: slugify(c.name),
        label: c.name,
        icon: c.icon || "🍽️",
      }));

    const mergedCategories: Category[] = [
      ...staticCategories,
      ...newCategories,
    ];

    return {
      menu: mergedMenu,
      categories: mergedCategories,
      loading,
    };
  }, [extraProducts, extraCategories, loading]);

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);

  if (!ctx) {
    throw new Error("useCatalog must be used inside CatalogProvider");
  }

  return ctx;
}
