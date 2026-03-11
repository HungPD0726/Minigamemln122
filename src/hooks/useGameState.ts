import { useState, useCallback, useEffect } from 'react';
import { GameState, Team, Question } from '@/types/game';
import { DEFAULT_QUESTION_POINTS, INITIAL_QUESTIONS } from '@/lib/questionBank';
import {
  PRESENTER_STATE_STORAGE_KEY,
  broadcastPublicState,
  normalizeStoredQuestions,
  normalizeStoredTeams,
  toPublicGameState,
  writePublicStateToStorage,
} from '@/lib/publicState';

const POINT_TO_VALUE_RATIO = 0.001; // 100 points = 0.1 value

const GAME_PHASES: GameState['phase'][] = [
  'intro',
  'setup',
  'question-bank',
  'quiz',
  'gambling',
  'scoreboard',
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isGamePhase = (value: unknown): value is GameState['phase'] =>
  typeof value === 'string' && GAME_PHASES.includes(value as GameState['phase']);

const createDefaultState = (): GameState => ({
  phase: 'intro',
  teams: [],
  questions: INITIAL_QUESTIONS,
  currentQuestionIndex: 0,
  revealedAnswer: false,
  awardedTeams: [],
});

const readPresenterState = (): GameState | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(PRESENTER_STATE_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) return null;

    const teams = normalizeStoredTeams(parsed.teams);
    const questions = normalizeStoredQuestions(parsed.questions).map((question) => ({
      ...question,
      points: DEFAULT_QUESTION_POINTS,
    }));
    const safeQuestions = questions.length > 0 ? questions : INITIAL_QUESTIONS;
    const maxQuestionIndex = Math.max(0, safeQuestions.length - 1);
    const currentQuestionIndex = clamp(
      Math.round(Number(parsed.currentQuestionIndex) || 0),
      0,
      maxQuestionIndex
    );
    const validTeamIds = new Set(teams.map((team) => team.id));
    const awardedTeams = Array.isArray(parsed.awardedTeams)
      ? parsed.awardedTeams
          .filter((id): id is string => typeof id === 'string' && validTeamIds.has(id))
          .slice(0, 20)
      : [];

    return {
      phase: isGamePhase(parsed.phase) ? parsed.phase : 'intro',
      teams,
      questions: safeQuestions,
      currentQuestionIndex,
      revealedAnswer: Boolean(parsed.revealedAnswer),
      awardedTeams,
    };
  } catch {
    return null;
  }
};

const createInitialState = (): GameState => readPresenterState() ?? createDefaultState();

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(PRESENTER_STATE_STORAGE_KEY, JSON.stringify(state));
    const publicState = toPublicGameState(state);
    writePublicStateToStorage(publicState);
    broadcastPublicState(publicState);
  }, [state]);

  const addTeam = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      teams: [
        ...prev.teams,
        {
          id: crypto.randomUUID(),
          name,
          score: 0,
          redeemedValue: 0,
          colorIndex: (prev.teams.length % 8) + 1,
        },
      ],
    }));
  }, []);

  const removeTeam = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t.id !== id),
    }));
  }, []);

  const setPhase = useCallback((phase: GameState['phase']) => {
    setState((prev) => ({ ...prev, phase }));
  }, []);

  const startQuiz = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'quiz',
      currentQuestionIndex: 0,
      revealedAnswer: false,
      awardedTeams: [],
    }));
  }, []);

  const revealAnswer = useCallback(() => {
    setState((prev) => ({ ...prev, revealedAnswer: true }));
  }, []);

  const awardPoints = useCallback((teamId: string) => {
    setState((prev) => {
      const q = prev.questions[prev.currentQuestionIndex];
      if (!q || prev.awardedTeams.includes(teamId)) return prev;
      return {
        ...prev,
        awardedTeams: [...prev.awardedTeams, teamId],
        teams: prev.teams.map((t) =>
          t.id === teamId ? { ...t, score: t.score + q.points } : t
        ),
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      const next = prev.currentQuestionIndex + 1;
      if (next >= prev.questions.length) {
        return { ...prev, phase: 'gambling', revealedAnswer: false, awardedTeams: [] };
      }
      return {
        ...prev,
        currentQuestionIndex: next,
        revealedAnswer: false,
        awardedTeams: [],
      };
    });
  }, []);

  const gamble = useCallback((teamId: string, scoreDelta: number) => {
    setState((prev) => {
      return {
        ...prev,
        teams: prev.teams.map((t) =>
          t.id === teamId
            ? { ...t, score: Math.max(0, t.score + Math.round(scoreDelta)) }
            : t
        ),
      };
    });
  }, []);

  const redeemPoints = useCallback((teamId: string, points: number) => {
    if (points <= 0) return;

    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => {
        if (t.id !== teamId || t.score < points) return t;
        return {
          ...t,
          score: t.score - points,
          redeemedValue: Number((t.redeemedValue + points * POINT_TO_VALUE_RATIO).toFixed(3)),
        };
      }),
    }));
  }, []);

  const updateTeamScore = useCallback((teamId: string, newScore: number) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) =>
        t.id === teamId ? { ...t, score: newScore } : t
      ),
    }));
  }, []);

  const addQuestion = useCallback((question: Question) => {
    setState((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...question, points: DEFAULT_QUESTION_POINTS }],
    }));
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setState((prev) => {
      const nextQuestions = prev.questions.filter((q) => q.id !== id);
      return {
        ...prev,
        questions: nextQuestions,
        currentQuestionIndex: clamp(prev.currentQuestionIndex, 0, Math.max(0, nextQuestions.length - 1)),
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState((prev) => {
      const defaultState = createDefaultState();
      return {
        ...defaultState,
        phase: 'setup',
        teams: prev.teams.map((t) => ({ ...t, score: 0, redeemedValue: 0 })),
        questions: prev.questions.length > 0 ? prev.questions : defaultState.questions,
      };
    });
  }, []);

  const goToScoreboard = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'scoreboard' }));
  }, []);

  return {
    state,
    addTeam,
    removeTeam,
    setPhase,
    startQuiz,
    revealAnswer,
    awardPoints,
    nextQuestion,
    gamble,
    redeemPoints,
    updateTeamScore,
    addQuestion,
    removeQuestion,
    resetGame,
    goToScoreboard,
  };
}
