import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LibraryView from './LibraryView';
import type { QuestionWithMeta } from '@/types/question';

const mockQuestions: QuestionWithMeta[] = [
  { id: 'bio_001', type: 'write_in', difficulty: 'beginner', question: 'What is DNA?', answer: 'Deoxyribonucleic acid', options: undefined, category: 'biology', file: 'biology/questions.json' },
  { id: 'bio_002', type: 'multiple_choice', difficulty: 'intermediate', question: 'Which organelle produces energy?', answer: 'Mitochondria', options: ['Mitochondria', 'Nucleus', 'Ribosome'], category: 'biology', file: 'biology/questions.json' },
  { id: 'astro_001', type: 'write_in', difficulty: 'beginner', question: 'What is the largest planet?', answer: 'Jupiter', options: undefined, category: 'astronomy', file: 'astronomy/questions.json' },
];

describe('LibraryView', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { hash: '' },
      writable: true,
    });
  });

  it('should render empty state when no questions', () => {
    const { container } = render(<LibraryView questions={[]} />);
    const el = container.querySelector('p');
    expect(el?.textContent).toBe('No questions loaded. Add files to `questions/` directory.');
  });

  it('should render categories and total count', () => {
    render(<LibraryView questions={mockQuestions} />);
    const counter = screen.getByText(/3 questions in 2 categories/);
    expect(counter).toBeTruthy();
    const bioBtn = screen.getByRole('button', { name: /biology/ });
    expect(bioBtn).toBeTruthy();
    const astroBtn = screen.getByRole('button', { name: /astronomy/ });
    expect(astroBtn).toBeTruthy();
  });

  it('should show questions when category is selected', () => {
    render(<LibraryView questions={mockQuestions} />);
    const bioBtn = screen.getByRole('button', { name: /biology/ });
    fireEvent.click(bioBtn);
    expect(screen.getByText(/Questions in biology/)).toBeTruthy();
    expect(screen.getByText(/What is DNA\?/)).toBeTruthy();
    expect(screen.getByText(/Which organelle produces energy\?/)).toBeTruthy();
  });
});
