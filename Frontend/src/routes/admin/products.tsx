import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/auth";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type Product = {
  _id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  prices: {
    regular?: number;
    half?: number;
    full?: number;
  };
  isAvailable: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  sortOrder: number;
  createdAt: string;
};

type ProductForm = {
  name: string;
  description: string;
  category: string;
  image: string;
  regular: string;
  half: string;
  full: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  sortOrder: string;
};

import { API_URL } from "@/lib/api-config";

const emptyForm: ProductForm = {
  name: "",
  description: "",
  category: "",
  image: "",
  regular: "",
  half: "",
  full: "",
  isAvailable: true,
  isFeatured: false,
  isBestseller: false,
  sortOrder: "0",
};

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadProducts = async (showRefresh = false) => {
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

      const response = await fetch(`${API_URL}/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to fetch products",
        );
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error("Products error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch products",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      image: product.image || "",
      regular:
        product.prices?.regular !== undefined
          ? String(product.prices.regular)
          : "",
      half:
        product.prices?.half !== undefined
          ? String(product.prices.half)
          : "",
      full:
        product.prices?.full !== undefined
          ? String(product.prices.full)
          : "",
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      isBestseller: product.isBestseller,
      sortOrder: String(product.sortOrder ?? 0),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const updateForm = <K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveProduct = async () => {
    try {
      if (!form.name.trim()) {
        alert("Product name is required.");
        return;
      }

      if (!form.category.trim()) {
        alert("Category is required.");
        return;
      }

      const prices: Product["prices"] = {};

      if (form.regular.trim()) {
        prices.regular = Number(form.regular);
      }

      if (form.half.trim()) {
        prices.half = Number(form.half);
      }

      if (form.full.trim()) {
        prices.full = Number(form.full);
      }

      if (Object.keys(prices).length === 0) {
        alert("Enter at least one product price.");
        return;
      }

      for (const price of Object.values(prices)) {
        if (Number.isNaN(price) || price < 0) {
          alert("Prices must be valid positive numbers.");
          return;
        }
      }

      const token = getAuthToken();

      if (!token) {
        throw new Error("Admin authentication required");
      }

      setSaving(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        image: form.image.trim(),
        prices,
        isAvailable: form.isAvailable,
        isFeatured: form.isFeatured,
        isBestseller: form.isBestseller,
        sortOrder: Number(form.sortOrder) || 0,
      };

      const url = editingProduct
        ? `${API_URL}/admin/products/${editingProduct._id}`
        : `${API_URL}/admin/products`;

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save product",
        );
      }

      if (editingProduct) {
        setProducts((current) =>
          current.map((product) =>
            product._id === editingProduct._id
              ? data.product
              : product,
          ),
        );
      } else {
        setProducts((current) => [
          data.product,
          ...current,
        ]);
      }

      closeForm();
    } catch (err) {
      console.error("Save product error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to save product",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) return;

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Admin authentication required");
      }

      setDeletingId(product._id);

      const response = await fetch(
        `${API_URL}/admin/products/${product._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete product",
        );
      }

      setProducts((current) =>
        current.filter(
          (item) => item._id !== product._id,
        ),
      );
    } catch (err) {
      console.error("Delete product error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete product",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Admin authentication required");
      }

      setTogglingId(product._id);

      const response = await fetch(
        `${API_URL}/admin/products/${product._id}/toggle-availability`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to update product availability",
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item._id === product._id
            ? data.product
            : item,
        ),
      );
    } catch (err) {
      console.error("Toggle availability error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update availability",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [products, search]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      available: products.filter(
        (product) => product.isAvailable,
      ).length,
      unavailable: products.filter(
        (product) => !product.isAvailable,
      ).length,
      featured: products.filter(
        (product) => product.isFeatured,
      ).length,
      bestseller: products.filter(
        (product) => product.isBestseller,
      ).length,
    };
  }, [products]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />

          <p className="mt-4 text-muted-foreground">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-4 text-2xl font-bold">
            Unable to load products
          </h1>

          <p className="mt-2 text-muted-foreground">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadProducts()}
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

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-extrabold">
              Products
            </h1>

            <p className="mt-2 text-muted-foreground">
              Manage your restaurant menu and product availability.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadProducts(true)}
              disabled={refreshing}
              className="rounded-full border bg-background px-5 py-2.5 text-sm font-bold shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Products"
            value={stats.total}
          />

          <StatCard
            title="Available"
            value={stats.available}
          />

          <StatCard
            title="Unavailable"
            value={stats.unavailable}
          />

          <StatCard
            title="Featured"
            value={stats.featured}
          />

          <StatCard
            title="Bestsellers"
            value={stats.bestseller}
          />
        </div>

        {/* Search */}
        <div className="mt-8 rounded-2xl border bg-background p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products by name or category..."
            className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Result count */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredProducts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {products.length}
            </span>{" "}
            products
          </p>
        </div>

        {/* Products */}
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-background p-12 text-center">
              <div className="text-5xl">🍽️</div>

              <h2 className="mt-4 text-xl font-bold">
                No products found
              </h2>

              <p className="mt-2 text-muted-foreground">
                Add your first product or change your search.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                deleting={
                  deletingId === product._id
                }
                toggling={
                  togglingId === product._id
                }
                onEdit={openEditForm}
                onDelete={deleteProduct}
                onToggle={toggleAvailability}
              />
            ))
          )}
        </div>
      </div>

      {/* Product Form */}
      {showForm && (
        <ProductFormModal
          form={form}
          editing={Boolean(editingProduct)}
          saving={saving}
          updateForm={updateForm}
          onClose={closeForm}
          onSave={saveProduct}
        />
      )}
    </div>
  );
}

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

function ProductCard({
  product,
  deleting,
  toggling,
  onEdit,
  onDelete,
  onToggle,
}: {
  product: Product;
  deleting: boolean;
  toggling: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggle: (product: Product) => void;
}) {
  const prices: Product["prices"] = product.prices || {};

  return (
    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      {/* Image */}
      <div className="relative h-48 bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            🍽️
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              product.isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.isAvailable
              ? "Available"
              : "Unavailable"}
          </span>

          {product.isBestseller && (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
              Bestseller
            </span>
          )}

          {product.isFeatured && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">
              {product.name}
            </h2>

            <p className="mt-1 text-sm font-medium text-primary">
              {product.category}
            </p>
          </div>
        </div>

        {product.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}

        {/* Prices */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {prices.regular !== undefined && (
            <PriceBox
              label="Regular"
              value={prices.regular}
            />
          )}

          {prices.half !== undefined && (
            <PriceBox
              label="Half"
              value={prices.half}
            />
          )}

          {prices.full !== undefined && (
            <PriceBox
              label="Full"
              value={prices.full}
            />
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:bg-muted"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onToggle(product)}
            disabled={toggling}
            className="rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:bg-muted disabled:opacity-60"
          >
            {toggling
              ? "Updating..."
              : product.isAvailable
                ? "Disable"
                : "Enable"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDelete(product)}
          disabled={deleting}
          className="mt-2 w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
        >
          {deleting
            ? "Deleting..."
            : "Delete Product"}
        </button>
      </div>
    </div>
  );
}

function PriceBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-3 text-center">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-bold">
        ₹{value}
      </p>
    </div>
  );
}

function ProductFormModal({
  form,
  editing,
  saving,
  updateForm,
  onClose,
  onSave,
}: {
  form: ProductForm;
  editing: boolean;
  saving: boolean;
  updateForm: <K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-background shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-5">
          <div>
            <h2 className="text-xl font-extrabold">
              {editing
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {editing
                ? "Update the product details."
                : "Add a new item to your menu."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full px-3 py-2 text-xl hover:bg-muted disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 p-5">
          <FormField label="Product Name" required>
            <input
              value={form.name}
              onChange={(event) =>
                updateForm(
                  "name",
                  event.target.value,
                )
              }
              placeholder="e.g. Paneer Butter Masala"
              className="form-input"
            />
          </FormField>

          <FormField label="Category" required>
            <input
              value={form.category}
              onChange={(event) =>
                updateForm(
                  "category",
                  event.target.value,
                )
              }
              placeholder="e.g. Main Course"
              className="form-input"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm(
                  "description",
                  event.target.value,
                )
              }
              rows={3}
              placeholder="Describe the product..."
              className="form-input resize-none"
            />
          </FormField>

          <FormField label="Image URL">
            <input
              value={form.image}
              onChange={(event) =>
                updateForm(
                  "image",
                  event.target.value,
                )
              }
              placeholder="https://..."
              className="form-input"
            />
          </FormField>

          {/* Prices */}
          <div>
            <p className="mb-3 text-sm font-bold">
              Prices
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Regular">
                <input
                  type="number"
                  min="0"
                  value={form.regular}
                  onChange={(event) =>
                    updateForm(
                      "regular",
                      event.target.value,
                    )
                  }
                  placeholder="₹"
                  className="form-input"
                />
              </FormField>

              <FormField label="Half">
                <input
                  type="number"
                  min="0"
                  value={form.half}
                  onChange={(event) =>
                    updateForm(
                      "half",
                      event.target.value,
                    )
                  }
                  placeholder="₹"
                  className="form-input"
                />
              </FormField>

              <FormField label="Full">
                <input
                  type="number"
                  min="0"
                  value={form.full}
                  onChange={(event) =>
                    updateForm(
                      "full",
                      event.target.value,
                    )
                  }
                  placeholder="₹"
                  className="form-input"
                />
              </FormField>
            </div>
          </div>

          <FormField label="Sort Order">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                updateForm(
                  "sortOrder",
                  event.target.value,
                )
              }
              className="form-input"
            />
          </FormField>

          {/* Toggles */}
          <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
            <ToggleRow
              label="Available for customers"
              checked={form.isAvailable}
              onChange={(value) =>
                updateForm("isAvailable", value)
              }
            />

            <ToggleRow
              label="Featured product"
              checked={form.isFeatured}
              onChange={(value) =>
                updateForm("isFeatured", value)
              }
            />

            <ToggleRow
              label="Bestseller"
              checked={form.isBestseller}
              onChange={(value) =>
                updateForm("isBestseller", value)
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 border-t bg-background p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border px-5 py-3 text-sm font-bold hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editing
                ? "Update Product"
                : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm font-medium">
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-5 w-5 accent-primary"
      />
    </label>
  );
}

