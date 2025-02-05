export interface Question {
  category: string;
  points: number;
  question: string;
  answer: string;
  isAnswered?: boolean;
  imageUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface GameState {
  teams: Team[];
  questions: Question[];
  categories: string[];
  settings: GameSettings;
  title: string;
}

export interface GameSettings {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  soundEnabled: boolean;
}
