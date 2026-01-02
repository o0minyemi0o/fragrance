import type { Meta, StoryObj } from '@storybook/react';
import { NavigationItem } from './NavigationItem';

const meta = {
  title: 'Molecules/NavigationItem',
  component: NavigationItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Dashboard',
  },
};

export const Active: Story = {
  args: {
    label: 'Dashboard',
    active: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Dashboard',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Settings',
    icon: '⚙️',
  },
};

export const WithIconActive: Story = {
  args: {
    label: 'Settings',
    icon: '⚙️',
    active: true,
  },
};

export const Pills: Story = {
  args: {
    label: 'Profile',
    variant: 'pills',
  },
};

export const PillsActive: Story = {
  args: {
    label: 'Profile',
    variant: 'pills',
    active: true,
  },
};

export const Underline: Story = {
  args: {
    label: 'Analytics',
    variant: 'underline',
  },
};

export const UnderlineActive: Story = {
  args: {
    label: 'Analytics',
    variant: 'underline',
    active: true,
  },
};
