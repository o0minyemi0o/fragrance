import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormField } from './FormField';

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '라벨 텍스트',
    },
    required: {
      control: 'boolean',
      description: '필수 필드 여부',
    },
    type: {
      control: 'select',
      options: ['input', 'textarea', 'select'],
      description: '입력 필드 타입',
    },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 Input FormField
 */
export const InputField: Story = {
  args: {
    id: 'email',
    label: 'Email Address',
    type: 'input',
    placeholder: 'Enter your email',
  },
};

/**
 * Required Input
 */
export const RequiredField: Story = {
  args: {
    id: 'name',
    label: 'Name',
    type: 'input',
    required: true,
    placeholder: 'Enter your name',
  },
};

/**
 * With Help Text
 */
export const WithHelpText: Story = {
  args: {
    id: 'password',
    label: 'Password',
    type: 'input',
    placeholder: 'Enter password',
    helpText: 'Password must be at least 8 characters',
  },
};

/**
 * With Error
 */
export const WithError: Story = {
  args: {
    id: 'username',
    label: 'Username',
    type: 'input',
    defaultValue: 'ab',
    errorMessage: 'Username must be at least 3 characters',
  },
};

/**
 * Textarea FormField
 */
export const TextareaField: Story = {
  args: {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter description',
    rows: 4,
  },
};

/**
 * Select FormField
 */
export const SelectField: Story = {
  args: {
    id: 'note',
    label: 'Note Family',
    type: 'select',
    required: true,
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
 * 실제 사용 예시 - 로그인 폼
 */
export const LoginForm: Story = {
  render: () => (
    <form style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <FormField
        id="login-email"
        label="Email"
        type="input"
        required
        placeholder="Enter your email"
      />
      <FormField
        id="login-password"
        label="Password"
        type="input"
        required
        placeholder="Enter your password"
      />
    </form>
  ),
};

/**
 * 실제 사용 예시 - 재료 추가 폼
 */
export const IngredientForm: Story = {
  render: () => (
    <form style={{ width: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <FormField
        id="ingredient-name"
        label="Ingredient Name"
        type="input"
        required
        placeholder="e.g., Lavender Essential Oil"
      />
      <FormField
        id="ingredient-note"
        label="Note Family"
        type="select"
        required
      >
        <option value="">Select note family...</option>
        <option value="top">Top Note</option>
        <option value="middle">Middle Note</option>
        <option value="base">Base Note</option>
      </FormField>
      <FormField
        id="ingredient-description"
        label="Description"
        type="textarea"
        placeholder="Describe the scent profile..."
        rows={4}
        helpText="Provide details about the scent characteristics"
      />
    </form>
  ),
};
