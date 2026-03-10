import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, RotateCcw, Dice1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Team } from '@/types/game';

const TEAM_COLORS = [
  'from-team-1/80 to-team-1/40',
  'from-team-2/80 to-team-2/40',
  'from-team-3/80 to-team-3/40',
  'from-team-4/80 to-team-4/40',
  'from-team-5/80 to-team-5/40',
  'from-team-6/80 to-team-6/40',
  'from-team-7/80 to-team-7/40',
  'from-team-8/80 to-team-8/40',
];

const MEDALS = ['🥇', '🥈', '🥉'];

interface ScoreboardPhaseProps {
  teams: Team[];
  onBackToQuiz: () => void;
  onGoGambling: () => void;
  onReset: () => void;
}

export default function ScoreboardPhase({
  teams,
  onBackToQuiz,
  onGoGambling,
  onReset,
}: ScoreboardPhaseProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const maxScore = sorted[0]?.score || 1;

  return (
    <div className="min-h-screen bg-game-gradient p-4 md:p-6 flex flex-col items-center">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <Trophy className="w-16 h-16 text-primary mx-auto mb-2" />
        <h1 className="font-display text-4xl md:text-6xl text-primary text-glow-gold">
          BẢNG XẾP HẠNG
        </h1>
      </motion.div>

      <div className="w-full max-w-2xl space-y-3">
        {sorted.map((team, i) => (
          <motion.div
            key={team.id}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.15 }}
            className="relative"
          >
            <div
              className={`rounded-xl p-4 md:p-5 flex items-center gap-4 bg-gradient-to-r ${
                TEAM_COLORS[(team.colorIndex - 1) % 8]
              }`}
            >
              <span className="text-3xl w-10 text-center">
                {i < 3 ? MEDALS[i] : `#${i + 1}`}
              </span>
              <span className="font-display text-xl md:text-2xl flex-1">{team.name}</span>
              <span className="font-display text-2xl md:text-3xl text-primary">
                {team.score}đ
              </span>
            </div>
            {/* Score bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(team.score / maxScore) * 100}%` }}
              transition={{ delay: i * 0.15 + 0.3, duration: 0.6 }}
              className="h-1 bg-primary rounded-full mt-1"
            />
          </motion.div>
        ))}
      </div>

      {/* Bonus info */}
      {sorted[0] && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-muted-foreground mt-6 text-center"
        >
          {sorted[0].score >= 100 && (
            <>🎁 Bonus: {(sorted[0].score * 0.001).toFixed(1)} điểm thưởng cho đội nhất!</>
          )}
        </motion.p>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <Button
          onClick={onBackToQuiz}
          variant="outline"
          className="border-primary text-primary font-display text-lg px-6 py-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> TIẾP TỤC QUIZ
        </Button>
        <Button
          onClick={onGoGambling}
          className="bg-secondary text-secondary-foreground font-display text-lg px-6 py-4"
        >
          <Dice1 className="w-5 h-5 mr-2" /> ĐỎ ĐEN
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="border-destructive text-destructive font-display text-lg px-6 py-4"
        >
          <RotateCcw className="w-5 h-5 mr-2" /> CHƠI LẠI
        </Button>
      </div>
    </div>
  );
}
