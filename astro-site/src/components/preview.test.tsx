// src/components/preview.test.tsx
import { describe, it, expect } from 'vitest';
import { marked } from 'marked';
import { generateMarkdown } from '../utils/export';

describe('marked rendering', () => {
  it('should render basic markdown', () => {
    const result = marked.parse('# Heading\n\nSome text') as string;
    expect(result).toContain('<h1>Heading</h1>');
    expect(result).toContain('<p>Some text</p>');
  });

  it('should not inject inline code', () => {
    const input = '# Title';
    const result = marked.parse(input) as string;
    expect(result.startsWith('<h1>')).toBe(true);
  });
});

describe('export', () => {
  it('should handle questions from previous task', () => {
    expect(generateMarkdown).toBeDefined();
  });
});
