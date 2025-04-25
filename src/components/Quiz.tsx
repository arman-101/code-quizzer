import React, { useEffect, useState } from "react";
import { Question, UserProgress, Topic } from "../types";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaBookOpen } from "react-icons/fa";

interface QuizProps {
  topic: string;
  questions: Question[];
  onComplete: (
    score: number,
    time: string,
    answerResults: { question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }[]
  ) => void;
  initialProgress: number;
  initialElapsed: number;
  initialScore: number;
  onQuit: (
    elapsed: number,
    score: number,
    completed: number,
    answerResults: { question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }[]
  ) => void;
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

interface AnswerResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

const Quiz: React.FC<QuizProps> = ({
  topic,
  questions,
  onComplete,
  initialProgress,
  initialElapsed,
  initialScore,
  onQuit,
  userProgress,
  topics,
  onEndScreenNavigation,
}) => {
  const [startTime] = useState(Date.now() - initialElapsed * 1000);
  const [elapsedTime, setElapsedTime] = useState(initialElapsed);
  const [buttonsEnabled, setButtonsEnabled] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>(userProgress[topic]?.answerResults || []);
  const [currentQuestion, setCurrentQuestion] = useState(initialProgress);
  const [score, setScore] = useState(initialScore);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    setTimerId(id);
    return () => clearInterval(id);
  }, [startTime]);

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

    const newAnswerResult = {
      question: question.question,
      userAnswer: selected,
      correctAnswer: question.correct,
      isCorrect,
    };

    setAnswerResults((prev) => [...prev, newAnswerResult]);

    Swal.fire({
      title: isCorrect ? "Correct!" : "Incorrect",
      text: isCorrect
        ? `You earned ${points} points!`
        : `The correct answer was: ${question.correct}`,
      icon: isCorrect ? "success" : "error",
      confirmButtonText: "Continue",
    }).then(() => {
      if (isCorrect) {
        setScore((prevScore) => prevScore + points);
        setCorrectAnswers(correctAnswers + 1);
      }

      const nextQuestion = currentQuestion + 1;
      if (nextQuestion >= questions.length) {
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        onComplete(score + (isCorrect ? points : 0), timeString, [...answerResults, newAnswerResult]);
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
        onQuit(elapsedTime, score, currentQuestion, answerResults);
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
      setAnswerResults([]);
      if (timerId) clearInterval(timerId);
      const newTimerId = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      setTimerId(newTimerId);
      onQuit(0, 0, 0, []);
    }
  };

  const handleGoHome = () => {
    onEndScreenNavigation();
    navigate("/");
  };

  const learningResources: { [key: string]: { title: string; url: string }[] } = {
    variables: [
      { title: "MDN Web Docs: Variables", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Variables" },
      { title: "W3Schools: JavaScript Variables", url: "https://www.w3schools.com/js/js_variables.asp" },
    ],
    loops: [
      { title: "MDN Web Docs: Loops and Iteration", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration" },
      { title: "W3Schools: JavaScript Loops", url: "https://www.w3schools.com/js/js_loop_for.asp" },
    ],
    conditions: [
      { title: "MDN Web Docs: Conditionals", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/conditionals" },
      { title: "W3Schools: JavaScript If Else", url: "https://www.w3schools.com/js/js_if_else.asp" },
    ],
    functions: [
      { title: "MDN Web Docs: Functions", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions" },
      { title: "W3Schools: JavaScript Functions", url: "https://www.w3schools.com/js/js_functions.asp" },
    ],
    data_structures: [
      { title: "MDN Web Docs: Arrays", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array" },
      { title: "W3Schools: JavaScript Arrays", url: "https://www.w3schools.com/js/js_arrays.asp" },
    ],
    input_output: [
      { title: "MDN Web Docs: Console", url: "https://developer.mozilla.org/en-US/docs/Web/API/console" },
      { title: "W3Schools: JavaScript Output", url: "https://www.w3schools.com/js/js_output.asp" },
    ],
    operators: [
      { title: "MDN Web Docs: Operators", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators" },
      { title: "W3Schools: JavaScript Operators", url: "https://www.w3schools.com/js/js_operators.asp" },
    ],
    strings: [
      { title: "MDN Web Docs: Strings", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String" },
      { title: "W3Schools: JavaScript Strings", url: "https://www.w3schools.com/js/js_strings.asp" },
    ],
    arrays: [
      { title: "MDN Web Docs: Arrays", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array" },
      { title: "W3Schools: JavaScript Arrays", url: "https://www.w3schools.com/js/js_arrays.asp" },
    ],
  };

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
    const correctQuestions = answerResults.filter((result) => result.isCorrect);
    const incorrectQuestions = answerResults.filter((result) => !result.isCorrect);
    const resources = learningResources[topic] || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full border border-gray-200">
          <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-6">
            Topic Completed: {capitalizeTopic(topic)}
          </h2>
          <div className="flex justify-center space-x-8 mb-10 text-center">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Score</p>
              <p className="text-2xl font-bold text-indigo-600">{score}/{maxScore}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Correct</p>
              <p className="text-2xl font-bold text-indigo-600">{correctAnswers}/{questions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Time</p>
              <p className="text-2xl font-bold text-indigo-600">{timeString}</p>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-green-600 mb-4 flex items-center">
              <FaCheckCircle className="mr-2" /> Correct Answers ({correctQuestions.length})
            </h3>
            <div className="bg-green-50 p-4 rounded-lg">
              {correctQuestions.length > 0 ? (
                <ul className="space-y-3">
                  {correctQuestions.map((result, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-gray-700 flex items-start"
                    >
                      <span className="text-green-500 mr-2">✓</span>
                      <span>
                        <span className="font-medium">{result.question}</span> -{" "}
                        <span className="text-green-600">Your Answer: {result.userAnswer}</span>
                      </span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">No questions answered correctly.</p>
              )}
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-red-600 mb-4 flex items-center">
              <FaTimesCircle className="mr-2" /> Incorrect Answers ({incorrectQuestions.length})
            </h3>
            <div className="bg-red-50 p-4 rounded-lg">
              {incorrectQuestions.length > 0 ? (
                <ul className="space-y-3">
                  {incorrectQuestions.map((result, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-gray-700 flex items-start"
                    >
                      <span className="text-red-500 mr-2">✗</span>
                      <span>
                        <span className="font-medium">{result.question}</span> -{" "}
                        <span className="text-red-600">Your Answer: {result.userAnswer}</span>,{" "}
                        <span className="text-green-600">Correct: {result.correctAnswer}</span>
                      </span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">No questions answered incorrectly.</p>
              )}
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-blue-600 mb-4 flex items-center">
              <FaBookOpen className="mr-2" /> Learn More About {capitalizeTopic(topic)}
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              {resources.length > 0 ? (
                <ul className="space-y-3">
                  {resources.map((resource, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200"
                      >
                        <span className="mr-2">📘</span> {resource.title}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">No resources available for this topic.</p>
              )}
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoHome}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-3 rounded-full shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 text-lg font-semibold"
            >
              Back to Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetTopic}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-8 py-3 rounded-full shadow-md hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 text-lg font-semibold"
            >
              Re-Try Topic
            </motion.button>
          </div>
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