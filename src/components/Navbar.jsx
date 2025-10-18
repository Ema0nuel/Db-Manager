/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../Service/supabase/supabaseClient"; // Make sure this path is correct
import {
  RiMenuLine,
  RiCloseLine,
  RiUserLine,
  RiLoginBoxLine,
  RiLogoutBoxLine,
} from "react-icons/ri";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    getUser();

    // Cleanup subscription
    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  // Profile modal component
  const ProfileModal = ({ name }) => (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
      <div className="py-1">
        <p className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
          {name || "User"}
        </p>
      </div>
    </div>
  );

  return (
    <nav className="bg-white shadow-lg dark:bg-gray-900 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                DB Manager
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Auth Section */}
            {!user ? (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-primary">
                  <RiLoginBoxLine className="mr-1" />
                  Login
                </Link>
                <Link to="/register" className="btn-secondary">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                {/* Profile Icon with Hover Modal */}
                <div className="relative">
                  <button
                    className="flex items-center nav-link"
                    onMouseEnter={() => setShowProfileModal(true)}
                    onMouseLeave={() => setShowProfileModal(false)}
                  >
                    <RiUserLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </button>
                  {showProfileModal && <ProfileModal name={user.email} />}
                </div>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn-secondary flex items-center"
                >
                  <RiLogoutBoxLine className="mr-1" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isOpen ? (
                <RiCloseLine className="h-6 w-6" />
              ) : (
                <RiMenuLine className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="mobile-nav-link">
              Home
            </Link>
            {!user ? (
              <>
                <Link to="/login" className="mobile-nav-link">
                  Login
                </Link>
                <Link to="/register" className="mobile-nav-link">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="mobile-nav-link">
                  Dashboard
                </Link>
                <div className="mobile-nav-link">
                  <RiUserLine className="mr-2 inline" />
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left mobile-nav-link"
                >
                  <RiLogoutBoxLine className="mr-2 inline" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
