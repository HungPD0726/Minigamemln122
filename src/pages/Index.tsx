import { useGameState } from '@/hooks/useGameState';
import SetupPhase from '@/components/game/SetupPhase';
import QuizPhase from '@/components/game/QuizPhase';
import GamblingPhase from '@/components/game/GamblingPhase';
import ScoreboardPhase from '@/components/game/ScoreboardPhase';

const Index = () => {
  const {
    state,
    addTeam,
    removeTeam,
    startQuiz,
    revealAnswer,
    awardPoints,
    nextQuestion,
    gamble,
    setPhase,
    addQuestion,
    removeQuestion,
    resetGame,
    goToScoreboard,
  } = useGameState();

  switch (state.phase) {
    case 'setup':
      return (
        <SetupPhase
          teams={state.teams}
          questions={state.questions}
          onAddTeam={addTeam}
          onRemoveTeam={removeTeam}
          onAddQuestion={addQuestion}
          onRemoveQuestion={removeQuestion}
          onStart={startQuiz}
        />
      );
    case 'quiz':
      return (
        <QuizPhase
          teams={state.teams}
          questions={state.questions}
          currentIndex={state.currentQuestionIndex}
          revealedAnswer={state.revealedAnswer}
          awardedTeams={state.awardedTeams}
          onReveal={revealAnswer}
          onAward={awardPoints}
          onNext={nextQuestion}
          onGoGambling={() => setPhase('gambling')}
          onGoScoreboard={goToScoreboard}
        />
      );
    case 'gambling':
      return (
        <GamblingPhase
          teams={state.teams}
          onGamble={gamble}
          onGoScoreboard={goToScoreboard}
          onBackToQuiz={() => setPhase('quiz')}
        />
      );
    case 'scoreboard':
      return (
        <ScoreboardPhase
          teams={state.teams}
          onBackToQuiz={() => setPhase('quiz')}
          onGoGambling={() => setPhase('gambling')}
          onReset={resetGame}
        />
      );
  }
};

export default Index;
