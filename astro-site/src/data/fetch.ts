import { QuestionWithMeta } from '../types/question';

export async function fetchQuestions(): Promise<QuestionWithMeta[]> {
  const response = await fetch('/quiz/questions-data.json');
  return response.json();
}

export async function fetchCategories(questions: QuestionWithMeta[]): Promise<Record<string, QuestionWithMeta[]>> {
  const result: Record<string, QuestionWithMeta[]> = {};
  for (const q of questions) {
    if (!result[q.category]) result[q.category] = [];
    result[q.category].push(q);
  }
  return result;
}
