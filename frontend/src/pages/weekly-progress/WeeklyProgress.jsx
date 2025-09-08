import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiBarChart2, FiPieChart } from "react-icons/fi";
import api from "../../services/api";
import { useAuth } from "../../context/AuthProvider";
import { FaChartLine } from "react-icons/fa";
import { Helmet } from "react-helmet";
import Loader from "../../components/Loader";

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#14b8a6", "#f97316"];

export default function WeeklyProgress() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/progress/${user?.email}`);
      setData(data || []);
    } catch (error) {
      console.error("Failed to fetch progress:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.email) load(); }, [user?.email]);

  const totals = useMemo(() => data.reduce((a, b) => a + b.total, 0), [data]);

  // Add percentage for pie chart
  const pieData = useMemo(() => {
    return data.map(d => ({
      ...d,
      percentage: totals ? ((d.total / totals) * 100).toFixed(1) : 0
    }));
  }, [data, totals]);

  if (loading) {
    return <Loader/>;
  }

  if (!data.length) {
    return <div className="text-center py-10 text-gray-500">No progress data available</div>;
  }

  return (
   <>
   <Helmet>
      <title>Weekly Progress | Brain Box</title>
    </Helmet>
   <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center gap-3 my-6"
    >
      <FaChartLine className="text-[#03A9F4] text-3xl sm:text-4xl md:text-5xl" />
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#03A9F4]">
        Weekly Progress
      </h1>
    </motion.div>
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Stats summary */}
      <motion.div
        className="stats border border-gray-300 shadow-md"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="stat">
          <div className="stat-title flex items-center gap-1 text-[#03A9F4]">
            <FiBarChart2 /> Total Classes
          </div>
          <div className="stat-value text-[#03A9F4]">{totals}</div>
        </div>
      </motion.div>

      {/* Charts grid */}
      <div className="grid md:grid-cols-1 lg:grid-cols-2 grid-cols-1 gap-6">
        {/* Bar chart */}
        <motion.div
          className="card bg-base-100 shadow p-4 border border-gray-300"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-bold mb-2 text-[#03A9F4] flex items-center gap-2">
            <FiBarChart2 /> Classes per Day
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} classes`, "Total"]} />
              <Bar
                dataKey="total"
                fill="#03A9F4"
                radius={[10, 10, 0, 0]}
                label={{ position: "top" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          className="card bg-base-100 shadow p-4 border border-gray-300"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-bold mb-2 text-[#03A9F4] flex items-center gap-2">
            <FiPieChart /> Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="total"
                nameKey="day"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value} classes`, `${props.payload.day}`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
   </>
  );
}
