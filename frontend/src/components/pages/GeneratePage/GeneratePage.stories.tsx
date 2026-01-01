import type { Meta, StoryObj } from '@storybook/react';
import { GeneratePage } from './GeneratePage';
import { mockAccordResult, mockFormulaResult, mockErrorMessage } from '../../../mocks/formulationMockData';

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

export const Loading: Story = {
  args: {
    initialLoading: true,
    initialMode: 'accord',
  },
};

export const WithAccordResult: Story = {
  args: {
    initialResult: mockAccordResult,
    initialMode: 'accord',
  },
};

export const WithFormulaResult: Story = {
  args: {
    initialResult: mockFormulaResult,
    initialMode: 'formula',
  },
};

export const WithError: Story = {
  args: {
    initialError: mockErrorMessage,
  },
};

export const DevelopMode: Story = {
  args: {
    initialMode: 'develop',
  },
};
