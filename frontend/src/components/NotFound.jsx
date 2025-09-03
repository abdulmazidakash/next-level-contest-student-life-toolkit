import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";
import { PiStudentDuotone } from "react-icons/pi";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center px-4 text-center">
      {/* Animated Icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="mb-6"
      >
        <FaExclamationTriangle className="text-[#03A9F4] text-7xl md:text-8xl" />
      </motion.div>

      {/* 404 Title */}
      <motion.h1
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="text-6xl md:text-8xl font-extrabold text-[#03A9F4]"
      >
        404
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-4 text-lg md:text-2xl text-[#0398DC] font-medium"
      >
        Oops! Not Found Page.
      </motion.p>

      {/* Go Home Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6"
      >
        <Link
          to="/"
          className="px-6 py-3 rounded-lg bg-[#03A9F4] text-white font-semibold shadow-md hover:bg-[#0288D1] transition"
        >
          🏠 Back to home
        </Link>
      </motion.div>

      {/* Brand Link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-6 font-bold text-center"
      >
        <Link
          to="/"
          className="flex items-center text-xl md:text-2xl text-[#03A9F4] hover:text-[#0288D1] transition"
        >
          <PiStudentDuotone className="mr-2"/> Student Toolkit
        </Link>
      </motion.p>
    </div>
  );
}
