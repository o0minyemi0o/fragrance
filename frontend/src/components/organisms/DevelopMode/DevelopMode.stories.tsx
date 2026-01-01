import type { Meta, StoryObj } from '@storybook/react';
import DevelopMode from './DevelopMode';
import {
  mockConversation,
  mockShortConversation,
  mockLongConversation,
  mockDetailedConversation,
} from '../../../mocks/developModeMockData';

const meta = {
  title: 'Organisms/DevelopMode',
  component: DevelopMode,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DevelopMode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithSimpleConversation: Story = {
  args: {
    initialMessages: mockConversation,
  },
};

export const ShortConversation: Story = {
  args: {
    initialMessages: mockShortConversation,
  },
};

export const LongConversation: Story = {
  args: {
    initialMessages: mockLongConversation,
  },
};

export const DetailedConversation: Story = {
  args: {
    initialMessages: mockDetailedConversation,
  },
};

export const WithExportHandler: Story = {
  args: {
    initialMessages: mockConversation,
    onExportFormula: (formula) => {
      console.log('Formula exported:', formula);
      alert(`Formula "${formula.name}" exported!`);
    },
  },
};
