import React from "react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear(); // Dynamically calculate the year

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 mt-auto"
    >
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-lg font-semibold">
          Code Quizzer &copy; {currentYear}
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;