import type { Meta, StoryObj } from '@storybook/react';
import IngredientManager from './IngredientManager';

const meta: Meta<typeof IngredientManager> = {
  title: 'Organisms/IngredientManager',
  component: IngredientManager,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IngredientManager>;

export const Default: Story = {
  args: {},
};
