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
  };
}

export interface HighScore {
  name: string;
  score: number;
  topic: string;
  completed: number; // Added to track completed questions per topic
}