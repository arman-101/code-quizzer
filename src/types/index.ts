export interface Question {
  question: string;
  options: string[];
  correct: string;
  difficulty: number;
}

export interface Topic {
  name: string;
  questions: Question[];
}

export interface UserProgress {
  [topic: string]: {
    completed: number;
    time: string | null;
    elapsed: number;
    score: number;
    answerResults: {
      question: string;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    }[];
  };
}

export interface HighScore {
  name: string;
  score: number;
  topic: string;
  completed: number;
}