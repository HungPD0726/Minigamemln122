import { useEffect, useRef, useState } from 'react';

const NOTE_SEQUENCE = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
const NOTE_DURATION_MS = 380;
const MASTER_VOLUME = 0.05;

export function useBackgroundMusic() {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const noteIndexRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (gainRef.current && contextRef.current) {
        const now = contextRef.current.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.setTargetAtTime(0.0001, now, 0.08);
      }
      return;
    }

    const context = contextRef.current ?? new AudioContext();
    contextRef.current = context;

    const masterGain = gainRef.current ?? context.createGain();
    if (!gainRef.current) {
      masterGain.gain.value = 0.0001;
      masterGain.connect(context.destination);
      gainRef.current = masterGain;
    }

    const startLoop = async () => {
      if (context.state === 'suspended') {
        await context.resume();
      }

      const now = context.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(MASTER_VOLUME, now, 0.12);

      const playNote = () => {
        const osc = context.createOscillator();
        const noteGain = context.createGain();
        const frequency = NOTE_SEQUENCE[noteIndexRef.current % NOTE_SEQUENCE.length];
        noteIndexRef.current += 1;

        osc.type = 'triangle';
        osc.frequency.value = frequency;

        const t = context.currentTime;
        noteGain.gain.setValueAtTime(0.0001, t);
        noteGain.gain.exponentialRampToValueAtTime(1, t + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.35);
      };

      playNote();

      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(playNote, NOTE_DURATION_MS);
    };

    void startLoop();

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      if (contextRef.current) {
        void contextRef.current.close();
      }
    };
  }, []);

  const toggle = () => setEnabled((prev) => !prev);

  return { enabled, toggle };
}
