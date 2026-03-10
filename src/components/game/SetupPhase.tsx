import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Play, HelpCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Team, Question } from '@/types/game';

const TEAM_COLORS = [
  'bg-team-1', 'bg-team-2', 'bg-team-3', 'bg-team-4',
  'bg-team-5', 'bg-team-6', 'bg-team-7', 'bg-team-8',
];

interface SetupPhaseProps {
  teams: Team[];
  questions: Question[];
  onAddTeam: (name: string) => void;
  onRemoveTeam: (id: string) => void;
  onAddQuestion: (q: Question) => void;
  onRemoveQuestion: (id: string) => void;
  onStart: () => void;
}

export default function SetupPhase({
  teams,
  questions,
  onAddTeam,
  onRemoveTeam,
  onAddQuestion,
  onRemoveQuestion,
  onStart,
}: SetupPhaseProps) {
  const [teamName, setTeamName] = useState('');
  const [showAddQ, setShowAddQ] = useState(false);
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qPoints, setQPoints] = useState(60);

  const handleAddTeam = () => {
    if (teamName.trim()) {
      onAddTeam(teamName.trim());
      setTeamName('');
    }
  };

  const handleAddQuestion = () => {
    if (qText.trim() && qOptions.every((o) => o.trim())) {
      onAddQuestion({
        id: crypto.randomUUID(),
        text: qText,
        options: qOptions as [string, string, string, string],
        correctIndex: qCorrect,
        points: qPoints,
      });
      setQText('');
      setQOptions(['', '', '', '']);
      setQCorrect(0);
      setShowAddQ(false);
    }
  };

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-game-gradient p-6 flex flex-col items-center">
      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-display text-5xl md:text-7xl text-primary text-glow-gold mb-8 text-center"
      >
        🎮 QUIZ SHOW 🎮
      </motion.h1>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Teams */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-card rounded-xl p-6 card-glow"
        >
          <h2 className="font-display text-2xl text-primary flex items-center gap-2 mb-4">
            <Users className="w-6 h-6" /> ĐỘI CHƠI ({teams.length})
          </h2>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Tên đội..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
              className="bg-muted border-border"
            />
            <Button onClick={handleAddTeam} size="icon" className="bg-primary text-primary-foreground shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <AnimatePresence>
            {teams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted mb-2"
              >
                <div className={`w-4 h-4 rounded-full ${TEAM_COLORS[i % 8]}`} />
                <span className="font-bold flex-1">{team.name}</span>
                <button onClick={() => onRemoveTeam(team.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Questions */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-card rounded-xl p-6 card-glow"
        >
          <h2 className="font-display text-2xl text-primary flex items-center gap-2 mb-4">
            <HelpCircle className="w-6 h-6" /> CÂU HỎI ({questions.length})
          </h2>

          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {questions.map((q, i) => (
              <div key={q.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
                <span className="text-primary font-bold shrink-0">#{i + 1}</span>
                <span className="flex-1 truncate">{q.text}</span>
                <span className="text-primary font-bold shrink-0">{q.points}đ</span>
                <button onClick={() => onRemoveQuestion(q.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {!showAddQ ? (
            <Button onClick={() => setShowAddQ(true)} variant="outline" className="w-full border-primary text-primary">
              <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <Input
                placeholder="Nội dung câu hỏi..."
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="bg-muted border-border"
              />
              {qOptions.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <button
                    onClick={() => setQCorrect(i)}
                    className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center shrink-0 transition-colors ${
                      qCorrect === i
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {labels[i]}
                  </button>
                  <Input
                    placeholder={`Đáp án ${labels[i]}...`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...qOptions];
                      newOpts[i] = e.target.value;
                      setQOptions(newOpts);
                    }}
                    className="bg-muted border-border"
                  />
                </div>
              ))}
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">Điểm:</span>
                <Input
                  type="number"
                  value={qPoints}
                  onChange={(e) => setQPoints(Number(e.target.value))}
                  className="bg-muted border-border w-24"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddQuestion} className="bg-accent text-accent-foreground flex-1">
                  Thêm
                </Button>
                <Button onClick={() => setShowAddQ(false)} variant="outline" className="border-border">
                  Huỷ
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Start Button */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Button
          onClick={onStart}
          disabled={teams.length < 2 || questions.length === 0}
          className="bg-primary text-primary-foreground font-display text-2xl px-12 py-6 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
        >
          <Play className="w-8 h-8 mr-3" /> BẮT ĐẦU GAME!
        </Button>
      </motion.div>
    </div>
  );
}
