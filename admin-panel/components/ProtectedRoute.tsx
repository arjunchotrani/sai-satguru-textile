import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const auth = useContext(AuthContext);
    const location = useLocation();

    // If loading or checking auth, we could return a spinner here
    // But for this simple implementation, we check the token
    const token = localStorage.getItem("admin_token");

    if (!auth?.isAuthenticated && !token) {
        // Redirect to login but save the current location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
