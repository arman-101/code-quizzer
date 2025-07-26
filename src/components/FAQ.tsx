import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FAQ: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
        >
          Back to Home
        </motion.button>
      </div>
      <div className="space-y-6 bg-white p-4 rounded-lg shadow-md">
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
          <h3 className="font-semibold text-lg text-gray-800">How are scores calculated?</h3>
          <p className="text-gray-600">
            Questions 1-10 are Easy (10 points), 11-20 are Medium (20 points), and 21-30 are Hard (30
            points).
          </p>
        </motion.div>
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
          <h3 className="font-semibold text-lg text-gray-800">What happens to my data?</h3>
          <p className="text-gray-600">
            I only use your data to display it on the leaderboard and in your profile. Your email,
            display name, and scores are stored securely in Firebase, and I don’t share it with
            third parties without your consent.
          </p>
        </motion.div>
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
          <h3 className="font-semibold text-lg text-gray-800">How is the leaderboard ranked?</h3>
          <p className="text-gray-600">
            The leaderboard is ranked by total score across all topics, ensuring a fair comparison
            of coding skills.
          </p>
        </motion.div>
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
          <h3 className="font-semibold text-lg text-gray-800">How do you ensure fairness in quizzes?</h3>
          <p className="text-gray-600">
            Questions are carefully designed to test skill, not trick users. Scores reflect difficulty
            levels, and I regularly review content to avoid bias or unfair advantages.
          </p>
        </motion.div>
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
          <h3 className="font-semibold text-lg text-gray-800">Can I delete my data?</h3>
          <p className="text-gray-600">
            Yes, you can reset your progress from the profile page, which clears your quiz data.
            To fully delete your account and all associated data, contact me at arman-101@hotmail.com.
          </p>
        </motion.div>
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
          <h3 className="font-semibold text-lg text-gray-800">Is the app accessible to all users?</h3>
          <p className="text-gray-600">
            I strive to meet accessibility standards (e.g., WCAG 2.1) with high-contrast UI and
            keyboard navigation. If you encounter issues, let me know so we can improve.
          </p>
        </motion.div>
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
          <h3 className="font-semibold text-lg text-gray-800">How do you handle cheating?</h3>
          <p className="text-gray-600">
            I monitor unusual activity (e.g., rapid completions) and reserve the right to remove
            scores that violate fair play. My goal is a fun, honest learning experience.
          </p>
        </motion.div>
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
          <h3 className="font-semibold text-lg text-gray-800">Why do you collect profile information?</h3>
          <p className="text-gray-600">
            Your display name and bio enhance community engagement (e.g., leaderboards, achievements).
            Icons are optional for personalisation. I minimise data collection to what’s necessary
            for the app’s functionality.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FAQ;