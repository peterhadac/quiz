import { QuestionWithMeta } from '@/types/question';

export function deriveCategories(questions: QuestionWithMeta[]): Record<string, QuestionWithMeta[]> {
  const result: Record<string, QuestionWithMeta[]> = {};
  for (const q of questions) {
    if (!result[q.category]) result[q.category] = [];
    result[q.category].push(q);
  }
  return result;
}
