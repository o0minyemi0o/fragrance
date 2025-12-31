import type { Meta, StoryObj } from '@storybook/react';
import { FormulasPage } from './FormulasPage';

const meta = {
  title: 'Pages/FormulasPage',
  component: FormulasPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormulasPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
