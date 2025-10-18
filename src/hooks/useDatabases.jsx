/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../Service/supabase/supabaseClient";

export const useDatabases = () => {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    recent: 0,
  });

  // Memoize the stats calculation to prevent unnecessary recalculations
  const calculateStats = useCallback((data) => {
    if (!Array.isArray(data)) return stats;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      total: data.length,
      active: data.filter((db) => db.is_active).length,
      pending: data.filter((db) => !db.last_ping_at).length,
      recent: data.filter((db) => new Date(db.created_at) > weekAgo).length,
    };
  }, []);

  const fetchDatabases = async () => {
    try {
      const { data, error: dbError } = await supabase
        .from("databases")
        .select("*")
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;

      const fetchedData = data || [];
      setDatabases(fetchedData);

      // Calculate stats once after fetching data
      const newStats = calculateStats(fetchedData);
      setStats(newStats);
    } catch (err) {
      console.error("Error fetching databases:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Only run fetchDatabases once on mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  return {
    databases,
    loading,
    error,
    stats,
    fetchDatabases,
  };
};
