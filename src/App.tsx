import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { topics } from "./data/questions";
import { HighScore, UserProgress } from "./types";
import Header from "./components/Header";
import TopicSelector from "./components/TopicSelector";
import Quiz from "./components/Quiz";
import Leaderboard from "./components/Leaderboard";
import FAQ from "./components/FAQ";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";

const App: React.FC = () => {
  const { user } = useAuth();
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadHighScores();
    } else {
      setUserProgress({});
      setHighScores([]);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      setUserProgress(userDoc.data() as UserProgress);
    }
  };

  const loadHighScores = async () => {
    const scores: HighScore[] = [];
    for (const topic of topics) {
      const highScoreDoc = await getDoc(doc(db, "highScores", `${user?.uid}_${topic.name}`));
      if (highScoreDoc.exists()) {
        scores.push(highScoreDoc.data() as HighScore);
      }
    }
    setHighScores(scores);
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
    await setDoc(highScoreDoc, {
      name: user.displayName || user.email || "",
      score: newScore,
      topic: currentTopic,
    });
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
    await setDoc(highScoreDoc, {
      name: user.displayName || user.email || "",
      score: newScore,
      topic: currentTopic,
    });
    await loadUserData();
    await loadHighScores();
    setCurrentTopic(null);
    setElapsedTime(0);
    setScore(0);
    setCurrentQuestion(0);
  };

  const handleResetAll = async () => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {});
    for (const topic of topics) {
      await setDoc(doc(db, "highScores", `${user.uid}_${topic.name}`), {
        name: user.displayName || user.email || "",
        score: 0,
        topic: topic.name,
      });
    }
    setUserProgress({});
    setCurrentTopic(null);
    setElapsedTime(0);
    setScore(0);
    setCurrentQuestion(0);
    await loadHighScores();
  };

  const currentTopicData = currentTopic ? topics.find((t) => t.name === currentTopic) : null;
  const initialProgress = currentTopic ? userProgress[currentTopic]?.completed || 0 : 0;
  const initialElapsed = currentTopic ? userProgress[currentTopic]?.elapsed || 0 : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              currentTopic && currentTopicData ? (
                <Quiz
                  topic={currentTopic}
                  questions={currentTopicData.questions}
                  onComplete={handleQuizComplete}
                  initialProgress={initialProgress}
                  initialElapsed={initialElapsed}
                  initialScore={score}
                  onQuit={handleQuizQuit}
                  elapsedTime={elapsedTime}
                  setElapsedTime={setElapsedTime}
                  score={score}
                  setScore={setScore}
                  currentQuestion={currentQuestion}
                  setCurrentQuestion={setCurrentQuestion}
                  userProgress={userProgress}
                  topics={topics}
                  onEndScreenNavigation={() => setCurrentTopic(null)}
                />
              ) : (
                <TopicSelector
                  topics={topics}
                  userProgress={userProgress}
                  setCurrentTopic={setCurrentTopic}
                  handleResetAll={handleResetAll}
                />
              )
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
        <Route
          path="/leaderboard"
          element={
            user ? (
              <Leaderboard highScores={highScores} userProgress={userProgress} />
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/signin" />}
        />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;