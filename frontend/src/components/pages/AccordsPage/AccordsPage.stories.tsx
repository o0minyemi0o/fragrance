import type { Meta, StoryObj } from '@storybook/react';
import { AccordsPage } from './AccordsPage';

const meta = {
  title: 'Pages/AccordsPage',
  component: AccordsPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AccordsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
