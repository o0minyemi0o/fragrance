import React from 'react';
import { Navigation } from '../../organisms/Navigation/Navigation';
import styles from './MainLayout.module.css';

export interface MainLayoutProps {
  children: React.ReactNode;
  currentTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentTab = 'generate',
  onTabChange,
}) => {
  const navItems = [
    { id: 'generate', label: 'Generate' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'accords', label: 'Accords' },
    { id: 'formulas', label: 'Formulas' },
  ];

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Scent Designer</h1>
        <p>Craft Your Imagination into Scent</p>
      </header>

      <div className={styles.mainWrapper}>
        <Navigation
          items={navItems}
          activeId={currentTab}
          onItemClick={onTabChange}
          orientation="vertical"
        />

        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
};
