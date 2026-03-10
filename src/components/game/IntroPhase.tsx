import { motion } from 'framer-motion';
import { Sparkles, Play, Dice3, Trophy, CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntroPhaseProps {
  onStart: () => void;
}

const INTRO_STEPS = [
  {
    icon: CircleHelp,
    title: 'Vòng Quiz',
    description: 'Trả lời câu hỏi để giành điểm cho đội.',
  },
  {
    icon: Dice3,
    title: 'Vòng Cược',
    description: 'Đặt điểm vào các ô, quay xúc xắc và tính lãi lỗ.',
  },
  {
    icon: Trophy,
    title: 'Bảng Điểm',
    description: 'Theo dõi xếp hạng và tổng điểm đã đổi thưởng.',
  },
];

export default function IntroPhase({ onStart }: IntroPhaseProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-game-gradient p-4 md:p-6">
      <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center">
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-3xl border border-primary/20 bg-card/90 p-6 md:p-10 card-glow"
        >
          <div className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              <Sparkles className="h-4 w-4" /> Giới Thiệu
            </p>
            <h1 className="mt-4 font-display text-5xl text-primary md:text-7xl">Quiz Bet Arena</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Mini game kết hợp quiz và cược điểm. Thích hợp cho lớp học, team building, hoặc buổi chơi nhỏ.
            </p>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {INTRO_STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-border/70 bg-muted/30 p-4"
              >
                <step.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-display text-2xl text-primary">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-7 flex flex-col items-center justify-center gap-3 md:flex-row"
          >
            <Button
              onClick={onStart}
              className="bg-primary text-primary-foreground font-display text-2xl px-10 py-6"
            >
              <Play className="mr-2 h-6 w-6" />
              Bắt đầu
            </Button>
            <p className="text-sm text-muted-foreground">Nhấn để vào màn hình tạo đội và bộ câu hỏi.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
