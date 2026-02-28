import React, { useState, useContext } from "react";
import { Lock, Mail, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { authService } from "../services/auth";

type ViewState = "LOGIN" | "FORGOT" | "RESET";

const Login: React.FC = () => {
  const [view, setView] = useState<ViewState>("LOGIN");

  // Form States
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");

  // UI States
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const auth = useContext(AuthContext);



  const clearState = () => {
    setError("");
    setSuccessMsg("");
    setOtp("");
    setNewPassword("");
    setPassword("");
  };

  const switchTo = (v: ViewState) => {
    clearState();
    setView(v);
  };

  // --- Handlers ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ✅ FIX: Passing email along with password
      const data = await authService.login(email, password);


      // Support multiple token property naming conventions
      const accessToken = data.accessToken || data.token || data.access_token;

      if (!accessToken) {
        console.error("Login successful but no token found:", data);
        throw new Error("No token received from server");
      }

      localStorage.setItem("admin_token", accessToken);
      auth?.login(accessToken);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccessMsg("Reset code sent to your email.");
      setTimeout(() => setView("RESET"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ✅ FIX: Passing email to reset password
      await authService.resetPassword(email, otp, newPassword);
      setSuccessMsg("Password reset successfully! Please login.");
      setTimeout(() => switchTo("LOGIN"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderLogin = () => (
    <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Quick Select */}
      {/* Quick Select - DISABLED FOR PRODUCTION */}
      {/* 
     
      */}

      <div>
        <label className="text-sm font-medium">Email</label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="admin@example.com"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Password</label>
          <button
            type="button"
            onClick={() => switchTo("FORGOT")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center"
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "Sign In"
        )}
      </button>

      <div className="mt-6 text-center pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Contact Support: <a href="mailto:Saisatgurutextile@gmail.com" className="text-indigo-600 font-medium hover:underline">Saisatgurutextile@gmail.com</a>
        </p>
      </div>
    </form>
  );

  const renderForgot = () => (
    <form onSubmit={handleForgot} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <KeyRound size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Reset Password</h2>
        <p className="text-sm text-slate-500 mt-2">
          We'll send a verification code to <strong>{email}</strong>
        </p>
      </div>

      <button
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center"
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "Send Reset Code"
        )}
      </button>

      <button
        type="button"
        onClick={() => switchTo("LOGIN")}
        className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center justify-center gap-2 py-2"
      >
        <ArrowLeft size={16} />
        Back to Login
      </button>
    </form>
  );

  const renderReset = () => (
    <form onSubmit={handleReset} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Set New Password</h2>
        <p className="text-sm text-slate-500 mt-2">
          Enter the code sent to your email and your new password.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Verification Code</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          placeholder="Enter OTP"
          className="w-full px-4 py-3 mt-1 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center tracking-widest font-mono text-lg"
        />
      </div>

      <div>
        <label className="text-sm font-medium">New Password</label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <button
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center"
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "Reset Password"
        )}
      </button>

      <button
        type="button"
        onClick={() => switchTo("LOGIN")}
        className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center justify-center gap-2 py-2"
      >
        Cancel
      </button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Sai Satguru Textiles</h1>
          {view === "LOGIN" && <p className="text-slate-500 text-sm mt-1">Authorized Access Only</p>}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">!</div>
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            {successMsg}
          </div>
        )}

        {view === "LOGIN" && renderLogin()}
        {view === "FORGOT" && renderForgot()}
        {view === "RESET" && renderReset()}

      </div>
    </div>
  );
};

export default Login;