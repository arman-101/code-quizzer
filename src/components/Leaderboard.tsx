import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth to get current user
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { HighScore, UserProgress } from "../types";
import { topics } from "../data/questions";

interface LeaderboardProps {
  highScores: HighScore[]; // Unused now, kept for compatibility
  userProgress: UserProgress; // Unused now, kept for compatibility
}

interface UserStat {
  name: string;
  totalScore: number;
  totalQuestions: number;
}

const Leaderboard: React.FC<LeaderboardProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const totalPossibleQuestions = topics.reduce((sum, topic) => sum + topic.questions.length, 0);

  useEffect(() => {
    const fetchUserStats = async () => {
      // Fetch all high scores
      const highScoresCol = collection(db, "highScores");
      const highScoresSnap = await getDocs(highScoresCol);

      // Aggregate scores by user
      const scoreMap: { [userId: string]: { name: string; totalScore: number } } = {};
      highScoresSnap.docs.forEach((doc) => {
        const data = doc.data() as HighScore;
        const userId = doc.id.split("_")[0]; // Extract userId from doc ID (e.g., "uid_topic")
        if (!scoreMap[userId]) {
          scoreMap[userId] = { name: data.name, totalScore: 0 };
        }
        scoreMap[userId].totalScore += data.score;
      });

      // Fetch all users' progress
      const usersCol = collection(db, "users");
      const usersSnap = await getDocs(usersCol);
      const allUserProgress: { [userId: string]: UserProgress } = {};
      usersSnap.docs.forEach((doc) => {
        allUserProgress[doc.id] = doc.data() as UserProgress;
      });

      // Calculate stats for each user
      const stats: UserStat[] = Object.entries(scoreMap).map(([userId, { name, totalScore }]) => {
        let totalQuestions = 0;
        if (allUserProgress[userId]) {
          totalQuestions = Object.values(allUserProgress[userId]).reduce(
            (sum, progress) => sum + (progress.completed || 0),
            0
          );
        }
        // Use current user's displayName if it's their entry
        const displayName = user && user.uid === userId ? user.displayName || user.email || name : name;
        return { name: displayName, totalScore, totalQuestions };
      });

      // Sort by totalScore descending
      stats.sort((a, b) => b.totalScore - a.totalScore);
      setUserStats(stats);
    };

    fetchUserStats();
  }, [user]); // Add user to dependencies to re-fetch if user changes (e.g., name update)

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