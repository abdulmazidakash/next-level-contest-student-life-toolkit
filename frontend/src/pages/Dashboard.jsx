import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaBookOpen, FaWallet, FaTasks, FaPenFancy, FaChartLine } from "react-icons/fa";

export default function Dashboard() {
  const cards = [
    { to: "/classes", title: "Class Schedule", desc: "Never miss a lecture", icon: <FaBookOpen /> },
    { to: "/budget", title: "Budget Tracker", desc: "Know where money goes", icon: <FaWallet /> },
    { to: "/planner", title: "Study Planner", desc: "Break big goals", icon: <FaTasks /> },
    { to: "/exam", title: "Exam Q&A", desc: "Practice makes perfect", icon: <FaPenFancy /> },
    { to: "/weekly-progress", title: "Weekly Progress", desc: "Pomodoro + block list", icon: <FaChartLine /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {cards.map((c, i) => (
        <motion.div
          key={c.to}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.5, type: "spring" }}
        >
          <Link
            to={c.to}
            className="flex flex-col items-start p-6 rounded-2xl shadow-md hover:shadow-xl transition bg-white dark:bg-base-200"
          >
            <div className="text-4xl text-primary mb-4">{c.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{c.desc}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
