// Mock data for LibraryView stories

export const mockAccords = [
  {
    id: 1,
    name: "Rose Accord",
    type: "Classic Floral",
    ingredients_count: 7,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Citrus Fresh",
    type: "Fresh Citrus",
    ingredients_count: 5,
    created_at: "2024-01-14T14:20:00Z",
  },
  {
    id: 3,
    name: "Woody Amber",
    type: "Oriental Woody",
    ingredients_count: 6,
    created_at: "2024-01-13T09:15:00Z",
  },
  {
    id: 4,
    name: "Green Tea",
    type: "Fresh Green",
    ingredients_count: 4,
    created_at: "2024-01-12T16:45:00Z",
  },
];

export const mockFormulas = [
  {
    id: 1,
    name: "White Floral Soap Type Formula",
    type: "White Floral Soap",
    ingredients_count: 9,
    created_at: "2024-01-15T11:00:00Z",
  },
  {
    id: 2,
    name: "Summer Citrus Breeze",
    type: "Fresh Citrus",
    ingredients_count: 6,
    created_at: "2024-01-14T15:30:00Z",
  },
  {
    id: 3,
    name: "Velvet Winter Night",
    type: "Warm Gourmand",
    ingredients_count: 7,
    created_at: "2024-01-13T10:20:00Z",
  },
];

export const mockAccordDetail = {
  id: 1,
  name: "Rose Accord",
  type: "Classic Floral",
  description: "A classic, romantic rose accord with fresh green nuances",
  ingredients: [
    { name: "Rose Oil Bulgarian", percentage: 30, note: "Heart", role: "Main note" },
    { name: "Geranium Oil", percentage: 25, note: "Heart", role: "Supporting" },
    { name: "Phenyl Ethyl Alcohol", percentage: 20, note: "Heart", role: "Rosy bridge" },
    { name: "Citronellol", percentage: 15, note: "Heart", role: "Freshness" },
    { name: "Linalool", percentage: 5, note: "Top", role: "Lift" },
    { name: "Methyldihydrojasmonate", percentage: 3, note: "Base", role: "Depth" },
    { name: "Iso E Super", percentage: 2, note: "Base", role: "Diffusion" }
  ],
  longevity: "moderate",
  sillage: "moderate",
  recommendation: "Perfect for fresh feminine fragrances, bridal compositions, or as a heart note in sophisticated florals.",
  created_at: "2024-01-15T10:30:00Z",
};

export const mockFormulaDetail = {
  id: 1,
  name: "White Floral Soap Type Formula",
  type: "White Floral Soap",
  description: "A clean, fresh white floral composition perfect for soap and laundry applications",
  ingredients: [
    { name: "Jasmine Absolute", percentage: 15, note: "Heart", role: "Main floral" },
    { name: "Orange Blossom Absolute", percentage: 12, note: "Heart", role: "White floral" },
    { name: "Benzyl Acetate", percentage: 10, note: "Heart", role: "Jasmine booster" },
    { name: "Phenyl Ethyl Alcohol", percentage: 10, note: "Heart", role: "Rosy bridge" },
    { name: "Linalool", percentage: 8, note: "Top", role: "Fresh top" },
    { name: "Ylang Ylang Oil", percentage: 7, note: "Heart", role: "Creamy richness" },
    { name: "Indole", percentage: 0.5, note: "Heart", role: "Floral depth" },
    { name: "Galaxolide", percentage: 20, note: "Base", role: "Clean musk" },
    { name: "Iso E Super", percentage: 17.5, note: "Base", role: "Diffusion & longevity" }
  ],
  longevity: "good",
  sillage: "moderate to strong",
  stability_notes: "Stable in soap base. Test at 0.5-1% in final product.",
  recommendation: "Ideal for premium hand soaps, laundry detergents, and body wash formulations.",
  created_at: "2024-01-15T11:00:00Z",
};
