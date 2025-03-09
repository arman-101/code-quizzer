import React from "react";
import { HighScore, UserProgress } from "../types";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { topics } from "../data/questions";

interface LeaderboardProps {
  highScores: HighScore[];
  userProgress: UserProgress;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ highScores, userProgress }) => {
  const navigate = useNavigate();

  const userStats = highScores.reduce((acc, entry) => {
    if (!acc[entry.name]) {
      acc[entry.name] = { totalScore: 0, totalQuestions: 0 };
    }
    acc[entry.name].totalScore += entry.score;
    const topicProgress = userProgress[entry.topic];
    acc[entry.name].totalQuestions += topicProgress ? topicProgress.completed : 0;
    return acc;
  }, {} as { [name: string]: { totalScore: number; totalQuestions: number } });

  const totalPossibleQuestions = topics.reduce((sum, topic) => sum + topic.questions.length, 0);

  const rankedUsers = Object.entries(userStats)
    .map(([name, { totalScore, totalQuestions }]) => ({ name, totalScore, totalQuestions }))
    .sort((a, b) => b.totalScore - a.totalScore);

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
        <div className="grid grid-cols-4 gap-2 font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-t-lg">
          <span>Rank</span>
          <span>Name</span>
          <span>Questions</span>
          <span>Score</span>
        </div>
        {rankedUsers.map((entry, index) => {
          const rank = entry.totalScore > 0 ? index + 1 : "N/A"; // Only N/A if no score
          return (
            <motion.div
              key={entry.name}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="grid grid-cols-4 gap-2 p-2 border-b border-gray-200"
            >
              <span className="text-gray-800 font-medium">{rank}</span>
              <span className="text-gray-800">{entry.name}</span>
              <span className="text-gray-800">{`${entry.totalQuestions}/${totalPossibleQuestions}`}</span>
              <span className="text-gray-800">{entry.totalScore}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Leaderboard;