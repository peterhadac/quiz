import { useState, useMemo, useEffect } from 'react';
import LibraryView from './LibraryView';
import BuilderView from './BuilderView';
import PreviewView from './PreviewView';
import HistoryView from './HistoryView';
import type { QuestionWithMeta } from '../types/question';

export default function App({ questions }: { questions: QuestionWithMeta[] }) {
  if (!questions) return null;
  
  const [activeTab, setActiveTab] = useState('library');

  return (
    <>
      <header style={{ padding: '8px 16px', borderBottom: '1px solid var(--clr-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', color: 'var(--clr-primary)' }}>Quiz Builder</h1>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {['library', 'builder', 'preview', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'var(--clr-secondary)' : 'transparent',
                  fontWeight: activeTab === tab ? '600' : '400',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
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
