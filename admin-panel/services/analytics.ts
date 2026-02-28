import { api } from "./api";

export type AnalyticsParams = {
  range?: number; // 7 | 30
  from?: string;
  to?: string;
};

export const fetchAnalytics = async (params?: AnalyticsParams) => {
  const res = await api.get("/admin/analytics", {
    params,
  });

  return res.data.data;
};

export const fetchDashboardStats = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};
