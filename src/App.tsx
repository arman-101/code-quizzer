import React, { useEffect, useState, useCallback } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import { auth, db } from "./firebase";
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
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [highScores, setHighScores] = useState<(HighScore & { userId: string })[]>([]);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<AchievementsState>({
    completed: {},
    shownPopups: {},
  });

  useEffect(() => {
    if (loading) return;

    const publicRoutes = ["/signin", "/signup", "/faq"];
    if (user) {
      if (publicRoutes.includes(location.pathname) && location.pathname !== "/faq") {
        navigate("/", { replace: true });
      }
    } else {
      if (!publicRoutes.includes(location.pathname)) {
        navigate("/signin", { replace: true, state: { from: location } });
      }
    }
  }, [user, loading, location, navigate]);

  const loadUserData = useCallback(async () => {
    if (!user || !auth.currentUser) return;
    console.log("Loading user data for:", user.uid);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserProgress(userDoc.data() as UserProgress);
      }
    } catch (error) {
      console.error("Error in loadUserData:", error);
    }
  }, [user]);

  const loadHighScores = useCallback(async () => {
    if (!user || !auth.currentUser) return;
    console.log("Loading high scores for:", user.uid);
    try {
      const highScoresSnap = await getDocs(collection(db, "highScores"));
      const scores = highScoresSnap.docs.map((doc) => ({
        ...doc.data() as HighScore,
        userId: doc.id.split('_')[0],
      }));
      setHighScores(scores);
    } catch (error) {
      console.error("Error in loadHighScores:", error);
    }
  }, [user]);

  const loadAchievements = useCallback(async (): Promise<AchievementsState> => {
    if (!user || !auth.currentUser) return { completed: {}, shownPopups: {} };
    console.log("Loading achievements for:", user.uid);
    try {
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
    } catch (error) {
      console.error("Error in loadAchievements:", error);
      return { completed: {}, shownPopups: {} };
    }
  }, [user]);

  const checkAchievements = useCallback(async () => {
    if (!user || !auth.currentUser) return;
    console.log("Checking achievements for:", user.uid);
    const currentAchievements = await loadAchievements();
    const completedTopics = Object.keys(userProgress).filter(
      (topic) => userProgress[topic].completed === topics.find((t) => t.name === topic)?.questions.length
    ).length;
    const totalScore = highScores.reduce((sum, score) => sum + score.score, 0);

    try {
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
    } catch (error) {
      console.error("Error in checkAchievements:", error);
    }
  }, [user, userProgress, highScores, streak, loadAchievements]);

  const updateStreak = useCallback(async () => {
    if (!user || !auth.currentUser) return;
    console.log("Updating streak for:", user.uid);
    const profileDocRef = doc(db, "profiles", user.uid);
    try {
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
    } catch (error) {
      console.error("Error in updateStreak:", error);
    }
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
    if (loading || !user || !auth.currentUser) {
      console.log("Skipping user data effect: loading=", loading, "user=", user, "auth.currentUser=", auth.currentUser);
      setUserProgress({});
      setHighScores([]);
      setStreak(0);
      setAchievements({ completed: {}, shownPopups: {} });
      return;
    }
    console.log("Running user data effect for:", user.uid);
    loadUserData();
    loadHighScores().then(() => checkAchievements());
    loadAchievements();
    updateStreak();
  }, [user, loading, loadUserData, loadHighScores, loadAchievements, updateStreak, checkAchievements]);

  const handleQuizComplete = useCallback(async (newScore: number, time: string, answerResults: { question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }[]) => {
    if (!user || !currentTopic || !auth.currentUser) return;
    const updatedProgress = {
      ...userProgress,
      [currentTopic]: {
        completed: topics.find((t) => t.name === currentTopic)!.questions.length,
        time,
        elapsed: 0,
        score: newScore,
        answerResults,
      },
    };
    try {
      setUserProgress(updatedProgress);
      await setDoc(doc(db, "users", user.uid), updatedProgress);
      const highScoreDoc = doc(db, "highScores", `${user.uid}_${currentTopic}`);
      await setDoc(highScoreDoc, {
        name: user.displayName || user.email || "",
        score: newScore,
        topic: currentTopic,
        completed: updatedProgress[currentTopic].completed,
      });
      await loadUserData();
      await loadHighScores();
      await checkAchievements();
    } catch (error) {
      console.error("Error in handleQuizComplete:", error);
    }
  }, [user, currentTopic, userProgress, loadUserData, loadHighScores, checkAchievements]);

  const handleQuizQuit = useCallback(async (newElapsed: number, newScore: number, newCompleted: number, answerResults: { question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }[]) => {
    if (!user || !currentTopic || !auth.currentUser) return;
    const updatedProgress = {
      ...userProgress,
      [currentTopic]: {
        completed: newCompleted,
        time: null,
        elapsed: newElapsed,
        score: newScore,
        answerResults,
      },
    };
    try {
      setUserProgress(updatedProgress);
      await setDoc(doc(db, "users", user.uid), updatedProgress);
      const highScoreDoc = doc(db, "highScores", `${user.uid}_${currentTopic}`);
      await setDoc(highScoreDoc, {
        name: user.displayName || user.email || "",
        score: newScore,
        topic: currentTopic,
        completed: newCompleted,
      });
      await loadUserData();
      await loadHighScores();
      setCurrentTopic(null);
      await checkAchievements();
    } catch (error) {
      console.error("Error in handleQuizQuit:", error);
    }
  }, [user, currentTopic, userProgress, loadUserData, loadHighScores, checkAchievements]);

  const handleResetAll = useCallback(async () => {
    if (!user || !auth.currentUser) return;
    try {
      await setDoc(doc(db, "users", user.uid), {});
      for (const topic of topics) {
        await setDoc(doc(db, "highScores", `${user.uid}_${topic.name}`), {
          name: user.displayName || user.email || "",
          score: 0,
          topic: topic.name,
          completed: 0,
        });
      }
      setUserProgress({});
      setCurrentTopic(null);
      await loadHighScores();
      await checkAchievements();
    } catch (error) {
      console.error("Error in handleResetAll:", error);
    }
  }, [user, loadHighScores, checkAchievements]);

  const currentTopicData = currentTopic ? topics.find((t) => t.name === currentTopic) : null;
  const initialProgress = currentTopic ? userProgress[currentTopic]?.completed || 0 : 0;
  const initialElapsed = currentTopic ? userProgress[currentTopic]?.elapsed || 0 : 0;
  const initialScore = currentTopic ? userProgress[currentTopic]?.score || 0 : 0;

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
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {user ? (
                  <TopicSelector
                    topics={topics}
                    userProgress={userProgress}
                    setCurrentTopic={setCurrentTopic}
                    handleResetAll={handleResetAll}
                    streak={streak}
                    highScores={highScores}
                  />
                ) : (
                  <SignIn />
                )}
              </motion.div>
            }
          />
          <Route
            path="/quiz/:topicName"
            element={
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {user && currentTopic && currentTopicData ? (
                  <Quiz
                    topic={currentTopic}
                    questions={currentTopicData.questions}
                    onComplete={handleQuizComplete}
                    initialProgress={initialProgress}
                    initialElapsed={initialElapsed}
                    initialScore={initialScore}
                    onQuit={handleQuizQuit}
                    elapsedTime={initialElapsed}
                    setElapsedTime={() => {}} 
                    score={initialScore}
                    setScore={() => {}}
                    currentQuestion={initialProgress}
                    setCurrentQuestion={() => {}}
                    userProgress={userProgress}
                    topics={topics}
                    onEndScreenNavigation={() => setCurrentTopic(null)}
                  />
                ) : user ? (
                  <TopicSelector
                    topics={topics}
                    userProgress={userProgress}
                    setCurrentTopic={setCurrentTopic}
                    handleResetAll={handleResetAll}
                    streak={streak}
                    highScores={highScores}
                  />
                ) : (
                  <SignIn />
                )}
              </motion.div>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {user ? <Leaderboard highScores={highScores} userProgress={userProgress} /> : <SignIn />}
              </motion.div>
            }
          />
          <Route
            path="/profile"
            element={
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {user ? <Profile handleResetAll={handleResetAll} /> : <SignIn />}
              </motion.div>
            }
          />
          <Route
            path="/achievements"
            element={
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {user ? <Achievements achievements={achievements.completed} /> : <SignIn />}
              </motion.div>
            }
          />
          <Route
            path="/faq"
            element={
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FAQ />
              </motion.div>
            }
          />
          <Route
            path="/signin"
            element={
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {!user ? (
                  <SignIn />
                ) : (
                  <TopicSelector
                    topics={topics}
                    userProgress={userProgress}
                    setCurrentTopic={setCurrentTopic}
                    handleResetAll={handleResetAll}
                    streak={streak}
                    highScores={highScores}
                  />
                )}
              </motion.div>
            }
          />
          <Route
            path="/signup"
            element={
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {!user ? (
                  <SignUp />
                ) : (
                  <TopicSelector
                    topics={topics}
                    userProgress={userProgress}
                    setCurrentTopic={setCurrentTopic}
                    handleResetAll={handleResetAll}
                    streak={streak}
                    highScores={highScores}
                  />
                )}
              </motion.div>
            }
          />
          <Route
            path="*"
            element={
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {user ? (
                  <TopicSelector
                    topics={topics}
                    userProgress={userProgress}
                    setCurrentTopic={setCurrentTopic}
                    handleResetAll={handleResetAll}
                    streak={streak}
                    highScores={highScores}
                  />
                ) : (
                  <SignIn />
                )}
              </motion.div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;