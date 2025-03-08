import React from "react";
import { HighScore } from "../types";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface LeaderboardProps {
  highScores: HighScore[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ highScores }) => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
        >
          Back to Home
        </motion.button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-3 gap-2 font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-t-lg">
          <span>Name</span>
          <span>Topic</span>
          <span>Score</span>
        </div>
        {highScores.map((entry, index) => (
          <motion.div
            key={index}
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="grid grid-cols-3 gap-2 p-2 border-b border-gray-200"
          >
            <span className="text-gray-800">{entry.name}</span>
            <span className="text-gray-800">{entry.topic}</span>
            <span className="text-gray-800">{entry.score}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Leaderboard;