// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="pt-16">
        <Outlet /> {/* This renders the current route view */}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
