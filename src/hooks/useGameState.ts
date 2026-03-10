import { useState, useCallback } from 'react';
import { GameState, Team, Question } from '@/types/game';

const POINT_TO_VALUE_RATIO = 0.001; // 100 points = 0.1 value

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    text: 'Thủ đô của Việt Nam là gì?',
    options: ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Huế'],
    correctIndex: 1,
    points: 60,
  },
  {
    id: '2',
    text: 'Sông nào dài nhất Việt Nam?',
    options: ['Sông Hồng', 'Sông Mê Kông', 'Sông Đồng Nai', 'Sông Đà'],
    correctIndex: 1,
    points: 60,
  },
  {
    id: '3',
    text: 'Năm nào Việt Nam giành độc lập?',
    options: ['1940', '1945', '1954', '1975'],
    correctIndex: 1,
    points: 80,
  },
  {
    id: '4',
    text: 'Đỉnh núi cao nhất Việt Nam?',
    options: ['Phu Si Lung', 'Fansipan', 'Ngọc Linh', 'Bạch Mã'],
    correctIndex: 1,
    points: 60,
  },
  {
    id: '5',
    text: 'Việt Nam có bao nhiêu tỉnh thành?',
    options: ['61', '63', '64', '65'],
    correctIndex: 1,
    points: 80,
  },
];

const initialState: GameState = {
  phase: 'setup',
  teams: [],
  questions: SAMPLE_QUESTIONS,
  currentQuestionIndex: 0,
  revealedAnswer: false,
  awardedTeams: [],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

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
      questions: [...prev.questions, question],
    }));
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState((prev) => ({
      ...initialState,
      teams: prev.teams.map((t) => ({ ...t, score: 0, redeemedValue: 0 })),
      questions: prev.questions,
    }));
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
