import { api } from "./api";

export const authService = {
    // ✅ NOTICE: It now takes TWO arguments: email AND password
    login: async (email: string, password: string) => {
        const res = await api.post("/admin/login", { email, password });
        return res.data;
    },

    // Initiate Password Reset (Send OTP)
    forgotPassword: async (email: string) => {
        const res = await api.post("/admin/forgot-password", { email });
        return res.data;
    },

    // Complete Password Reset (Verify OTP and Set New Password)
    resetPassword: async (email: string, code: string, newPassword: string) => {
        const res = await api.post("/admin/reset-password", {
            email,
            code,
            newPassword,
        });
        return res.data;
    },
};