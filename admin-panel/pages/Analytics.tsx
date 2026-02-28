import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";
import {
  MessageSquare,
  Target,
  Users,
  TrendingUp,
  Sparkles,
  Calendar,
  ArrowUpRight,
  Filter,
  BarChart3,
  PieChart,
  ServerCrash,
  FileText,
  X,
  Printer
} from "lucide-react";
import { useAnalytics } from "../services/queries";
// import { AuthContext } from "../context/AuthContext"; // Not needed

const Analytics: React.FC = () => {
  const [range, setRange] = useState<7 | 30>(7);
  const [showReportModal, setShowReportModal] = useState(false);

  const { data, isLoading } = useAnalytics(range);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <ServerCrash size={48} className="mb-4 text-slate-300" />
        <p>Failed to load analytics data.</p>
        {/* Retry handled by React Query auto-retry or window reload */}
      </div>
    );
  }

  const {
    summary = {},
    enquiryTrend = [],
    conversionTrend = [],
    topProducts = [],
    aiInsight,
  } = data || {};

  const hasEnquiryData = enquiryTrend.some((d: any) => d.enquiries > 0);
  const hasConversionData = conversionTrend.some(
    (d: any) => d.conversionRate > 0
  );

  /* ================= HANDLERS ================= */

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Track your performance and growth metrics</p>
        </div>

        {/* Date Filter */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-inner">
          {[7, 30].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as 7 | 30)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${range === r
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Last {r} Days
            </button>
          ))}
        </div>
      </div>

      {/* ================= SUMMARY STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Stat
          title="Total Enquiries"
          value={summary?.totalEnquiries || 0}
          icon={MessageSquare}
          color="indigo"
          trend="+12%" // Dummy trend for visual
        />
        <Stat
          title="Avg Conversion"
          value={`${summary?.avgConversion || 0}%`}
          icon={Target}
          color="emerald"
          trend="+3.2%"
        />
        <Stat
          title="Unique Visitors"
          value={summary?.visitors || 0}
          icon={Users}
          color="blue"
          trend="+8.5%"
        />
      </div>

      {/* ================= TREND CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Enquiry Trend" subtitle="Daily enquiry volume">
          {hasEnquiryData ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enquiryTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="enquiries"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#colorEnquiries)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={BarChart3} text="No enquiries recorded yet" />
          )}
        </ChartCard>

        <ChartCard title="Conversion Rate" subtitle="Percentage of converted leads">
          {hasConversionData ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={conversionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip valueSuffix="%" />} />
                  <Area
                    type="monotone"
                    dataKey="conversionRate"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorConversion)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={TrendingUp} text="No conversion data available" />
          )}
        </ChartCard>
      </div>

      {/* ================= TOP PRODUCTS & AI INSIGHT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-2">
          <ChartCard title="Top Products" subtitle="By enquiry volume">
            {topProducts.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="enquiries"
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState icon={PieChart} text="No product data to display" />
            )}
          </ChartCard>
        </div>

        {/* AI Insight Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-10 translate-x-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400 opacity-20 rounded-full translate-y-8 -translate-x-8 blur-xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
              <Sparkles className="text-yellow-300" size={16} />
              <span className="text-xs font-bold tracking-wide uppercase">AI Insight</span>
            </div>

            <h3 className="text-xl font-bold mb-3 leading-tight">Smart Recommendations</h3>
            <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
              {aiInsight || "Our AI is analyzing your data trends to provide actionable insights. Check back later for personalized growth recommendations."}
            </p>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="relative z-10 mt-6 w-full py-3 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-lg active:scale-[0.98]"
          >
            View Detailed Report
          </button>
        </div>
      </div>

      {/* ================= REPORT MODAL ================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowReportModal(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Performance Report</h3>
                  <p className="text-xs text-slate-500">Generated for last {range} days</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Total Enquiries</p>
                  <p className="text-xl font-bold text-slate-900">{summary?.totalEnquiries || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Avg. Conversion</p>
                  <p className="text-xl font-bold text-slate-900">{summary?.avgConversion || 0}%</p>
                </div>
              </div>

              {/* Analysis Text */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-500" />
                  AI Execution Summary
                </h4>
                <div className="text-sm text-slate-600 space-y-2 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p>{aiInsight || "Data analysis indicates stable performance. Consider increasing outreach to boost enquiry volume."}</p>
                  <p>
                    Top performing product category is <span className="font-semibold text-slate-900">{topProducts?.[0]?.name || "N/A"}</span> with {topProducts?.[0]?.enquiries || 0} enquiries.
                  </p>
                </div>
              </div>

              {/* Top Products List */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Top Products Breakdown</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3 text-right">Enquiries</th>
                        <th className="px-4 py-3 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(topProducts || []).map((p: any, i: number) => (
                        <tr key={i}>
                          <td className="px-4 py-3 font-medium text-slate-700">{p.name}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{p.enquiries}</td>
                          <td className="px-4 py-3 text-right text-slate-400">
                            {(summary?.totalEnquiries || 0) > 0
                              ? Math.round((p.enquiries / (summary?.totalEnquiries || 1)) * 100)
                              : 0}%
                          </td>
                        </tr>
                      ))}
                      {(topProducts || []).length === 0 && (
                        <tr><td colSpan={3} className="p-4 text-center text-slate-400">No data available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/10"
              >
                <Printer size={16} />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

/* ================= HELPERS COMPONENTS ================= */

const Stat: React.FC<{ title: string; value: string | number; icon: any; color: string; trend?: string }> = ({
  title, value, icon: Icon, color, trend
}) => {
  const colorStyles: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

const ChartCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title, subtitle, children
}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
    <div className="mb-6">
      <h3 className="font-bold text-lg text-slate-800">{title}</h3>
      {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
    </div>
    <div className="flex-1 min-h-[200px]">
      {children}
    </div>
  </div>
);

const EmptyState: React.FC<{ icon: any; text: string }> = ({ icon: Icon, text }) => (
  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
    <div className="p-4 bg-slate-50 rounded-full mb-3">
      <Icon size={24} className="opacity-50" />
    </div>
    <p className="text-sm font-medium">{text}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label, valueSuffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs">
        <p className="font-semibold mb-1 opacity-70 border-b border-white/20 pb-1 mb-2">{label}</p>
        <p className="font-bold text-base flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          {payload[0].value}{valueSuffix}
        </p>
      </div>
    );
  }
  return null;
};

