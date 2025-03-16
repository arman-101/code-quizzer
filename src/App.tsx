import React, { useEffect, useState, useCallback } from "react";
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
import Swal from "sweetalert2";

const App: React.FC = () => {
  const { user } = useAuth();
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [streak, setStreak] = useState(0);

  const loadUserData = useCallback(async () => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      setUserProgress(userDoc.data() as UserProgress);
    }
  }, [user]);

  const loadHighScores = useCallback(async () => {
    if (!user) return;
    const scores: HighScore[] = [];
    for (const topic of topics) {
      const highScoreDoc = await getDoc(doc(db, "highScores", `${user.uid}_${topic.name}`));
      if (highScoreDoc.exists()) {
        scores.push(highScoreDoc.data() as HighScore);
      }
    }
    setHighScores(scores);
  }, [user]);

  const updateStreak = useCallback(async () => {
    if (!user) return;
    const profileDocRef = doc(db, "profiles", user.uid);
    const profileDoc = await getDoc(profileDocRef);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    if (profileDoc.exists()) {
      const data = profileDoc.data();
      const lastLogin = data.lastLogin || "";
      let currentStreak = data.streak || 0;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastLogin === today) {
        setStreak(currentStreak);
      } else if (lastLogin === yesterdayStr) {
        currentStreak += 1;
        setStreak(currentStreak);
        await setDoc(profileDocRef, { lastLogin: today, streak: currentStreak }, { merge: true });
        Swal.fire({
          title: "Streak Increased!",
          text: `Your login streak is now ${currentStreak} days!`,
          icon: "success",
          confirmButtonColor: "#3085d6",
          timer: 2000,
          timerProgressBar: true,
        });
      } else if (!lastLogin || lastLogin < yesterdayStr) {
        currentStreak = 1;
        setStreak(currentStreak);
        await setDoc(profileDocRef, { lastLogin: today, streak: currentStreak }, { merge: true });
        Swal.fire({
          title: "Streak Started!",
          text: "Your login streak is now 1 day!",
          icon: "success",
          confirmButtonColor: "#3085d6",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    } else {
      const initialStreak = 1;
      setStreak(initialStreak);
      await setDoc(profileDocRef, { lastLogin: today, streak: initialStreak, displayName: user.displayName || user.email, bio: "" }, { merge: true });
      Swal.fire({
        title: "Streak Started!",
        text: "Your login streak is now 1 day!",
        icon: "success",
        confirmButtonColor: "#3085d6",
        timer: 2000,
        timerProgressBar: true,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadHighScores();
      updateStreak();
    } else {
      setUserProgress({});
      setHighScores([]);
      setStreak(0);
    }
  }, [user, loadUserData, loadHighScores, updateStreak]);

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
                  streak={streak}
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