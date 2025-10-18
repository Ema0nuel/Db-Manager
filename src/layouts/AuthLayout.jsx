import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

function AuthLayout() {
  const { checkAuthRedirectToDashboard, loading } = useAuth();

  useEffect(() => {
    checkAuthRedirectToDashboard();
  }, [checkAuthRedirectToDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
