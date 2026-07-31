import { describe, it, expect } from 'vitest';
import { parseQuestions } from '@/data/questions';

describe('parseQuestions', () => {
  it('should parse valid multiple_choice question', () => {
    const result = parseQuestions('geography', 'test.json', {
      category: 'geography',
      questions: [{ id: 'geo_1', type: 'multiple_choice', difficulty: 'intermediate', question: 'What is the capital of Slovakia?', options: ['Bratislava', 'Kosice', 'Nitra', 'Presov'], answer: 'Bratislava', notes: 'Basic geography fact' }],
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'geo_1', type: 'multiple_choice', question: 'What is the capital of Slovakia?', answer: 'Bratislava', category: 'geography', file: 'test.json' });
  });

  it('should parse valid write_in question', () => {
    const result = parseQuestions('history', 'test.json', {
      category: 'history',
      questions: [{ id: 'hist_1', type: 'write_in', difficulty: 'intermediate', question: 'What is the longest river in Slovakia?', answer: 'Vah' }],
    });
    expect(result[0].type).toBe('write_in');
    expect(result[0].options).toBe(undefined);
  });

  it('should throw error for invalid ID', () => {
    expect(() => parseQuestions('test', 'test.json', { category: 'test', questions: [{ type: 'write_in', question: 'foo', answer: 'bar' }] })).toThrow('Invalid question ID');
  });

  it('should throw error for missing required fields', () => {
    expect(() => parseQuestions('test', 'test.json', { category: 'test', questions: [{ id: 'x', type: 'write_in', question: 'foo' }] })).toThrow('Invalid answer');
  });

  it('should throw error for multiple_choice without options', () => {
    expect(() => parseQuestions('test', 'test.json', { category: 'test', questions: [{ id: 'x', type: 'multiple_choice', difficulty: 'beginner', question: 'foo', answer: 'bar', options: [] }] })).toThrow('requires options');
  });
});
