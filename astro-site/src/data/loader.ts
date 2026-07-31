import { parseQuestions } from '@/data/questions';
import { deriveCategories } from '@/data/categories';
import type { QuestionWithMeta } from '@/types/question';

export async function loadQuestionData() {
  return { questions: [], categories: [] as [QuestionWithMeta[], Record<string, QuestionWithMeta[]>] };
}
