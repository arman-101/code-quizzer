import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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

interface AchievementsProps {
  achievements: { [key: string]: boolean };
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const navigate = useNavigate();

  const achievementDetails = [
    { name: "First Step", svg: Achievement1, description: "Complete 1 topic" },
    { name: "Triple Threat", svg: Achievement2, description: "Complete 3 topics" },
    { name: "Master Coder", svg: Achievement3, description: "Complete all 9 topics" },
    { name: "Century Scorer", svg: Achievement4, description: "Reach a total score of 100" },
    { name: "Half Millennium", svg: Achievement5, description: "Reach a total score of 500" },
    { name: "Code Legend", svg: Achievement6, description: "Reach a total score of 1000" },
    { name: "Double Duty", svg: Achievement7, description: "Achieve a 2-day login streak" },
    { name: "Five Alive", svg: Achievement8, description: "Achieve a 5-day login streak" },
    { name: "Decade Devotion", svg: Achievement9, description: "Achieve a 10-day login streak" },
    { name: "Top Coder", svg: Achievement10, description: "Reach #1 on the leaderboard" },
  ];

  const handleAchievementClick = (name: string, completed: boolean, description: string) => {
    Swal.fire({
      title: name,
      text: `${completed ? "Completed!" : "Not yet completed."}\n${description}`,
      icon: completed ? "success" : "info",
      confirmButtonColor: completed ? "#3085d6" : "#d33",
    });
  };

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
        <div className="grid grid-cols-3 gap-6 mb-6">
          {achievementDetails.slice(0, 9).map((achievement, index) => {
            const completed = achievements[achievement.name];
            return (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex justify-center items-center bg-gray-100 p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAchievementClick(achievement.name, completed, achievement.description)}
              >
                <img
                  src={achievement.svg}
                  alt={achievement.name}
                  className={`w-16 h-16 ${completed ? "" : "opacity-50"}`}
                />
                {completed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-30 rounded-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center">
          {achievementDetails.slice(9).map((achievement, index) => {
            const completed = achievements[achievement.name];
            return (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 }}
                className="relative flex justify-center items-center bg-gray-100 p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAchievementClick(achievement.name, completed, achievement.description)}
              >
                <img
                  src={achievement.svg}
                  alt={achievement.name}
                  className={`w-16 h-16 ${completed ? "" : "opacity-50"}`}
                />
                {completed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-30 rounded-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Achievements;
