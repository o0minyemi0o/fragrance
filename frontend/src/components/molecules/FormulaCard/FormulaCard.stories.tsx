import type { Meta, StoryObj } from '@storybook/react';
import { FormulaCard } from './FormulaCard';

const meta = {
  title: 'Molecules/FormulaCard',
  component: FormulaCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormulaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Summer Citrus Breeze',
    totalIngredients: 6,
    type: 'Fresh Citrus',
    description: 'A bright and uplifting citrus composition perfect for warm summer days',
    ingredients: [
      { name: 'Bergamot Oil', percentage: 35, note: 'Top', role: 'Main citrus note' },
      { name: 'Lemon Oil', percentage: 25, note: 'Top', role: 'Bright freshness' },
      { name: 'Neroli Oil', percentage: 15, note: 'Heart', role: 'Floral bridge' },
      { name: 'Petit Grain', percentage: 10, note: 'Heart', role: 'Green support' },
      { name: 'Vetiver', percentage: 10, note: 'Base', role: 'Earthy depth' },
      { name: 'Ambroxan', percentage: 5, note: 'Base', role: 'Clean diffusion' },
    ],
    longevity: 'moderate (4-6 hours)',
    sillage: 'moderate',
    recommendation:
      'Perfect for daytime wear, casual summer events, and outdoor activities. Best applied after shower for maximum freshness.',
  },
};

export const WithSaveButton: Story = {
  args: {
    ...Default.args,
    onSave: () => alert('Formula saved!'),
    isSaving: false,
  },
};

export const Saving: Story = {
  args: {
    ...Default.args,
    onSave: () => {},
    isSaving: true,
  },
};

export const Minimal: Story = {
  args: {
    name: 'Simple Rose Accord',
    totalIngredients: 3,
    ingredients: [
      { name: 'Rose Oil Bulgarian', percentage: 50, note: 'Heart', role: 'Main note' },
      { name: 'Geranium Oil', percentage: 30, note: 'Heart', role: 'Supporting' },
      { name: 'Phenyl Ethyl Alcohol', percentage: 20, note: 'Heart', role: 'Rounding' },
    ],
  },
};

export const Complex: Story = {
  args: {
    name: 'Oriental Amber Fantasy',
    totalIngredients: 12,
    type: 'Oriental Woody',
    description: 'A rich and sophisticated oriental composition with warm amber and exotic spices',
    ingredients: [
      { name: 'Bergamot', percentage: 12, note: 'Top', role: 'Opening freshness' },
      { name: 'Pink Pepper', percentage: 8, note: 'Top', role: 'Spicy accent' },
      { name: 'Cardamom', percentage: 5, note: 'Top', role: 'Aromatic spice' },
      { name: 'Rose Absolute', percentage: 10, note: 'Heart', role: 'Floral richness' },
      { name: 'Jasmine Sambac', percentage: 8, note: 'Heart', role: 'Exotic floral' },
      { name: 'Patchouli', percentage: 12, note: 'Heart', role: 'Earthy depth' },
      { name: 'Labdanum', percentage: 15, note: 'Base', role: 'Amber warmth' },
      { name: 'Vanilla', percentage: 10, note: 'Base', role: 'Sweet comfort' },
      { name: 'Tonka Bean', percentage: 8, note: 'Base', role: 'Creamy sweetness' },
      { name: 'Sandalwood', percentage: 6, note: 'Base', role: 'Woody smooth' },
      { name: 'Amber', percentage: 4, note: 'Base', role: 'Warm glow' },
      { name: 'Musk', percentage: 2, note: 'Base', role: 'Soft trail' },
    ],
    longevity: 'long-lasting (8-12 hours)',
    sillage: 'strong',
    recommendation:
      'Best for evening wear, special occasions, and cooler weather. A luxurious scent that makes a statement. Apply sparingly to pulse points.',
    onSave: () => alert('Formula saved!'),
  },
};
