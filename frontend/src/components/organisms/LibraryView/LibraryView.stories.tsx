import type { Meta, StoryObj } from '@storybook/react';
import LibraryView from './LibraryView';

const meta: Meta<typeof LibraryView> = {
  title: 'Organisms/LibraryView',
  component: LibraryView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LibraryView>;

export const AccordsView: Story = {
  args: {
    mode: 'accords',
    onRefresh: () => {
      console.log('Refreshing accords');
    },
  },
};

export const FormulasView: Story = {
  args: {
    mode: 'formulas',
    onRefresh: () => {
      console.log('Refreshing formulas');
    },
  },
};
