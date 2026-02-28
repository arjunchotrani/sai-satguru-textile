import React, { useState } from "react";
import { useArchivedProducts, useRestoreProduct } from "../services/queries";
import { RotateCcw, Search, Package, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

const LIMIT = 10;

const Archived: React.FC = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = useArchivedProducts({ search, page, limit: LIMIT });
    const restoreMutation = useRestoreProduct();

    const products = data?.data || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / LIMIT);

    const handleRestore = async (id: string, name: string) => {
        if (!confirm(`Restore "${name}" to active products?`)) return;
        try {
            await restoreMutation.mutateAsync(id);
        } catch {
            alert("Failed to restore product");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Archived Products</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Inactive and deleted products. Restore them to make them active again.
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search archived products..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-500" size={20} />
                    <p className="text-red-700">Failed to load archived products. Please try again.</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Package size={48} strokeWidth={1.5} />
                    <p className="mt-4 text-lg font-medium">No archived products</p>
                    <p className="text-sm">Products you deactivate or delete will appear here.</p>
                </div>
            )}

            {/* Products Table */}
            {!isLoading && products.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left p-4 font-semibold text-slate-600">PRODUCT</th>
                                    <th className="text-left p-4 font-semibold text-slate-600">BRAND</th>
                                    <th className="text-left p-4 font-semibold text-slate-600">PRICE</th>
                                    <th className="text-left p-4 font-semibold text-slate-600">STATUS</th>
                                    <th className="text-center p-4 font-semibold text-slate-600">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product: any) => (
                                    <tr
                                        key={product.id}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                                    >
                                        {/* Product Name */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                        <Package size={16} className="text-slate-400" />
                                                    </div>
                                                )}
                                                <span className="font-medium text-slate-700">{product.name}</span>
                                            </div>
                                        </td>

                                        {/* Brand */}
                                        <td className="p-4 text-slate-500">
                                            {product.brand || "—"}
                                        </td>

                                        {/* Price */}
                                        <td className="p-4 font-semibold text-slate-700">
                                            ₹{product.price}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="p-4">
                                            {product.is_deleted ? (
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                                    Deleted
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        {/* Restore Button */}
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleRestore(product.id, product.name)}
                                                disabled={restoreMutation.isPending}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium text-sm disabled:opacity-50"
                                            >
                                                <RotateCcw size={14} />
                                                Restore
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} archived product{total !== 1 ? "s" : ""}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-medium text-slate-600 min-w-[80px] text-center">
                                Page {page} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Archived;
