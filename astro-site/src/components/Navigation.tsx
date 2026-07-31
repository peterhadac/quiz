import { useState, useEffect } from 'react';

const TABS = [
  { id: 'library', label: 'Library' },
  { id: 'builder', label: 'Builder' },
  { id: 'preview', label: 'Preview' },
  { id: 'history', label: 'History' },
] as const;

export default function Navigation({ onTabChange }: { onTabChange: (tabId: string) => void }) {
  const [activeTab, setActiveTab] = useState('library');

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.replace('#', '') || 'library';
      setActiveTab(hash);
    }

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function handleTabClick(tabId: string) {
    setActiveTab(tabId);
    onTabChange(tabId);
    window.location.hash = tabId;
  }

  return (
    <nav style={{ display: 'flex', gap: '4px' }}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          style={activeTab === tab.id ? {
            background: 'var(--clr-secondary)',
            fontWeight: '600',
          } : {}}
          aria-pressed={activeTab === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
