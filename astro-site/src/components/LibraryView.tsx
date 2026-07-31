import { useState } from 'react';
import type { QuestionWithMeta } from '@/types/question';

interface LibraryViewProps {
  questions: QuestionWithMeta[];
  categories: string[];
  counts: Record<string, number>;
  totalQuestions: number;
}

export default function LibraryView({ categories, counts, totalQuestions }: LibraryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!categories.length) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <p>No questions loaded. Add files to `questions/` directory.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Question Library</h2>
        <span style={{ color: 'var(--clr-muted)', fontSize: '14px' }}>
          {totalQuestions} questions in {categories.length} categories
        </span>
      </div>

      {/* Category list */}
      <div>
        <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Categories</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid var(--clr-border)',
                background: selectedCategory === cat ? 'var(--clr-primary)' : 'var(--clr-surface)',
                color: selectedCategory === cat ? 'white' : 'var(--clr-text)',
                fontWeight: selectedCategory === cat ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {cat} ({counts[cat] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Questions in selected category */}
      {selectedCategory && (
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>
            Questions in {selectedCategory}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* This would show questions filtered by category - placeholder for now */}
            <p style={{ color: 'var(--clr-muted)', fontSize: '14px' }}>
              {counts[selectedCategory] || 0} question{counts[selectedCategory] !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
