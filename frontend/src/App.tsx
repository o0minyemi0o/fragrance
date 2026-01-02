import { useState } from 'react';
import './App.css';
import { MainLayout } from './components/layouts/MainLayout/MainLayout';
import { GeneratePage } from './components/pages/GeneratePage/GeneratePage';
import { IngredientsPage } from './components/pages/IngredientsPage/IngredientsPage';
import { AccordsPage } from './components/pages/AccordsPage/AccordsPage';
import { FormulasPage } from './components/pages/FormulasPage/FormulasPage';

function App() {
  const [currentTab, setCurrentTab] = useState<'generate' | 'ingredients' | 'accords' | 'formulas'>('generate');
  const [libraryKey, setLibraryKey] = useState(0);

  const handleTabChange = (tabId: string) => {
    const tab = tabId as 'generate' | 'ingredients' | 'accords' | 'formulas';

    if ((tab === 'accords' && currentTab === 'accords') ||
        (tab === 'formulas' && currentTab === 'formulas')) {
      setLibraryKey(prev => prev + 1);
    }

    setCurrentTab(tab);
  };

  return (
    <MainLayout
      currentTab={currentTab}
      onTabChange={handleTabChange}
    >
      {currentTab === 'generate' && <GeneratePage />}
      {currentTab === 'ingredients' && <IngredientsPage />}
      {currentTab === 'accords' && (
        <AccordsPage
          refreshKey={libraryKey}
          onRefresh={() => setLibraryKey(prev => prev + 1)}
        />
      )}
      {currentTab === 'formulas' && (
        <FormulasPage
          refreshKey={libraryKey}
          onRefresh={() => setLibraryKey(prev => prev + 1)}
        />
      )}
    </MainLayout>
  );
}

export default App;
