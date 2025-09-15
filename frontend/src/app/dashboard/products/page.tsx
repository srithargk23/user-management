"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  category?: { _id: string; name: string };
}

interface Category {
  _id: string;
  name: string;
}

interface ProductsResponse {
  total: number;
  page: number;
  pages: number;
  products: Product[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");

  // Fetch products
  async function fetchProducts() {
  setLoading(true);
  setErr(null);
  try {
    const data = await apiRequest<ProductsResponse>("get", `/api/products`, {
      params: { page, limit, search: search.trim() || undefined, category: categoryFilter },
    });
    setProducts(data.products);
    setTotal(data.total);
  } catch (e: any) {
    setErr(e?.message || "Failed to load products");
  } finally {
    setLoading(false);
  }
}


  // Fetch categories
  async function fetchCategories() {
    try {
      const data = await apiRequest<Category[]>("get", "/api/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, categoryFilter]);

  // Search debounce
//   useEffect(() => {
//     const tt = setTimeout(() => {
//       setPage(1);
//       fetchProducts();
//     }, 350);
//     return () => clearTimeout(tt);
//   }, [search]);

  async function handleDelete(id: string) {
    const ok = confirm("Delete this product?");
    if (!ok) return;
    try {
      await apiRequest("delete", `/api/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err?.message || "Delete failed");

    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setImage(product.image || "");
    setCategory(product.category?._id || "");
    setShowAdd(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingProduct) {
        await apiRequest("put", `/api/products/${editingProduct._id}`, {data: { name, price, description, image, category },
        });
      } else {
        await apiRequest("post", "/api/products", {data: { name, price, description, image, category },
        });
      }
      fetchProducts();
      setShowAdd(false);
      resetForm();
    } catch (err: any) {
      alert(err?.message || "Save failed");
    }
  }

  function resetForm() {
    setEditingProduct(null);
    setName("");
    setPrice(0);
    setDescription("");
    setImage("");
    setCategory("");
  }

  return (
    <div className="p-6">
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          {/* <p className="text-sm text-gray-500">Manage products and categories</p> */}
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
          className="rounded-xl bg-gray-900 px-4 py-2 text-white shadow hover:bg-black/90 transition"
        >
          + Add Product
        </button>
      </div>

      {/* filters */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full gap-3 md:w-auto">
          <div className="relative flex-1">
  <input
    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 shadow-sm outline-none ring-0 focus:border-gray-400"
    placeholder="Search by product name…"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
  <button
    type="button"
    onClick={() => {
      if (search.trim().length === 0) {
        // reset → fetch all
        setPage(1);
        fetchProducts();
      } else {
        // search query
        setPage(1);
        fetchProducts();
      }
    }}
    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-800"
  >
     <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13z"
    />
  </svg>

  </button>
</div>


          {/* <select
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-gray-400"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select> */}
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-medium">
                <th>Product Name</th>
                <th>Price</th>
                <th className="hidden md:table-cell">Category</th>
                <th className="hidden md:table-cell">Description</th>
                <th className="w-36 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-red-600">
                    {err}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-700">${p.price}</td>
                    <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
                      {p.category?.name || "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {p.description}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* footer / pagination */}
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
          <div>
            Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{pages}</span> • Total{" "}
            <span className="font-medium">{total}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((pagi) => Math.max(1, pagi - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((pagi) => Math.min(pages, pagi + 1))}
              disabled={page >= pages}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-semibold">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form 
            onSubmit={handleSaveProduct} 
            noValidate 
            className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Name</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">Price</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">Description</label>
                <textarea
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">Category</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">Image URL</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-2"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Image url"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-4 py-2 text-white hover:bg-black/90"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
