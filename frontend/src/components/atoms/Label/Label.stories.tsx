import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './Label';

const meta = {
  title: 'Atoms/Label',
  component: Label,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    required: {
      control: 'boolean',
      description: '필수 필드 표시',
    },
    children: {
      control: 'text',
      description: '라벨 텍스트',
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 Label
 */
export const Default: Story = {
  args: {
    children: 'Label Text',
  },
};

/**
 * Required Label
 */
export const Required: Story = {
  args: {
    required: true,
    children: 'Required Field',
  },
};

/**
 * With htmlFor
 */
export const WithHtmlFor: Story = {
  args: {
    htmlFor: 'input-id',
    children: 'Email Address',
  },
};

/**
 * 실제 사용 예시
 */
export const WithInput: Story = {
  render: () => (
    <div>
      <Label htmlFor="email" required>
        Email Address
      </Label>
      <input
        id="email"
        type="email"
        placeholder="Enter your email"
        style={{
          display: 'block',
          width: '100%',
          padding: '12px',
          fontSize: '1rem',
          border: '1px solid #ddd',
          borderRadius: '5px',
        }}
      />
    </div>
  ),
};
