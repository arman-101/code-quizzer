import React, { useState, useEffect } from "react";
import { Question } from "../types";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface QuizProps {
  topic: string;
  questions: Question[];
  onComplete: (score: number, time: string) => void;
  initialProgress: number;
  initialElapsed: number;
  onQuit: (elapsed: number) => void;
}

const Quiz: React.FC<QuizProps> = ({
  topic,
  questions,
  onComplete,
  initialProgress,
  initialElapsed,
  onQuit,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(initialProgress);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now() - initialElapsed * 1000);
  const [elapsedTime, setElapsedTime] = useState(initialElapsed);
  const [buttonsEnabled, setButtonsEnabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleAnswer = (selected: string) => {
    if (!buttonsEnabled) return;
    setButtonsEnabled(false);

    const question = questions[currentQuestion];
    if (selected === question.correct) {
      const points = question.difficulty <= 10 ? 10 : question.difficulty <= 20 ? 20 : 30;
      setScore(score + points);
      toast.success(`Correct! +${points} points`);
    } else {
      toast.error(`Wrong! Correct answer: ${question.correct}`);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion >= questions.length) {
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      onComplete(score, `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    } else {
      setTimeout(() => {
        setCurrentQuestion(nextQuestion);
        setButtonsEnabled(true);
      }, 1000);
    }
  };

  const handleQuit = () => {
    Swal.fire({
      title: "Quit Quiz?",
      text: "Your progress will be saved.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, quit",
    }).then((result) => {
      if (result.isConfirmed) {
        onQuit(elapsedTime);
        navigate("/");
      }
    });
  };

  if (currentQuestion >= questions.length) return null;

  const question = questions[currentQuestion];
  const difficultyColor =
    question.difficulty <= 10 ? "bg-green-400" : question.difficulty <= 20 ? "bg-blue-400" : "bg-red-400";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
        >
          Back to Home
        </motion.button>
        <div className="flex space-x-4">
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
        onClick={handleQuit}
        className="mt-6 w-full bg-yellow-400 text-white py-3 rounded-lg hover:bg-yellow-500 transition"
      >
        Quit
      </motion.button>
    </motion.div>
  );
};

export default Quiz;