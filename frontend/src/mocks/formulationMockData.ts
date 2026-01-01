// Mock data for Storybook stories

export const mockAccordResult = {
  name: "Rose Accord",
  type: "Rose Accord",
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
  recommendation: "Perfect for fresh feminine fragrances, bridal compositions, or as a heart note in sophisticated florals."
};

export const mockFormulaResult = {
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
  recommendation: "Ideal for premium hand soaps, laundry detergents, and body wash formulations. The clean white floral profile appeals to a wide consumer base."
};

export const mockErrorMessage = "Failed to generate formulation. Please try again.";
