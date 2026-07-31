import { useState, useMemo } from 'react';
import type { QuestionWithMeta } from '@/types/question';

interface LibraryViewProps {
  questions: QuestionWithMeta[];
}

export default function LibraryView({ questions }: LibraryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { categoryNames, counts, totalQuestions } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of questions) {
      counts[q.category] = (counts[q.category] || 0) + 1;
    }
    const categoryNames = Object.keys(counts);
    return { categoryNames, counts, totalQuestions: questions.length };
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!selectedCategory) return [];
    return questions.filter(q => q.category === selectedCategory);
  }, [selectedCategory, questions]);

  if (categoryNames.length === 0) {
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
          {totalQuestions} questions in {categoryNames.length} categories
        </span>
      </div>

      {/* Category list */}
      <div>
        <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Categories</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categoryNames.map((cat) => (
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
            {filteredQuestions.map((q) => (
              <div key={q.id} style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--clr-border)',
                background: 'var(--clr-surface)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--clr-muted)' }}>{q.id}</span>
                  <span style={{ fontSize: '12px', color: 'var(--clr-muted)' }}>
                    {q.type === 'multiple_choice' ? 'Multiple Choice' : 'Write-In'}
                  </span>
                </div>
                <p style={{ margin: '0 0 8px 0', color: 'var(--clr-text)' }}>{q.question}</p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-primary)' }}>Answer: {q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
