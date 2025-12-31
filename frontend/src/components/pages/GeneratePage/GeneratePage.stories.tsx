import type { Meta, StoryObj } from '@storybook/react';
import { GeneratePage } from './GeneratePage';

const meta = {
  title: 'Pages/GeneratePage',
  component: GeneratePage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GeneratePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
