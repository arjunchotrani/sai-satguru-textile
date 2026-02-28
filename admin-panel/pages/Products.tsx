import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Share2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

import { generateAdminWhatsAppText } from "../utils/generateAdminWhatsAppText";
import { shareToWhatsApp } from "../utils/shareToWhatsApp";
import {
  useBrands,
  useCategories,
  useInvalidateProducts,
  useInvalidateBrands,
  useProduct,
  useProducts,
  useSubCategories,
  Product, // ✅ Added missing Type
} from "../services/queries";

/* ================= TYPES ================= */
// Types are now imported from services/queries


type Category = { id: string; name: string };
type SubCategory = { id: string; name: string; category_id: string };

/* ================= PAGINATION COMPONENT ================= */
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-slate-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === 1 && totalPages === 1 || currentPage === totalPages}
        className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

/* ================= COMPONENT ================= */
const Products: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState(""); // ✅ Brand Filter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    sub_category_id: "",
    price: "",
    description: "",
    brand_type: "Branded" as "Branded" | "Non-Branded", // Default
    brand: "",
  });

  /* ================= SEARCH DEBOUNCE ================= */
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ================= RESET PAGE ON FILTER CHANGE ================= */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryFilter, brandFilter]);

  /* ================= FETCH PRODUCTS (SERVER-SIDE) ================= */
  const { data: productData, isLoading: productsLoading } = useProducts({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    categoryId: categoryFilter,
    brand: brandFilter, // ✅ Pass to hook
    // subCategoryId: subCategoryFilter // TODO: Add UI for this
  });

  const products = productData?.data || [];
  const totalItems = productData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const { data: categories = [] } = useCategories();
  const { data: subCategories = [] } = useSubCategories();
  const { data: brands = [] } = useBrands();
  const invalidateBrands = useInvalidateBrands();

  const invalidateProducts = useInvalidateProducts();

  const loading = productsLoading;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // Fetch full details when editing
  const { data: fullProduct } = useProduct(editing?.id);

  // Update form description when full product details load
  useEffect(() => {
    if (fullProduct && editing) {
      setForm((prev) => ({
        ...prev,
        // Only update if description is missing or to sync with latest
        description: fullProduct.description || prev.description || "",
        brand_type: fullProduct.brand_type || "Branded",
        brand: fullProduct.brand || "",
      }));
    }
  }, [fullProduct, editing]);

  /* ================= SUB FILTER (FOR FORM) ================= */
  const formSubCategories = useMemo(
    () => subCategories.filter((s) => s.category_id === form.category_id),
    [form.category_id, subCategories]
  );

  /* ================= VISIBILITY ================= */
  const toggleVisibility = async (p: Product) => {
    const queryKey = ["products", {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
      categoryId: categoryFilter,
      brand: brandFilter,
    }];
    const previousProducts = queryClient.getQueryData(queryKey);

    if (previousProducts) {
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        data: old.data.map((item: Product) =>
          item.id === p.id ? { ...item, is_active: !p.is_active } : item
        ),
      }));
    }

    try {
      await api.put(`/admin/products/${p.id}/status`, {
        is_active: !p.is_active,
      });
      invalidateProducts();
    } catch (err) {
      // Rollback
      if (previousProducts) {
        queryClient.setQueryData(queryKey, previousProducts);
      }
      alert("Status update failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;

    const queryKey = ["products", {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
      categoryId: categoryFilter,
      brand: brandFilter,
    }];
    const previousProducts = queryClient.getQueryData(queryKey);

    if (previousProducts) {
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        data: old.data.filter((item: Product) => item.id !== p.id),
        total: old.total - 1,
      }));
    }

    try {
      await api.delete(`/admin/products/${p.id}`);
      invalidateProducts();
    } catch (err) {
      // Rollback
      if (previousProducts) {
        queryClient.setQueryData(queryKey, previousProducts);
      }
      alert("Delete failed");
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!form.name || !form.category_id || !form.price) {
      alert("Name, category and price are required");
      return;
    }

    if (form.brand_type === "Branded" && !form.brand) {
      alert("Brand Name is required for Branded products.");
      return;
    }

    const payload: any = {
      name: form.name,
      category_id: form.category_id,
      sub_category_id: form.sub_category_id || null,
      price: Number(form.price),
      description: form.description,
      brand_type: form.brand_type,
    };

    if (form.brand_type === "Branded") {
      payload.brand = form.brand;
    }
    // Note: If Non-Branded, we omit brand field entirely as per requirements.

    try {
      if (editing) {
        await api.put(`/admin/products/${editing.id}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }

      setDrawerOpen(false);
      setEditing(null);
      invalidateProducts();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Save failed");
    }
  };

  // Client-side filtering REMOVED - Using Server-side data
  const paginatedProducts = products; // Directly use fetched data


  /* ================= UI ================= */
  return (
    <div className="space-y-6 pb-10">
      {/* HEADER / TOOLBAR */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* SEARCH */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm sm:text-base bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

          {/* FILTERS: SIDE-BY-SIDE ON MOBILE */}
          <div className="flex gap-3 w-full sm:w-auto">
            {/* CATEGORY FILTER */}
            <div className="relative flex-1 min-w-0 sm:w-40 md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-3 pr-8 border border-slate-200 rounded-xl h-12 font-semibold text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none appearance-none bg-slate-50 focus:bg-white transition-colors text-sm sm:text-base truncate"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </div>

            {/* BRAND FILTER */}
            <div className="relative flex-1 min-w-0 sm:w-40 md:w-auto">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full px-3 py-3 pr-8 border border-slate-200 rounded-xl h-12 font-semibold text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none appearance-none bg-slate-50 focus:bg-white transition-colors text-sm sm:text-base truncate"
              >
                <option value="">All Brands</option>
                <option value="Generic">Generic</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setForm({
              name: "",
              category_id: "",
              sub_category_id: "",
              price: "",
              description: "",
              brand_type: "Branded",
              brand: "",
            });
            setDrawerOpen(true);
          }}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-sm shadow-indigo-200 transition-colors"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* TABLE / CARDS CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-[25%]">Product</th>
                <th className="px-6 py-4 w-[15%]">Brand</th>
                <th className="px-6 py-4 w-[10%]">Type</th>
                <th className="px-6 py-4 w-[15%]">Category</th>
                <th className="px-6 py-4 w-[10%]">Price</th>
                <th className="px-6 py-4 w-[10%] text-center">Visibility</th>
                <th className="px-6 py-4 w-[15%] text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">Loading...</td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">No products found.</td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>

                    <td className="px-6 py-4">
                      {p.brand_type === "Branded" && p.brand && p.brand.toLowerCase() !== "generic" ? (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold">
                          {p.brand}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Generic</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${p.brand_type === "Branded" && p.brand && p.brand.toLowerCase() !== "generic"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-orange-50 text-orange-600"
                        }`}>
                        {p.brand_type === "Branded" && p.brand && p.brand.toLowerCase() !== "generic" ? "Branded" : "Non-Branded"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-semibold">
                        {categories.find((c) => c.id === p.category_id)?.name || "—"}
                        {p.sub_category_id &&
                          ` / ${subCategories.find(s => s.id === p.sub_category_id)?.name}`
                        }
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-indigo-600">
                      ₹{p.price}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleVisibility(p)}
                        className={`p-2 rounded-lg transition-colors ${p.is_active
                          ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                      >
                        {p.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="Edit Product"
                          onClick={() => {
                            setEditing(p);
                            setForm({
                              name: p.name,
                              category_id: p.category_id,
                              sub_category_id: p.sub_category_id || "",
                              price: String(p.price),
                              description: p.description || "",
                              brand_type: (p.brand_type === "Branded" && p.brand && p.brand.toLowerCase() !== "generic") ? "Branded" : "Non-Branded",
                              brand: p.brand && p.brand.toLowerCase() === "generic" ? "Generic" : (p.brand || ""),
                            });
                            setDrawerOpen(true);
                          }}
                          className="p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>

                        <button
                          title="Upload Media"
                          onClick={() => navigate(`/media-upload/${p.id}`)}
                          className="p-2 text-slate-600 hover:bg-violet-50 hover:text-violet-600 rounded-lg"
                        >
                          <ImageIcon size={18} />
                        </button>

                        {/* WHATSAPP SHARE */}
                        <button
                          title="Share on WhatsApp"
                          onClick={() => {
                            const text = generateAdminWhatsAppText({
                              id: p.id,
                              name: p.name,
                              description: p.description || "",
                              brand: p.brand || "",
                            });
                            shareToWhatsApp(text);
                          }}
                          className="p-2 text-slate-600 hover:bg-green-50 hover:text-green-600 rounded-lg"
                        >
                          <Share2 size={18} />
                        </button>

                        <button
                          title="Delete Product"
                          onClick={() => handleDelete(p)}
                          className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4 p-4">
          {loading ? (
            <p className="text-center text-slate-400">Loading...</p>
          ) : paginatedProducts.length === 0 ? (
            <p className="text-center text-slate-400">No products found.</p>
          ) : (
            paginatedProducts.map((p) => (
              <div key={p.id} className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{p.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {categories.find((c) => c.id === p.category_id)?.name || "—"}
                      {p.sub_category_id &&
                        ` • ${subCategories.find(s => s.id === p.sub_category_id)?.name}`
                      }
                    </p>
                  </div>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                    ₹{p.price}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t overflow-x-auto pb-1">
                  <button
                    onClick={() => toggleVisibility(p)}
                    className={`flex-1 flex justify-center p-2 rounded-lg ${p.is_active
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                      }`}
                  >
                    {p.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(p);
                      setForm({
                        name: p.name,
                        category_id: p.category_id,
                        sub_category_id: p.sub_category_id || "",
                        price: String(p.price),
                        description: p.description || "",
                        brand_type: (p.brand_type === "Branded" && p.brand && p.brand.toLowerCase() !== "generic") ? "Branded" : "Non-Branded",
                        brand: p.brand && p.brand.toLowerCase() === "generic" ? "Generic" : (p.brand || ""),
                      });
                      setDrawerOpen(true);
                    }}
                    className="flex-1 flex justify-center p-2 bg-indigo-50 text-indigo-600 rounded-lg"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => navigate(`/media-upload/${p.id}`)}
                    className="flex-1 flex justify-center p-2 bg-violet-50 text-violet-600 rounded-lg"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <button
                    onClick={() => {
                      const text = generateAdminWhatsAppText({
                        id: p.id,
                        name: p.name,
                        description: p.description || "",
                        brand: p.brand || "",
                      });
                      shareToWhatsApp(text);
                    }}
                    className="flex-1 flex justify-center p-2 bg-green-50 text-green-600 rounded-lg"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="flex-1 flex justify-center p-2 bg-red-50 text-red-600 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-xl font-bold text-slate-800">
                {editing ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                  placeholder="Product name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* BRAND TYPE & BRAND NAME */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <label className="block text-sm font-bold text-slate-700">Brand Details</label>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="brand_type"
                      checked={form.brand_type === "Branded"}
                      onChange={() => setForm({ ...form, brand_type: "Branded", brand: "" })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Branded</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="brand_type"
                      checked={form.brand_type === "Non-Branded"}
                      onChange={() => setForm({ ...form, brand_type: "Non-Branded", brand: "Generic" })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Non-Branded (Generic)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {form.brand_type === "Branded" ? "Brand Name (Required)" : "Brand Name"}
                  </label>

                  {form.brand_type === "Branded" ? (
                    <div className="flex gap-2">
                      <select
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                        value={form.brand}
                        onChange={async (e) => {
                          if (e.target.value === "new") {
                            const newBrand = prompt("Enter new brand name:");
                            if (newBrand) {
                              try {
                                await api.post("/admin/brands", { name: newBrand });
                                await invalidateBrands();
                                setForm({ ...form, brand: newBrand });
                              } catch (err) {
                                alert("Failed to add brand");
                              }
                            }
                          } else {
                            setForm({ ...form, brand: e.target.value });
                          }
                        }}
                      >
                        <option value="">Select Brand</option>
                        {/* Show currently selected custom brand if not in list */}
                        {form.brand && !brands.find(b => b.name === form.brand) && (
                          <option value={form.brand}>{form.brand}</option>
                        )}
                        {brands.map((b) => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                        <option value="new" className="font-bold text-indigo-600">+ Add New Brand</option>
                      </select>
                    </div>
                  ) : (
                    <input
                      className="w-full p-3 border rounded-xl outline-none transition-colors bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                      value="Generic"
                      readOnly
                    />
                  )}

                  {form.brand_type === "Non-Branded" && (
                    <p className="text-xs text-slate-500 mt-1">
                      Non-Branded products will be saved under Brand: <strong>Generic</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category_id: e.target.value,
                        sub_category_id: "",
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sub-Category</label>
                  <select
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                    value={form.sub_category_id}
                    disabled={!form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, sub_category_id: e.target.value })
                    }
                  >
                    <option value="">Optional</option>
                    {formSubCategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    className="w-full pl-8 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-sm text-slate-700">Description</label>

                </div>
                <textarea
                  rows={6}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={handleSave}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
