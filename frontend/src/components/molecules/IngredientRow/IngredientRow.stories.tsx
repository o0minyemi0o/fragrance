import type { Meta, StoryObj } from '@storybook/react';
import { IngredientRow } from './IngredientRow';

// Default table decorator for standard stories
const defaultDecorator = (Story: any) => (
  <div style={{ width: '100%', maxWidth: '1200px' }}>
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      border: '1px solid #ddd'
    }}>
      <thead>
        <tr>
          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '40px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>#</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '300px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Name</th>
          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '80px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>%</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '100px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Note</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Role</th>
        </tr>
      </thead>
      <tbody>
        <Story />
      </tbody>
    </table>
  </div>
);

// Compact table decorator for compact variant stories
const compactDecorator = (Story: any) => (
  <div style={{ width: '100%', maxWidth: '1200px' }}>
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      border: '1px solid #ddd'
    }}>
      <thead>
        <tr>
          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '30px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>#</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '250px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Name</th>
          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '100px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>%</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '120px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Note</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Role</th>
        </tr>
      </thead>
      <tbody>
        <Story />
      </tbody>
    </table>
  </div>
);

const meta = {
  title: 'Molecules/IngredientRow',
  component: IngredientRow,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof IngredientRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TopNote: Story = {
  args: {
    index: 0,
    ingredient: {
      name: 'Bergamot',
      percentage: 15.5,
      note: 'Top',
      role: 'Fresh opening',
    },
  },
  decorators: [defaultDecorator],
};

export const MiddleNote: Story = {
  args: {
    index: 1,
    ingredient: {
      name: 'Rose Absolute',
      percentage: 25.0,
      note: 'Middle',
      role: 'Heart',
    },
  },
  decorators: [defaultDecorator],
};

export const BaseNote: Story = {
  args: {
    index: 2,
    ingredient: {
      name: 'Sandalwood',
      percentage: 10.0,
      note: 'Base',
      role: 'Fixative',
    },
  },
  decorators: [defaultDecorator],
};

export const NoOptionalFields: Story = {
  args: {
    index: 3,
    ingredient: {
      name: 'Linalool',
      percentage: 5.0,
    },
  },
  decorators: [defaultDecorator],
};

export const LongName: Story = {
  args: {
    index: 4,
    ingredient: {
      name: 'Hedione (Methyl Dihydrojasmonate)',
      percentage: 8.5,
      note: 'Middle',
      role: 'Radiance and diffusion enhancer',
    },
  },
  decorators: [defaultDecorator],
};

// Compact variant stories
export const CompactTopNote: Story = {
  args: {
    index: 0,
    ingredient: {
      name: 'Bergamot',
      percentage: 15.5,
      note: 'Top',
      role: 'Fresh opening',
    },
    variant: 'compact',
  },
  decorators: [compactDecorator],
};

export const CompactMiddleNote: Story = {
  args: {
    index: 1,
    ingredient: {
      name: 'Rose Absolute',
      percentage: 25.0,
      note: 'Middle',
      role: 'Heart',
    },
    variant: 'compact',
  },
  decorators: [compactDecorator],
};

export const CompactBaseNote: Story = {
  args: {
    index: 2,
    ingredient: {
      name: 'Sandalwood',
      percentage: 10.0,
      note: 'Base',
      role: 'Fixative',
    },
    variant: 'compact',
  },
  decorators: [compactDecorator],
};

// Full table examples
export const FullTableDefault: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const ingredients = [
      { name: 'PHENYL ETHYL ALCOHOL', percentage: 35, note: 'middle', role: 'Rose Heart - Main Body' },
      { name: 'CITRONELLOL', percentage: 25, note: 'middle', role: 'Fresh Rosy Character' },
      { name: 'GERANIOL', percentage: 15, note: 'middle', role: 'Geranium-Rose Facet' },
      { name: 'GERANIUM OIL', percentage: 10, note: 'top', role: 'Natural Green-Rosy Top' },
      { name: 'beta-DAMASCENONE', percentage: 5, note: 'middle', role: 'Fruity Rose Depth' },
      { name: 'LINALOOL', percentage: 5, note: 'top', role: 'Fresh Floral Lift' },
      { name: 'ROSE OXIDE', percentage: 3, note: 'top', role: 'Natural Rose Character' },
      { name: 'DIMETHYL HEPTANOL', percentage: 2, note: 'middle', role: 'Green Metallic Nuance' },
    ];

    return (
      <div style={{ padding: '20px', width: '100%' }}>
        <h3 style={{ marginBottom: '10px', color: '#85933e' }}>Default Variant (LibraryView Style)</h3>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '5px 0',
          marginBottom: '15px'
        }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '40px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>#</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '300px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '80px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>%</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '100px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Note</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, idx) => (
              <IngredientRow key={idx} index={idx} ingredient={ing} variant="default" />
            ))}
          </tbody>
        </table>
      </div>
    );
  },
} as any;

export const FullTableCompact: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const ingredients = [
      { name: 'PHENYL ETHYL ALCOHOL', percentage: 35, note: 'middle', role: 'Rose Heart - Main Body' },
      { name: 'CITRONELLOL', percentage: 25, note: 'middle', role: 'Fresh Rosy Character' },
      { name: 'GERANIOL', percentage: 15, note: 'middle', role: 'Geranium-Rose Facet' },
      { name: 'GERANIUM OIL', percentage: 10, note: 'top', role: 'Natural Green-Rosy Top' },
      { name: 'beta-DAMASCENONE', percentage: 5, note: 'middle', role: 'Fruity Rose Depth' },
      { name: 'LINALOOL', percentage: 5, note: 'top', role: 'Fresh Floral Lift' },
      { name: 'ROSE OXIDE', percentage: 3, note: 'top', role: 'Natural Rose Character' },
      { name: 'DIMETHYL HEPTANOL', percentage: 2, note: 'middle', role: 'Green Metallic Nuance' },
    ];

    return (
      <div style={{ padding: '20px', width: '100%' }}>
        <h3 style={{ marginBottom: '10px', color: '#85933e' }}>Compact Variant (GeneratePage Style)</h3>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '5px 0',
          marginBottom: '15px'
        }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '30px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>#</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '250px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '100px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>%</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '120px', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Note</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', background: '#f5f6f3', fontWeight: 600, color: '#666' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, idx) => (
              <IngredientRow key={idx} index={idx} ingredient={ing} variant="compact" />
            ))}
          </tbody>
        </table>
      </div>
    );
  },
} as any;
