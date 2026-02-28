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
} from "lucide-react";
import { Brand } from "../types";
import { api } from "../services/api";
import { useBrands, useInvalidateBrands } from "../services/queries";

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
    const [currentBrand, setCurrentBrand] = useState<Partial<Brand>>({});
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    /* ---------------- SAVE ---------------- */
    const handleSave = async () => {
        if (!currentBrand.name?.trim()) {
            alert("Brand name is required");
            return;
        }

        try {
            const payload = {
                name: currentBrand.name,
            };

            if (currentBrand.id) {
                await api.put(`/admin/brands/${currentBrand.id}`, payload);
            } else {
                await api.post("/admin/brands", payload);
            }

            setIsModalOpen(false);
            setCurrentBrand({});
            invalidateBrands();
        } catch (err: any) {
            // If brand already exists (409), we should refresh the list so the user can see it
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

    /* ---------------- FILTER & PAGINATION ---------------- */
    const filtered = brands.filter((b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedBrands = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="space-y-6 pb-10">
            {/* HEADER / TOOLBAR */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search brands..."
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl h-12 focus:ring-2 focus:ring-indigo-100 outline-none text-sm sm:text-base bg-slate-50 focus:bg-white transition-colors"
                    />
                </div>

                <button
                    onClick={() => {
                        setCurrentBrand({});
                        setIsModalOpen(true);
                    }}
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
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={2} className="p-10 text-center text-slate-400">
                                        Loading brands...
                                    </td>
                                </tr>
                            ) : paginatedBrands.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="p-10 text-center text-slate-400">
                                        No brands found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedBrands.map((brand) => (
                                    <tr key={brand.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                    <Tag size={16} />
                                                </span>
                                                <span className="font-bold text-slate-800">{brand.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentBrand(brand);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(brand)}
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
                                {currentBrand.id ? "Edit" : "New"} Brand
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
                                    Brand Name
                                </label>
                                <input
                                    value={currentBrand.name || ""}
                                    onChange={(e) =>
                                        setCurrentBrand({
                                            ...currentBrand,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Aarohi"
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                                />
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
