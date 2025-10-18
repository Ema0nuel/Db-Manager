import { Link } from "react-router-dom";
import { RiDatabase2Line, RiPingPongLine, RiTimeLine } from "react-icons/ri";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Keep Your Databases</span>
            <span className="block text-indigo-600 dark:text-indigo-400">
              Always Active
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Automatically ping your Supabase projects to prevent them from going
            inactive. Monitor health, track status, and maintain peak
            performance.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link
                to="/login"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="mt-24 grid gap-8 grid-cols-1 md:grid-cols-3">
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="absolute -top-4 left-4 bg-indigo-600 rounded-lg p-3">
              <RiDatabase2Line className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Database Monitoring
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Keep track of all your Supabase projects in one place
            </p>
          </div>
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="absolute -top-4 left-4 bg-green-600 rounded-lg p-3">
              <RiPingPongLine className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Automated Pings
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Schedule automatic pings to keep your databases active
            </p>
          </div>
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="absolute -top-4 left-4 bg-blue-600 rounded-lg p-3">
              <RiTimeLine className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Real-time Status
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Monitor health status and get instant insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
