import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HighScore, UserProgress } from "../types";
import { topics } from "../data/questions";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaTrophy } from "react-icons/fa";

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
  const POINTS_PER_QUESTION = 10;

  useEffect(() => {
    const calculateUserStats = async () => {
      const scoreMap: { [userId: string]: { name: string; totalScore: number; totalQuestions: number; achievementsCount: number } } = {};

      highScores.forEach((score) => {
        const userId = score.userId;
        if (!scoreMap[userId]) {
          scoreMap[userId] = { name: score.name, totalScore: 0, totalQuestions: 0, achievementsCount: 0 };
        }
        scoreMap[userId].totalScore += score.score;
        scoreMap[userId].totalQuestions += score.completed || Math.floor(score.score / POINTS_PER_QUESTION);
      });

      for (const userId of Object.keys(scoreMap)) {
        if (user && userId === user.uid) {
          scoreMap[userId].name = user.displayName || user.email || scoreMap[userId].name;
          scoreMap[userId].totalQuestions = Object.values(userProgress).reduce(
            (sum, progress) => sum + (progress.completed || 0),
            0
          );
        }
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
    <>
      <div className="max-w-3xl mx-auto flex justify-between items-center mt-6 mb-6 px-6"> {/* Halved to mt-6 and mb-6 */}
        <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
        >
          Back to Home
        </motion.button>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="grid grid-cols-5 gap-4 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-t-lg shadow-inner">
          <span className="text-center">Rank</span>
          <span className="text-center">Name</span>
          <span className="text-center">Questions</span>
          <span className="text-center">Score</span>
          <span className="text-center">Achievements</span>
        </div>
        {userStats.map((entry, index) => {
          const rank = entry.totalScore > 0 ? index + 1 : "N/A";
          const isOdd = index % 2 === 1;
          const trophyColor = rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-amber-600" : "";
          return (
            <motion.div
              key={entry.name}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className={`grid grid-cols-5 gap-4 p-4 ${isOdd ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0`}
            >
              <span className="text-center font-semibold text-indigo-600 flex items-center justify-center">
                {rank <= 3 && rank !== "N/A" && <FaTrophy className={`${trophyColor} mr-2`} />}
                {rank}
              </span>
              <span className="text-gray-900 font-medium truncate">{entry.name}</span>
              <span className="text-center text-gray-700">{`${entry.totalQuestions}/${totalPossibleQuestions}`}</span>
              <span className="text-center text-indigo-600 font-semibold">{entry.totalScore}</span>
              <span className="text-center text-gray-700">{`${entry.achievementsCount}/${totalPossibleAchievements}`}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
};

export default Leaderboard;