import React, { useEffect, useState, useCallback } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
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
import Achievements from "./components/Achievements";
import Swal from "sweetalert2";

type AchievementCheck = (
  progress: UserProgress,
  scores: (HighScore & { userId: string })[],
  streak: number,
  loginDays: number
) => boolean;

const achievementConditions: { id: string; name: string; check: AchievementCheck }[] = [
  { id: "1", name: "Beginner", check: (progress) => Object.values(progress).some(p => p.completed > 0) },
  { id: "2", name: "Quizzer", check: (progress) => Object.values(progress).filter(p => p.completed === topics.find(t => t.name === Object.keys(progress).find(k => progress[k] === p))?.questions.length).length >= 5 },
  { id: "3", name: "Master", check: (progress) => Object.values(progress).filter(p => p.completed === topics.find(t => t.name === Object.keys(progress).find(k => progress[k] === p))?.questions.length).length >= 10 },
  { id: "4", name: "Score Starter", check: (_, scores) => scores.reduce((sum, s) => sum + s.score, 0) >= 50 },
  { id: "5", name: "Score Pro", check: (_, scores) => scores.reduce((sum, s) => sum + s.score, 0) >= 200 },
  { id: "6", name: "Streak Starter", check: (_, __, streak) => streak >= 3 },
  { id: "7", name: "Streak Master", check: (_, __, streak) => streak >= 7 },
  { id: "8", name: "Quick Learner", check: (progress) => Object.values(progress).some(p => p.time && parseTimeToSeconds(p.time) < 300) },
  { id: "9", name: "Perfectionist", check: (_, scores) => scores.some(s => s.score === topics.find(t => t.name === s.topic)?.questions.length) },
  { id: "10", name: "Veteran", check: (_, __, ___, loginDays) => loginDays >= 10 },
];

const parseTimeToSeconds = (time: string): number => {
  const [minutes, seconds] = time.split(":").map(Number);
  return minutes * 60 + seconds;
};

const App: React.FC = () => {
  const { user } = useAuth();
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [highScores, setHighScores] = useState<(HighScore & { userId: string })[]>([]);
  const [streak, setStreak] = useState(0);
  const [loginDays, setLoginDays] = useState(0);

  const loadUserData = useCallback(async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserProgress(userDoc.data() as UserProgress);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load user progress. Please try again later.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  }, [user]);

  const loadHighScores = useCallback(async () => {
    if (!user) return;
    const scores: (HighScore & { userId: string })[] = [];
    try {
      for (const topic of topics) {
        const highScoreDoc = await getDoc(doc(db, "highScores", `${user.uid}_${topic.name}`));
        if (highScoreDoc.exists()) {
          scores.push({ ...highScoreDoc.data() as HighScore, userId: user.uid });
        }
      }
      setHighScores(scores);
    } catch (error) {
      console.error("Error loading high scores:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load high scores. Please try again later.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  }, [user]);

  const updateStreakAndAchievements = useCallback(async () => {
    if (!user) return;
    const profileDocRef = doc(db, "profiles", user.uid);
    try {
      const profileDoc = await getDoc(profileDocRef);
      const today = new Date().toISOString().split("T")[0];

      let currentStreak = 0;
      let loginDaysSet = new Set<string>();

      if (profileDoc.exists()) {
        const data = profileDoc.data();
        const lastLogin = data.lastLogin || "";
        currentStreak = data.streak || 0;
        loginDaysSet = new Set(data.loginDays || []);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastLogin !== today) {
          loginDaysSet.add(today);
          if (lastLogin === yesterdayStr) {
            currentStreak += 1;
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
            Swal.fire({
              title: "Streak Started!",
              text: "Your login streak is now 1 day!",
              icon: "success",
              confirmButtonColor: "#3085d6",
              timer: 2000,
              timerProgressBar: true,
            });
          }
        }
      } else {
        currentStreak = 1;
        loginDaysSet.add(today);
        Swal.fire({
          title: "Streak Started!",
          text: "Your login streak is now 1 day!",
          icon: "success",
          confirmButtonColor: "#3085d6",
          timer: 2000,
          timerProgressBar: true,
        });
      }

      setStreak(currentStreak);
      setLoginDays(loginDaysSet.size);
      await setDoc(profileDocRef, { lastLogin: today, streak: currentStreak, loginDays: Array.from(loginDaysSet), displayName: user.displayName || user.email, bio: "" }, { merge: true });

      const achievementsRef = collection(db, "profiles", user.uid, "achievements");
      for (const { id, name, check } of achievementConditions) {
        if (check(userProgress, highScores, currentStreak, loginDaysSet.size)) {
          const achievementDoc = doc(achievementsRef, id);
          const docSnap = await getDoc(achievementDoc);
          if (!docSnap.exists()) {
            await setDoc(achievementDoc, { name, achievedAt: new Date().toISOString() });
            Swal.fire({
              title: "Achievement Unlocked!",
              text: `${name}`,
              icon: "success",
              confirmButtonColor: "#3085d6",
              timer: 2000,
              timerProgressBar: true,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating streak and achievements:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to update achievements. Please check your permissions or try again later.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  }, [user, userProgress, highScores]);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadHighScores();
      updateStreakAndAchievements();
    } else {
      setUserProgress({});
      setHighScores([]);
      setStreak(0);
      setLoginDays(0);
    }
  }, [user, loadUserData, loadHighScores, updateStreakAndAchievements]);

  const handleQuizComplete = async (newScore: number, time: string) => {
    if (!user || !currentTopic) return;
    try {
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
      await updateStreakAndAchievements();
    } catch (error) {
      console.error("Error completing quiz:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to save quiz progress. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleQuizQuit = async (newElapsed: number, newScore: number, newCompleted: number) => {
    if (!user || !currentTopic) return;
    try {
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
      await updateStreakAndAchievements();
      setCurrentTopic(null);
      setElapsedTime(0);
      setScore(0);
      setCurrentQuestion(0);
    } catch (error) {
      console.error("Error quitting quiz:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to save quiz state. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleResetAll = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {});
      for (const topic of topics) {
        await setDoc(doc(db, "highScores", `${user.uid}_${topic.name}`), {
          name: user.displayName || user.email || "",
          score: 0,
          topic: topic.name,
        });
      }
      const achievementsRef = collection(db, "profiles", user.uid, "achievements");
      const snapshot = await getDocs(achievementsRef);
      for (const docSnap of snapshot.docs) {
        await setDoc(doc(achievementsRef, docSnap.id), {}, { merge: true });
      }
      setUserProgress({});
      setCurrentTopic(null);
      setElapsedTime(0);
      setScore(0);
      setCurrentQuestion(0);
      await loadHighScores();
      await updateStreakAndAchievements();
    } catch (error) {
      console.error("Error resetting progress:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to reset progress. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const currentTopicData = currentTopic ? topics.find((t) => t.name === currentTopic) : null;
  const initialProgress = currentTopic ? userProgress[currentTopic]?.completed || 0 : 0;
  const initialElapsed = currentTopic ? userProgress[currentTopic]?.elapsed || 0 : 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow">
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
                    highScores={highScores}
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
          <Route
            path="/achievements"
            element={user ? <Achievements loginDays={loginDays} /> : <Navigate to="/signin" />}
          />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>Code Quizzers @2025</p>
      </footer>
    </div>
  );
};

export default App;