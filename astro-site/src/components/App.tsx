import { useState, useEffect, useMemo } from 'react';
import Navigation from './Navigation';
import LibraryView from './LibraryView';
import BuilderView from './BuilderView';
import PreviewView from './PreviewView';
import HistoryView from './HistoryView';
import type { QuestionWithMeta } from '../types/question';

export default function App() {
  const [activeTab, setActiveTab] = useState('library');
  const [questions, setQuestions] = useState<QuestionWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const script = document.getElementById('quiz-data') as HTMLScriptElement;
      const data: QuestionWithMeta[] = JSON.parse(script?.textContent || '[]');
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load quiz data:', err);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '32px', color: 'var(--clr-muted)' }}>Loading...</div>;
  }

  const categories = useMemo(() => {
    const cats: Record<string, QuestionWithMeta[]> = {};
    for (const q of questions) {
      if (!cats[q.category]) cats[q.category] = [];
      cats[q.category].push(q);
    }
    return cats;
  }, [questions]);

  return (
    <>
      <header style={{ padding: '8px 16px', borderBottom: '1px solid var(--clr-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', color: 'var(--clr-primary)' }}>Quiz Builder</h1>
          <Navigation onTabChange={setActiveTab} />
        </div>
      </header>
      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'library' && <LibraryView questions={questions} />}
        {activeTab === 'builder' && <BuilderView questions={questions} />}
        {activeTab === 'preview' && <p>Preview tab — coming soon</p>}
        {activeTab === 'history' && <HistoryView quizzes={[]} />}
      </div>
    </>
  );
}
