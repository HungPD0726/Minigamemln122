export interface Team {
  id: string;
  name: string;
  score: number;
  redeemedValue: number;
  colorIndex: number; // 1-8 maps to --team-1 through --team-8
}

export interface Question {
  id: string;
  text: string;
  options: [string, string, string, string]; // A, B, C, D
  correctIndex: number; // 0-3
  points: number;
}

export interface GameState {
  phase: 'setup' | 'quiz' | 'gambling' | 'scoreboard';
  teams: Team[];
  questions: Question[];
  currentQuestionIndex: number;
  revealedAnswer: boolean;
  awardedTeams: string[]; // team ids that got points this round
}
