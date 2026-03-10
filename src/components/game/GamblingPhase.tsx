import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Team } from '@/types/game';

interface GamblingPhaseProps {
  teams: Team[];
  onGamble: (teamId: string, amount: number) => void;
  onGoScoreboard: () => void;
  onBackToQuiz: () => void;
}

export default function GamblingPhase({
  teams,
  onGamble,
  onGoScoreboard,
  onBackToQuiz,
}: GamblingPhaseProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [result, setResult] = useState<{ win: boolean; amount: number } | null>(null);
  const [spinning, setSpinning] = useState(false);

  const handleGamble = () => {
    if (!selectedTeam || betAmount <= 0) return;
    const team = teams.find((t) => t.id === selectedTeam);
    if (!team || betAmount > team.score) return;

    setSpinning(true);
    setResult(null);

    setTimeout(() => {
      const win = Math.random() > 0.5;
      setResult({ win, amount: betAmount });
      onGamble(selectedTeam, betAmount);
      setSpinning(false);
    }, 2000);
  };

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const selectedTeamData = teams.find((t) => t.id === selectedTeam);

  return (
    <div className="min-h-screen bg-game-gradient p-4 md:p-6 flex flex-col items-center">
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display text-4xl md:text-6xl text-secondary text-glow-purple mb-8 text-center"
      >
        🎰 ĐỎ ĐEN 🎰
      </motion.h1>

      <div className="w-full max-w-2xl">
        {/* Team Selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-6 card-glow mb-6"
        >
          <h3 className="font-display text-xl text-primary mb-4 text-center">CHỌN ĐỘI CƯỢC</h3>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {sortedTeams.map((team) => (
              <Button
                key={team.id}
                onClick={() => {
                  setSelectedTeam(team.id);
                  setResult(null);
                  setBetAmount(0);
                }}
                className={`font-bold transition-all ${
                  selectedTeam === team.id
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {team.name} — {team.score}đ
              </Button>
            ))}
          </div>

          {selectedTeamData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  Điểm hiện tại: <span className="text-primary font-bold">{selectedTeamData.score}đ</span>
                </p>
                <div className="flex items-center gap-3 justify-center">
                  <span className="text-foreground font-bold">Cược:</span>
                  <Input
                    type="number"
                    min={0}
                    max={selectedTeamData.score}
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.min(Number(e.target.value), selectedTeamData.score))}
                    className="bg-muted border-border w-32 text-center text-lg font-bold"
                  />
                  <span className="text-muted-foreground">đ</span>
                </div>
                <div className="flex gap-2 justify-center mt-2">
                  {[0.25, 0.5, 0.75, 1].map((pct) => (
                    <Button
                      key={pct}
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground text-xs"
                      onClick={() => setBetAmount(Math.floor(selectedTeamData.score * pct))}
                    >
                      {pct * 100}%
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGamble}
                disabled={spinning || betAmount <= 0}
                className="w-full bg-secondary text-secondary-foreground font-display text-xl py-6 hover:scale-105 transition-transform"
              >
                {spinning ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="inline-block"
                  >
                    🎲
                  </motion.span>
                ) : (
                  <>
                    <Dice1 className="w-6 h-6 mr-2" /> QUAY!
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`rounded-xl p-8 text-center mb-6 ${
                result.win ? 'bg-accent/20 ring-2 ring-accent' : 'bg-destructive/20 ring-2 ring-destructive'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                {result.win ? '🎉' : '💀'}
              </motion.div>
              <h2 className="font-display text-3xl mb-2">
                {result.win ? 'THẮNG!' : 'THUA!'}
              </h2>
              <p className="text-xl font-bold">
                {result.win ? '+' : '-'}{result.amount} điểm
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onBackToQuiz}
            variant="outline"
            className="border-primary text-primary font-display text-lg px-6 py-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> QUIZ
          </Button>
          <Button
            onClick={onGoScoreboard}
            className="bg-primary text-primary-foreground font-display text-lg px-6 py-4"
          >
            <Trophy className="w-5 h-5 mr-2" /> BẢNG ĐIỂM
          </Button>
        </div>
      </div>
    </div>
  );
}
