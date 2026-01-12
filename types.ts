
export interface Book {
  id: number;
  title: string;
  author: string;
  category: '저학년' | '중학년' | '고학년';
  description: string;
}

export interface QuizQuestion {
  bookTitle: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export enum AppState {
  HOME = 'HOME',
  BOOK_SELECT = 'BOOK_SELECT',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  GAME_OVER = 'GAME_OVER',
  LEADERBOARD = 'LEADERBOARD'
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  totalAttempts: number;
  unlockedBadges: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}
