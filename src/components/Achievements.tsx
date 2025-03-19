import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Swal from "sweetalert2";
import svg1 from "../achievements/1.svg";
import svg2 from "../achievements/2.svg";
import svg3 from "../achievements/3.svg";
import svg4 from "../achievements/4.svg";
import svg5 from "../achievements/5.svg";
import svg6 from "../achievements/6.svg";
import svg7 from "../achievements/7.svg";
import svg8 from "../achievements/8.svg";
import svg9 from "../achievements/9.svg";
import svg10 from "../achievements/10.svg";

const achievementDetails = [
  { id: "1", name: "Beginner", requirement: "Complete 1 quiz" },
  { id: "2", name: "Quizzer", requirement: "Complete 5 quizzes" },
  { id: "3", name: "Master", requirement: "Complete 10 quizzes" },
  { id: "4", name: "Score Starter", requirement: "Reach a total score of 50" },
  { id: "5", name: "Score Pro", requirement: "Reach a total score of 200" },
  { id: "6", name: "Streak Starter", requirement: "Achieve a 3-day streak" },
  { id: "7", name: "Streak Master", requirement: "Achieve a 7-day streak" },
  { id: "8", name: "Quick Learner", requirement: "Complete a quiz in under 5 minutes" },
  { id: "9", name: "Perfectionist", requirement: "Score 100% on a quiz" },
  { id: "10", name: "Veteran", requirement: "Log in 10 days total" },
];

interface AchievementsProps {
  loginDays: number;
}

const Achievements: React.FC<AchievementsProps> = ({ loginDays }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [achieved, setAchieved] = useState<Set<string>>(new Set());

  const gridImages = [svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8, svg9];
  const extraImage = svg10;

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;
      try {
        const achievementsRef = collection(db, "profiles", user.uid, "achievements");
        const snapshot = await getDocs(achievementsRef);
        const achievedIds = new Set(snapshot.docs.map((doc) => doc.id));
        setAchieved(achievedIds);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load achievements. Please try again later.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    };
    fetchAchievements();
  }, [user]);

  const handleSvgClick = (achievementId: string) => {
    const achievement = achievementDetails.find((a) => a.id === achievementId);
    if (!achievement) return;

    if (achieved.has(achievementId)) {
      Swal.fire({
        title: "Achievement Unlocked!",
        text: `${achievement.name}: ${achievement.requirement}`,
        icon: "success",
        confirmButtonColor: "#3085d6",
        timer: 2000,
        timerProgressBar: true,
      });
    } else {
      Swal.fire({
        title: achievement.name,
        text: `To unlock: ${achievement.requirement}`,
        icon: "info",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-2xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Achievements ({achieved.size}/10)
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
        >
          Back to Home
        </motion.button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {gridImages.map((svg, index) => {
            const achievementId = (index + 1).toString();
            const isAchieved = achieved.has(achievementId);
            return (
              <motion.div
                key={index}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="relative flex justify-center items-center p-2 border border-gray-200 rounded-lg cursor-pointer"
                onClick={() => handleSvgClick(achievementId)}
              >
                <img
                  src={svg}
                  alt={`Achievement ${index + 1}`}
                  className="w-32 h-32 object-contain"
                />
                {!isAchieved && (
                  <div className="absolute inset-0 bg-gray-500 opacity-50 rounded-lg pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="relative flex justify-center items-center p-2 border border-gray-200 rounded-lg cursor-pointer"
          onClick={() => handleSvgClick("10")}
        >
          <img
            src={extraImage}
            alt="Achievement 10"
            className="w-32 h-32 object-contain"
          />
          {!achieved.has("10") && (
            <div className="absolute inset-0 bg-gray-500 opacity-50 rounded-lg pointer-events-none" />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Achievements;