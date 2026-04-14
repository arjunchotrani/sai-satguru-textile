import React, { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Edit2,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    Tag,
    Link,
} from "lucide-react";
import { Brand } from "../types";
import { api } from "../services/api";
import { useBrands, useInvalidateBrands } from "../services/queries";

/* =======================
   SLUG HELPER (mirrors frontend normalizeSlug)
======================= */
function toSlug(text: string): string {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

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

const Brands: React.FC = () => {
    /* ---------------- QUERY HOOKS ---------------- */
    const { data: brands = [], isLoading } = useBrands();
    const invalidateBrands = useInvalidateBrands();

    // Local State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBrand, setCurrentBrand] = useState<Partial<Brand & { slug: string }>>({});
    const [customSlug, setCustomSlug] = useState('');
    const [slugEdited, setSlugEdited] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Auto-generate slug from name (unless user manually edited it)
    useEffect(() => {
        if (!slugEdited && currentBrand.name) {
            setCustomSlug(toSlug(currentBrand.name));
        }
    }, [currentBrand.name, slugEdited]);

    /* ---------------- SAVE ---------------- */
    const handleSave = async () => {
        if (!currentBrand.name?.trim()) {
            alert("Brand name is required");
            return;
        }

        const finalSlug = customSlug.trim() || toSlug(currentBrand.name);

        try {
            const payload = {
                name: currentBrand.name,
                slug: finalSlug,
            };

            if (currentBrand.id) {
                await api.put(`/admin/brands/${currentBrand.id}`, payload);
            } else {
                await api.post("/admin/brands", payload);
            }

            setIsModalOpen(false);
            setCurrentBrand({});
            setCustomSlug('');
            setSlugEdited(false);
            invalidateBrands();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                invalidateBrands();
                setIsModalOpen(false);
            }
            alert(err?.response?.data?.message || "Save failed");
        }
    };

    /* ---------------- DELETE ---------------- */
    const handleDelete = async (brand: Brand) => {
        if (!confirm(`Remove "${brand.name}"?`)) return;

        try {
            await api.delete(`/admin/brands/${brand.id}`);
            invalidateBrands();
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.message || "Remove failed");
        }
    };

    /* ---------------- OPEN MODAL ---------------- */
    const openEdit = (brand?: any) => {
        if (brand) {
            setCurrentBrand(brand);
            const existingSlug = brand.slug ? toSlug(brand.slug) : toSlug(brand.name);
            setCustomSlug(existingSlug);
            // If DB slug has a space, it's broken — don't mark as manually edited
            setSlugEdited(!!brand.slug && !brand.slug.includes(' '));
        } else {
            setCurrentBrand({});
            setCustomSlug('');
            setSlugEdited(false);
        }
        setIsModalOpen(true);
    };

    /* ---------------- FILTER & PAGINATION ---------------- */
    const filtered = brands.filter((b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedBrands = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    return (
        <div className="space-y-6 pb-10">
            {/* HEADER / TOOLBAR */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search brands..."
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl h-12 focus:ring-2 focus:ring-indigo-100 outline-none text-sm sm:text-base bg-slate-50 focus:bg-white transition-colors"
                    />
                </div>

                <button
                    onClick={() => openEdit()}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-sm shadow-indigo-200"
                >
                    <Plus size={20} /> Add Brand
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">URL Slug</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-slate-400">
                                        Loading brands...
                                    </td>
                                </tr>
                            ) : paginatedBrands.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-slate-400">
                                        No brands found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedBrands.map((brand: any) => {
                                    const displaySlug = brand.slug ? toSlug(brand.slug) : toSlug(brand.name);
                                    const isBadSlug = brand.slug?.includes(' ') || brand.slug?.includes('%');
                                    return (
                                        <tr key={brand.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                        <Tag size={16} />
                                                    </span>
                                                    <span className="font-bold text-slate-800">{brand.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-mono px-2 py-1 rounded-md ${isBadSlug
                                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                                        : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        /brand/{displaySlug}
                                                    </span>
                                                    {isBadSlug && (
                                                        <span className="text-[10px] text-red-500 font-bold">⚠ Fix needed</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(brand)}
                                                        className="p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                                                        title="Edit brand"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(brand)}
                                                        className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                        title="Delete brand"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!isLoading && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4 md:p-0">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="font-bold text-xl text-slate-800">
                                {currentBrand.id ? "Edit" : "New"} Brand
                            </h2>
                            <button
                                onClick={() => { setIsModalOpen(false); setSlugEdited(false); }}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Brand Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Brand Name
                                </label>
                                <input
                                    value={currentBrand.name || ""}
                                    onChange={(e) => setCurrentBrand({ ...currentBrand, name: e.target.value })}
                                    placeholder="e.g. Alizeh Official"
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                />
                            </div>

                            {/* Slug Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    URL Slug
                                    <span className="ml-1 text-xs text-slate-400 font-normal">(auto-generated · you can override)</span>
                                </label>
                                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100">
                                    <span className="px-3 py-3 bg-slate-50 text-slate-400 text-sm border-r border-slate-200 whitespace-nowrap select-none">
                                        /brand/
                                    </span>
                                    <input
                                        value={customSlug}
                                        onChange={(e) => {
                                            setSlugEdited(true);
                                            // Only allow url-safe chars
                                            setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-'));
                                        }}
                                        placeholder="alizeh-official"
                                        className="flex-1 p-3 outline-none font-mono text-sm"
                                    />
                                </div>
                                <p className="mt-1.5 text-xs text-slate-400">
                                    Live URL:{" "}
                                    <span className="font-mono text-indigo-500">
                                        saisatgurutextile.com/brand/{customSlug || toSlug(currentBrand.name || '')}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => { setIsModalOpen(false); setSlugEdited(false); }}
                                className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-3 font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold transition-colors shadow-lg shadow-indigo-200"
                            >
                                Save Brand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Brands;
