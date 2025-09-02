import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaWallet, FaQuestionCircle, FaClipboardList } from 'react-icons/fa';

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function Home() {
  return (
    <div className="">
      {/* Hero Section */}
      <motion.div
        className="grid lg:grid-cols-2 gap-6 items-center min-h-[80vh] px-4 md:px-8 lg:px-16"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <div>
          <h1 className="text-4xl font-bold mb-4">Make your student life simpler ✨</h1>
          <p className="mb-6">Track classes, plan studies, manage budget, generate exam questions and stay focused.</p>
          <div className="flex gap-3">
            <Link to="/dashboard" className="btn bg-[#03A9F4] text-white hover:bg-[#0398DC]">Open Dashboard</Link>
            <Link to="/about-us" className="btn text-[#03A9F4] border-[#03A9F4]">About Us</Link>
          </div>
        </div>
        <img className="rounded-2xl shadow" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" alt="hero" />
      </motion.div>

      {/* Features Section */}
      <motion.section
        id="features"
        className="py-12 px-4 md:px-8 lg:px-16"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold text-center mb-10">Our Key Features ✨</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            className="card bg-base-100 shadow hover:shadow-lg p-6 text-center"
            variants={cardVariants}
          >
            <FaCalendarAlt className="text-4xl text-[#03A9F4] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Class Schedule Tracker</h3>
            <p className="text-sm text-gray-600">Add, edit, or delete classes with color coding for easy tracking.</p>
          </motion.div>
          <motion.div
            className="card bg-base-100 shadow hover:shadow-lg p-6 text-center"
            variants={cardVariants}
          >
            <FaWallet className="text-4xl text-[#03A9F4] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Budget Tracker</h3>
            <p className="text-sm text-gray-600">Manage income, expenses, and savings with visual charts.</p>
          </motion.div>
          <motion.div
            className="card bg-base-100 shadow hover:shadow-lg p-6 text-center"
            variants={cardVariants}
          >
            <FaQuestionCircle className="text-4xl text-[#03A9F4] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Exam Q&A Generator</h3>
            <p className="text-sm text-gray-600">Generate practice questions with difficulty levels for exam prep.</p>
          </motion.div>
          <motion.div
            className="card bg-base-100 shadow hover:shadow-lg p-6 text-center"
            variants={cardVariants}
          >
            <FaClipboardList className="text-4xl text-[#03A9F4] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Study Planner</h3>
            <p className="text-sm text-gray-600">Break down goals into tasks with priorities and deadlines.</p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}