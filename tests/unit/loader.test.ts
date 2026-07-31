import { describe, it, expect } from 'vitest';
import { loadQuestionData } from '@/data/loader';

describe('loadQuestionData', () => {
  it('should return empty arrays when no files found', async () => {
    const result = await loadQuestionData();
    expect(result).toHaveProperty('questions');
    expect(result).toHaveProperty('categories');
  });
});
