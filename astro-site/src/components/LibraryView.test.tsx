import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LibraryView from './LibraryView';

describe('LibraryView', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { hash: '' },
      writable: true,
    });
  });

  it('should render empty state when no categories', () => {
    render(<LibraryView questions={[]} categories={[]} counts={{ }} totalQuestions={0} />);
    const el = screen.getByText(/No questions loaded/);
    expect(el).toBeTruthy();
  });

  it('should render categories and total count', () => {
    render(<LibraryView questions={[]} categories={['geography']} counts={{ geography: 2 }} totalQuestions={2} />);
    const counter = screen.getByText(/2 questions in 1 categories/);
    expect(counter).toBeTruthy();
    const catBtn = screen.getByRole('button', { name: /geography \(\d+\)/ });
    expect(catBtn).toBeTruthy();
  });

  it('should show questions count when category is selected', () => {
    render(<LibraryView questions={[]} categories={['geography']} counts={{ geography: 2 }} totalQuestions={2} />);
    const catBtn = screen.getByRole('button', { name: /geography \(\d+\)/ });
    fireEvent.click(catBtn);
    expect(screen.getByText(/2 questions available/)).toBeTruthy();
  });
});
