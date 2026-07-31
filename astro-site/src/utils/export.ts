// src/utils/export.ts
import type { QuestionWithMeta } from '../types/question';

export function generateMarkdown(date: string, questions: QuestionWithMeta[]): string {
  if (questions.length === 0) {
    return '# Quiz — No questions selected';
  }

  const byCategory: Record<string, QuestionWithMeta[]> = {};
  questions.forEach((q) => {
    if (!byCategory[q.category]) byCategory[q.category] = [];
    byCategory[q.category].push(q);
  });

  const lines: string[] = [
    `# Quiz — ${date}`,
    `- **Date:** ${date}`,
    `- **Total Questions:** ${questions.length}`,
  ];

  let questionIndex = 0;

  for (const [category, catQuestions] of Object.entries(byCategory)) {
    lines.push(`\n## ${category}`);
    
    for (const q of catQuestions) {
      questionIndex++;
      lines.push(`\n### Q${questionIndex}`);
      lines.push(`- **Type:** ${q.type}`);
      lines.push(`- **Difficulty:** ${q.difficulty}`);
      lines.push(`- **Question:** ${q.question}`);
      
      if (q.type === 'multiple_choice' && q.options) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        q.options.forEach((opt, i) => {
          lines.push(`  - ${letters[i]}) ${opt}`);
        });
      }
      
      lines.push(`- **Answer:** ${q.answer}`);
      if (q.notes) {
        lines.push(`- **Notes:** ${q.notes}`);
      }
    }
  }

  return lines.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback: create textarea and copy
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
