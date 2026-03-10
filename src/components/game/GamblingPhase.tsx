import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  HandCoins,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Team } from '@/types/game';

type DiceFace = 1 | 2 | 3 | 4 | 5 | 6;

interface RoundResult {
  dice: DiceFace[];
  totalBet: number;
  won: number;
  lost: number;
  delta: number;
}

interface GamblingPhaseProps {
  teams: Team[];
  onGamble: (teamId: string, scoreDelta: number) => void;
  onRedeem: (teamId: string, points: number) => void;
  onGoScoreboard: () => void;
  onBackToQuiz: () => void;
}

const BET_FACES: DiceFace[] = [1, 2, 3, 4, 5, 6];
const DICE_ICONS = {
  1: Dice1,
  2: Dice2,
  3: Dice3,
  4: Dice4,
  5: Dice5,
  6: Dice6,
} as const;

const createEmptyBets = (): Record<DiceFace, number> => ({
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
});

const randomFace = (): DiceFace => (Math.floor(Math.random() * 6) + 1) as DiceFace;

export default function GamblingPhase({
  teams,
  onGamble,
  onRedeem,
  onGoScoreboard,
  onBackToQuiz,
}: GamblingPhaseProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [bets, setBets] = useState<Record<DiceFace, number>>(createEmptyBets);
  const [rolling, setRolling] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [redeemMessage, setRedeemMessage] = useState('');

  const sortedTeams = useMemo(() => [...teams].sort((a, b) => b.score - a.score), [teams]);
  const selectedTeamData = teams.find((team) => team.id === selectedTeam) ?? null;
  const totalBet = BET_FACES.reduce((sum, face) => sum + (bets[face] || 0), 0);
  const remainingPoints = selectedTeamData ? Math.max(0, selectedTeamData.score - totalBet) : 0;

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
    setBets(createEmptyBets());
    setRoundResult(null);
    setRedeemMessage('');
  };

  const updateBet = (face: DiceFace, rawValue: number) => {
    if (!selectedTeamData) return;

    const normalized = Number.isFinite(rawValue) ? Math.max(0, Math.floor(rawValue)) : 0;
    setBets((prev) => {
      const otherTotal = BET_FACES.reduce((sum, key) => {
        if (key === face) return sum;
        return sum + (prev[key] || 0);
      }, 0);
      const maxForFace = Math.max(0, selectedTeamData.score - otherTotal);

      return {
        ...prev,
        [face]: Math.min(normalized, maxForFace),
      };
    });
  };

  const addChip = (face: DiceFace, chipValue: number) => {
    if (!selectedTeamData) return;

    setBets((prev) => {
      const current = prev[face] || 0;
      const otherTotal = BET_FACES.reduce((sum, key) => {
        if (key === face) return sum;
        return sum + (prev[key] || 0);
      }, 0);
      const maxForFace = Math.max(0, selectedTeamData.score - otherTotal);

      return {
        ...prev,
        [face]: Math.min(current + chipValue, maxForFace),
      };
    });
  };

  const handleRoll = () => {
    if (!selectedTeamData || totalBet <= 0 || totalBet > selectedTeamData.score) return;

    setRolling(true);
    setRoundResult(null);
    setRedeemMessage('');

    setTimeout(() => {
      const dice: DiceFace[] = [randomFace(), randomFace(), randomFace()];
      const faceCount: Record<DiceFace, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      dice.forEach((face) => {
        faceCount[face] += 1;
      });

      let won = 0;
      let lost = 0;
      let delta = 0;

      BET_FACES.forEach((face) => {
        const bet = bets[face] || 0;
        if (bet <= 0) return;

        const hits = faceCount[face];
        if (hits > 0) {
          const gain = bet * hits;
          won += gain;
          delta += gain;
        } else {
          lost += bet;
          delta -= bet;
        }
      });

      onGamble(selectedTeamData.id, delta);
      setRoundResult({
        dice,
        totalBet,
        won,
        lost,
        delta,
      });
      setBets(createEmptyBets());
      setRolling(false);
    }, 1600);
  };

  const handleRedeem = () => {
    if (!selectedTeamData) return;

    if (selectedTeamData.score < 100) {
      setRedeemMessage('Can it nhat 100 diem de doi.');
      return;
    }

    onRedeem(selectedTeamData.id, 100);
    setRedeemMessage(`${selectedTeamData.name} da doi 100 diem -> 0.1.`);
    setRoundResult(null);
    setBets(createEmptyBets());
  };

  return (
    <div className="min-h-screen bg-game-gradient p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 rounded-2xl border border-primary/20 bg-card/85 p-6 card-glow"
        >
          <h1 className="font-display text-center text-4xl text-primary md:text-6xl">DICE BET ARENA</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground md:text-base">
            Dat diem vao nhieu o, quay 3 xuc xac va tinh lai lo theo ket qua tung mat.
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <motion.section
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="rounded-2xl border border-border/80 bg-card/90 p-5"
          >
            <h2 className="font-display text-2xl text-primary">Chon doi va dat cuoc</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {sortedTeams.map((team) => (
                <Button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  className={`font-bold transition-all ${
                    selectedTeam === team.id
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {team.name}: {team.score} diem
                </Button>
              ))}
            </div>

            {!selectedTeamData && (
              <div className="mt-5 rounded-xl border border-dashed border-border/70 bg-muted/30 p-5 text-center text-muted-foreground">
                Chon mot doi de bat dau dat cuoc.
              </div>
            )}

            {selectedTeamData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 space-y-4"
              >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {BET_FACES.map((face) => {
                    const DiceIcon = DICE_ICONS[face];
                    return (
                      <div key={face} className="rounded-xl border border-border bg-muted/40 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold">
                            <DiceIcon className="h-5 w-5 text-primary" />
                            <span>O {face}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">x1 den x3 neu hit</span>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          value={bets[face]}
                          onChange={(event) => updateBet(face, Number(event.target.value))}
                          className="bg-background/80 text-center font-bold"
                        />
                        <div className="mt-2 flex gap-2">
                          {[10, 25, 50].map((chip) => (
                            <Button
                              key={chip}
                              type="button"
                              size="sm"
                              variant="outline"
                              className="flex-1 border-border/70 text-xs"
                              onClick={() => addChip(face, chip)}
                            >
                              +{chip}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                  <div className="grid gap-2 text-sm md:grid-cols-3">
                    <p>
                      Tong dat: <span className="font-bold text-primary">{totalBet}</span>
                    </p>
                    <p>
                      Con lai: <span className="font-bold text-accent">{remainingPoints}</span>
                    </p>
                    <p>
                      Lai toi da: <span className="font-bold text-secondary">{totalBet * 3}</span>
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      onClick={handleRoll}
                      disabled={rolling || totalBet <= 0 || totalBet > selectedTeamData.score}
                      className="bg-secondary text-secondary-foreground font-display text-lg px-6 py-5"
                    >
                      {rolling ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                          className="inline-block"
                        >
                          <Dice1 className="h-5 w-5" />
                        </motion.span>
                      ) : (
                        <>
                          <Dice1 className="mr-2 h-5 w-5" /> Quay xuc xac
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border"
                      onClick={() => setBets(createEmptyBets())}
                    >
                      Xoa cuoc
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-accent/20 bg-accent/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">Doi diem</p>
                      <p className="text-sm text-muted-foreground">100 diem = 0.1</p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleRedeem}
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      <HandCoins className="mr-2 h-4 w-4" />
                      Doi 100 diem
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Da doi: <span className="font-bold text-accent">{selectedTeamData.redeemedValue.toFixed(3)}</span>
                  </p>
                  {redeemMessage && <p className="mt-1 text-sm text-primary">{redeemMessage}</p>}
                </div>
              </motion.div>
            )}
          </motion.section>

          <motion.section
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="rounded-2xl border border-border/80 bg-card/90 p-5"
          >
            <h2 className="font-display text-2xl text-primary">Ket qua va bang tam</h2>

            <AnimatePresence mode="wait">
              {roundResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4"
                >
                  <p className="text-sm text-muted-foreground">3 xuc xac ra:</p>
                  <div className="mt-2 flex items-center gap-2">
                    {roundResult.dice.map((face, index) => {
                      const DiceIcon = DICE_ICONS[face];
                      return (
                        <div
                          key={`${face}-${index}`}
                          className="rounded-lg bg-background/70 p-2 ring-1 ring-border"
                        >
                          <DiceIcon className="h-7 w-7 text-primary" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <p>Tong dat: {roundResult.totalBet}</p>
                    <p className="text-accent">Thang: +{roundResult.won}</p>
                    <p className="text-destructive">Thua: -{roundResult.lost}</p>
                    <p className="font-bold">
                      Chenh lech:{' '}
                      <span className={roundResult.delta >= 0 ? 'text-accent' : 'text-destructive'}>
                        {roundResult.delta >= 0 ? '+' : ''}
                        {roundResult.delta}
                      </span>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground"
                >
                  Chua co ket qua vong cuoc. Hay dat diem va quay xuc xac.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 space-y-2">
              {sortedTeams.map((team, index) => (
                <div
                  key={team.id}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    selectedTeam === team.id ? 'border-primary/60 bg-primary/10' : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">
                      #{index + 1} {team.name}
                    </span>
                    <span className="font-bold text-primary">{team.score} diem</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Da doi: {team.redeemedValue.toFixed(3)}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button
            onClick={onBackToQuiz}
            variant="outline"
            className="border-primary text-primary font-display text-lg px-6 py-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Quiz
          </Button>
          <Button
            onClick={onGoScoreboard}
            className="bg-primary text-primary-foreground font-display text-lg px-6 py-4"
          >
            <Trophy className="w-5 h-5 mr-2" /> Bang diem
          </Button>
        </div>
      </div>
    </div>
  );
}
