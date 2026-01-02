import type { Meta, StoryObj } from '@storybook/react';
import FormulationMode from './FormulationMode';

const meta: Meta<typeof FormulationMode> = {
  title: 'Organisms/FormulationMode',
  component: FormulationMode,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormulationMode>;

export const AccordMode: Story = {
  args: {
    onGenerate: (mode, type) => {
      console.log(`Generating ${mode}:`, type);
      alert(`Generating ${mode}: ${type}`);
    },
    loading: false,
    initialMode: 'accord',
  },
};

export const FormulaMode: Story = {
  args: {
    onGenerate: (mode, type) => {
      console.log(`Generating ${mode}:`, type);
      alert(`Generating ${mode}: ${type}`);
    },
    loading: false,
    initialMode: 'formula',
  },
};

export const DevelopMode: Story = {
  args: {
    onGenerate: (mode, type) => {
      console.log(`Generating ${mode}:`, type);
      alert(`Generating ${mode}: ${type}`);
    },
    loading: false,
    initialMode: 'develop',
    onExportFormula: (formula) => {
      console.log('Exporting formula:', formula);
      alert('Formula exported!');
    },
  },
};

export const Loading: Story = {
  args: {
    onGenerate: (mode, type) => {
      console.log(`Generating ${mode}:`, type);
    },
    loading: true,
    initialMode: 'accord',
  },
};
