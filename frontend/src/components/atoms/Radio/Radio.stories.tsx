import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';
import { useState } from 'react';

const meta = {
  title: 'Atoms/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Radio Option',
    value: 'option1',
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: 'Selected Option',
    value: 'option1',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Option',
    value: 'option1',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled & Selected',
    value: 'option1',
    checked: true,
    disabled: true,
  },
};

// Interactive Radio Group
export const RadioGroup = () => {
  const [selected, setSelected] = useState('accord');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Radio
        label="Accord Mode (Simple & Clear)"
        value="accord"
        checked={selected === 'accord'}
        onChange={(e) => setSelected(e.target.value)}
        name="mode"
      />
      <Radio
        label="Formula Mode (Complete Product)"
        value="formula"
        checked={selected === 'formula'}
        onChange={(e) => setSelected(e.target.value)}
        name="mode"
      />
      <Radio
        label="Develop Mode (Conversation)"
        value="develop"
        checked={selected === 'develop'}
        onChange={(e) => setSelected(e.target.value)}
        name="mode"
      />
      <p style={{ marginTop: '20px', color: '#666' }}>
        Selected: <strong>{selected}</strong>
      </p>
    </div>
  );
};
