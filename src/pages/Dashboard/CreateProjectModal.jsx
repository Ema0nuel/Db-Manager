import React, { useState } from "react";
import { RiCloseLine, RiInformationLine } from "react-icons/ri";
import { supabase } from "../../Service/supabase/supabaseClient";

export const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const initialFormData = {
    project_name: "",
    project_url: "",
    project_anon_key: "",
    service_role_key: "",
    ping_interval_days: 7,
    query_table: "", // Table to monitor in addition to auth check
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!formData.project_name.trim()) {
      throw new Error("Project name is required");
    }
    if (!formData.project_url.trim()) {
      throw new Error("Project URL is required");
    }
    if (!formData.project_anon_key.trim()) {
      throw new Error("Project Anon Key is required");
    }
    if (!formData.service_role_key.trim()) {
      throw new Error("Service Role Key is required for admin operations");
    }
    if (formData.ping_interval_days < 1 || formData.ping_interval_days > 30) {
      throw new Error("Ping interval must be between 1 and 30 days");
    }

    // Validate URL format
    try {
      new URL(formData.project_url);
    } catch {
      throw new Error("Please enter a valid URL");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null); // Clear error when user makes changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form
      validateForm();

      // Prepare project data
      const newProject = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_ping_at: null,
        next_ping_at: new Date(
          Date.now() + formData.ping_interval_days * 24 * 60 * 60 * 1000
        ).toISOString(),
        is_active: true,
      };

      // Insert into Supabase
      const { error: insertError } = await supabase
        .from("databases")
        .insert([newProject]);

      if (insertError) throw insertError;

      setSuccess(true);
      // Reset form
      setFormData(initialFormData);

      // Delay closing modal to show success state
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      // Disable scroll on body when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scroll when modal is closed
      document.body.style.overflow = "unset";
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed -top-8 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Project
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-3 rounded-md text-sm flex items-start">
              <RiInformationLine className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-200 p-3 rounded-md text-sm flex items-center">
              <RiInformationLine className="w-5 h-5 mr-2" />
              Project created successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="My Supabase Project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project URL
            </label>
            <input
              type="url"
              name="project_url"
              value={formData.project_url}
              onChange={handleChange}
              required
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Anon Key
            </label>
            <input
              type="text"
              name="project_anon_key"
              value={formData.project_anon_key}
              onChange={handleChange}
              required
              placeholder="your-anon-key"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Role Key
            </label>
            <input
              type="text"
              name="service_role_key"
              value={formData.service_role_key}
              onChange={handleChange}
              required
              placeholder="your-service-role-key"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Required for admin operations like checking users
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Query Table
            </label>
            <input
              type="text"
              name="query_table"
              value={formData.query_table}
              onChange={handleChange}
              placeholder="Table to monitor (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Table to check in addition to auth (leave empty to only check
              auth)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ping Interval (days)
            </label>
            <input
              type="number"
              name="ping_interval_days"
              value={formData.ping_interval_days}
              onChange={handleChange}
              min="1"
              max="30"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              How often to ping this database (1-30 days)
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
