import { useState, useEffect } from 'react';

interface HistoryQuiz {
  date: string;
  filename: string;
  preview?: string;
}

interface HistoryViewProps {
  quizzes: HistoryQuiz[];
}

export default function HistoryView({ quizzes: initialQuizzes }: HistoryViewProps) {
  const [dateQuizzes, setDateQuizzes] = useState<HistoryQuiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [mdContent, setMdContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDateQuizzes(initialQuizzes);
  }, [initialQuizzes]);

  async function viewQuiz(dateId: string) {
    setLoading(true);
    try {
      const response = await fetch(`/samples/${dateId}/quiz.md`);
      if (response.ok) {
        const markdown = await response.text();
        setMdContent(markdown);
        setSelectedQuiz(dateId);
      }
    } catch {
      console.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2>History</h2>

      {dateQuizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <h3 style={{ color: 'var(--clr-muted)' }}>No quizzes found</h3>
          <p>Quizzes appear here after you build them and commit to git.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(
              dateQuizzes.reduce((acc, q) => {
                if (!acc[q.date]) acc[q.date] = [];
                acc[q.date].push(q);
                return acc;
              }, {} as Record<string, HistoryQuiz[]>),
            ).map(([dateId, dateQuizzes]) => (
              <div key={dateId} style={{ marginBottom: '12px' }}>
                <h3 style={{ color: 'var(--clr-primary)', marginBottom: '8px' }}>{dateId}</h3>
                {dateQuizzes.map((quiz) => (
                  <div
                    key={quiz.filename}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: selectedQuiz === dateId ? 'var(--clr-lightest)' : 'var(--clr-surface)',
                      border: '1px solid var(--clr-border)',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                    onClick={() => viewQuiz(dateId)}
                  >
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>quiz.md</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {selectedQuiz && (
            <div>
              <h3>Preview: {selectedQuiz}</h3>
              {loading ? (
                <p>Loading...</p>
              ) : mdContent ? (
                <pre style={{
                  background: 'var(--clr-surface)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--border-radius)',
                  padding: '16px',
                  overflow: 'auto',
                  maxHeight: '500px',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                    {mdContent}
                </pre>
              ) : (
                <p>No content loaded.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
