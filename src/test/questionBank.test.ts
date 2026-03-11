import { describe, expect, it } from 'vitest';
import { DEFAULT_QUESTION_POINTS, parseQuestionMarkdown } from '@/lib/questionBank';
import questionMarkdown from '@/question.md?raw';

describe('parseQuestionMarkdown', () => {
  it('parses all questions from question.md with default points', () => {
    const questions = parseQuestionMarkdown(questionMarkdown);

    expect(questions).toHaveLength(41);
    expect(questions[0].text).toContain('Trong kinh tế học');
    expect(questions[40].text).toContain('Nếu tiêu chí là công bằng xã hội');

    questions.forEach((question) => {
      expect(question.options).toHaveLength(4);
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThanOrEqual(3);
      expect(question.points).toBe(DEFAULT_QUESTION_POINTS);
    });
  });

  it('skips malformed blocks and keeps valid ones', () => {
    const markdown = `
1. Tiêu đề nhóm

Câu 1. Câu hợp lệ?
A. Đáp án A
B. Đáp án B
C. Đáp án C
D. Đáp án D
Đáp án: B

Câu 2. Thiếu đáp án đúng
A. A
B. B
C. C
D. D

Câu 3. Thiếu một phương án
A. A
B. B
C. C
Đáp án: A
`;

    const questions = parseQuestionMarkdown(markdown);

    expect(questions).toHaveLength(1);
    expect(questions[0].text).toBe('Câu hợp lệ?');
    expect(questions[0].correctIndex).toBe(1);
  });

  it('supports multiline question text before options', () => {
    const markdown = `
Câu 1. Dòng đầu tiên
phần mô tả bổ sung
A. A
B. B
C. C
D. D
Đáp án: A
`;

    const [question] = parseQuestionMarkdown(markdown);
    expect(question.text).toContain('Dòng đầu tiên phần mô tả bổ sung');
  });
});
