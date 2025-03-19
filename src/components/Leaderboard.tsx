import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { HighScore, UserProgress } from "../types";
import { topics } from "../data/questions";
import Swal from "sweetalert2";

interface LeaderboardProps {
  highScores: HighScore[];
  userProgress: UserProgress;
}

interface UserStat {
  name: string;
  totalScore: number;
  totalQuestions: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ highScores: initialHighScores, userProgress }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const totalPossibleQuestions = topics.reduce((sum, topic) => sum + topic.questions.length, 0);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Fetch all high scores
        const highScoresCol = collection(db, "highScores");
        const highScoresSnap = await getDocs(highScoresCol);
        const scoreMap: { [userId: string]: { name: string; totalScore: number } } = {};
        highScoresSnap.docs.forEach((doc) => {
          const data = doc.data() as HighScore;
          const userId = doc.id.split("_")[0];
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
          const displayName = user && user.uid === userId ? user.displayName || user.email || name : name;
          return { name: displayName, totalScore, totalQuestions };
        });

        // Sort by totalScore descending
        stats.sort((a, b) => b.totalScore - a.totalScore);
        setUserStats(stats);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load leaderboard. Please check your permissions or try again later.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    };

    if (user) {
      fetchUserStats();
    } else {
      setUserStats([]);
      Swal.fire({
        title: "Authentication Required",
        text: "Please sign in to view the leaderboard.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
    }
  }, [user]);

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
        {userStats.length > 0 ? (
          userStats.map((entry, index) => {
            const rank = entry.totalScore > 0 ? index + 1 : "N/A";
            return (
              <motion.div
                key={entry.name + index} // Unique key with index to handle duplicate names
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
          })
        ) : (
          <p className="text-gray-500 p-2">No leaderboard data available yet.</p>
        )}
      </div>
    </motion.div>
  );
};

export default Leaderboard;