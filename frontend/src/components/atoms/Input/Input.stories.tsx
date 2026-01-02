import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: '입력 타입',
    },
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
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 Input
 */
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

/**
 * 값이 있는 Input
 */
export const WithValue: Story = {
  args: {
    defaultValue: 'Some value',
  },
};

/**
 * Email Input
 */
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

/**
 * Password Input
 */
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

/**
 * Number Input
 */
export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

/**
 * Error 상태
 */
export const Error: Story = {
  args: {
    error: true,
    defaultValue: 'Invalid value',
    placeholder: 'Enter text...',
  },
};

/**
 * Disabled 상태
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Disabled input',
  },
};

/**
 * Full Width
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    placeholder: 'Full width input',
  },
};

/**
 * 모든 상태 비교
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Input placeholder="Default" />
      <Input placeholder="With value" defaultValue="Some text" />
      <Input placeholder="Error" error defaultValue="Error value" />
      <Input placeholder="Disabled" disabled />
    </div>
  ),
};
