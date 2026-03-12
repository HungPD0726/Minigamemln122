import { useGameState } from '@/hooks/useGameState';
import SetupPhase from '@/components/game/SetupPhase';
import QuestionBankPhase from '@/components/game/QuestionBankPhase';
import QuizPhase from '@/components/game/QuizPhase';
import GamblingPhase from '@/components/game/GamblingPhase';
import ScoreboardPhase from '@/components/game/ScoreboardPhase';
import IntroPhase from '@/components/game/IntroPhase';
import MusicToggle from '@/components/game/MusicToggle';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

const Index = () => {
  const { enabled, toggle } = useBackgroundMusic();
  const {
    state,
    addTeam,
    removeTeam,
    startQuiz,
    revealAnswer,
    awardPoints,
    nextQuestion,
    gamble,
    redeemPoints,
    setPhase,
    addQuestion,
    removeQuestion,
    resetGame,
    goToScoreboard,
  } = useGameState();

  const renderPhase = () => {
    switch (state.phase) {
      case 'intro':
        return <IntroPhase onStart={() => setPhase('setup')} />;
      case 'setup':
        return (
          <SetupPhase
            teams={state.teams}
            questions={state.questions}
            onAddTeam={addTeam}
            onRemoveTeam={removeTeam}
            onOpenQuestionBank={() => setPhase('question-bank')}
            onStart={startQuiz}
          />
        );
      case 'question-bank':
        return (
          <QuestionBankPhase
            questions={state.questions}
            onAddQuestion={addQuestion}
            onRemoveQuestion={removeQuestion}
            onBack={() => setPhase('setup')}
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
            onRedeem={redeemPoints}
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
      default:
        return null;
    }
  };

  return (
    <>
      {renderPhase()}
      <MusicToggle enabled={enabled} onToggle={toggle} />
    </>
  );
};

export default Index;
