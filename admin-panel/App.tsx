import React, { useState, useContext, useEffect, Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  ListTree,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Tags,
  Wand2,
  Award,
  Archive,
} from "lucide-react";

/* ================= PAGES ================= */
import Loading from "./components/Loading";

/* ================= PAGES ================= */
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import SubCategories from "./pages/SubCategories";
import Products from "./pages/Products";
import MediaUpload from "./pages/MediaUpload";
import Enquiries from "./pages/Enquiries";
import Analytics from "./pages/Analytics";
import SmartFormatter from "./pages/SmartFormatter";
import Archived from "./pages/Archived";

import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

/* ================= MAIN LAYOUT ================= */
const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const location = useLocation();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: ShoppingBag },
    { name: "Categories", path: "/categories", icon: ListTree },
    { name: "Brands", path: "/brands", icon: Award },
    { name: "Sub-Categories", path: "/sub-categories", icon: Tags },
    { name: "Enquiries", path: "/enquiries", icon: MessageSquare },
    { name: "Smart Formatter", path: "/smart-formatter", icon: Wand2 },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Archived", path: "/archived", icon: Archive },
  ];

  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
  };

  const activeItem = navItems.find((i) => {
    if (i.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(i.path);
  });
  const currentPage = activeItem?.name || "Admin";

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-x-hidden">
      {/* Sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-[40] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed h-full bg-slate-900 text-slate-300 z-[50] transition-all duration-300
        ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"}
      `}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
            SS
          </div>
          {isSidebarOpen && (
            <span className="ml-3 text-white font-bold">Sai Satguru</span>
          )}
          <button
            className="ml-auto lg:hidden text-slate-400"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-xl transition
                ${active ? "bg-indigo-600 text-white" : "hover:bg-slate-800"}
              `}
              >
                <Icon size={20} />
                {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <header className="h-16 bg-white border-b flex items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu />
            </button>
            <h1 className="font-bold text-lg text-slate-800">{currentPage}</h1>
          </div>
          <Bell />
        </header>

        <main className="p-6 flex-1">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/sub-categories" element={<SubCategories />} />
              <Route path="/products" element={<Products />} />
              <Route path="/smart-formatter" element={<SmartFormatter />} />
              <Route path="/media-upload/:productId" element={<MediaUpload />} />
              <Route path="/enquiries" element={<Enquiries />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/archived" element={<Archived />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

/* ================= APP ROOT ================= */
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem("admin_token")
  );

  const login = (token: string) => {
    localStorage.setItem("admin_token", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
        <HashRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Login Page: Only accessible if not authenticated */}
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
              />

              {/* Protected Routes: All other paths wrapped in ProtectedRoute */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </HashRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
