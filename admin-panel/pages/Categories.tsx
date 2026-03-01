import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
} from "lucide-react";
import { Category } from "../types";
import { api } from "../services/api";
import { useCategories, useInvalidateCategories } from "../services/queries";

/* =======================
   STATUS TOGGLE COMPONENT
======================= */
const StatusToggle: React.FC<{
  isActive: boolean;
  onToggle: (newStatus: boolean) => Promise<void>;
}> = ({ isActive, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await onToggle(!isActive);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-3 py-1 rounded-full text-xs font-semibold transition
        ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
      `}
    >
      {loading ? "..." : isActive ? "Active" : "Inactive"}
    </button>
  );
};

/* =======================
   PAGINATION COMPONENT
======================= */
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

const Categories: React.FC = () => {
  /* ---------------- QUERY HOOKS ---------------- */
  const { data: categories = [], isLoading } = useCategories();
  const invalidateCategories = useInvalidateCategories();

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // const [categories, setCategories] = useState<Category[]>([]);
  // const [loading, setLoading] = useState(true);

  // Handled by React Query
  // const fetchCategories = async () => { ... }
  // useEffect(() => { fetchCategories(); }, []);

  // useEffect(() => {
  //   fetchCategories();
  // }, []);

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    if (!currentCategory.name?.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      const payload = {
        name: currentCategory.name,
        // Send created_at if edited/set
        created_at: currentCategory.created_at,
      };

      if (currentCategory.id) {
        await api.put(`/admin/categories/${currentCategory.id}`, payload);
      } else {
        await api.post("/admin/categories", payload);
      }

      setIsModalOpen(false);
      setCurrentCategory({});
      invalidateCategories();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Save failed");
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (cat: Category) => {
    if (cat.is_active) {
      alert("Disable the category before deleting it.");
      return;
    }

    if (!confirm(`Remove "${cat.name}"?`)) return;

    try {
      await api.delete(`/admin/categories/${cat.id}`);
      invalidateCategories();
      // setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Remove failed");
    }
  };

  /* ---------------- TOGGLE ACTIVE ---------------- */
  const toggleStatus = async (cat: Category, newStatus: boolean) => {
    if (!newStatus) {
      const confirmDisable = window.confirm(
        "Disabling this category will disable all its sub-categories and products. Continue?"
      );
      if (!confirmDisable) return;
    }

    // setCategories((prev) =>
    //   prev.map((c) => (c.id === cat.id ? { ...c, is_active: newStatus } : c))
    // );

    try {
      await api.put(`/admin/categories/${cat.id}/status`, {
        is_active: newStatus,
      });
      invalidateCategories();
    } catch (err) {
      // setCategories((prev) =>
      //   prev.map((c) => (c.id === cat.id ? { ...c, is_active: !newStatus } : c))
      // );
      alert("Status update failed");
    }
  };

  /* ---------------- FILTER & PAGINATION ---------------- */
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCategories = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl h-12 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
        </div>

        <button
          onClick={() => {
            setCurrentCategory({});
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-sm shadow-indigo-200"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      {/* TABLE (Desktop) / CARDS (Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Helper for "Mobile Only" layout if table is too wide, but standard table with hidden columns often works better.
            We'll use a responsive design: Cards on mobile, Table on MD+ */
        }

        {/* TABLE VIEW (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Created At</th>
                <th className="px-6 py-4 text-center">Sub-Categories</th>
                <th className="px-6 py-4 text-center">Products</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    Loading categories...
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    No categories found.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{cat.name}</p>
                      <p className="text-xs text-slate-400">/{cat.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        {cat.created_at
                          ? new Date(cat.created_at).toLocaleDateString()
                          : "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600">
                      {cat.subcategory_count ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600">
                      {cat.product_count ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusToggle
                        isActive={cat.is_active}
                        onToggle={(newStatus) => toggleStatus(cat, newStatus)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setCurrentCategory(cat);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
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

        {/* MOBILE CARD VIEW (Block on Mobile, Hidden on MD+) */}
        <div className="md:hidden space-y-4 p-4">
          {isLoading ? (
            <p className="text-center text-slate-400">Loading...</p>
          ) : paginatedCategories.length === 0 ? (
            <p className="text-center text-slate-400">No categories found.</p>
          ) : (
            paginatedCategories.map((cat) => (
              <div key={cat.id} className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{cat.name}</h3>
                    <p className="text-xs text-slate-400">/{cat.slug}</p>
                  </div>
                  <StatusToggle
                    isActive={cat.is_active}
                    onToggle={(newStatus) => toggleStatus(cat, newStatus)}
                  />
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg flex-1">
                    <span className="font-bold text-lg">{cat.subcategory_count ?? 0}</span>
                    <span className="text-[10px] uppercase text-slate-400">Sub-Cats</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg flex-1">
                    <span className="font-bold text-lg">{cat.product_count ?? 0}</span>
                    <span className="text-[10px] uppercase text-slate-400">Products</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : "No date"}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCurrentCategory(cat);
                        setIsModalOpen(true);
                      }}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer / Pagination */}
      {!isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4 md:p-0">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="font-bold text-xl text-slate-800">
                {currentCategory.id ? "Edit" : "New"} Category
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category Name
                </label>
                <input
                  value={currentCategory.name || ""}
                  onChange={(e) =>
                    setCurrentCategory({
                      ...currentCategory,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Sarees"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Creation Date (Admin Only)
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={
                      currentCategory.created_at
                        ? new Date(currentCategory.created_at).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        created_at: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm md:text-base"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Only visible in admin panel (for sorting/memory).
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-3 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold transition-colors shadow-lg shadow-indigo-200"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
