import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, RotateCcw, Dice1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Team } from '@/types/game';

const TEAM_COLORS = [
  'from-team-1/80 to-team-1/35',
  'from-team-2/80 to-team-2/35',
  'from-team-3/80 to-team-3/35',
  'from-team-4/80 to-team-4/35',
  'from-team-5/80 to-team-5/35',
  'from-team-6/80 to-team-6/35',
  'from-team-7/80 to-team-7/35',
  'from-team-8/80 to-team-8/35',
];

const MEDALS = ['1st', '2nd', '3rd'];

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
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-7"
      >
        <Trophy className="mx-auto mb-2 h-14 w-14 text-primary" />
        <h1 className="font-display text-4xl text-primary md:text-6xl">Scoreboard</h1>
      </motion.div>

      <div className="w-full max-w-3xl space-y-3">
        {sorted.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.08 }}
            className="relative"
          >
            <div
              className={`rounded-xl border border-border/60 bg-gradient-to-r ${
                TEAM_COLORS[(team.colorIndex - 1) % TEAM_COLORS.length]
              } p-4`}
            >
              <div className="flex items-center gap-3">
                <span className="w-14 text-center font-display text-xl text-primary">
                  {index < 3 ? MEDALS[index] : `#${index + 1}`}
                </span>
                <div className="flex-1">
                  <p className="font-display text-2xl leading-none">{team.name}</p>
                  <p className="mt-1 text-sm text-foreground/80">Da doi: {team.redeemedValue.toFixed(3)}</p>
                </div>
                <p className="font-display text-3xl text-primary">{team.score}</p>
              </div>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(team.score / maxScore) * 100}%` }}
              transition={{ delay: index * 0.08 + 0.25, duration: 0.55 }}
              className="mt-1 h-1 rounded-full bg-primary"
            />
          </motion.div>
        ))}
      </div>

      {sorted.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-5 text-center text-muted-foreground"
        >
          Doi dang dan dau: <span className="font-bold text-primary">{sorted[0].name}</span>
        </motion.p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          onClick={onBackToQuiz}
          variant="outline"
          className="border-primary text-primary font-display text-lg px-6 py-4"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Quiz
        </Button>
        <Button
          onClick={onGoGambling}
          className="bg-secondary text-secondary-foreground font-display text-lg px-6 py-4"
        >
          <Dice1 className="mr-2 h-5 w-5" /> Bet Mode
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="border-destructive text-destructive font-display text-lg px-6 py-4"
        >
          <RotateCcw className="mr-2 h-5 w-5" /> Reset
        </Button>
      </div>
    </div>
  );
}
