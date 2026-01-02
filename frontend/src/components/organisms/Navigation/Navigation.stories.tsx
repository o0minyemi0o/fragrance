import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navigation } from './Navigation';

const meta = {
  title: 'Organisms/Navigation',
  component: Navigation,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: '네비게이션 방향',
    },
    variant: {
      control: 'select',
      options: ['default', 'pills', 'underline'],
      description: '스타일 변형',
    },
  },
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems = [
  { id: 'generate', label: 'Generate' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'accords', label: 'Accords' },
  { id: 'formulas', label: 'Formulas' },
];

const itemsWithIcons = [
  { id: 'generate', label: 'Generate', icon: '✨' },
  { id: 'ingredients', label: 'Ingredients', icon: '🧪' },
  { id: 'accords', label: 'Accords', icon: '🎵' },
  { id: 'formulas', label: 'Formulas', icon: '📋' },
];

/**
 * Vertical Navigation (기본)
 */
export const Vertical: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('generate');

    return (
      <Navigation
        items={basicItems}
        activeId={activeId}
        onItemClick={setActiveId}
        orientation="vertical"
      />
    );
  },
};

/**
 * Horizontal Navigation
 */
export const Horizontal: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('generate');

    return (
      <Navigation
        items={basicItems}
        activeId={activeId}
        onItemClick={setActiveId}
        orientation="horizontal"
      />
    );
  },
};

/**
 * Pills Variant
 */
export const Pills: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('generate');

    return (
      <Navigation
        items={basicItems}
        activeId={activeId}
        onItemClick={setActiveId}
        variant="pills"
        orientation="horizontal"
      />
    );
  },
};

/**
 * Underline Variant
 */
export const Underline: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('generate');

    return (
      <Navigation
        items={basicItems}
        activeId={activeId}
        onItemClick={setActiveId}
        variant="underline"
        orientation="horizontal"
      />
    );
  },
};

/**
 * With Icons
 */
export const WithIcons: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('generate');

    return (
      <Navigation
        items={itemsWithIcons}
        activeId={activeId}
        onItemClick={setActiveId}
        orientation="vertical"
      />
    );
  },
};

/**
 * With Icons (Horizontal)
 */
export const WithIconsHorizontal: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('generate');

    return (
      <Navigation
        items={itemsWithIcons}
        activeId={activeId}
        onItemClick={setActiveId}
        orientation="horizontal"
      />
    );
  },
};

/**
 * With Disabled Items
 */
export const WithDisabled: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('generate');

    const itemsWithDisabled = [
      { id: 'generate', label: 'Generate' },
      { id: 'ingredients', label: 'Ingredients' },
      { id: 'accords', label: 'Accords', disabled: true },
      { id: 'formulas', label: 'Formulas' },
    ];

    return (
      <Navigation
        items={itemsWithDisabled}
        activeId={activeId}
        onItemClick={setActiveId}
        orientation="vertical"
      />
    );
  },
};

/**
 * 실제 사용 예시 - 앱 레이아웃
 */
export const AppLayoutExample: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('generate');

    const renderContent = () => {
      switch (activeId) {
        case 'generate':
          return <div style={{ padding: '2rem' }}><h2>Generate Page</h2><p>Create new formulas and accords...</p></div>;
        case 'ingredients':
          return <div style={{ padding: '2rem' }}><h2>Ingredients Page</h2><p>Manage your ingredient library...</p></div>;
        case 'accords':
          return <div style={{ padding: '2rem' }}><h2>Accords Page</h2><p>Browse saved accords...</p></div>;
        case 'formulas':
          return <div style={{ padding: '2rem' }}><h2>Formulas Page</h2><p>Browse saved formulas...</p></div>;
        default:
          return null;
      }
    };

    return (
      <div style={{ display: 'flex', gap: '2rem', minHeight: '400px' }}>
        <Navigation
          items={itemsWithIcons}
          activeId={activeId}
          onItemClick={setActiveId}
          orientation="vertical"
        />
        <div style={{ flex: 1, background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {renderContent()}
        </div>
      </div>
    );
  },
};

/**
 * All Variants Comparison
 */
export const AllVariants: Story = {
  render: () => {
    const [activeId1, setActiveId1] = useState('generate');
    const [activeId2, setActiveId2] = useState('generate');
    const [activeId3, setActiveId3] = useState('generate');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Default</h3>
          <Navigation
            items={basicItems}
            activeId={activeId1}
            onItemClick={setActiveId1}
            orientation="horizontal"
          />
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Pills</h3>
          <Navigation
            items={basicItems}
            activeId={activeId2}
            onItemClick={setActiveId2}
            variant="pills"
            orientation="horizontal"
          />
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Underline</h3>
          <Navigation
            items={basicItems}
            activeId={activeId3}
            onItemClick={setActiveId3}
            variant="underline"
            orientation="horizontal"
          />
        </div>
      </div>
    );
  },
};
