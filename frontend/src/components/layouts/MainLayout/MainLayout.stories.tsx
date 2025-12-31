import type { Meta, StoryObj } from '@storybook/react';
import { MainLayout } from './MainLayout';

const meta = {
  title: 'Layouts/MainLayout',
  component: MainLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MainLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentTab: 'generate',
    children: (
      <div style={{ padding: '20px' }}>
        <h2>Page Content Goes Here</h2>
        <p>This is where the page content would be rendered.</p>
      </div>
    ),
  },
};

export const IngredientsTab: Story = {
  args: {
    currentTab: 'ingredients',
    children: (
      <div style={{ padding: '20px' }}>
        <h2>Ingredients Page</h2>
        <p>Ingredient management interface would appear here.</p>
      </div>
    ),
  },
};

export const AccordsTab: Story = {
  args: {
    currentTab: 'accords',
    children: (
      <div style={{ padding: '20px' }}>
        <h2>My Accords</h2>
        <p>Saved accords would be displayed here.</p>
      </div>
    ),
  },
};
