import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaGavel, FaUserShield, FaFileAlt, FaBan, FaExclamationTriangle, FaHandshake } from 'react-icons/fa';

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      staggerChildren: 0.2,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const TermsAndConditions = () => {
  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 bg-base-100 shadow-lg rounded-lg my-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
        <FaGavel className="text-primary" /> Terms and Conditions
      </h1>

      <p className="text-center mb-10 text-gray-600">
        Welcome to Student Life Toolkit. These terms and conditions outline the rules and regulations for the use of our website and services. By accessing this website, we assume you accept these terms and conditions. Do not continue to use Student Life Toolkit if you do not agree to all of the terms and conditions stated on this page.
      </p>

      <motion.section variants={sectionVariants} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FaUserShield className="text-blue-500" /> 1. User Accounts
        </h2>
        <p className="text-gray-700">
          To access certain features of the app, you may be required to create an account. You must provide accurate and complete information and keep your account information updated. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>
      </motion.section>

      <motion.section variants={sectionVariants} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FaFileAlt className="text-green-500" /> 2. Content and Data
        </h2>
        <p className="text-gray-700">
          Our app allows you to track classes, budgets, study plans, and generate exam questions. All data you input is your responsibility. We do not claim ownership of your content but may use anonymized data for improving our services. Ensure your content does not violate any laws or infringe on third-party rights.
        </p>
      </motion.section>

      <motion.section variants={sectionVariants} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FaBan className="text-red-500" /> 3. Prohibited Activities
        </h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Using the app for any illegal purposes.</li>
          <li>Attempting to hack, disrupt, or overload the app.</li>
          <li>Sharing false or misleading information.</li>
          <li>Harassing or harming other users.</li>
        </ul>
      </motion.section>

      <motion.section variants={sectionVariants} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-500" /> 4. Limitation of Liability
        </h2>
        <p className="text-gray-700">
          Student Life Toolkit is provided "as is" without any warranties. We are not liable for any damages arising from the use of the app, including loss of data or inaccuracies in generated content. Use at your own risk.
        </p>
      </motion.section>

      <motion.section variants={sectionVariants} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FaHandshake className="text-purple-500" /> 5. Changes to Terms
        </h2>
        <p className="text-gray-700">
          We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms. It is your responsibility to review these terms periodically.
        </p>
      </motion.section>

      <motion.section variants={sectionVariants} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FaGavel className="text-indigo-500" /> 6. Governing Law
        </h2>
        <p className="text-gray-700">
          These terms are governed by the laws of [Your Country/State], without regard to its conflict of law principles.
        </p>
      </motion.section>

      <p className="text-center text-gray-600 mt-10">
        If you have any questions about these Terms and Conditions, please contact us at support@studentlifetoolkit.com.
      </p>
    </motion.div>
  );
};

export default TermsAndConditions;