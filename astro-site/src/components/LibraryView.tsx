import { useState, useMemo } from 'react';
import type { QuestionWithMeta } from '@/types/question';

interface LibraryViewProps {
  questions: QuestionWithMeta[];
}

export default function LibraryView({ questions }: LibraryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

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

  const handleAnswerChange = (questionId: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: value }));
  };

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
            {filteredQuestions.map((q) => {
              const userAnswer = userAnswers[q.id] || '';
              const isCorrect = userAnswer === q.answer;
              const showFeedback = userAnswer && (q.type === 'multiple_choice' || q.type === 'write_in');

              return (
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
                  <p style={{ margin: '0 0 12px 0', color: 'var(--clr-text)' }}>{q.question}</p>
                  
                  {q.type === 'multiple_choice' && q.options && q.options.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((option, idx) => {
                        const isSelected = userAnswer === option;
                        const optionCorrect = option === q.answer;
                        let optionColor = 'var(--clr-text)';
                        let optionBg = 'transparent';
                        
                        if (showFeedback) {
                          if (optionCorrect) {
                            optionColor = 'var(--clr-primary)';
                            optionBg = 'rgba(34, 197, 94, 0.1)';
                          } else if (isSelected && !isCorrect) {
                            optionColor = '#ef4444';
                            optionBg = 'rgba(239, 68, 68, 0.1)';
                          }
                        }

                        return (
                          <label key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${showFeedback && optionCorrect ? 'var(--clr-primary)' : isSelected ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                            background: optionBg,
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: optionColor,
                          }}>
                            <input
                              type="radio"
                              name={q.id}
                              value={option}
                              checked={isSelected}
                              onChange={() => handleAnswerChange(q.id, option)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span>{option}</span>
                            {showFeedback && optionCorrect && <span>✓</span>}
                          </label>
                        );
                      })}
                    </div>
                  ) : q.type === 'write_in' ? (
                    <div>
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Type your answer..."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--clr-border)',
                          fontSize: '14px',
                          marginBottom: '8px',
                        }}
                      />
                      {showFeedback && (
                        <p style={{
                          margin: '0',
                          fontSize: '13px',
                          color: isCorrect ? 'var(--clr-primary)' : '#ef4444',
                        }}>
                          {isCorrect ? '✓ Correct!' : `Answer: ${q.answer}`}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
