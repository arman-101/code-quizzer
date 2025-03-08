import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import Header from "./components/Header";
import TopicSelector from "./components/TopicSelector";
import Quiz from "./components/Quiz";
import Leaderboard from "./components/Leaderboard";
import FAQ from "./components/FAQ";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import { Topic, UserProgress, HighScore } from "./types";
import { topics } from "./data/questions";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const App: React.FC = () => {
  const { user } = useAuth();
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadHighScores();
    }
  }, [user]);

  const loadUserData = async () => {
    const userDoc = doc(db, "users", user!.uid);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      setUserProgress(docSnap.data() as UserProgress);
    } else {
      const initialProgress = topics.reduce(
        (acc, topic) => ({
          ...acc,
          [topic.name]: { completed: 0, time: null, elapsed: 0 },
        }),
        {}
      );
      await setDoc(userDoc, initialProgress);
      setUserProgress(initialProgress);
    }
  };

  const loadHighScores = async () => {
    const highScoresCol = collection(db, "highScores");
    const highScoresSnap = await getDocs(highScoresCol);
    const scores = highScoresSnap.docs.map((doc) => doc.data() as HighScore);
    setHighScores(scores.sort((a, b) => b.score - a.score).slice(0, 5));
  };

  const handleTopicSelect = (topic: string) => {
    setCurrentTopic(topic);
  };

  const handleQuizComplete = async (score: number, time: string) => {
    const updatedProgress = {
      ...userProgress,
      [currentTopic!]: {
        completed: topics.find((t) => t.name === currentTopic)!.questions.length,
        time,
        elapsed: 0,
      },
    };
    setUserProgress(updatedProgress);
    await setDoc(doc(db, "users", user!.uid), updatedProgress);

    const highScoreDoc = doc(db, "highScores", `${user!.uid}_${currentTopic}`);
    await setDoc(highScoreDoc, { name: user!.displayName || user!.email, score, topic: currentTopic });
    loadHighScores();
    setCurrentTopic(null);
  };

  const handleQuizQuit = async (elapsed: number) => {
    const updatedProgress = {
      ...userProgress,
      [currentTopic!]: {
        ...userProgress[currentTopic!],
        elapsed,
      },
    };
    setUserProgress(updatedProgress);
    await setDoc(doc(db, "users", user!.uid), updatedProgress);
    setCurrentTopic(null);
  };

  const handleResetProgress = async () => {
    Swal.fire({
      title: "Reset Progress?",
      text: "All your scores and progress will be reset!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reset",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const initialProgress = topics.reduce(
          (acc, topic) => ({
            ...acc,
            [topic.name]: { completed: 0, time: null, elapsed: 0 },
          }),
          {}
        );
        setUserProgress(initialProgress);
        await setDoc(doc(db, "users", user!.uid), initialProgress);
        const highScoresCol = collection(db, "highScores");
        const highScoresSnap = await getDocs(highScoresCol);
        highScoresSnap.docs
          .filter((doc) => doc.data().name === (user!.displayName || user!.email))
          .forEach((doc) => setDoc(doc.ref, { ...doc.data(), score: 0 }));
        loadHighScores();
        Swal.fire("Reset!", "Your progress has been reset.", "success");
      }
    });
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/sign-in" element={!user ? <SignIn /> : <Navigate to="/" />} />
          <Route path="/sign-up" element={!user ? <SignUp /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={
              user ? (
                <>
                  <nav className="p-4 flex justify-center space-x-6">
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link
                        to="/"
                        className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition shadow-md"
                      >
                        Home
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link
                        to="/leaderboard"
                        className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition shadow-md"
                      >
                        Leaderboard
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link
                        to="/faq"
                        className="bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition shadow-md"
                      >
                        FAQ
                      </Link>
                    </motion.div>
                  </nav>
                  {currentTopic ? (
                    <Quiz
                      topic={currentTopic}
                      questions={topics.find((t) => t.name === currentTopic)!.questions}
                      onComplete={handleQuizComplete}
                      initialProgress={userProgress[currentTopic]?.completed || 0}
                      initialElapsed={userProgress[currentTopic]?.elapsed || 0}
                      onQuit={handleQuizQuit}
                    />
                  ) : (
                    <TopicSelector
                      topics={topics}
                      userProgress={userProgress}
                      onSelectTopic={handleTopicSelect}
                      onResetProgress={handleResetProgress}
                    />
                  )}
                </>
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />
          <Route
            path="/leaderboard"
            element={user ? <Leaderboard highScores={highScores} /> : <Navigate to="/sign-in" />}
          />
          <Route path="/faq" element={user ? <FAQ /> : <Navigate to="/sign-in" />} />
          <Route path="*" element={<Navigate to="/sign-in" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;