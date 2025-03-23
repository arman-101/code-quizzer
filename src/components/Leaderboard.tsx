import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HighScore, UserProgress } from "../types";
import { topics } from "../data/questions";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface LeaderboardProps {
  highScores: (HighScore & { userId: string })[];
  userProgress: UserProgress;
}

interface UserStat {
  name: string;
  totalScore: number;
  totalQuestions: number;
  achievementsCount: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ highScores, userProgress }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const totalPossibleQuestions = topics.reduce((sum, topic) => sum + topic.questions.length, 0);
  const totalPossibleAchievements = 10;
  const POINTS_PER_QUESTION = 10; // Adjust based on your quiz scoring logic

  useEffect(() => {
    const calculateUserStats = async () => {
      const scoreMap: { [userId: string]: { name: string; totalScore: number; totalQuestions: number; achievementsCount: number } } = {};

      // Aggregate from highScores
      highScores.forEach((score) => {
        const userId = score.userId;
        if (!scoreMap[userId]) {
          scoreMap[userId] = { name: score.name, totalScore: 0, totalQuestions: 0, achievementsCount: 0 };
        }
        scoreMap[userId].totalScore += score.score;
        // Infer totalQuestions from score for non-current users if completed is missing
        if (!score.completed) {
          scoreMap[userId].totalQuestions += Math.floor(score.score / POINTS_PER_QUESTION);
        } else {
          scoreMap[userId].totalQuestions += score.completed;
        }
      });

      // Update current user's data and fetch achievements
      for (const userId of Object.keys(scoreMap)) {
        if (user && userId === user.uid) {
          // Use userProgress for current user
          scoreMap[userId].name = user.displayName || user.email || scoreMap[userId].name;
          scoreMap[userId].totalQuestions = Object.values(userProgress).reduce(
            (sum, progress) => sum + (progress.completed || 0),
            0
          );
        }
        // Fetch achievements
        const achievementsDoc = await getDoc(doc(db, "profiles", userId, "achievements", "progress"));
        if (achievementsDoc.exists()) {
          const achievementsData = achievementsDoc.data();
          const completedAchievements = achievementsData.completed || {};
          scoreMap[userId].achievementsCount = Object.values(completedAchievements).filter(Boolean).length;
        }
      }

      const stats: UserStat[] = Object.entries(scoreMap).map(([_, { name, totalScore, totalQuestions, achievementsCount }]) => ({
        name,
        totalScore,
        totalQuestions,
        achievementsCount,
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
        <div className="grid grid-cols-5 gap-2 font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 rounded-t-lg">
          <span>Rank</span>
          <span>Name</span>
          <span>Questions</span>
          <span>Score</span>
          <span>Achievements</span>
        </div>
        {userStats.map((entry, index) => {
          const rank = entry.totalScore > 0 ? index + 1 : "N/A";
          return (
            <motion.div
              key={entry.name}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="grid grid-cols-5 gap-2 p-2 border-b border-gray-200"
            >
              <span className="text-gray-800 font-medium">{rank}</span>
              <span className="text-gray-800">{entry.name}</span>
              <span className="text-gray-800">{`${entry.totalQuestions}/${totalPossibleQuestions}`}</span>
              <span className="text-gray-800">{entry.totalScore}</span>
              <span className="text-gray-800">{`${entry.achievementsCount}/${totalPossibleAchievements}`}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Leaderboard;