import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Topic, UserProgress } from "../types";
import Swal from "sweetalert2";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface TopicSelectorProps {
  topics: Topic[];
  userProgress: UserProgress;
  setCurrentTopic: React.Dispatch<React.SetStateAction<string | null>>;
  handleResetAll: () => Promise<void>;
  streak: number;
  highScores: { name: string; score: number; topic: string; userId: string }[];
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  userProgress,
  setCurrentTopic,
  streak,
  highScores,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalScore = highScores
    .filter((score) => user && score.userId === user.uid)
    .reduce((sum, score) => sum + score.score, 0);

  const handleTopicClick = async (topicName: string) => {
    const progress = userProgress[topicName];
    const total = topics.find((t) => t.name === topicName)!.questions.length;
    const isCompleted = progress && progress.completed === total;

    if (isCompleted && user) {
      const result = await Swal.fire({
        title: "Retry Topic?",
        text: `You've completed ${capitalizeTopic(
          topicName
        )}. Retrying will reset your progress for this topic.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, retry",
      });

      if (result.isConfirmed) {
        const updatedProgress = { ...userProgress, [topicName]: { completed: 0, time: null, elapsed: 0 } };
        await setDoc(doc(db, "users", user.uid), updatedProgress);
        await setDoc(doc(db, "highScores", `${user.uid}_${topicName}`), {
          name: user.displayName || user.email || "",
          score: 0,
          topic: topicName,
        });
        setCurrentTopic(topicName);
        navigate(`/quiz/${topicName}`);
      }
    } else {
      setCurrentTopic(topicName);
      navigate(`/quiz/${topicName}`);
    }
  };

  const capitalizeTopic = (topicName: string) =>
    topicName
      .replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto mt-6"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Select a Topic
        </h2>
        <div className="flex items-center bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-4 py-2 rounded-full shadow-md">
          <span className="text-lg font-semibold">Your Score: {totalScore}</span>
        </div>
        <div className="flex items-center bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full shadow-md">
          <span className="text-lg font-semibold">Streak: {streak} days</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-8"> {/* Changed from gap-4 to gap-8 */}
        {topics.map((topic) => {
          const progress = userProgress[topic.name];
          const completed = progress?.completed || 0;
          const total = topic.questions.length;
          const percentage = total > 0 ? (completed / total) * 100 : 0;
          const isCompleted = completed === total;

          return (
            <motion.div
              key={topic.name}
              whileHover={{ scale: 1.03 }}
              onClick={() => handleTopicClick(topic.name)}
              className={`relative bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 ${
                isCompleted ? "overflow-hidden" : ""
              }`}
            >
              {isCompleted && (
                <div className="absolute inset-0 bg-green-500 opacity-30 pointer-events-none"></div>
              )}
              <h3 className="text-xl font-semibold text-indigo-600 relative z-10">
                {capitalizeTopic(topic.name)}
              </h3>
              <p className="text-gray-600 mt-2 relative z-10">
                {completed}/{total} Questions Completed
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 relative z-10">
                <div
                  className="bg-indigo-500 h-2.5 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TopicSelector;