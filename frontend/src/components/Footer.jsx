import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaHome, FaFileAlt, FaShieldAlt } from 'react-icons/fa';
import { PiStudentDuotone } from 'react-icons/pi';
import { Link } from 'react-router-dom';

// Animation variants
const footerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const linkVariants = {
  hover: {
    scale: 1.1,
    transition: { duration: 0.3 },
  },
};

const Footer = () => {
  return (
    <motion.footer
      className="bg-base-300 text-base-content py-8 px-4 md:px-8 lg:px-16"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4">
        {/* Logo/Brand Section */}
        <div className="text-center md:text-left">
         <Link to="/" className="btn btn-ghost text-xl font-bold items-center text-[#03A9F4]"><PiStudentDuotone className="font-bold" /> Student Toolkit</Link>
          <p className="text-sm">Make your student life simpler</p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-lg font-semibold mb-4 text-[#03A9F4]">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <motion.li variants={linkVariants} whileHover="hover">
              <a href="/" className="flex items-center gap-2 hover:text-[#03A9F4]">
                <FaHome /> Home
              </a>
            </motion.li>
            <motion.li variants={linkVariants} whileHover="hover">
              <a href="/terms-and-conditions" className="flex items-center gap-2 hover:text-[#03A9F4]">
                <FaFileAlt /> Terms & Conditions
              </a>
            </motion.li>
            <motion.li variants={linkVariants} whileHover="hover">
              <a href="/about-us" className="flex items-center gap-2 hover:text-[#03A9F4]">
                <FaShieldAlt /> About Us
              </a>
            </motion.li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-lg font-semibold mb-4 text-[#03A9F4]">Contact Us</h4>
          <ul className="space-y-2 text-sm">
            <motion.li variants={linkVariants} whileHover="hover">
              <a href="mailto:support@studentlifetoolkit.com" className="flex items-center gap-2 hover:text-[#03A9F4]">
                <FaEnvelope /> support@studentlifetoolkit.com
              </a>
            </motion.li>
            <motion.li variants={linkVariants} whileHover="hover">
              <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-[#03A9F4]">
                <FaPhone /> +1 (234) 567-890
              </a>
            </motion.li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-lg font-semibold mb-4 text-[#03A9F4]">Follow Us</h4>
          <div className="flex gap-4">
            <motion.a href="https://facebook.com" variants={linkVariants} whileHover="hover" className="text-2xl hover:text-[#03A9F4]">
              <FaFacebook />
            </motion.a>
            <motion.a href="https://twitter.com" variants={linkVariants} whileHover="hover" className="text-2xl hover:text-[#03A9F4]">
              <FaTwitter />
            </motion.a>
            <motion.a href="https://instagram.com" variants={linkVariants} whileHover="hover" className="text-2xl hover:text-[#03A9F4]">
              <FaInstagram />
            </motion.a>
            <motion.a href="https://linkedin.com" variants={linkVariants} whileHover="hover" className="text-2xl hover:text-[#03A9F4]">
              <FaLinkedin />
            </motion.a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-sm border-t border-base-content/20 pt-4">
        © {new Date().getFullYear()} Student Life Toolkit. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;