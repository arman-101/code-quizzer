import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Import SVG icons (assuming they’re in src/achievements)
import Achievement1 from "../achievements/1.svg";
import Achievement2 from "../achievements/2.svg";
import Achievement3 from "../achievements/3.svg";
import Achievement4 from "../achievements/4.svg";
import Achievement5 from "../achievements/5.svg";
import Achievement6 from "../achievements/6.svg";
import Achievement7 from "../achievements/7.svg";
import Achievement8 from "../achievements/8.svg";
import Achievement9 from "../achievements/9.svg";
import Achievement10 from "../achievements/10.svg";

const Achievements: React.FC = () => {
  const navigate = useNavigate();

  // Array of achievements for easier mapping
  const achievements = [
    Achievement1,
    Achievement2,
    Achievement3,
    Achievement4,
    Achievement5,
    Achievement6,
    Achievement7,
    Achievement8,
    Achievement9,
    Achievement10,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Achievements</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
        >
          Back to Home
        </motion.button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* 3x3 Grid for Achievements 1-9 */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {achievements.slice(0, 9).map((AchievementIcon, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-center items-center bg-gray-100 p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <img
                src={AchievementIcon}
                alt={`Achievement ${index + 1}`}
                className="w-16 h-16"
              />
            </motion.div>
          ))}
        </div>

        {/* Centered 10th Achievement */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9 }}
            className="flex justify-center items-center bg-gray-100 p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <img
              src={Achievement10}
              alt="Achievement 10"
              className="w-16 h-16"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Achievements;