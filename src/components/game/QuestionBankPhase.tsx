import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, ListChecks, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Question } from '@/types/game';
import { DEFAULT_QUESTION_POINTS } from '@/lib/questionBank';

interface QuestionBankPhaseProps {
  questions: Question[];
  onAddQuestion: (q: Question) => void;
  onRemoveQuestion: (id: string) => void;
  onBack: () => void;
}

export default function QuestionBankPhase({
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onBack,
}: QuestionBankPhaseProps) {
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const labels = ['A', 'B', 'C', 'D'];

  const totalQuizPoints = useMemo(
    () => questions.reduce((sum, question) => sum + (question.points || 0), 0),
    [questions]
  );

  const handleAddQuestion = () => {
    if (!qText.trim() || !qOptions.every((option) => option.trim())) return;

    onAddQuestion({
      id: crypto.randomUUID(),
      text: qText.trim(),
      options: qOptions.map((option) => option.trim()) as [string, string, string, string],
      correctIndex: qCorrect,
      points: DEFAULT_QUESTION_POINTS,
    });

    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
  };

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
                <ListChecks className="h-4 w-4" /> Trang Riêng Cho MC
              </p>
              <h1 className="mt-3 font-display text-4xl text-primary md:text-6xl">Quản Lý Câu Hỏi</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Danh sách câu hỏi nằm ở trang này để tránh hiển thị trước cho khán giả.
              </p>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-primary/60 text-primary font-display text-lg px-6 py-5"
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Về màn chuẩn bị
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
            <h2 className="flex items-center gap-2 font-display text-2xl text-primary">
              <HelpCircle className="h-6 w-6" /> Danh Sách Câu Hỏi
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Tất cả câu hỏi đang mặc định {DEFAULT_QUESTION_POINTS} điểm.</p>

            <div className="mt-4 max-h-[580px] space-y-2 overflow-auto pr-1">
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
                  Chưa có câu hỏi nào.
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="rounded-2xl border border-border/80 bg-card/90 p-5"
          >
            <h2 className="font-display text-2xl text-primary">Thêm Câu Hỏi</h2>
            <p className="mt-1 text-sm text-muted-foreground">Điểm mỗi câu được khóa mặc định là {DEFAULT_QUESTION_POINTS}.</p>

            <div className="mt-4 space-y-3">
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

              <Button onClick={handleAddQuestion} className="w-full bg-accent text-accent-foreground">
                <Plus className="mr-2 h-4 w-4" /> Lưu câu hỏi
              </Button>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
