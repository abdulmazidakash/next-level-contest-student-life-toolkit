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
     initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="mb-6"
      >
        <FaExclamationTriangle className="text-[#03A9F4] text-7xl md:text-8xl animate-pulse" />
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

      {/* Brand Link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-6 font-bold text-center"
      >
        <Link
          to="/"
          className="flex items-center text-xl border border-[#03A9F4] btn md:text-2xl text-[#03A9F4] hover:text-[#0288D1] transition"
        >
          <PiStudentDuotone className="mr-2 animate-pulse"/><span className="animate-pulse">Brain Box</span>
        </Link>
      </motion.p>
    </div>
  );
}
