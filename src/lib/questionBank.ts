import { Question } from '@/types/game';
import rawQuestions from '@/question.md?raw';

export const DEFAULT_QUESTION_POINTS = 60;

const ANSWER_LABELS = ['A', 'B', 'C', 'D'] as const;

interface QuestionDraft {
  id: string;
  text: string;
  options: string[];
  answerLabel: string | null;
}

function toQuestion(draft: QuestionDraft, points: number): Question | null {
  if (!draft.text || draft.options.length !== 4 || !draft.answerLabel) {
    return null;
  }

  const normalizedAnswer = draft.answerLabel.toUpperCase();
  const correctIndex = ANSWER_LABELS.indexOf(normalizedAnswer as (typeof ANSWER_LABELS)[number]);
  if (correctIndex === -1) {
    return null;
  }

  return {
    id: draft.id,
    text: draft.text,
    options: draft.options as [string, string, string, string],
    correctIndex,
    points,
  };
}

export function parseQuestionMarkdown(markdown: string, defaultPoints = DEFAULT_QUESTION_POINTS): Question[] {
  const lines = markdown.split(/\r?\n/);
  const questions: Question[] = [];
  let draft: QuestionDraft | null = null;
  let fallbackId = 1;

  const flushDraft = () => {
    if (!draft) return;

    const question = toQuestion(draft, defaultPoints);
    if (question) {
      questions.push(question);
    }

    draft = null;
    fallbackId += 1;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const questionMatch = line.match(/^Câu\s+(\d+)\.\s*(.+)$/i);
    if (questionMatch) {
      flushDraft();
      draft = {
        id: questionMatch[1] || `${fallbackId}`,
        text: questionMatch[2].trim(),
        options: [],
        answerLabel: null,
      };
      continue;
    }

    if (!draft) continue;

    const optionMatch = line.match(/^([ABCD])\.\s*(.+)$/i);
    if (optionMatch) {
      if (draft.options.length < 4) {
        draft.options.push(optionMatch[2].trim());
      }
      continue;
    }

    const answerMatch = line.match(/^(?:Đáp án|Dap an)\s*:\s*([ABCD])$/i);
    if (answerMatch) {
      draft.answerLabel = answerMatch[1].toUpperCase();
      continue;
    }

    if (!/^(\d+)\./.test(line) && draft.options.length === 0) {
      draft.text = `${draft.text} ${line}`.trim();
    }
  }

  flushDraft();
  return questions;
}

export const INITIAL_QUESTIONS = parseQuestionMarkdown(rawQuestions, DEFAULT_QUESTION_POINTS);
