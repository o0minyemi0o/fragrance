import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ChatInput } from './ChatInput';

const meta = {
  title: 'Molecules/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    onChange: () => {},
    onSend: () => alert('Message sent!'),
    disabled: false,
    placeholder: 'Enter your message.',
  },
};

export const WithText: Story = {
  args: {
    value: 'I want to create a fresh citrus fragrance',
    onChange: () => {},
    onSend: () => alert('Message sent!'),
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    value: '',
    onChange: () => {},
    onSend: () => {},
    disabled: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');

    const handleSend = () => {
      alert(`Sending: ${value}`);
      setValue('');
    };

    return (
      <ChatInput
        value={value}
        onChange={setValue}
        onSend={handleSend}
        placeholder="Type a message and press Enter..."
      />
    );
  },
};
