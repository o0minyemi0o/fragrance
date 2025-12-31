import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const meta = {
  title: 'Atoms/Select',
  component: Select,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
      description: '에러 상태',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    fullWidth: {
      control: 'boolean',
      description: '전체 너비',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 Select
 */
export const Default: Story = {
  args: {
    children: (
      <>
        <option value="">Select an option...</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </>
    ),
  },
};

/**
 * With Default Value
 */
export const WithDefaultValue: Story = {
  args: {
    defaultValue: '2',
    children: (
      <>
        <option value="">Select an option...</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2 (Selected)</option>
        <option value="3">Option 3</option>
      </>
    ),
  },
};

/**
 * Error 상태
 */
export const Error: Story = {
  args: {
    error: true,
    children: (
      <>
        <option value="">Select an option...</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </>
    ),
  },
};

/**
 * Disabled 상태
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <option value="">Select an option...</option>
        <option value="1">Option 1</option>
      </>
    ),
  },
};

/**
 * Full Width
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: (
      <>
        <option value="">Select an option...</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </>
    ),
  },
};

/**
 * Note Family Select (실제 사용 예시)
 */
export const NoteFamily: Story = {
  args: {
    fullWidth: true,
    children: (
      <>
        <option value="">Select note family...</option>
        <option value="top">Top Note</option>
        <option value="middle">Middle Note</option>
        <option value="base">Base Note</option>
      </>
    ),
  },
};

/**
 * 모든 상태 비교
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Select>
        <option>Default</option>
        <option>Option 2</option>
      </Select>
      <Select error>
        <option>Error State</option>
        <option>Option 2</option>
      </Select>
      <Select disabled>
        <option>Disabled</option>
      </Select>
    </div>
  ),
};
