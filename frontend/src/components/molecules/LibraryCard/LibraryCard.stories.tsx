import type { Meta, StoryObj } from '@storybook/react';
import { LibraryCard } from './LibraryCard';

const meta = {
  title: 'Molecules/LibraryCard',
  component: LibraryCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LibraryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Fresh Citrus Accord',
    type: 'Citrus',
    ingredientsCount: 5,
    onClick: () => console.log('Card clicked'),
  },
};

export const Active: Story = {
  args: {
    name: 'Floral Bouquet',
    type: 'Floral',
    ingredientsCount: 12,
    onClick: () => console.log('Card clicked'),
    active: true,
  },
};

export const LongName: Story = {
  args: {
    name: 'Sophisticated White Floral Soap Type Formula',
    type: 'White Floral',
    ingredientsCount: 24,
    onClick: () => console.log('Card clicked'),
  },
};

export const ManyIngredients: Story = {
  args: {
    name: 'Complex Chypre Accord',
    type: 'Chypre',
    ingredientsCount: 156,
    onClick: () => console.log('Card clicked'),
  },
};
