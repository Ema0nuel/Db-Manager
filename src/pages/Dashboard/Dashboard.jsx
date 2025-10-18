/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import {
  RiDatabase2Line,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiAddLine,
} from "react-icons/ri";
import { useDatabases } from "../../hooks/useDatabases";
import { useAuth } from "../../hooks/useAuth";
import { StatsCard } from "./StatsCard";
import { CreateProjectModal } from "./CreateProjectModal";
import { ViewProjectModal } from "./ViewProjectModal";
import { pingService } from "../../utils/pingService";
import { supabase } from "../../Service/supabase/supabaseClient";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler // Added Filler plugin for fill option
);

// Chart options
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: "top",
    },
  },
  animation: false,
};

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top",
    },
  },
  animation: false,
};

const Dashboard = () => {
  const { databases, loading, error, stats, fetchDatabases } = useDatabases();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  const handleViewProject = (project) => {
    setSelectedProject({ ...project }); // Create a new object reference
    setShowViewModal(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowCreateModal(true); // Reuse create modal for editing
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const { error } = await supabase
        .from("databases")
        .delete()
        .eq("id", projectId);

      if (error) throw error;
      fetchDatabases(); // Refresh the list
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project");
    }
  };

  // Memoized chart data
  const chartData = useMemo(
    () => ({
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Active Databases",
          data: Array(4).fill(stats?.active || 0),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    }),
    [stats?.active]
  );

  const doughnutData = useMemo(
    () => ({
      labels: ["Active", "Inactive"],
      datasets: [
        {
          data: [
            stats?.active || 0,
            (stats?.total || 0) - (stats?.active || 0),
          ],
          backgroundColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)"],
        },
      ],
    }),
    [stats?.active, stats?.total]
  );

  const handleCreateSuccess = useCallback(() => {
    fetchDatabases();
    setShowCreateModal(false);
  }, [fetchDatabases]);

  const handleTestPing = async () => {
    setIsPinging(true);
    try {
      await pingService.testPingSystem();
      // Refresh the dashboard data
      fetchDatabases();
    } catch (error) {
      console.error("Ping test failed:", error);
    } finally {
      setIsPinging(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 m-4 bg-red-50 text-red-600 rounded-md">
        <p className="font-semibold">Error loading dashboard</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  // Stats cards data
  const statsCards = [
    {
      title: "Total Projects",
      value: stats?.total || 0,
      icon: <RiDatabase2Line className="h-6 w-6" />,
      color: "border-indigo-500",
    },
    {
      title: "Active Projects",
      value: stats?.active || 0,
      icon: <RiCheckboxCircleLine className="h-6 w-6" />,
      color: "border-green-500",
    },
    {
      title: "Pending Setup",
      value: stats?.pending || 0,
      icon: <RiErrorWarningLine className="h-6 w-6" />,
      color: "border-yellow-500",
    },
    {
      title: "Recent Projects",
      value: stats?.recent || 0,
      icon: <RiTimeLine className="h-6 w-6" />,
      color: "border-blue-500",
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          <RiAddLine className="mr-2" />
          Create Project
        </button>
      </div>

      <button
        onClick={handleTestPing}
        disabled={isPinging}
        className="ml-2 flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
      >
        {isPinging ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            Testing Ping...
          </>
        ) : (
          "Test Ping System"
        )}
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Project Activity
          </h3>
          <div className="h-[300px]">
            <Line data={chartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Project Status
          </h3>
          <div className="h-[300px]">
            <Doughnut data={doughnutData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Projects
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Ping
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Next Ping
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {databases.slice(0, 5).map((db) => (
                  <tr
                    key={db.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {db.project_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          db.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {db.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {db.last_ping_at
                        ? new Date(db.last_ping_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {db.next_ping_at
                        ? new Date(db.next_ping_at).toLocaleDateString()
                        : "Not scheduled"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewProject(db)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditProject(db)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(db.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedProject(null);
          }}
          onSuccess={handleCreateSuccess}
          project={selectedProject} // Pass selected project for editing
        />
      )}

      {/* View Project Modal */}
      <ViewProjectModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        key={selectedProject?.id} // Add key to force re-render
      />
    </div>
  );
};

export default Dashboard;
