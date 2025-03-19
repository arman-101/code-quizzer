import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// Import SVGs (adjust path if needed)
import svg1 from "../achievements/1.svg";
import svg2 from "../achievements/2.svg";
import svg3 from "../achievements/3.svg";
import svg4 from "../achievements/4.svg";
import svg5 from "../achievements/5.svg";
import svg6 from "../achievements/6.svg";
import svg7 from "../achievements/7.svg";
import svg8 from "../achievements/8.svg";
import svg9 from "../achievements/9.svg";
import svg10 from "../achievements/10.svg"; // Added 10.svg

const Achievements: React.FC = () => {
  const navigate = useNavigate();

  // Array of SVGs for the 3x3 grid (9 items)
  const gridImages = [svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8, svg9];
  // 10th SVG to display below
  const extraImage = svg10;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-2xl mx-auto"
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
      <div className="bg-white p-4 rounded-lg shadow-md">
        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {gridImages.map((svg, index) => (
            <motion.div
              key={index}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="flex justify-center items-center p-2 border border-gray-200 rounded-lg"
            >
              <img
                src={svg}
                alt={`Achievement ${index + 1}`}
                className="w-32 h-32 object-contain" // Increased from w-24 h-24 to w-32 h-32
              />
            </motion.div>
          ))}
        </div>
        {/* 10th SVG below the grid */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="flex justify-center items-center p-2 border border-gray-200 rounded-lg"
        >
          <img
            src={extraImage}
            alt="Achievement 10"
            className="w-32 h-32 object-contain"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Achievements;