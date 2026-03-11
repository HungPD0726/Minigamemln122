import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CircleHelp, Dice3, Trophy, Wifi, WifiOff } from 'lucide-react';
import { PublicGameState, PUBLIC_STATE_CHANNEL_NAME, PUBLIC_STATE_STORAGE_KEY, normalizePublicGameState, readPublicStateFromStorage } from '@/lib/publicState';

const OPTION_COLORS = [
  'bg-team-1',
  'bg-team-2',
  'bg-team-3',
  'bg-team-4',
];

function AudienceWaiting({ icon: Icon, title, description }: { icon: typeof CircleHelp; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-card/90 p-8 text-center card-glow">
      <Icon className="mx-auto h-14 w-14 text-primary" />
      <h1 className="mt-4 font-display text-4xl text-primary md:text-6xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground md:text-base">{description}</p>
    </div>
  );
}

function formatClock(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', { hour12: false });
}

export default function Audience() {
  const [state, setState] = useState<PublicGameState | null>(() => readPublicStateFromStorage());
  const [connected, setConnected] = useState(() => Boolean(readPublicStateFromStorage()));

  useEffect(() => {
    const cached = readPublicStateFromStorage();
    setState(cached);
    if (cached) {
      setConnected(true);
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== PUBLIC_STATE_STORAGE_KEY || !event.newValue) return;
      try {
        const next = normalizePublicGameState(JSON.parse(event.newValue));
        if (next) {
          setState(next);
          setConnected(true);
        }
      } catch {
        // ignore invalid payloads
      }
    };

    window.addEventListener('storage', onStorage);

    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(PUBLIC_STATE_CHANNEL_NAME);
      channel.onmessage = (event) => {
        const next = normalizePublicGameState(event.data);
        if (next) {
          setState(next);
          setConnected(true);
        }
      };
    }

    return () => {
      window.removeEventListener('storage', onStorage);
      channel?.close();
    };
  }, []);

  const sortedTeams = useMemo(
    () => (state ? [...state.teams].sort((a, b) => b.score - a.score) : []),
    [state]
  );

  if (!state) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-game-gradient p-4 md:p-6">
        <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
          <AudienceWaiting
            icon={WifiOff}
            title="Màn Hình Khán Giả"
            description="Chưa nhận dữ liệu từ Presenter. Hãy mở route /presenter và bắt đầu game."
          />
        </div>
      </div>
    );
  }

  const headerStatus = (
    <div className="absolute right-4 top-4 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs">
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        {connected ? <Wifi className="h-3.5 w-3.5 text-accent" /> : <WifiOff className="h-3.5 w-3.5 text-destructive" />}
        Cập nhật: {formatClock(state.updatedAt)}
      </span>
    </div>
  );

  switch (state.phase) {
    case 'intro':
    case 'setup':
      return (
        <div className="relative min-h-screen overflow-hidden bg-game-gradient p-4 md:p-6">
          <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
          {headerStatus}
          <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
            <AudienceWaiting
              icon={CircleHelp}
              title="Quiz Bet Arena"
              description="MC đang chuẩn bị. Vòng câu hỏi sẽ bắt đầu ngay."
            />
          </div>
        </div>
      );

    case 'quiz':
      return (
        <div className="relative min-h-screen overflow-hidden bg-game-gradient p-4 md:p-6">
          {headerStatus}
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-xl text-primary">
                Câu {state.currentQuestionIndex + 1}/{state.totalQuestions}
              </span>
              <span className="font-display text-xl text-secondary">
                {state.question?.points ?? 0} ĐIỂM
              </span>
            </div>

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 rounded-2xl bg-card p-6 md:p-8 card-glow"
            >
              <h2 className="text-center font-display text-2xl leading-snug text-foreground md:text-4xl">
                {state.question?.text || 'Đang chờ câu hỏi...'}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(state.question?.options || ['...', '...', '...', '...']).map((option, index) => {
                const labels = ['A', 'B', 'C', 'D'];
                const isCorrect = state.revealedAnswer && state.question?.correctIndex === index;
                const dimmed = state.revealedAnswer && !isCorrect;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 rounded-xl p-4 md:p-5 transition-all ${
                      isCorrect
                        ? 'bg-accent ring-4 ring-accent/50 scale-[1.02]'
                        : dimmed
                        ? 'opacity-40'
                        : OPTION_COLORS[index % OPTION_COLORS.length]
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/20 font-display text-xl">
                      {labels[index]}
                    </span>
                    <span className="text-lg font-bold md:text-xl">{option}</span>
                    {isCorrect && <span className="ml-auto text-3xl">✅</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );

    case 'gambling':
      return (
        <div className="relative min-h-screen overflow-hidden bg-game-gradient p-4 md:p-6">
          {headerStatus}
          <div className="mx-auto max-w-4xl">
            <AudienceWaiting
              icon={Dice3}
              title="Vòng Cược Điểm"
              description="Các đội đang cược điểm. Kết quả sẽ được cập nhật ngay khi hoàn tất."
            />

            <div className="mx-auto mt-5 max-w-2xl space-y-2 rounded-2xl border border-border/80 bg-card/90 p-4">
              {sortedTeams.map((team, index) => (
                <div key={team.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <span className="font-semibold">
                    #{index + 1} {team.name}
                  </span>
                  <span className="font-bold text-primary">{team.score} điểm</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'scoreboard':
      return (
        <div className="relative min-h-screen overflow-hidden bg-game-gradient p-4 md:p-6">
          {headerStatus}
          <div className="mx-auto max-w-4xl">
            <AudienceWaiting icon={Trophy} title="Bảng Xếp Hạng" description="Kết quả hiện tại của các đội." />

            <div className="mx-auto mt-5 max-w-2xl space-y-2 rounded-2xl border border-border/80 bg-card/90 p-4">
              {sortedTeams.map((team, index) => (
                <div key={team.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <span className="font-semibold">
                    #{index + 1} {team.name}
                  </span>
                  <span className="font-bold text-primary">{team.score} điểm</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
  }
}
