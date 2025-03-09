import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { Route, Routes, Link, Navigate, useNavigate } from "react-router-dom";
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadUserData();
      loadHighScores();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    const userDoc = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      setUserProgress(docSnap.data() as UserProgress);
    } else {
      const initialProgress: UserProgress = topics.reduce(
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
    setHighScores(scores);
  };

  const handleTopicSelect = (topic: string) => {
    setCurrentTopic(topic);
    setCurrentQuestion(userProgress[topic]?.completed || 0);
    setElapsedTime(userProgress[topic]?.elapsed || 0);
    setScore(getInitialScore(topic));
  };

  const handleTopicReset = async (topic: string) => {
    if (!user) return;

    const updatedProgress = {
      ...userProgress,
      [topic]: { completed: 0, time: null, elapsed: 0 },
    };
    setUserProgress(updatedProgress);
    await setDoc(doc(db, "users", user.uid), updatedProgress);

    const highScoreDoc = doc(db, "highScores", `${user.uid}_${topic}`);
    await setDoc(highScoreDoc, { name: user.displayName || user.email || "", score: 0, topic });

    await loadUserData();
    await loadHighScores();
    setCurrentTopic(topic);
    setCurrentQuestion(0);
    setElapsedTime(0);
    setScore(0);
  };

  const handleQuizComplete = async (newScore: number, time: string) => {
    if (!user || !currentTopic) return;
    const updatedProgress = {
      ...userProgress,
      [currentTopic]: {
        completed: topics.find((t) => t.name === currentTopic)!.questions.length,
        time,
        elapsed: 0,
      },
    };
    setUserProgress(updatedProgress);
    await setDoc(doc(db, "users", user.uid), updatedProgress);

    const highScoreDoc = doc(db, "highScores", `${user.uid}_${currentTopic}`);
    await setDoc(highScoreDoc, { name: user.displayName || user.email || "", score: newScore, topic: currentTopic });

    await loadUserData();
    await loadHighScores();
  };

  const handleQuizQuit = async (newElapsed: number, newScore: number, newCompleted: number) => {
    if (!user || !currentTopic) return;
    const updatedProgress = {
      ...userProgress,
      [currentTopic]: {
        completed: newCompleted,
        time: null,
        elapsed: newElapsed,
      },
    };
    setUserProgress(updatedProgress);
    await setDoc(doc(db, "users", user.uid), updatedProgress);

    const highScoreDoc = doc(db, "highScores", `${user.uid}_${currentTopic}`);
    await setDoc(highScoreDoc, { name: user.displayName || user.email || "", score: newScore, topic: currentTopic });

    await loadUserData();
    await loadHighScores();
    setCurrentTopic(null);
    setElapsedTime(0);
    setScore(0);
    setCurrentQuestion(0);
    navigate("/");
  };

  const handleResetProgress = async () => {
    if (!user) return;
    const result = await Swal.fire({
      title: "Reset Progress?",
      text: "All your scores and progress will be reset!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reset",
    });

    if (result.isConfirmed) {
      const initialProgress: UserProgress = topics.reduce(
        (acc, topic) => ({
          ...acc,
          [topic.name]: { completed: 0, time: null, elapsed: 0 },
        }),
        {}
      );
      setUserProgress(initialProgress);
      await setDoc(doc(db, "users", user.uid), initialProgress);
      const highScoresCol = collection(db, "highScores");
      const highScoresSnap = await getDocs(highScoresCol);
      const userHighScores = highScoresSnap.docs.filter(
        (doc) => doc.data().name === (user.displayName || user.email || "")
      );
      await Promise.all(
        userHighScores.map((doc) => setDoc(doc.ref, { ...doc.data(), score: 0 }))
      );

      await loadUserData();
      await loadHighScores();
      Swal.fire("Reset!", "Your progress has been reset.", "success");
    }
  };

  const handleHeaderClick = async () => {
    if (currentTopic) {
      const result = await Swal.fire({
        title: "Return Home?",
        text: "Your progress will be saved.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, go home",
      });
      if (result.isConfirmed) {
        await handleQuizQuit(elapsedTime, score, currentQuestion);
      }
    } else {
      navigate("/");
    }
  };

  const getInitialScore = (topic: string) => {
    const highScore = highScores.find(
      (hs) => hs.topic === topic && hs.name === (user?.displayName || user?.email || "")
    );
    return highScore ? highScore.score : 0;
  };

  const handleEndScreenNavigation = () => {
    setCurrentTopic(null);
    setElapsedTime(0);
    setScore(0);
    setCurrentQuestion(0);
    navigate("/");
  };

  const userName: string = user?.displayName || user?.email || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onClick={handleHeaderClick} />
      <Routes>
        <Route path="/sign-in" element={!user ? <SignIn /> : <Navigate to="/" />} />
        <Route path="/sign-up" element={!user ? <SignUp /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={
            user ? (
              <>
                {!currentTopic && (
                  <nav className="p-4 pt-8 flex justify-center space-x-6">
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link
                        to="/leaderboard"
                        className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition shadow-md"
                      >
                        Leaderboard
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link
                        to="/faq"
                        className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 transition shadow-md"
                      >
                        FAQ
                      </Link>
                    </motion.div>
                  </nav>
                )}
                {currentTopic ? (
                  <Quiz
                    topic={currentTopic}
                    questions={topics.find((t) => t.name === currentTopic)!.questions}
                    onComplete={handleQuizComplete}
                    initialProgress={userProgress[currentTopic]?.completed || 0}
                    initialElapsed={userProgress[currentTopic]?.elapsed || 0}
                    initialScore={getInitialScore(currentTopic)}
                    onQuit={handleQuizQuit}
                    elapsedTime={elapsedTime}
                    setElapsedTime={setElapsedTime}
                    score={score}
                    setScore={setScore}
                    currentQuestion={currentQuestion}
                    setCurrentQuestion={setCurrentQuestion}
                    userProgress={userProgress}
                    topics={topics}
                    onEndScreenNavigation={handleEndScreenNavigation}
                  />
                ) : (
                  <TopicSelector
                    topics={topics}
                    userProgress={userProgress}
                    highScores={highScores}
                    onSelectTopic={handleTopicSelect}
                    onResetProgress={handleResetProgress}
                    onResetTopic={handleTopicReset}
                    userName={userName}
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
          element={user ? <Leaderboard highScores={highScores} userProgress={userProgress} /> : <Navigate to="/sign-in" />}
        />
        <Route path="/faq" element={user ? <FAQ /> : <Navigate to="/sign-in" />} />
        <Route path="*" element={<Navigate to="/sign-in" />} />
      </Routes>
    </div>
  );
};

export default App;