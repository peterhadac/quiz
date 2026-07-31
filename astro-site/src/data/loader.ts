import { readdirSync, readFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseQuestions } from '@/data/questions';
import { deriveCategories } from '@/data/categories';
import type { QuestionWithMeta, QuestionJson } from '@/types/question';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// questions/ directory is at repo root (grandparent of src/data/)
const questionsDir = join(__dirname, '../../../questions');

export function loadQuestionData(): { questions: QuestionWithMeta[]; categories: Record<string, QuestionWithMeta[]> } {
  const allQuestions: QuestionWithMeta[] = [];

  if (!existsSync(questionsDir)) {
    return { questions: [], categories: {} };
  }

  const dirEntries = readdirSync(questionsDir, { withFileTypes: true });

  for (const entry of dirEntries) {
    if (!entry.isDirectory()) continue;

    const jsonPath = join(questionsDir, entry.name, 'questions.json');
    if (!existsSync(jsonPath)) continue;

    try {
      const raw = readFileSync(jsonPath, { encoding: 'utf-8' });
      const data: QuestionJson = JSON.parse(raw);
      const parsed = parseQuestions(entry.name, jsonPath, data);
      allQuestions.push(...parsed);
    } catch (err) {
      console.warn(`Failed to parse ${jsonPath}:`, (err as Error).message);
    }
  }

  const categoriesMap = deriveCategories(allQuestions);
  return { questions: allQuestions, categories: categoriesMap };
}

function existsSync(path: string): boolean {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}
