import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessage } from './ChatMessage';

const meta = {
  title: 'Molecules/ChatMessage',
  component: ChatMessage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  args: {
    sender: 'user',
    text: 'I want to create a fresh citrus fragrance for summer.',
    timestamp: new Date('2024-01-01T10:00:00'),
  },
};

export const AIMessage: Story = {
  args: {
    sender: 'ai',
    text: 'Great choice! A fresh citrus fragrance is perfect for summer. Let me create a formula for you.',
    timestamp: new Date('2024-01-01T10:01:00'),
  },
};

export const AIMessageWithMarkdown: Story = {
  args: {
    sender: 'ai',
    text: `I'll create a **Summer Citrus Breeze** fragrance for you. Here are the key notes:

- **Top Notes**: Lemon, Bergamot
- **Heart Notes**: Orange Blossom, Neroli
- **Base Notes**: White Musk, Amber

This combination will give you a refreshing yet sophisticated scent.`,
    timestamp: new Date('2024-01-01T10:02:00'),
  },
};

export const LongMessage: Story = {
  args: {
    sender: 'ai',
    text: 'This is a very long message to demonstrate how the chat bubble handles extended text. The message should wrap properly and maintain readability even with lots of content. The bubble has a max-width of 70% to ensure it doesn\'t span the entire width of the container.',
    timestamp: new Date('2024-01-01T10:03:00'),
  },
};
