import React, { useEffect, useState } from "react";
import { Question, UserProgress, Topic } from "../types";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface QuizProps {
  topic: string;
  questions: Question[];
  onComplete: (score: number, time: string) => void;
  initialProgress: number;
  initialElapsed: number;
  initialScore: number;
  onQuit: (elapsed: number, score: number, completed: number) => void;
  elapsedTime: number;
  setElapsedTime: (time: number) => void;
  score: number;
  setScore: (score: number) => void;
  currentQuestion: number;
  setCurrentQuestion: (question: number) => void;
  userProgress: UserProgress;
  topics: Topic[];
  onEndScreenNavigation: () => void;
}

const Quiz: React.FC<QuizProps> = ({
  topic,
  questions,
  onComplete,
  initialProgress,
  initialElapsed,
  onQuit,
  elapsedTime,
  setElapsedTime,
  score,
  setScore,
  currentQuestion,
  setCurrentQuestion,
  userProgress,
  topics,
  onEndScreenNavigation,
}) => {
  const [startTime, setStartTime] = useState(Date.now() - initialElapsed * 1000);
  const [buttonsEnabled, setButtonsEnabled] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    setTimerId(id);
    return () => clearInterval(id);
  }, [startTime, setElapsedTime]);

  useEffect(() => {
    if (isCompleted && timerId) {
      clearInterval(timerId);
    }
  }, [isCompleted, timerId]);

  const handleAnswer = (selected: string) => {
    if (!buttonsEnabled) return;
    setButtonsEnabled(false);

    const question = questions[currentQuestion];
    const isCorrect = selected === question.correct;
    const points = isCorrect ? (question.difficulty <= 10 ? 10 : question.difficulty <= 20 ? 20 : 30) : 0;

    Swal.fire({
      title: isCorrect ? "Correct!" : "Incorrect",
      text: isCorrect
        ? `You earned ${points} points!`
        : `The correct answer was: ${question.correct}`,
      icon: isCorrect ? "success" : "error",
      confirmButtonText: "Continue",
    }).then(() => {
      if (isCorrect) {
        setScore(score + points);
        setCorrectAnswers(correctAnswers + 1);
      }

      const nextQuestion = currentQuestion + 1;
      if (nextQuestion >= questions.length) {
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        onComplete(score + points, timeString);
        setIsCompleted(true);
      } else {
        setCurrentQuestion(nextQuestion);
        setButtonsEnabled(true);
      }
    });
  };

  const handleQuit = (isBackToHome = false) => {
    Swal.fire({
      title: isBackToHome ? "Return Home?" : "Quit Quiz?",
      text: "Your progress will be saved.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isBackToHome ? "Yes, go home" : "Yes, quit",
    }).then((result) => {
      if (result.isConfirmed) {
        onQuit(elapsedTime, score, currentQuestion);
        navigate("/");
      }
    });
  };

  const handleResetTopic = async () => {
    const result = await Swal.fire({
      title: "Re-Try Topic?",
      text: "This will reset your progress for this topic only.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, re-try",
    });
    if (result.isConfirmed) {
      setCurrentQuestion(0);
      setScore(0);
      setElapsedTime(0);
      setCorrectAnswers(0);
      setButtonsEnabled(true);
      setIsCompleted(false);
      setStartTime(Date.now());
    }
  };

  // Capitalize each word in the topic name
  const capitalizeTopic = (topicName: string) =>
    topicName
      .replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  if (isCompleted) {
    const maxScore = questions.reduce(
      (sum, q) => sum + (q.difficulty <= 10 ? 10 : q.difficulty <= 20 ? 20 : 30),
      0
    );
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl font-bold mb-8 text-indigo-600">Topic Completed: {capitalizeTopic(topic)}</h2>
        <div className="mb-8">
          <p className="text-lg mb-4">Score: {score}/{maxScore}</p>
          <p className="text-lg mb-4">Correct Answers: {correctAnswers}/{questions.length}</p>
          <p className="text-lg">Time: {timeString}</p>
        </div>
        <div className="space-y-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={onEndScreenNavigation}
            className="w-1/3 mx-auto block bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition"
          >
            Back to Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleResetTopic}
            className="w-1/3 mx-auto block bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition"
          >
            Re-Try Topic
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (currentQuestion >= questions.length) {
    return null;
  }

  const question = questions[currentQuestion];
  const difficultyColor =
    question.difficulty <= 10 ? "bg-green-400" : question.difficulty <= 20 ? "bg-blue-400" : "bg-red-400";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => handleQuit(true)}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
        >
          Back to Home
        </motion.button>
        <div className="flex space-x-4">
          <p className="text-lg font-medium text-gray-800">Topic: {capitalizeTopic(topic)}</p>
          <p className="text-lg font-medium text-gray-800">Score: {score}</p>
          <p className="text-lg font-medium text-gray-800">
            Time: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, "0")}
          </p>
        </div>
      </div>
      <motion.div
        key={currentQuestion}
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        className="my-6 bg-white p-4 rounded-lg shadow-md"
      >
        <p className="text-xl font-semibold text-gray-800">
          Question {currentQuestion + 1}: {question.question}
        </p>
        <span className={`${difficultyColor} text-white px-2 py-1 rounded-full text-sm mt-2 inline-block`}>
          {question.difficulty <= 10 ? "Easy" : question.difficulty <= 20 ? "Medium" : "Hard"}
        </span>
      </motion.div>
      <div className="space-y-3">
        {question.options.map((option) => (
          <motion.button
            key={option}
            whileHover={{ scale: buttonsEnabled ? 1.03 : 1 }}
            onClick={() => handleAnswer(option)}
            disabled={!buttonsEnabled}
            className={`w-full bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition ${
              !buttonsEnabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {option}
          </motion.button>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => handleQuit(false)}
        className="mt-6 w-1/2 mx-auto block bg-yellow-400 text-white px-2 py-2 rounded-lg hover:bg-yellow-500 transition"
      >
        Quit
      </motion.button>
    </motion.div>
  );
};

export default Quiz;