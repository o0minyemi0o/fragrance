import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardBody, CardFooter } from './Card';
import { Button } from '../../atoms/Button/Button';

const meta = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
      description: '카드 스타일 변형',
    },
    hoverable: {
      control: 'boolean',
      description: '호버 효과 여부',
    },
    clickable: {
      control: 'boolean',
      description: '클릭 가능 여부',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 Card
 */
export const Default: Story = {
  args: {
    variant: 'default',
    children: <CardBody>This is a basic card with default styling.</CardBody>,
  },
};

/**
 * Outlined Card
 */
export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: <CardBody>This is an outlined card.</CardBody>,
  },
};

/**
 * Elevated Card
 */
export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: <CardBody>This is an elevated card with more shadow.</CardBody>,
  },
};

/**
 * Hoverable Card
 */
export const Hoverable: Story = {
  args: {
    variant: 'default',
    hoverable: true,
    children: <CardBody>Hover over this card to see the effect!</CardBody>,
  },
};

/**
 * Clickable Card
 */
export const Clickable: Story = {
  args: {
    variant: 'default',
    clickable: true,
    hoverable: true,
    onClick: () => alert('Card clicked!'),
    children: <CardBody>Click this card!</CardBody>,
  },
};

/**
 * Card with Header
 */
export const WithHeader: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <h3>Card Title</h3>
        <p>Card subtitle or description</p>
      </CardHeader>
      <CardBody>
        <p>This is the card body with some content.</p>
      </CardBody>
    </Card>
  ),
};

/**
 * Card with Footer
 */
export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardBody>
        <h4>Card Content</h4>
        <p>This card has a footer with action buttons.</p>
      </CardBody>
      <CardFooter>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button variant="primary" size="sm">
            Confirm
          </Button>
        </div>
      </CardFooter>
    </Card>
  ),
};

/**
 * Full Card (Header + Body + Footer)
 */
export const FullCard: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <h3>Complete Card</h3>
        <p>With header, body, and footer</p>
      </CardHeader>
      <CardBody>
        <p>
          This is a complete card with all sections. The body contains the main content.
        </p>
      </CardBody>
      <CardFooter>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', color: '#999' }}>Last updated: 2 hours ago</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
            <Button variant="primary" size="sm">
              Save
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  ),
};

/**
 * 실제 사용 예시 - Ingredient Card
 */
export const IngredientCard: Story = {
  render: () => (
    <Card hoverable clickable style={{ maxWidth: '350px' }}>
      <CardHeader>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Lavender Essential Oil</h3>
        <p style={{ color: '#999', fontSize: '0.875rem' }}>Top Note</p>
      </CardHeader>
      <CardBody>
        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.6 }}>
          A fresh, floral, and herbaceous scent. Widely used for its calming and relaxing properties.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
          <div>
            <strong>INCI:</strong> Lavandula Angustifolia
          </div>
          <div>
            <strong>CAS:</strong> 8000-28-0
          </div>
        </div>
      </CardBody>
    </Card>
  ),
};

/**
 * 실제 사용 예시 - Formula Card
 */
export const FormulaCard: Story = {
  render: () => (
    <Card variant="elevated" style={{ maxWidth: '400px' }}>
      <CardHeader>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Fresh Citrus Accord</h3>
        <p style={{ color: '#999' }}>Created on 2024-01-15</p>
      </CardHeader>
      <CardBody>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          A bright and uplifting citrus blend with subtle floral undertones.
        </p>
        <div style={{ fontSize: '0.875rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Ingredients:</strong> 5
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Longevity:</strong> 3-4 hours
          </div>
          <div>
            <strong>Sillage:</strong> Moderate
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="sm" fullWidth>
            View Details
          </Button>
          <Button variant="primary" size="sm" fullWidth>
            Edit Formula
          </Button>
        </div>
      </CardFooter>
    </Card>
  ),
};

/**
 * Grid of Cards
 */
export const CardGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} hoverable clickable>
          <CardHeader>
            <h4>Card {i}</h4>
          </CardHeader>
          <CardBody>
            <p>This is card number {i} in the grid.</p>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
};
