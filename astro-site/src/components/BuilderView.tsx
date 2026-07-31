// src/components/BuilderView.tsx
import { useState, useRef, useEffect } from 'react';
import { quizStore, QuizSession } from '../stores/quizStore';

interface QuestionWithMeta {
  id: string;
  type: string;
  difficulty: string;
  question: string;
  options?: string[];
  answer: string;
  notes?: string;
  category: string;
  file: string;
}

interface BuilderViewProps {
  questions: QuestionWithMeta[];
}

interface QuestionRef {
  id: string;
  order: number;
}

const STORAGE_KEY = 'quizBuilderSession';

export default function BuilderView({ questions }: BuilderViewProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionRef[]>([]);
  const [date, setDate] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load existing session on mount
  useEffect(() => {
    const savedSession = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (savedSession) {
      const { sessionId, date: savedDate, name: savedName, questions: savedQuestions } = JSON.parse(savedSession);
      setActiveSessionId(savedSessionId);
      setDate(savedDate);
      setSessionName(savedName);
      setSelectedQuestions(savedQuestions);
    } else {
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
    }
  }, []);

  // Save to localStorage
  function saveSession() {
    const sid = activeSessionId || `session_${Date.now()}`;
    if (!activeSessionId) {
      setActiveSessionId(sid);
    }
    const sessionData = {
      sessionId: sid,
      date,
      name: sessionName,
      questions: selectedQuestions,
      timestamp: Date.now(),
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    }
  }

  useEffect(() => {
    saveSession();
  }, [selectedQuestions, date, sessionName, activeSessionId]);

  function addQuestion(questionId: string) {
    setSelectedQuestions((prev) => {
      const exists = prev.find((q) => q.id === questionId);
      if (exists) return prev;
      return [...prev, { id: questionId, order: prev.length }];
    });
  }

  function removeQuestion(questionId: string) {
    setSelectedQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === questionId);
      if (idx === -1) return prev;
      return prev
        .filter((q) => q.id !== questionId)
        .map((q, i) => ({ ...q, order: i }));
    });
  }

  function isQuestionSelected(questionId: string) {
    return selectedQuestions.some((q) => q.id === questionId);
  }

  // Group by category (derived from questions prop)
  const byCategory: Record<string, QuestionWithMeta[]> = {};
  questions.forEach((q) => {
    if (!byCategory[q.category]) byCategory[q.category] = [];
    byCategory[q.category].push(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
        <div>
          <label>Quiz Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label>Session Name (optional)</label>
          <input
            type="text"
            placeholder="e.g., Mid-August Quiz"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>
      </div>

      <p style={{ fontSize: '14px', color: 'var(--clr-muted)' }}>
        {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
      </p>

      {/* Questions grouped by category */}
      {Object.entries(byCategory).map(([category, catQuestions]) => (
        <div key={category} style={{ marginBottom: '24px' }}>
          <h3 style={{
            borderBottom: '2px solid var(--clr-primary)',
            paddingBottom: '8px',
            color: 'var(--clr-primary)',
          }}>
            {category}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '12px' }}>
            {catQuestions.map((q) => (
              <div key={q.id} style={{
                padding: '12px',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--border-radius)',
                background: isQuestionSelected(q.id) ? 'var(--clr-lightest)' : 'var(--clr-surface)',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }} onClick={() => isQuestionSelected(q.id) ? removeQuestion(q.id) : addQuestion(q.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      background: q.difficulty === 'intermediate' ? 'var(--clr-lightest)' : 'var(--clr-light)',
                    }}>
                      {q.difficulty}
                    </span>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginTop: '8px' }}>{q.question}</h4>
                  </div>
                  <span style={{
                    fontSize: '20px',
                    minWidth: '28px',
                    textAlign: 'center',
                    color: isQuestionSelected(q.id) ? 'var(--clr-primary)' : 'var(--clr-muted)',
                    fontWeight: 'bold',
                  }}>
                    {isQuestionSelected(q.id) ? '✓' : '+'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Selected questions queue */}
      {selectedQuestions.length > 0 && (
        <div>
          <h3>Selected Questions ({selectedQuestions.length})</h3>
          {selectedQuestions.map((qr, idx) => {
            const q = questions.find((q) => q.id === qr.id);
            return q ? (
              <div key={qr.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--border-radius)',
                fontWeight: '500',
              }}>
                <span>{idx + 1}. {q.question.substring(0, 60)}{q.question.length > 60 ? '...' : ''}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                  style={{ padding: '4px 8px', background: 'var(--clr-error)', color: 'white' }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div key={qr.id} style={{ padding: '8px 12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--border-radius)' }}>
                Question: {qr.id} (not found)
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
