import React, { useEffect, useState, useCallback } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
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
import Footer from "./components/Footer";
import Swal from "sweetalert2";

interface AchievementsState {
  completed: { [key: string]: boolean };
  shownPopups: { [key: string]: boolean };
}

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [highScores, setHighScores] = useState<(HighScore & { userId: string })[]>([]);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<AchievementsState>({
    completed: {},
    shownPopups: {},
  });

  const loadUserData = useCallback(async () => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      setUserProgress(userDoc.data() as UserProgress);
    }
  }, [user]);

  const loadHighScores = useCallback(async () => {
    if (!user) return;
    try {
      const highScoresSnap = await getDocs(collection(db, "highScores"));
      const scores = highScoresSnap.docs.map((doc) => ({
        ...doc.data() as HighScore,
        userId: doc.id.split('_')[0],
      }));
      setHighScores(scores);
    } catch (error) {
      console.error("Error loading high scores:", error);
    }
  }, [user]);

  const loadAchievements = useCallback(async (): Promise<AchievementsState> => {
    if (!user) {
      return { completed: {}, shownPopups: {} };
    }
    const achievementsDoc = await getDoc(doc(db, "profiles", user.uid, "achievements", "progress"));
    const defaultAchievements: AchievementsState = {
      completed: {
        "First Step": false,
        "Triple Threat": false,
        "Master Coder": false,
        "Century Scorer": false,
        "Half Millennium": false,
        "Code Legend": false,
        "Double Duty": false,
        "Five Alive": false,
        "Decade Devotion": false,
        "Top Coder": false,
      },
      shownPopups: {
        "First Step": false,
        "Triple Threat": false,
        "Master Coder": false,
        "Century Scorer": false,
        "Half Millennium": false,
        "Code Legend": false,
        "Double Duty": false,
        "Five Alive": false,
        "Decade Devotion": false,
        "Top Coder": false,
      },
    };
    const loadedAchievements = achievementsDoc.exists()
      ? (achievementsDoc.data() as AchievementsState)
      : defaultAchievements;
    setAchievements(loadedAchievements);
    return loadedAchievements;
  }, [user]);

  const checkAchievements = useCallback(async () => {
    if (!user) return;

    const currentAchievements = await loadAchievements();
    const completedTopics = Object.keys(userProgress).filter(
      (topic) => userProgress[topic].completed === topics.find((t) => t.name === topic)?.questions.length
    ).length;
    const totalScore = highScores.reduce((sum, score) => sum + score.score, 0);

    const allHighScoresSnap = await getDocs(collection(db, "highScores"));
    const allHighScores = allHighScoresSnap.docs.map((doc) => ({
      ...doc.data() as HighScore,
      userId: doc.id.split('_')[0],
    }));
    const userScores: { [userId: string]: number } = {};
    allHighScores.forEach((score) => {
      userScores[score.userId] = (userScores[score.userId] || 0) + score.score;
    });
    const leaderboard = Object.entries(userScores).map(([userId, score]) => ({ userId, score }));
    leaderboard.sort((a, b) => b.score - a.score);
    const topUserId = leaderboard[0]?.userId;

    const newAchievements: AchievementsState = { ...currentAchievements };
    let updated = false;

    const checkAndUpdate = (name: string, condition: boolean, message: string) => {
      if (condition && !currentAchievements.completed[name]) {
        newAchievements.completed[name] = true;
        if (!currentAchievements.shownPopups[name]) {
          newAchievements.shownPopups[name] = true;
          Swal.fire({ title: "Achievement Unlocked!", text: message, icon: "success", timer: 2000 });
          updated = true;
        }
        updated = true;
      }
    };

    checkAndUpdate("First Step", completedTopics >= 1, "First Step: Completed 1 topic!");
    checkAndUpdate("Triple Threat", completedTopics >= 3, "Triple Threat: Completed 3 topics!");
    checkAndUpdate("Master Coder", completedTopics >= 9, "Master Coder: Completed all 9 topics!");
    checkAndUpdate("Century Scorer", totalScore >= 100, "Century Scorer: Reached 100 score!");
    checkAndUpdate("Half Millennium", totalScore >= 500, "Half Millennium: Reached 500 score!");
    checkAndUpdate("Code Legend", totalScore >= 1000, "Code Legend: Reached 1000 score!");
    checkAndUpdate("Double Duty", streak >= 2, "Double Duty: 2-day streak!");
    checkAndUpdate("Five Alive", streak >= 5, "Five Alive: 5-day streak!");
    checkAndUpdate("Decade Devotion", streak >= 10, "Decade Devotion: 10-day streak!");
    checkAndUpdate("Top Coder", topUserId === user.uid, "Top Coder: #1 on the leaderboard!");

    if (updated) {
      setAchievements(newAchievements);
      await setDoc(doc(db, "profiles", user.uid, "achievements", "progress"), newAchievements);
    }
  }, [user, userProgress, highScores, streak, loadAchievements]);

  const updateStreak = useCallback(async () => {
    if (!user) return;
    const profileDocRef = doc(db, "profiles", user.uid);
    const profileDoc = await getDoc(profileDocRef);
    const today = new Date().toISOString().split("T")[0];

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
        Swal.fire({ title: "Streak Increased!", text: `Your login streak is now ${currentStreak} days!`, icon: "success", timer: 2000 });
      } else if (!lastLogin || lastLogin < yesterdayStr) {
        currentStreak = 1;
        setStreak(currentStreak);
        await setDoc(profileDocRef, { lastLogin: today, streak: currentStreak }, { merge: true });
        Swal.fire({ title: "Streak Started!", text: "Your login streak is now 1 day!", icon: "success", timer: 2000 });
      }
    } else {
      const initialStreak = 1;
      setStreak(initialStreak);
      await setDoc(profileDocRef, { lastLogin: today, streak: initialStreak, displayName: user.displayName || user.email, bio: "" }, { merge: true });
      Swal.fire({ title: "Streak Started!", text: "Your login streak is now 1 day!", icon: "success", timer: 2000 });
    }
    await checkAchievements();
  }, [user, checkAchievements]);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const topicFromUrl = pathParts[2];
    if (pathParts[1] === "quiz" && topicFromUrl && topics.some(t => t.name === topicFromUrl)) {
      setCurrentTopic(topicFromUrl);
    } else if (pathParts[1] !== "quiz") {
      setCurrentTopic(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadHighScores().then(() => checkAchievements());
      loadAchievements();
      updateStreak();
    } else {
      setUserProgress({});
      setHighScores([]);
      setStreak(0);
      setAchievements({ completed: {}, shownPopups: {} });
    }
  }, [user, loadUserData, loadHighScores, loadAchievements, updateStreak]);

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
      completed: updatedProgress[currentTopic].completed, // Add completed count
    });
    await loadUserData();
    await loadHighScores();
    await checkAchievements();
    setCurrentTopic(null);
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
      completed: newCompleted, // Add completed count
    });
    await loadUserData();
    await loadHighScores();
    setCurrentTopic(null);
    setElapsedTime(0);
    setScore(0);
    setCurrentQuestion(0);
    await checkAchievements();
  };

  const handleResetAll = async () => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {});
    for (const topic of topics) {
      await setDoc(doc(db, "highScores", `${user.uid}_${topic.name}`), {
        name: user.displayName || user.email || "",
        score: 0,
        topic: topic.name,
        completed: 0, // Reset completed to 0
      });
    }
    setUserProgress({});
    setCurrentTopic(null);
    setElapsedTime(0);
    setScore(0);
    setCurrentQuestion(0);
    await loadHighScores();
    await checkAchievements();
  };

  const currentTopicData = currentTopic ? topics.find((t) => t.name === currentTopic) : null;
  const initialProgress = currentTopic ? userProgress[currentTopic]?.completed || 0 : 0;
  const initialElapsed = currentTopic ? userProgress[currentTopic]?.elapsed || 0 : 0;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <TopicSelector
                  topics={topics}
                  userProgress={userProgress}
                  setCurrentTopic={setCurrentTopic}
                  handleResetAll={handleResetAll}
                  streak={streak}
                  highScores={highScores}
                />
              ) : (
                <Navigate to="/signin" state={{ from: location }} />
              )
            }
          />
          <Route
            path="/quiz/:topicName"
            element={
              user && currentTopic && currentTopicData ? (
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
              ) : user ? (
                <Navigate to="/" />
              ) : (
                <Navigate to="/signin" state={{ from: location }} />
              )
            }
          />
          <Route
            path="/leaderboard"
            element={
              user ? (
                <Leaderboard highScores={highScores} userProgress={userProgress} />
              ) : (
                <Navigate to="/signin" state={{ from: location }} />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user ? <Profile /> : <Navigate to="/signin" state={{ from: location }} />
            }
          />
          <Route
            path="/achievements"
            element={
              user ? (
                <Achievements achievements={achievements.completed} />
              ) : (
                <Navigate to="/signin" state={{ from: location }} />
              )
            }
          />
          <Route path="/faq" element={<FAQ />} />
          <Route
            path="/signin"
            element={!user ? <SignIn /> : <Navigate to={location.state?.from?.pathname || "/"} />}
          />
          <Route
            path="/signup"
            element={!user ? <SignUp /> : <Navigate to={location.state?.from?.pathname || "/"} />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;