import React, { useEffect, useState } from "react";
import {
  Search,
  Phone,
  Globe,
  MessageSquare,
  MoreVertical,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { api } from "../services/api";
import { useEnquiries, useInvalidateEnquiries } from "../services/queries";

type Status = "New" | "Contacted" | "Converted" | "Dropped";
type Source = "Website" | "WhatsApp" | "Direct Call";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  source: Source;
  status: Status;
  created_at: string;
}

const Enquiries: React.FC = () => {
  const { data: enquiries = [], isLoading } = useEnquiries();
  const invalidateEnquiries = useInvalidateEnquiries();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  // const [isLoading, setIsLoading] = useState(false); // Handled by hook

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Showing 8 items per page

  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
    source: "Website" as Source,
  });

  /* ================= FETCH - Handled by React Query ================= */
  // const fetchEnquiries = async () => { ... }
  // useEffect(() => { fetchEnquiries(); }, []);

  /* ================= HELPERS ================= */
  const sourceIcon = (s: Source) => {
    switch (s) {
      case "Website": return <Globe size={14} className="text-blue-500" />;
      case "WhatsApp": return <MessageSquare size={14} className="text-green-500" />;
      case "Direct Call": return <Phone size={14} className="text-purple-500" />;
      default: return <Globe size={14} />;
    }
  };

  const statusStyle = (s: Status) => {
    switch (s) {
      case "New": return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10";
      case "Contacted": return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10";
      case "Converted": return "bg-green-50 text-green-700 border-green-200 ring-green-500/10";
      case "Dropped": return "bg-red-50 text-red-700 border-red-200 ring-red-500/10";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id: string, status: Status) => {
    try {
      await api.put(`/enquiries/${id}`, {
        status,
        is_converted: status === "Converted",
      });
      setOpenMenu(null);
      invalidateEnquiries();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  /* ================= MANUAL ENTRY ================= */
  const submitManual = async () => {
    if (!form.name || !form.phone || !form.message) return;

    try {
      await api.post("/enquiries/admin", form);
      setShowModal(false);
      setForm({ name: "", phone: "", message: "", source: "Website" });
      invalidateEnquiries();
    } catch (error) {
      console.error("Failed to create enquiry:", error);
    }
  };

  /* ================= FILTER & PAGINATION ================= */
  const filtered = enquiries.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search);
    const matchStatus =
      statusFilter === "All" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  /* ================= UI COMPONENTS ================= */

  const EnquiryCard: React.FC<{ e: Enquiry }> = ({ e }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{e.name}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <Phone size={12} /> {e.phone}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === e.id ? null : e.id)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          {openMenu === e.id && (
            <div className="absolute right-0 top-8 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden py-1">
              {(["Contacted", "Converted", "Dropped"] as Status[]).map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(e.id, status)}
                  className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors
                        ${status === "Dropped" ? 'text-red-600' : 'text-slate-700'}`}
                >
                  Mark {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
        {e.message}
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm ${statusStyle(e.status)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
          {e.status}
        </span>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
            {sourceIcon(e.source)} {e.source}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
          <p className="text-slate-500 text-sm mt-1">Manage customer leads and messages</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/10"
        >
          <UserPlus size={18} />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative min-w-[180px]">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-700"
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
            <option value="Dropped">Dropped</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="border-l-4 border-l-transparent border-t-[5px] border-t-slate-400 border-r-4 border-r-transparent"></div>
          </div>
        </div>
      </div>

      {/* CONTENT: MOBILE CARDS / DESKTOP TABLE */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {currentItems.map((e) => (
              <EnquiryCard key={e.id} e={e} />
            ))}
            {currentItems.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300 mx-auto w-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
                  <Filter className="text-slate-300" size={24} />
                </div>
                <p className="text-slate-500">No enquiries found</p>
              </div>
            )}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left w-1/3">Message</th>
                  <th className="px-6 py-4 text-center">Source</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Date</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {currentItems.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
                          {e.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{e.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            {e.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="line-clamp-2 text-sm text-slate-600 leading-relaxed" title={e.message}>
                        {e.message}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        {sourceIcon(e.source)}
                        {e.source}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${statusStyle(
                          e.status
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {e.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center text-xs text-slate-500 font-medium">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === e.id ? null : e.id)
                        }
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenu === e.id && (
                        <div className="absolute right-8 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                            Update Status
                          </div>
                          {(["Contacted", "Converted", "Dropped"] as Status[]).map(status => (
                            <button
                              key={status}
                              onClick={() => updateStatus(e.id, status)}
                              className={`flex items-center w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors gap-2
                                    ${status === "Dropped" ? 'text-red-600' : 'text-slate-700'}`}
                            >
                              {status === "Contacted" && <Clock size={14} />}
                              {status === "Converted" && <CheckCircle2 size={14} />}
                              {status === "Dropped" && <XCircle size={14} />}
                              Mark {status}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No enquiries found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-600 transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-600 transition-colors shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl text-slate-900">Add New Enquiry</h2>
                <p className="text-sm text-slate-500 mt-1">Manually enter a customer detail</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Customer Name</label>
                <input
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm"
                  placeholder="Enter name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                <input
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm"
                  placeholder="Enter phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Message</label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm resize-none"
                  placeholder="Enter enquiry message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Source</label>
                <select
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm bg-white"
                  value={form.source}
                  onChange={(e) =>
                    setForm({ ...form, source: e.target.value as Source })
                  }
                >
                  <option>Website</option>
                  <option>WhatsApp</option>
                  <option>Direct Call</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitManual}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
              >
                Save Enquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
