import React, { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Search, X, ChevronLeft, ChevronRight, Calendar, Clock, ChevronDown } from "lucide-react";
import { api } from "../services/api";
import { Category, SubCategory } from "../types";
import { useCategories, useSubCategories, useInvalidateSubCategories } from "../services/queries";

/* ======================
   STATUS TOGGLE
====================== */
const StatusToggle: React.FC<{
  isActive: boolean;
  onToggle: (newStatus: boolean) => Promise<void>;
}> = ({ isActive, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
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
        ${loading ? "opacity-60 cursor-not-allowed" : ""}
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

const SubCategories: React.FC = () => {
  /* ================= QUERY HOOKS ================= */
  const { data: categories = [] } = useCategories();
  const { data: subCategories = [], isLoading } = useSubCategories();
  const invalidateSubCategories = useInvalidateSubCategories();

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState<Partial<SubCategory>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // const [categories, setCategories] = useState<Category[]>([]);
  // const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  // const [loading, setLoading] = useState(true);

  // const fetchAll = async () => { ... }
  // useEffect(() => { fetchAll(); }, []);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!currentSub.name || !currentSub.category_id) {
      alert("Name and parent category are required");
      return;
    }

    const parent = categories.find((c) => c.id === currentSub.category_id);
    if (parent && parent.is_active === false) {
      alert("Cannot add sub-category under an inactive category.");
      return;
    }

    try {
      const payload = {
        name: currentSub.name,
        category_id: currentSub.category_id,
        created_at: currentSub.created_at, // Send override date
      };

      if (currentSub.id) {
        await api.put(`/admin/subcategories/${currentSub.id}`, payload);
      } else {
        await api.post("/admin/subcategories", payload);
      }

      setIsModalOpen(false);
      setCurrentSub({});
      invalidateSubCategories();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Save failed");
    }
  };

  /* ================= STATUS TOGGLE ================= */
  const toggleStatus = async (sub: SubCategory, newStatus: boolean) => {
    if (!newStatus) {
      const confirmDisable = window.confirm(
        "Disabling this sub-category will disable all its products. Continue?"
      );
      if (!confirmDisable) return;
    }

    // Optimistic Update can be done via setQueryData, but for now we trust the invalidate

    try {
      await api.put(`/admin/subcategories/${sub.id}/status`, {
        is_active: newStatus,
      });
    } catch (err) {
      // Rollback not needed as we invalidate
      alert("Status update failed");
      invalidateSubCategories();
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (sub: SubCategory) => {
    if (sub.is_active) {
      alert("Disable the sub-category before deleting it.");
      return;
    }

    if ((sub.product_count ?? 0) > 0) {
      alert("Remove products under this sub-category first.");
      return;
    }

    if (!confirm(`Delete "${sub.name}"?`)) return;

    try {
      await api.delete(`/admin/subcategories/${sub.id}`);
      invalidateSubCategories();
    } catch (err) {
      alert("Delete failed");
    }
  };

  /* ================= FILTER & PAGINATION ================= */
  const filteredSubs = useMemo(() => {
    return subCategories.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !categoryFilter || s.category_id === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [subCategories, searchTerm, categoryFilter]);

  const totalPages = Math.ceil(filteredSubs.length / itemsPerPage);
  const paginatedSubs = filteredSubs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER / TOOLBAR */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative w-full sm:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sub-cats..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl h-12 focus:ring-2 focus:ring-indigo-100 outline-none text-sm sm:text-base bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="relative w-full sm:w-auto flex-1 min-w-0 md:flex-none">
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
          </div>
        </div>

        <button
          onClick={() => {
            setCurrentSub({});
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex gap-2 items-center justify-center transition-all shadow-sm shadow-indigo-200"
        >
          <Plus size={18} /> Add Sub-Category
        </button>
      </div>

      {/* TABLE / CARDS CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Created At</th>
                <th className="px-6 py-4 text-center">Parent Category</th>
                <th className="px-6 py-4 text-center">Products</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : paginatedSubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    No sub-categories found.
                  </td>
                </tr>
              ) : (
                paginatedSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{sub.name}</td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        {sub.created_at
                          ? new Date(sub.created_at).toLocaleDateString()
                          : "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                        {categories.find((c) => c.id === sub.category_id)?.name || "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-slate-600">
                      {sub.product_count ?? 0}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusToggle
                        isActive={sub.is_active}
                        onToggle={(s) => toggleStatus(sub, s)}
                      />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setCurrentSub(sub);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub)}
                          className={`p-2 rounded-lg transition-colors ${sub.is_active || (sub.product_count ?? 0) > 0
                            ? "opacity-30 cursor-not-allowed text-slate-400"
                            : "text-slate-600 hover:bg-red-50 hover:text-red-600"
                            }`}
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
          {isLoading ? (
            <p className="text-center text-slate-400">Loading...</p>
          ) : paginatedSubs.length === 0 ? (
            <p className="text-center text-slate-400">No sub-categories found.</p>
          ) : (
            paginatedSubs.map((sub) => (
              <div key={sub.id} className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{sub.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      in <span className="font-semibold">{categories.find((c) => c.id === sub.category_id)?.name || "—"}</span>
                    </p>
                  </div>
                  <StatusToggle
                    isActive={sub.is_active}
                    onToggle={(s) => toggleStatus(sub, s)}
                  />
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg flex-1">
                    <span className="font-bold text-lg">{sub.product_count ?? 0}</span>
                    <span className="text-[10px] uppercase text-slate-400">Products</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : "No date"}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCurrentSub(sub);
                        setIsModalOpen(true);
                      }}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(sub)}
                      disabled={sub.is_active || (sub.product_count ?? 0) > 0}
                      className={`p-2 rounded-lg ${sub.is_active || (sub.product_count ?? 0) > 0
                        ? "bg-slate-100 text-slate-300"
                        : "bg-red-50 text-red-600"
                        }`}
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

      {/* Pagination Controls */}
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
                {currentSub.id ? "Edit" : "Add"} Sub-Category
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={currentSub.category_id || ""}
                  onChange={(e) =>
                    setCurrentSub({
                      ...currentSub,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  value={currentSub.name || ""}
                  onChange={(e) =>
                    setCurrentSub({
                      ...currentSub,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Men, Women"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Creation Date (Admin Only)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="datetime-local"
                    value={
                      currentSub.created_at
                        ? new Date(currentSub.created_at).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setCurrentSub({
                        ...currentSub,
                        created_at: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full pl-10 pr-4 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategories;
