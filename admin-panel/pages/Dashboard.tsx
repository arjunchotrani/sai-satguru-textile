import React, { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { useDashboardStats } from "../services/queries";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const COLORS = {
  Website: "#6366f1", // Indigo
  WhatsApp: "#10b981", // Emerald
  "Direct Call": "#f59e0b", // Amber
};

const Dashboard: React.FC = () => {
  const { data, isLoading } = useDashboardStats();

  const stats = {
    totalVisitors: data?.totalVisitors || 0,
    totalEnquiries: data?.totalEnquiries || 0,
    convertedLeads: data?.convertedLeads || 0,
    conversionRate:
      (data?.totalEnquiries || 0) > 0
        ? Math.round(
          (data?.convertedLeads / data?.totalEnquiries) * 100
        )
        : 0,
  };

  const enquiryTrend = data?.enquiryTrend || [];

  const leadSources = [
    { name: "Website", value: data?.leadSources?.Website || 0 },
    { name: "WhatsApp", value: data?.leadSources?.WhatsApp || 0 },
    { name: "Direct Call", value: data?.leadSources?.["Direct Call"] || 0 },
  ];

  if (isLoading) {
    return <p className="text-center text-slate-500">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-6 pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card
          icon={Users}
          label="Total Visitors"
          value={stats.totalVisitors}
          trend="+12% from last week"
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <Card
          icon={MessageSquare}
          label="Total Enquiries"
          value={stats.totalEnquiries}
          trend="+5 new today"
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <Card
          icon={CheckCircle}
          label="Converted Leads"
          value={stats.convertedLeads}
          trend="Conversion is healthy"
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <Card
          icon={TrendingUp}
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          trend="Based on enquiries"
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Enquiry Trend */}
        <div className="bg-white p-6 rounded-2xl border">
          <h3 className="font-semibold mb-4">Enquiries Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enquiryTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="enquiries"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔥 Lead Sources - Redesigned */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-800 mb-6">Lead Sources</h3>

            {leadSources.every((ls) => ls.value === 0) ? (
              <p className="text-slate-400 text-center mt-10">
                No lead source data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={leadSources}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                  barSize={32}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={100}
                    style={{ fontSize: "14px", fontWeight: 500, fill: "#475569" }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {leadSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Sources Summary Footer */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 border-t pt-6">
            {leadSources.map((source) => {
              const total = leadSources.reduce((acc, curr) => acc + curr.value, 0);
              const percentage = total > 0 ? Math.round((source.value / total) * 100) : 0;
              return (
                <div key={source.name} className="text-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1 truncate">
                    {source.name}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-slate-800">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Improved Card Component */
const Card = ({ icon: Icon, label, value, trend, color, bg }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {/* <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
        Live
      </span> */}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {trend && <p className="text-xs text-slate-400 mt-2">{trend}</p>}
    </div>
  </div>
);

export default Dashboard;
