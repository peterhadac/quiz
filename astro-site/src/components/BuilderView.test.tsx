import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BuilderView from './BuilderView';

describe('BuilderView', () => {
  const baseQuestions = [
    { id: 'q1', type: 'write_in', difficulty: 'intermediate', question: 'Test question 1', answer: 'Answer 1', category: 'test', file: 'test.json' },
    { id: 'q2', type: 'multiple_choice', difficulty: 'beginner', question: 'Test question 2', answer: 'Answer 2', options: ['a', 'b'], category: 'test', file: 'test.json' },
  ];

  it('should render date input', () => {
    render(<BuilderView questions={baseQuestions} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toBeVisible();
  });

  it('should group questions by category', () => {
    const { container } = render(<BuilderView questions={baseQuestions} />);
    expect(container.innerHTML).toContain('test');
  });

  it('should show "0 questions selected"', () => {
    render(<BuilderView questions={baseQuestions} />);
    expect(screen.getByText('0 questions selected')).toBeVisible();
  });
});
