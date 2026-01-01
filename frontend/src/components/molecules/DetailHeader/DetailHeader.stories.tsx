import type { Meta, StoryObj } from '@storybook/react';
import { DetailHeader } from './DetailHeader';

const meta = {
  title: 'Molecules/DetailHeader',
  component: DetailHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DetailHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Fresh Citrus Accord',
    onBack: () => console.log('Back clicked'),
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Sophisticated White Floral Soap Type Formula with Extended Name',
    onBack: () => console.log('Back clicked'),
  },
};

export const ShortTitle: Story = {
  args: {
    title: 'Rose',
    onBack: () => console.log('Back clicked'),
  },
};
