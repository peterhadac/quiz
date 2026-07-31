// tests/unit/export.test.ts
import { describe, it, expect } from 'vitest';
import { generateMarkdown } from '../../src/utils/export';

describe('generateMarkdown', () => {
  const questions = [
    { id: 'geo_1', type: 'multiple_choice' as const, difficulty: 'intermediate' as const, question: 'What is the capital of Slovakia?', options: ['A', 'B', 'C', 'D'], answer: 'A', category: 'geography', file: 'test.json' },
    { id: 'hist_1', type: 'write_in' as const, difficulty: 'beginner' as const, question: 'What is the longest river in Slovakia?', answer: 'Dunaj', category: 'history', file: 'test.json' },
    { id: 'hist_2', type: 'write_in' as const, difficulty: 'intermediate' as const, question: 'What is the second longest river?', answer: 'Nitra', notes: 'Just testing notes', category: 'history', file: 'test.json' },
  ];

  it('should generate markdown with proper format', () => {
    const result = generateMarkdown('2024-08-01', questions);
    
    expect(result).toContain('# Quiz — 2024-08-01');
    expect(result).toContain('## geography');
    expect(result).toContain('## history');
    expect(result).toContain('  - A) A');
    expect(result).toContain('- **Answer:** A');
  });

  it('should group by category', () => {
    const result = generateMarkdown('2024-08-01', questions);
    
    const geoIndex = result.indexOf('## geography');
    const histIndex = result.indexOf('## history');
    
    expect(geoIndex).toBeLessThan(histIndex);
    expect(geoIndex).toBeGreaterThan(0);
  });

  it('should include notes when present', () => {
    const result = generateMarkdown('2024-08-01', questions);
    expect(result).toContain('- **Notes:** Just testing notes');
  });

  it('should return plain message for empty questions', () => {
    const result = generateMarkdown('2024-08-01', []);
    expect(result).toBe('# Quiz — No questions selected');
  });

  it('should include date and total count in header', () => {
    const result = generateMarkdown('2024-08-01', questions);
    expect(result).toContain('- **Date:** 2024-08-01');
    expect(result).toContain('- **Total Questions:** 3');
  });

  it('should include type and difficulty for each question', () => {
    const result = generateMarkdown('2024-08-01', questions);
    expect(result).toContain('- **Type:** multiple_choice');
    expect(result).toContain('- **Type:** write_in');
    expect(result).toContain('- **Difficulty:** intermediate');
    expect(result).toContain('- **Difficulty:** beginner');
  });
});
