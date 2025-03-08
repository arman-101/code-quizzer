import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FAQ: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
        >
          Back to Home
        </motion.button>
      </div>
      <div className="space-y-6 bg-white p-4 rounded-lg shadow-md">
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
          <h3 className="font-semibold text-lg text-gray-800">How are scores calculated?</h3>
          <p className="text-gray-600">
            Questions 1-10 are Easy (10 points), 11-20 are Medium (20 points), and 21-30 are Hard (30
            points).
          </p>
        </motion.div>
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
          <h3 className="font-semibold text-lg text-gray-800">What happens to my data?</h3>
          <p className="text-gray-600">We only use your data to display it on the leaderboard.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FAQ;