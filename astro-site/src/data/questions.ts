import { QuestionWithMeta, QuestionJson } from '@/types/question';

export function parseQuestions(category: string, file: string, data: QuestionJson): QuestionWithMeta[] {
  if (!data || typeof data !== 'object') {
    throw new Error(`Invalid data: expected JSON object with "category" and "questions"`);
  }
  if (!data.category || typeof data.category !== 'string') {
    throw new Error(`Invalid category: expected "category" string in ${file}`);
  }
  if (!Array.isArray(data.questions)) {
    throw new Error(`Invalid questions: expected "questions" array in ${file}`);
  }
  return data.questions.map((q) => {
    if (!q.id || typeof q.id !== 'string') throw new Error(`Invalid question ID in ${file}`);
    if (!q.type || !['multiple_choice', 'write_in'].includes(q.type)) throw new Error(`Invalid type "${q.type}" in ${file}`);
    if (!q.question || typeof q.question !== 'string') throw new Error(`Invalid question text in ${file}`);
    if (!q.answer || typeof q.answer !== 'string') throw new Error(`Invalid answer in ${file}`);
    if (q.type === 'multiple_choice' && (!Array.isArray(q.options) || q.options.length === 0)) {
      throw new Error(`Multiple_choice question "${q.id}" requires options in ${file}`);
    }
    return { ...q, category, file };
  });
}
