// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import {
  FaUsers,
  FaLightbulb,
  FaVideo,
  FaTasks,
  FaLock,
  FaMobileAlt,
} from "react-icons/fa";

const AboutUsPage = () => {
  return (
    <>
    <Helmet>
      <title>About Us | Brain Box</title>
    </Helmet>
    <div className="min-h-screen  flex flex-col items-center px-4 py-10">
      {/* Title Section */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl md:text-5xl font-bold text-[#03A9F4] mb-6 text-center"
      >
        About Our App
      </motion.h1>

      {/* Description Section */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="max-w-3xl text-center text-gray-700 text-base md:text-lg leading-relaxed mb-10"
      >
        The <strong className="text-[#03A9F4]">Brain Box</strong> is designed to make learning and task
        management seamless. From tracking assignments to accessing resources,
        everything is built with modern technology to ensure <span className="text-[#03A9F4] font-semibold">speed,
        security, and flexibility</span> across all devices.
      </motion.p>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mb-12">
        {/* User Friendly */}
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center border border-gray-100">
          <FaUsers className="text-4xl text-[#F67E04] mb-4" />
          <h3 className="font-semibold text-lg mb-2">User Friendly</h3>
          <p className="text-gray-600 text-center">
            Simple interface so anyone can use it without hassle. No steep learning curve.
          </p>
        </motion.div>

        {/* Smart Features */}
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center border border-gray-100">
          <FaLightbulb className="text-4xl text-[#317371] mb-4" />
          <h3 className="font-semibold text-lg mb-2">Smart AI Features</h3>
          <p className="text-gray-600 text-center">
            AI-powered tools to save your time and enhance productivity.
          </p>
        </motion.div>

        {/* Video Guide */}
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center border border-gray-100">
          <FaVideo className="text-4xl text-[#785F54] mb-4" />
          <h3 className="font-semibold text-lg mb-2">Video Guide</h3>
          <p className="text-gray-600 text-center">
            Watch step-by-step instructions on how to use every feature.
          </p>
        </motion.div>

        {/* Task Management */}
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center border border-gray-100">
          <FaTasks className="text-4xl text-[#9C27B0] mb-4" />
          <h3 className="font-semibold text-lg mb-2">Task Management</h3>
          <p className="text-gray-600 text-center">
            Organize your assignments, set deadlines, and track progress easily.
          </p>
        </motion.div>

        {/* Security */}
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center border border-gray-100">
          <FaLock className="text-4xl text-[#E91E63] mb-4" />
          <h3 className="font-semibold text-lg mb-2">Secure Access</h3>
          <p className="text-gray-600 text-center">
            Your data is encrypted and fully protected with modern security practices.
          </p>
        </motion.div>

        {/* Responsive */}
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center border border-gray-100">
          <FaMobileAlt className="text-4xl text-[#2196F3] mb-4" />
          <h3 className="font-semibold text-lg mb-2">Responsive Design</h3>
          <p className="text-gray-600 text-center">
            Optimized for mobile, tablet, and desktop for the best experience.
          </p>
        </motion.div>
      </div>

      {/* Video Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="w-full max-w-4xl aspect-video shadow-lg rounded-2xl overflow-hidden"
      >
        <iframe
          src="https://drive.google.com/file/d/1RCB5Sy8N84IszuYtDM4dYEBGmmxLDpBd/preview"
          className="w-full h-full"
          allow="autoplay; fullscreen"
        />
      </motion.div>
    </div>
    </>
  );
};

export default AboutUsPage;
