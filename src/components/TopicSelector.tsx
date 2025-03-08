import React from "react";
import { Topic, UserProgress } from "../types";
import { motion } from "framer-motion";

interface TopicSelectorProps {
  topics: Topic[];
  userProgress: UserProgress;
  onSelectTopic: (topic: string) => void;
  onResetProgress: () => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  userProgress,
  onSelectTopic,
  onResetProgress,
}) => {
  const totalScore = Object.entries(userProgress).reduce((sum, [topicName, progress]) => {
    const topic = topics.find((t) => t.name === topicName);
    if (!topic) return sum; // If topic not found, skip it
    const topicScore = topic.questions
      .slice(0, progress.completed)
      .reduce((s, q) => s + (q.difficulty <= 10 ? 10 : q.difficulty <= 20 ? 20 : 30), 0);
    return sum + topicScore;
  }, 0);

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
          const topicScore = topic.questions
            .slice(0, progress.completed)
            .reduce((sum, q) => sum + (q.difficulty <= 10 ? 10 : q.difficulty <= 20 ? 20 : 30), 0);
          const maxScore = topic.questions.reduce(
            (sum, q) => sum + (q.difficulty <= 10 ? 10 : q.difficulty <= 20 ? 20 : 30),
            0
          );
          return (
            <motion.button
              key={topic.name}
              whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}
              onClick={() => onSelectTopic(topic.name)}
              className="bg-white text-gray-800 p-4 rounded-lg shadow-md hover:bg-indigo-50 transition border border-gray-200"
            >
              <span className="font-semibold text-lg">{topic.name.replace("_", " ").toUpperCase()}</span>
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
        className="mt-6 w-full max-w-xs mx-auto block bg-red-500 text-white py-2 rounded-full hover:bg-red-600 transition"
      >
        Reset Progress
      </motion.button>
    </div>
  );
};

export default TopicSelector;