import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = {
  title: 'Atoms/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: '플레이스홀더',
    },
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
    rows: {
      control: 'number',
      description: '행 개수',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 Textarea
 */
export const Default: Story = {
  args: {
    placeholder: 'Enter description...',
  },
};

/**
 * 값이 있는 Textarea
 */
export const WithValue: Story = {
  args: {
    defaultValue: 'This is a multi-line\ntext area\nwith some content.',
  },
};

/**
 * Error 상태
 */
export const Error: Story = {
  args: {
    error: true,
    defaultValue: 'Invalid content',
  },
};

/**
 * Disabled 상태
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'This textarea is disabled',
  },
};

/**
 * Full Width
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    placeholder: 'Full width textarea',
  },
};

/**
 * Custom Rows
 */
export const CustomRows: Story = {
  args: {
    rows: 8,
    placeholder: 'This textarea has 8 rows',
  },
};

/**
 * 모든 상태 비교
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Textarea placeholder="Default" />
      <Textarea placeholder="With value" defaultValue="Some text content" />
      <Textarea placeholder="Error" error defaultValue="Error content" />
      <Textarea placeholder="Disabled" disabled />
    </div>
  ),
};
