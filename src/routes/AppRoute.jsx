// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import PublicLayout from "../layouts/PublicLayout";
import ErrorBoundary from "../components/ErrorBoundary";

import Home from "../pages/Home";
import Login from "../pages/Auth/Login";
import Forgot from "../pages/Auth/Forgot";
import Signup from "../pages/Auth/Signup";
import Reset from "../pages/Auth/Reset";
import Dashboard from "../pages/Dashboard/Dashboard";

function AppRoutes() {
  return (
    <Routes>
      {/* Public route for home page */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        {<Route path="/login" element={<Login />} />}
        <Route path="/register" element={<Signup />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/reset-password" element={<Reset />} />
      </Route>

      {/* Private routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          }
        />
        {/* <Route path="/profile" element={<Profile />} /> */}
      </Route>
    </Routes>
  );
}

export default AppRoutes;
