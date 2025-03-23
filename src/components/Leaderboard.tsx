import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HighScore, UserProgress } from "../types";
import { topics } from "../data/questions";

interface LeaderboardProps {
  highScores: (HighScore & { userId: string })[]; // Updated to include userId
  userProgress: UserProgress; // Current user's progress
}

interface UserStat {
  name: string;
  totalScore: number;
  totalQuestions: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ highScores, userProgress }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const totalPossibleQuestions = topics.reduce((sum, topic) => sum + topic.questions.length, 0);

  useEffect(() => {
    const calculateUserStats = () => {
      // Aggregate scores by userId from highScores prop
      const scoreMap: { [userId: string]: { name: string; totalScore: number; totalQuestions: number } } = {};
      
      highScores.forEach((score) => {
        const userId = score.userId;
        if (!scoreMap[userId]) {
          scoreMap[userId] = { name: score.name, totalScore: 0, totalQuestions: 0 };
        }
        scoreMap[userId].totalScore += score.score;
        // totalQuestions isn’t in highScores; we’ll use userProgress for the current user only
      });

      // Add totalQuestions for the current user from userProgress
      if (user && userProgress) {
        const currentUserId = user.uid;
        if (scoreMap[currentUserId]) {
          scoreMap[currentUserId].totalQuestions = Object.values(userProgress).reduce(
            (sum, progress) => sum + (progress.completed || 0),
            0
          );
          // Update name to current user's displayName if available
          scoreMap[currentUserId].name = user.displayName || user.email || scoreMap[currentUserId].name;
        }
      }

      // Convert to array and sort
      const stats: UserStat[] = Object.entries(scoreMap).map(([userId, { name, totalScore, totalQuestions }]) => ({
        name,
        totalScore,
        totalQuestions,
      }));
      stats.sort((a, b) => b.totalScore - a.totalScore);
      setUserStats(stats);
    };

    calculateUserStats();
  }, [highScores, userProgress, user]);

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
        {userStats.map((entry, index) => {
          const rank = entry.totalScore > 0 ? index + 1 : "N/A";
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