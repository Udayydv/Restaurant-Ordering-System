import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getAuthToken } from "@/lib/auth";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type Category = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

type CategorySummary = {
  _id: string;
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  availableProducts: number;
};

type Product = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  image?: string;
  prices: {
    regular?: number;
    half?: number;
    full?: number;
  };
  isAvailable: boolean;
};

import { API_URL } from "@/lib/api-config";

function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ADD CATEGORY STATES
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [categorySortOrder, setCategorySortOrder] = useState(0);
  const [creatingCategory, setCreatingCategory] = useState(false);

  // CATEGORY PRODUCTS
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // LOAD CATEGORIES
  const loadCategories = async (showRefresh = false) => {
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

      const [categoriesResponse, summaryResponse] =
        await Promise.all([
          fetch(`${API_URL}/admin/categories`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_URL}/admin/categories/summary`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const categoriesData = await categoriesResponse.json();
      const summaryData = await summaryResponse.json();

      if (!categoriesResponse.ok || !categoriesData.success) {
        throw new Error(
          categoriesData.message || "Unable to fetch categories",
        );
      }

      if (!summaryResponse.ok || !summaryData.success) {
        throw new Error(
          summaryData.message ||
            "Unable to fetch category summary",
        );
      }

      setCategories(categoriesData.categories || []);
      setSummary(summaryData.categories || []);
    } catch (err) {
      console.error("Categories error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch categories",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // CREATE CATEGORY
  const createCategory = async () => {
    try {
      if (!categoryName.trim()) {
        alert("Category name is required");
        return;
      }

      const token = getAuthToken();

      if (!token) {
        throw new Error("Admin authentication required");
      }

      setCreatingCategory(true);

      const response = await fetch(
        `${API_URL}/admin/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: categoryName.trim(),
            description: categoryDescription.trim(),
            image: categoryImage.trim(),
            sortOrder: Number(categorySortOrder),
            isActive: true,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to create category",
        );
      }

      alert("Category created successfully");

      // CLEAR FORM
      setCategoryName("");
      setCategoryDescription("");
      setCategoryImage("");
      setCategorySortOrder(0);

      // CLOSE MODAL
      setShowAddCategory(false);

      // REFRESH CATEGORY LIST
      await loadCategories(true);
    } catch (err) {
      console.error("Create category error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to create category",
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // LOAD PRODUCTS OF CATEGORY
  const loadCategoryProducts = async (category: string) => {
    try {
      setSelectedCategory(category);
      setProductsLoading(true);
      setCategoryProducts([]);

      const token = getAuthToken();

      if (!token) {
        throw new Error("Admin authentication required");
      }

      const response = await fetch(
        `${API_URL}/admin/categories/${encodeURIComponent(category)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to fetch category products",
        );
      }

      setCategoryProducts(data.products || []);
    } catch (err) {
      console.error("Category products error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to fetch category products",
      );
    } finally {
      setProductsLoading(false);
    }
  };

  const closeCategoryProducts = () => {
    if (productsLoading) return;

    setSelectedCategory(null);
    setCategoryProducts([]);
  };

  // SEARCH
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return summary;
    }

    return summary.filter((category) =>
      category.name.toLowerCase().includes(query),
    );
  }, [summary, search]);

  // TOTAL PRODUCTS
  const totalProducts = useMemo(() => {
    return summary.reduce(
      (total, category) =>
        total + category.productCount,
      0,
    );
  }, [summary]);

  // AVAILABLE PRODUCTS
  const totalAvailableProducts = useMemo(() => {
    return summary.reduce(
      (total, category) =>
        total + category.availableProducts,
      0,
    );
  }, [summary]);

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />

          <p className="mt-4 text-muted-foreground">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-4 text-2xl font-bold">
            Unable to load categories
          </h1>

          <p className="mt-2 text-muted-foreground">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadCategories()}
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

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-extrabold">
              Categories
            </h1>

            <p className="mt-2 text-muted-foreground">
              View menu categories and the products inside them.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* ADD CATEGORY BUTTON */}
            <button
              type="button"
              onClick={() => setShowAddCategory(true)}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              + Add Category
            </button>

            {/* REFRESH BUTTON */}
            <button
              type="button"
              onClick={() => loadCategories(true)}
              disabled={refreshing}
              className="rounded-full border bg-background px-5 py-2.5 text-sm font-bold shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Categories"
            value={categories.length}
          />

          <StatCard
            title="Total Products"
            value={totalProducts}
          />

          <StatCard
            title="Available Products"
            value={totalAvailableProducts}
          />
        </div>

        {/* SEARCH */}
        <div className="mt-8 rounded-2xl border bg-background p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search categories..."
            className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* RESULT COUNT */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredCategories.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {categories.length}
            </span>{" "}
            categories
          </p>
        </div>

        {/* CATEGORIES */}
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-background p-12 text-center">
              <div className="text-5xl">🍽️</div>

              <h2 className="mt-4 text-xl font-bold">
                No categories found
              </h2>

              <p className="mt-2 text-muted-foreground">
                Create a category using the Add Category button.
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <CategoryCard
                key={category.categoryId}
                category={category}
                onView={() =>
                  loadCategoryProducts(category.name)
                }
              />
            ))
          )}
        </div>
      </div>

      {/* ADD CATEGORY MODAL */}
      {showAddCategory && (
        <AddCategoryModal
          categoryName={categoryName}
          categoryDescription={categoryDescription}
          categoryImage={categoryImage}
          categorySortOrder={categorySortOrder}
          creatingCategory={creatingCategory}
          onNameChange={setCategoryName}
          onDescriptionChange={setCategoryDescription}
          onImageChange={setCategoryImage}
          onSortOrderChange={setCategorySortOrder}
          onCreate={createCategory}
          onClose={() => {
            if (creatingCategory) return;

            setShowAddCategory(false);
          }}
        />
      )}

      {/* CATEGORY PRODUCTS MODAL */}
      {selectedCategory && (
        <CategoryProductsModal
          category={selectedCategory}
          products={categoryProducts}
          loading={productsLoading}
          onClose={closeCategoryProducts}
        />
      )}
    </div>
  );
}

// STAT CARD
function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
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

// CATEGORY CARD
function CategoryCard({
  category,
  onView,
}: {
  category: CategorySummary;
  onView: () => void;
}) {
  const unavailableProducts =
    category.productCount -
    category.availableProducts;

  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Category
          </p>

          <h2 className="mt-1 text-xl font-extrabold">
            {category.name}
          </h2>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-xl">
          🍽️
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Products
          </p>

          <p className="mt-1 text-xl font-extrabold">
            {category.productCount}
          </p>
        </div>

        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Available
          </p>

          <p className="mt-1 text-xl font-extrabold">
            {category.availableProducts}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Unavailable
        </span>

        <span className="font-semibold">
          {unavailableProducts}
        </span>
      </div>

      <button
        type="button"
        onClick={onView}
        className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
      >
        View Products
      </button>
    </div>
  );
}

// ADD CATEGORY MODAL
function AddCategoryModal({
  categoryName,
  categoryDescription,
  categoryImage,
  categorySortOrder,
  creatingCategory,
  onNameChange,
  onDescriptionChange,
  onImageChange,
  onSortOrderChange,
  onCreate,
  onClose,
}: {
  categoryName: string;
  categoryDescription: string;
  categoryImage: string;
  categorySortOrder: number;
  creatingCategory: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageChange: (value: string) => void;
  onSortOrderChange: (value: number) => void;
  onCreate: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-background shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Admin Panel
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              Add Category
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creatingCategory}
            className="rounded-full px-3 py-2 text-xl hover:bg-muted disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4 p-5">

          {/* NAME */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Category Name *
            </label>

            <input
              type="text"
              value={categoryName}
              onChange={(event) =>
                onNameChange(event.target.value)
              }
              placeholder="e.g. Main Course"
              className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Description
            </label>

            <textarea
              value={categoryDescription}
              onChange={(event) =>
                onDescriptionChange(event.target.value)
              }
              placeholder="Enter category description"
              rows={3}
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* IMAGE */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Image URL
            </label>

            <input
              type="text"
              value={categoryImage}
              onChange={(event) =>
                onImageChange(event.target.value)
              }
              placeholder="https://example.com/image.jpg"
              className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* SORT ORDER */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Sort Order
            </label>

            <input
              type="number"
              value={categorySortOrder}
              onChange={(event) =>
                onSortOrderChange(
                  Number(event.target.value),
                )
              }
              className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 border-t p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={creatingCategory}
            className="flex-1 rounded-xl border px-5 py-3 text-sm font-bold transition hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onCreate}
            disabled={creatingCategory}
            className="flex-1 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creatingCategory
              ? "Creating..."
              : "Create Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

// CATEGORY PRODUCTS MODAL
function CategoryProductsModal({
  category,
  products,
  loading,
  onClose,
}: {
  category: string;
  products: Product[];
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-background shadow-2xl">

        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              {category}
            </h2>
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

        {/* PRODUCTS */}
        <div className="p-5">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />

                <p className="mt-4 text-sm text-muted-foreground">
                  Loading products...
                </p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border p-10 text-center">
              <div className="text-4xl">🍽️</div>

              <h3 className="mt-3 font-bold">
                No products found
              </h3>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-2xl">
                        🍽️
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {getPriceText(product)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={
                      product.isAvailable
                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
                        : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
                    }
                  >
                    {product.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
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

// PRICE TEXT
function getPriceText(product: Product) {
  const prices = product.prices || {};

  const values: string[] = [];

  if (prices.regular !== undefined) {
    values.push(`Regular ₹${prices.regular}`);
  }

  if (prices.half !== undefined) {
    values.push(`Half ₹${prices.half}`);
  }

  if (prices.full !== undefined) {
    values.push(`Full ₹${prices.full}`);
  }

  return values.join(" • ") || "Price not available";
}