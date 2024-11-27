import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth/authProvider";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, checkAuthStatus, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/", { replace: true });
      }
    };

    verifyAuth();
  }, [checkAuthStatus, navigate]);

  if (!isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  if (requiredRole && userRole !== requiredRole) {
    navigate("/unauthorized", { replace: true });
    return null;
  }

  return children;
};

export default ProtectedRoute;
