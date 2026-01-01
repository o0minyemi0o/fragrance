// Mock data for DevelopMode Storybook stories
import type { Message, FormulaData } from '../components/organisms/DevelopMode';

export type { Message, FormulaData };

export const mockInitialMessage: Message = {
  id: '1',
  text: 'Hello! What kind of scent would you like to create? Please tell me your desired mood, season, specific notes, or intended use.',
  sender: 'ai',
  timestamp: new Date('2024-01-01T10:00:00'),
};

export const mockUserMessage: Message = {
  id: '2',
  text: 'I want to create a fresh citrus scent for summer',
  sender: 'user',
  timestamp: new Date('2024-01-01T10:01:00'),
};

export const mockAIResponseWithFormula: Message = {
  id: '3',
  text: 'Great choice! Here\'s a refreshing citrus formula perfect for summer:\n\nThis formula combines bright bergamot and lemon with subtle floral notes for a sophisticated summer scent.',
  sender: 'ai',
  timestamp: new Date('2024-01-01T10:02:00'),
  formula: {
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
      { name: 'Ambroxan', percentage: 5, note: 'Base', role: 'Clean diffusion' }
    ],
    longevity: 'moderate (4-6 hours)',
    sillage: 'moderate',
    recommendation: 'Perfect for daytime wear, casual summer events, and outdoor activities. Best applied after shower for maximum freshness.'
  }
};

// 기본 대화 (포뮬러 있음)
export const mockConversation: Message[] = [
  mockInitialMessage,
  mockUserMessage,
  mockAIResponseWithFormula,
];

// 짧은 대화 (포뮬러 없음)
export const mockShortConversation: Message[] = [
  mockInitialMessage,
  {
    id: '2',
    text: 'I want something woody and masculine',
    sender: 'user',
    timestamp: new Date('2024-01-01T10:01:00'),
  },
  {
    id: '3',
    text: 'Great choice! Woody fragrances are perfect for creating a sophisticated, masculine scent. Would you like it to be more:\n\n- **Fresh Woody** (with citrus or aquatic notes)\n- **Spicy Woody** (with pepper, cardamom)\n- **Oriental Woody** (with amber, vanilla)\n- **Smoky Woody** (with leather, tobacco)\n\nWhich direction interests you most?',
    sender: 'ai',
    timestamp: new Date('2024-01-01T10:02:00'),
  },
];

// 긴 대화 (여러 포뮬러)
export const mockLongConversation: Message[] = [
  mockInitialMessage,
  {
    id: '2',
    text: 'I need both a fresh citrus for summer and a warm vanilla for winter',
    sender: 'user',
    timestamp: new Date('2024-01-01T10:01:00'),
  },
  {
    id: '3',
    text: 'Excellent! I\'ll create two complementary formulas for you. Let me start with the summer citrus:',
    sender: 'ai',
    timestamp: new Date('2024-01-01T10:02:00'),
    formula: {
      name: 'Mediterranean Summer',
      totalIngredients: 5,
      type: 'Fresh Citrus',
      description: 'A bright, sparkling citrus with Mediterranean herbs',
      ingredients: [
        { name: 'Bergamot Oil', percentage: 40, note: 'Top', role: 'Bright opening' },
        { name: 'Lemon Oil', percentage: 30, note: 'Top', role: 'Fresh zest' },
        { name: 'Rosemary Oil', percentage: 15, note: 'Heart', role: 'Herbal accent' },
        { name: 'Sea Salt Accord', percentage: 10, note: 'Heart', role: 'Marine freshness' },
        { name: 'White Musk', percentage: 5, note: 'Base', role: 'Clean base' },
      ],
      longevity: 'light (3-4 hours)',
      sillage: 'light',
      recommendation: 'Perfect for beach days, summer mornings, and casual outdoor activities.',
    },
  },
  {
    id: '4',
    text: 'That looks perfect! Can you show me the winter one now?',
    sender: 'user',
    timestamp: new Date('2024-01-01T10:05:00'),
  },
  {
    id: '5',
    text: 'Here\'s your cozy winter vanilla formula:',
    sender: 'ai',
    timestamp: new Date('2024-01-01T10:06:00'),
    formula: {
      name: 'Velvet Winter Night',
      totalIngredients: 7,
      type: 'Warm Gourmand',
      description: 'A luxurious vanilla composition with spicy warmth and woody depth',
      ingredients: [
        { name: 'Cinnamon Bark', percentage: 8, note: 'Top', role: 'Spicy warmth' },
        { name: 'Orange Peel', percentage: 7, note: 'Top', role: 'Bright accent' },
        { name: 'Vanilla Absolute', percentage: 35, note: 'Heart', role: 'Main note' },
        { name: 'Tonka Bean', percentage: 20, note: 'Heart', role: 'Creamy sweetness' },
        { name: 'Sandalwood', percentage: 15, note: 'Base', role: 'Woody smooth' },
        { name: 'Amber', percentage: 10, note: 'Base', role: 'Warm glow' },
        { name: 'Benzoin', percentage: 5, note: 'Base', role: 'Balsamic depth' },
      ],
      longevity: 'long-lasting (8-10 hours)',
      sillage: 'strong',
      recommendation: 'Ideal for cold evenings, holiday gatherings, and intimate winter occasions. Best worn on sweaters and scarves.',
    },
  },
];

// 질문 많은 대화
export const mockDetailedConversation: Message[] = [
  mockInitialMessage,
  {
    id: '2',
    text: 'I want to create a rose fragrance',
    sender: 'user',
    timestamp: new Date('2024-01-01T10:01:00'),
  },
  {
    id: '3',
    text: 'Wonderful! Rose fragrances can vary greatly. To create the perfect formula for you, I need to know:\n\n**1. What style of rose?**\n- Fresh garden rose (green, dewy)\n- Classic romantic rose (soft, powdery)\n- Modern rose (spicy, bold)\n- Dark rose (woody, mysterious)\n\n**2. Who is this for?**\n- Personal use\n- Gift\n- Special occasion\n\n**3. When will it be worn?**\n- Daytime / Evening\n- Season preference',
    sender: 'ai',
    timestamp: new Date('2024-01-01T10:02:00'),
  },
  {
    id: '4',
    text: 'I want a classic romantic rose for evening wear, for myself',
    sender: 'user',
    timestamp: new Date('2024-01-01T10:03:00'),
  },
  {
    id: '5',
    text: 'Perfect! A classic romantic rose for evening is elegant and timeless. Here\'s a formula that captures the essence of a blooming rose garden at dusk:',
    sender: 'ai',
    timestamp: new Date('2024-01-01T10:04:00'),
    formula: {
      name: 'Evening Rose Garden',
      totalIngredients: 8,
      type: 'Floral Rose',
      description: 'A romantic, powdery rose with soft musk and elegant woods',
      ingredients: [
        { name: 'Rose Otto', percentage: 30, note: 'Heart', role: 'True rose scent' },
        { name: 'Rose Absolute', percentage: 20, note: 'Heart', role: 'Rich depth' },
        { name: 'Geranium', percentage: 12, note: 'Heart', role: 'Green support' },
        { name: 'Peony Accord', percentage: 10, note: 'Heart', role: 'Soft floral' },
        { name: 'Iris Butter', percentage: 8, note: 'Heart', role: 'Powdery elegance' },
        { name: 'Cedarwood', percentage: 10, note: 'Base', role: 'Woody frame' },
        { name: 'White Musk', percentage: 8, note: 'Base', role: 'Soft sensuality' },
        { name: 'Benzoin', percentage: 2, note: 'Base', role: 'Warm sweetness' },
      ],
      longevity: 'moderate-long (6-8 hours)',
      sillage: 'moderate',
      recommendation: 'Perfect for romantic dinners, elegant events, and special evenings. Apply to pulse points and hair for best diffusion.',
    },
  },
];
