import React from "react";
import { Topic, UserProgress, HighScore } from "../types";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

interface TopicSelectorProps {
  topics: Topic[];
  userProgress: UserProgress;
  highScores: HighScore[];
  onSelectTopic: (topic: string) => void;
  onResetProgress: () => void;
  onResetTopic: (topic: string) => void;
  userName: string; // New prop for current user's name
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  userProgress,
  highScores,
  onSelectTopic,
  onResetProgress,
  onResetTopic,
  userName,
}) => {
  const totalScore = highScores
    .filter((hs) => hs.name === userName)
    .reduce((sum, hs) => sum + hs.score, 0);

  const handleTopicClick = async (topic: Topic) => {
    const progress = userProgress[topic.name] || { completed: 0, time: null, elapsed: 0 };
    const isCompleted = progress.completed === topic.questions.length;

    if (isCompleted) {
      const result = await Swal.fire({
        title: "Re-Try Topic?",
        text: "This topic is already completed. Starting it again will reset your progress for this topic.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, re-try",
      });

      if (result.isConfirmed) {
        onResetTopic(topic.name);
      }
    } else {
      onSelectTopic(topic.name);
    }
  };

  const capitalizeTopic = (topicName: string) =>
    topicName
      .replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-6 text-center text-gray-800"
      >
        Choose a Topic
      </motion.h2>
      <p className="text-center text-lg mb-4 text-gray-600">
        Your Total Score: <span className="font-semibold text-indigo-600">{totalScore}</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => {
          const progress = userProgress[topic.name] || { completed: 0, time: null, elapsed: 0 };
          const topicScore = highScores.find((hs) => hs.topic === topic.name && hs.name === userName)?.score || 0;
          const maxScore = topic.questions.reduce(
            (sum, q) => sum + (q.difficulty <= 10 ? 10 : q.difficulty <= 20 ? 20 : 30),
            0
          );
          const isCompleted = progress.completed === topic.questions.length;

          return (
            <motion.button
              key={topic.name}
              whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}
              onClick={() => handleTopicClick(topic)}
              className={`bg-white text-gray-800 p-4 rounded-lg shadow-md hover:bg-indigo-50 transition border border-gray-200 ${
                isCompleted ? "bg-green-100 hover:bg-green-200" : ""
              }`}
            >
              <span className="font-semibold text-lg">{capitalizeTopic(topic.name)}</span>
              <p className="text-sm text-gray-600">
                ({progress.completed}/{topic.questions.length} - {topicScore}/{maxScore})
                {progress.time && ` - ${progress.time}`}
              </p>
            </motion.button>
          );
        })}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={onResetProgress}
        className="mt-6 w-full max-w-[12rem] mx-auto block bg-red-500 text-white py-2 rounded-full hover:bg-red-600 transition"
      >
        Reset My Progress
      </motion.button>
    </div>
  );
};

export default TopicSelector;