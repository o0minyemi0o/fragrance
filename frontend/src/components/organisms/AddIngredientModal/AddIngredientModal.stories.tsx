import type { Meta, StoryObj } from '@storybook/react';
import AddIngredientModal from './AddIngredientModal';

const meta: Meta<typeof AddIngredientModal> = {
  title: 'Organisms/AddIngredientModal',
  component: AddIngredientModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AddIngredientModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {
      console.log('Modal closed');
      alert('Modal closed');
    },
    onSubmit: async (data) => {
      console.log('Submitting ingredient:', data);
      alert(`Ingredient "${data.ingredient_name}" added!`);
    },
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    isOpen: true,
    onClose: () => {
      console.log('Modal closed');
    },
    onSubmit: async (data) => {
      console.log('Submitting ingredient:', data);
    },
    loading: true,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => {
      console.log('Modal closed');
    },
    onSubmit: async (data) => {
      console.log('Submitting ingredient:', data);
    },
    loading: false,
  },
};
