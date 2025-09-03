import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaBookOpen, FaWallet, FaTasks, FaPenFancy, FaChartLine } from "react-icons/fa";
import { Helmet } from "react-helmet";

export default function Dashboard() {
  const cards = [
    { to: "/dashboard/classes-schedule", title: "Class Schedule", desc: "Never miss a lecture", icon: <FaBookOpen /> },
    { to: "/dashboard/budget-tracking", title: "Budget Tracker", desc: "Know where money goes", icon: <FaWallet /> },
    { to: "/dashboard/study-planner", title: "Study Planner", desc: "Break big goals", icon: <FaTasks /> },
    { to: "/dashboard/exam-q-and-a", title: "Exam Q&A", desc: "Practice makes perfect", icon: <FaPenFancy /> },
    { to: "/dashboard/weekly-progress", title: "Weekly Progress", desc: "Pomodoro + block list", icon: <FaChartLine /> },
  ];

  return (
    <>
    <Helmet>
      <title>Dashboard | Student Toolkit</title>
    </Helmet>
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center gap-3 my-6"
    >
      <FaPenFancy className="text-[#03A9F4] text-3xl sm:text-4xl md:text-5xl" />
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#03A9F4]">
        Student Dashboard
      </h1>
    </motion.div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full my-8">
      {cards.map((c, i) => (
        <motion.div
          key={c.to}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.5, type: "spring" }}
        >
          <Link
            to={c.to}
            className="flex flex-col items-start p-6 rounded-2xl shadow-md hover:shadow-xl transition bg-white dark:bg-base-200 border border-gray-100"
          >
            <div className="text-4xl text-[#03A9F4] mb-4">{c.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{c.desc}</p>
          </Link>
        </motion.div>
      ))}
    </div>
    </>
  );
}
