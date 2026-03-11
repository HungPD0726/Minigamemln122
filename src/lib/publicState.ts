import { GameState, Question, Team } from '@/types/game';

export const PRESENTER_STATE_STORAGE_KEY = 'quiz-bet-arena.presenter-state.v1';
export const PUBLIC_STATE_STORAGE_KEY = 'quiz-bet-arena.public-state.v1';
export const PUBLIC_STATE_CHANNEL_NAME = 'quiz-bet-arena.public-state.channel';

type PublicPhase = Exclude<GameState['phase'], 'question-bank'>;

export interface PublicQuestion {
  id: string;
  text: string;
  options: [string, string, string, string];
  points: number;
  correctIndex: number | null;
}

export interface PublicGameState {
  phase: PublicPhase;
  teams: Team[];
  currentQuestionIndex: number;
  totalQuestions: number;
  question: PublicQuestion | null;
  revealedAnswer: boolean;
  updatedAt: number;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toFiniteNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toSafeText = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeTeam = (input: unknown, index: number): Team | null => {
  if (!isObject(input)) return null;

  return {
    id: toSafeText(input.id, `team-${index + 1}`),
    name: toSafeText(input.name, `Đội ${index + 1}`),
    score: Math.max(0, Math.round(toFiniteNumber(input.score, 0))),
    redeemedValue: Math.max(0, Number(toFiniteNumber(input.redeemedValue, 0).toFixed(3))),
    colorIndex: clamp(Math.round(toFiniteNumber(input.colorIndex, (index % 8) + 1)), 1, 8),
  };
};

const normalizeQuestion = (input: unknown): PublicQuestion | null => {
  if (!isObject(input)) return null;

  const rawOptions = Array.isArray(input.options) ? input.options.slice(0, 4) : [];
  if (rawOptions.length !== 4 || rawOptions.some((option) => typeof option !== 'string')) {
    return null;
  }

  const correctIndex = input.correctIndex === null ? null : Math.round(toFiniteNumber(input.correctIndex, -1));
  if (correctIndex !== null && (correctIndex < 0 || correctIndex > 3)) {
    return null;
  }

  return {
    id: toSafeText(input.id, 'q'),
    text: toSafeText(input.text, ''),
    options: rawOptions.map((option) => option.trim()) as [string, string, string, string],
    points: Math.max(0, Math.round(toFiniteNumber(input.points, 0))),
    correctIndex,
  };
};

const isPublicPhase = (value: unknown): value is PublicPhase =>
  value === 'intro' ||
  value === 'setup' ||
  value === 'quiz' ||
  value === 'gambling' ||
  value === 'scoreboard';

export function toPublicGameState(state: GameState): PublicGameState {
  const phase: PublicPhase = state.phase === 'question-bank' ? 'setup' : state.phase;
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const question: PublicQuestion | null =
    phase === 'quiz' && currentQuestion
      ? {
          id: currentQuestion.id,
          text: currentQuestion.text,
          options: currentQuestion.options,
          points: currentQuestion.points,
          correctIndex: state.revealedAnswer ? currentQuestion.correctIndex : null,
        }
      : null;

  return {
    phase,
    teams: state.teams,
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions: state.questions.length,
    question,
    revealedAnswer: state.revealedAnswer,
    updatedAt: Date.now(),
  };
}

export function normalizePublicGameState(input: unknown): PublicGameState | null {
  if (!isObject(input)) return null;

  const phase = isPublicPhase(input.phase) ? input.phase : 'intro';
  const teams = (Array.isArray(input.teams) ? input.teams : [])
    .map((team, index) => normalizeTeam(team, index))
    .filter((team): team is Team => team !== null);

  const totalQuestions = Math.max(0, Math.round(toFiniteNumber(input.totalQuestions, 0)));
  const question = normalizeQuestion(input.question);
  const maxIndex = Math.max(0, totalQuestions - 1);
  const currentQuestionIndex = clamp(Math.round(toFiniteNumber(input.currentQuestionIndex, 0)), 0, maxIndex);
  const revealedAnswer = Boolean(input.revealedAnswer);

  return {
    phase,
    teams,
    currentQuestionIndex,
    totalQuestions,
    question: phase === 'quiz' ? question : null,
    revealedAnswer,
    updatedAt: toFiniteNumber(input.updatedAt, Date.now()),
  };
}

export function readPublicStateFromStorage(): PublicGameState | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(PUBLIC_STATE_STORAGE_KEY);
  if (!raw) return null;

  try {
    return normalizePublicGameState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writePublicStateToStorage(state: PublicGameState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PUBLIC_STATE_STORAGE_KEY, JSON.stringify(state));
}

export function broadcastPublicState(state: PublicGameState): void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
  const channel = new BroadcastChannel(PUBLIC_STATE_CHANNEL_NAME);
  channel.postMessage(state);
  channel.close();
}

const normalizeStoredQuestion = (input: unknown, fallbackId: string): Question | null => {
  if (!isObject(input)) return null;

  const rawOptions = Array.isArray(input.options) ? input.options.slice(0, 4) : [];
  if (rawOptions.length !== 4 || rawOptions.some((option) => typeof option !== 'string')) {
    return null;
  }

  const correctIndex = Math.round(toFiniteNumber(input.correctIndex, -1));
  if (correctIndex < 0 || correctIndex > 3) {
    return null;
  }

  return {
    id: toSafeText(input.id, fallbackId),
    text: toSafeText(input.text, ''),
    options: rawOptions.map((option) => option.trim()) as [string, string, string, string],
    correctIndex,
    points: Math.max(0, Math.round(toFiniteNumber(input.points, 0))),
  };
};

export function normalizeStoredQuestions(input: unknown): Question[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((question, index) => normalizeStoredQuestion(question, `${index + 1}`))
    .filter((question): question is Question => question !== null);
}

export function normalizeStoredTeams(input: unknown): Team[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((team, index) => normalizeTeam(team, index))
    .filter((team): team is Team => team !== null);
}
