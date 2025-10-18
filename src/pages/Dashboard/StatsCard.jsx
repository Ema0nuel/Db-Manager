import React from "react";

export const StatsCard = ({ title, value, icon, color }) => (
  <div
    className={`p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 border-l-4 ${color}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <div
        className={`p-3 rounded-full ${color.replace(
          "border-",
          "bg-"
        )} bg-opacity-10`}
      >
        {icon}
      </div>
    </div>
  </div>
);
