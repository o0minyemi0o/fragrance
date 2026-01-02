import type { Meta, StoryObj } from '@storybook/react';
import { IngredientsPage } from './IngredientsPage';

const meta = {
  title: 'Pages/IngredientsPage',
  component: IngredientsPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof IngredientsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
