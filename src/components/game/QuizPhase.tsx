import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight, Award, Dice1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Team, Question } from '@/types/game';

const OPTION_COLORS = [
  'bg-team-1 hover:bg-team-1/80',
  'bg-team-2 hover:bg-team-2/80',
  'bg-team-3 hover:bg-team-3/80',
  'bg-team-4 hover:bg-team-4/80',
];

interface QuizPhaseProps {
  teams: Team[];
  questions: Question[];
  currentIndex: number;
  revealedAnswer: boolean;
  awardedTeams: string[];
  onReveal: () => void;
  onAward: (teamId: string) => void;
  onNext: () => void;
  onGoGambling: () => void;
  onGoScoreboard: () => void;
}

export default function QuizPhase({
  teams,
  questions,
  currentIndex,
  revealedAnswer,
  awardedTeams,
  onReveal,
  onAward,
  onNext,
  onGoGambling,
  onGoScoreboard,
}: QuizPhaseProps) {
  const question = questions[currentIndex];
  if (!question) return null;

  const labels = ['A', 'B', 'C', 'D'];
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-game-gradient p-4 md:p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-display text-xl text-primary">
          Câu {currentIndex + 1}/{questions.length}
        </span>
        <span className="font-display text-xl text-secondary">
          {question.points} ĐIỂM
        </span>
      </div>

      {/* Question */}
      <motion.div
        key={question.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl p-6 md:p-8 card-glow mb-6"
      >
        <h2 className="font-display text-2xl md:text-4xl text-center text-foreground leading-snug">
          {question.text}
        </h2>
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex;
          const showCorrect = revealedAnswer && isCorrect;
          const showWrong = revealedAnswer && !isCorrect;

          return (
            <motion.div
              key={i}
              initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl p-4 md:p-5 flex items-center gap-4 transition-all ${
                showCorrect
                  ? 'bg-accent ring-4 ring-accent/50 scale-105'
                  : showWrong
                  ? 'opacity-40'
                  : OPTION_COLORS[i]
              }`}
            >
              <span className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center font-display text-xl">
                {labels[i]}
              </span>
              <span className="font-bold text-lg md:text-xl">{opt}</span>
              {showCorrect && <span className="ml-auto text-3xl">✅</span>}
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {!revealedAnswer ? (
          <Button
            onClick={onReveal}
            className="bg-primary text-primary-foreground font-display text-lg px-8 py-5"
          >
            <Eye className="w-5 h-5 mr-2" /> HIỆN ĐÁP ÁN
          </Button>
        ) : (
          <>
            <Button
              onClick={onNext}
              className="bg-secondary text-secondary-foreground font-display text-lg px-8 py-5"
            >
              {isLast ? (
                <>
                  <Dice1 className="w-5 h-5 mr-2" /> ĐỎ ĐEN
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" /> CÂU TIẾP
                </>
              )}
            </Button>
            <Button
              onClick={onGoGambling}
              variant="outline"
              className="border-primary text-primary font-display text-lg px-8 py-5"
            >
              <Dice1 className="w-5 h-5 mr-2" /> CƯỢC ĐIỂM
            </Button>
            <Button
              onClick={onGoScoreboard}
              variant="outline"
              className="border-accent text-accent font-display text-lg px-8 py-5"
            >
              <Award className="w-5 h-5 mr-2" /> BẢNG ĐIỂM
            </Button>
          </>
        )}
      </div>

      {/* Award Points to Teams */}
      {revealedAnswer && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-xl p-4 card-glow"
        >
          <h3 className="font-display text-lg text-primary mb-3 text-center">
            TRAO ĐIỂM CHO ĐỘI TRẢ LỜI ĐÚNG
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {teams.map((team) => {
              const awarded = awardedTeams.includes(team.id);
              return (
                <Button
                  key={team.id}
                  onClick={() => onAward(team.id)}
                  disabled={awarded}
                  className={`font-bold transition-all ${
                    awarded
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {team.name} ({team.score}đ)
                  {awarded && ' ✓'}
                </Button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
