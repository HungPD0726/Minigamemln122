import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Play,
  HelpCircle,
  Users,
  Sparkles,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Team, Question } from '@/types/game';

const TEAM_COLORS = [
  'bg-team-1',
  'bg-team-2',
  'bg-team-3',
  'bg-team-4',
  'bg-team-5',
  'bg-team-6',
  'bg-team-7',
  'bg-team-8',
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

  const totalQuizPoints = useMemo(
    () => questions.reduce((sum, question) => sum + (question.points || 0), 0),
    [questions]
  );
  const canStart = teams.length >= 2 && questions.length > 0;

  const handleAddTeam = () => {
    if (!teamName.trim()) return;
    onAddTeam(teamName.trim());
    setTeamName('');
  };

  const handleAddQuestion = () => {
    if (!qText.trim() || !qOptions.every((option) => option.trim())) return;

    onAddQuestion({
      id: crypto.randomUUID(),
      text: qText.trim(),
      options: qOptions.map((option) => option.trim()) as [string, string, string, string],
      correctIndex: qCorrect,
      points: qPoints,
    });

    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
    setQPoints(60);
    setShowAddQ(false);
  };

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-game-gradient">
      <div className="pointer-events-none absolute -left-24 top-12 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 p-4 md:p-6">
        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl border border-primary/20 bg-card/90 p-5 md:p-7 card-glow"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-4 w-4" /> Màn Hình Chính
              </p>
              <h1 className="mt-3 font-display text-4xl text-primary md:text-6xl">Quiz Bet Arena</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Tạo danh sách đội chơi và bộ câu hỏi. Khi đủ điều kiện, bắt đầu game để vào vòng quiz.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm">
              <p className="font-semibold">Điều kiện bắt đầu</p>
              <p className="mt-1 text-muted-foreground">Cần ít nhất 2 đội và 1 câu hỏi.</p>
              <p className={`mt-2 font-bold ${canStart ? 'text-accent' : 'text-destructive'}`}>
                {canStart ? 'Sẵn sàng chơi' : 'Chưa đủ điều kiện'}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Đội Chơi</p>
              <p className="font-display text-3xl text-primary">{teams.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Câu Hỏi</p>
              <p className="font-display text-3xl text-primary">{questions.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tổng Điểm</p>
              <p className="font-display text-3xl text-primary">{totalQuizPoints}</p>
            </div>
          </div>
        </motion.header>

        <div className="grid gap-4 lg:grid-cols-2">
          <motion.section
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="rounded-2xl border border-border/80 bg-card/90 p-5"
          >
            <h2 className="font-display text-2xl text-primary flex items-center gap-2">
              <Users className="h-6 w-6" /> Quản Lý Đội Chơi
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Thêm, xóa đội và sắp xếp đội trước khi bắt đầu.</p>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Nhập tên đội"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleAddTeam()}
                className="bg-muted/50"
              />
              <Button onClick={handleAddTeam} className="bg-primary text-primary-foreground" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 max-h-[360px] space-y-2 overflow-auto pr-1">
              <AnimatePresence>
                {teams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3"
                  >
                    <div className={`h-4 w-4 rounded-full ${TEAM_COLORS[index % TEAM_COLORS.length]}`} />
                    <div className="flex-1">
                      <p className="font-semibold leading-none">{team.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">ID: {team.id.slice(0, 8)}</p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onRemoveTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {teams.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Chưa có đội nào. Thêm đội đầu tiên để khởi tạo trận đấu.
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="rounded-2xl border border-border/80 bg-card/90 p-5"
          >
            <h2 className="font-display text-2xl text-primary flex items-center gap-2">
              <HelpCircle className="h-6 w-6" /> Quản Lý Câu Hỏi
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Kiểm tra nhanh danh sách câu hỏi trước khi chạy quiz.</p>

            <div className="mt-4 max-h-[220px] space-y-2 overflow-auto pr-1">
              {questions.map((question, index) => (
                <div key={question.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-start gap-2">
                    <span className="rounded-md bg-primary/20 px-2 py-1 text-xs font-semibold text-primary">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{question.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{question.points} điểm</p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onRemoveQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Chưa có câu hỏi nào. Thêm câu hỏi mới bên dưới.
                </div>
              )}
            </div>

            {!showAddQ ? (
              <Button
                onClick={() => setShowAddQ(true)}
                variant="outline"
                className="mt-4 w-full border-primary/60 text-primary"
              >
                <ListChecks className="mr-2 h-4 w-4" /> Thêm câu hỏi mới
              </Button>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3">
                <Input
                  placeholder="Nội dung câu hỏi"
                  value={qText}
                  onChange={(event) => setQText(event.target.value)}
                  className="bg-muted/40"
                />

                {qOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQCorrect(index)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        qCorrect === index
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {labels[index]}
                    </button>
                    <Input
                      placeholder={`Đáp án ${labels[index]}`}
                      value={option}
                      onChange={(event) => {
                        const newOptions = [...qOptions];
                        newOptions[index] = event.target.value;
                        setQOptions(newOptions);
                      }}
                      className="bg-muted/40"
                    />
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Điểm:</span>
                  <Input
                    type="number"
                    min={10}
                    step={10}
                    value={qPoints}
                    onChange={(event) => setQPoints(Math.max(10, Number(event.target.value) || 10))}
                    className="w-28 bg-muted/40"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddQuestion} className="flex-1 bg-accent text-accent-foreground">
                    Lưu câu hỏi
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddQ(false)}>
                    Hủy
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.section>
        </div>

        <motion.footer
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl border border-primary/20 bg-card/90 p-4 md:p-5"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Mẹo: ở vòng quiz bạn có thể trao điểm cho nhiều đội nếu cùng trả lời đúng.
            </p>
            <Button
              onClick={onStart}
              disabled={!canStart}
              className="bg-primary text-primary-foreground font-display text-xl px-10 py-6 disabled:opacity-50"
            >
              <Play className="mr-3 h-6 w-6" /> Bắt đầu game
            </Button>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
