
/**
 * STCR Coefficients
 * NR: Nutrient Requirement (kg/q of grain/yield)
 * CF: Contribution from Fertilizer (%)
 * CS: Contribution from Soil (%)
 * 
 * NR is derived from user-provided ranges (Midpoint / 50) to maintain STCR formula integrity.
 */
export const STCR_COEFFICIENTS: Record<string, {
  N: { NR: number; CF: number; CS: number };
  P: { NR: number; CF: number; CS: number };
  K: { NR: number; CF: number; CS: number };
}> = {
  'Major Cereals (Rice, Wheat, Maize, etc.)': {
    N: { NR: 2.60, CF: 45, CS: 30 },
    P: { NR: 1.10, CF: 25, CS: 40 },
    K: { NR: 0.80, CF: 60, CS: 35 }
  },
  'Millets / Minor Cereals (Bajra, Ragi, etc.)': {
    N: { NR: 1.20, CF: 45, CS: 30 },
    P: { NR: 0.60, CF: 25, CS: 40 },
    K: { NR: 0.60, CF: 60, CS: 35 }
  },
  'Pulses / Grain Legumes (Gram, Lentil, etc.)': {
    N: { NR: 0.45, CF: 45, CS: 30 },
    P: { NR: 1.10, CF: 25, CS: 40 },
    K: { NR: 0.70, CF: 60, CS: 35 }
  },
  'Oilseed Crops (Mustard, Soybean, etc.)': {
    N: { NR: 1.80, CF: 45, CS: 30 },
    P: { NR: 1.20, CF: 25, CS: 40 },
    K: { NR: 1.20, CF: 60, CS: 35 }
  },
  'Root Crops (Carrot, Radish, etc.)': {
    N: { NR: 1.80, CF: 45, CS: 30 },
    P: { NR: 1.00, CF: 25, CS: 40 },
    K: { NR: 1.80, CF: 60, CS: 35 }
  },
  'Tuber Crops (Potato, Cassava, etc.)': {
    N: { NR: 2.80, CF: 45, CS: 30 },
    P: { NR: 1.40, CF: 25, CS: 40 },
    K: { NR: 2.80, CF: 60, CS: 35 }
  },
  'Sugar & Starch Crops (Sugarcane, etc.)': {
    N: { NR: 4.50, CF: 45, CS: 30 },
    P: { NR: 1.80, CF: 25, CS: 40 },
    K: { NR: 3.70, CF: 60, CS: 35 }
  },
  'Fiber Crops (Cotton, Jute, etc.)': {
    N: { NR: 2.30, CF: 45, CS: 30 },
    P: { NR: 1.10, CF: 25, CS: 40 },
    K: { NR: 1.40, CF: 60, CS: 35 }
  },
  'Vegetable Crops (Leafy - Spinach, etc.)': {
    N: { NR: 3.00, CF: 45, CS: 30 },
    P: { NR: 1.30, CF: 25, CS: 40 },
    K: { NR: 1.80, CF: 60, CS: 35 }
  },
  'Vegetable Crops (Fruiting - Tomato, etc.)': {
    N: { NR: 3.40, CF: 45, CS: 30 },
    P: { NR: 1.60, CF: 25, CS: 40 },
    K: { NR: 2.30, CF: 60, CS: 35 }
  },
  'Cucurbits (Pumpkin, Cucumber, etc.)': {
    N: { NR: 2.30, CF: 45, CS: 30 },
    P: { NR: 1.30, CF: 25, CS: 40 },
    K: { NR: 2.20, CF: 60, CS: 35 }
  },
  'Plantation Crops (Tea, Coffee, etc.)': {
    N: { NR: 3.70, CF: 45, CS: 30 },
    P: { NR: 1.20, CF: 25, CS: 40 },
    K: { NR: 3.70, CF: 60, CS: 35 }
  },
  'Fruit Crops (Deciduous - Apple, etc.)': {
    N: { NR: 2.30, CF: 45, CS: 30 },
    P: { NR: 1.00, CF: 25, CS: 40 },
    K: { NR: 2.30, CF: 60, CS: 35 }
  },
  'Fruit Crops (Tropical - Mango, etc.)': {
    N: { NR: 3.00, CF: 45, CS: 30 },
    P: { NR: 1.30, CF: 25, CS: 40 },
    K: { NR: 3.00, CF: 60, CS: 35 }
  },
  'Banana & High Biomass Fruits': {
    N: { NR: 5.00, CF: 45, CS: 30 },
    P: { NR: 1.50, CF: 25, CS: 40 },
    K: { NR: 5.00, CF: 60, CS: 35 }
  },
  'Forage Crops (Berseem, Alfalfa, etc.)': {
    N: { NR: 4.00, CF: 45, CS: 30 },
    P: { NR: 1.20, CF: 25, CS: 40 },
    K: { NR: 2.80, CF: 60, CS: 35 }
  },
  'Spices & Medicinal Crops (Turmeric, etc.)': {
    N: { NR: 2.10, CF: 45, CS: 30 },
    P: { NR: 1.10, CF: 25, CS: 40 },
    K: { NR: 1.60, CF: 60, CS: 35 }
  },
  'Oil Palm & Coconut': {
    N: { NR: 3.20, CF: 45, CS: 30 },
    P: { NR: 1.00, CF: 25, CS: 40 },
    K: { NR: 5.00, CF: 60, CS: 35 }
  },
  'Vine Crops (Grapes, etc.)': {
    N: { NR: 2.50, CF: 45, CS: 30 },
    P: { NR: 1.30, CF: 25, CS: 40 },
    K: { NR: 3.00, CF: 60, CS: 35 }
  },
  'Pseudo-cereals (Quinoa, Amaranth, etc.)': {
    N: { NR: 1.80, CF: 45, CS: 30 },
    P: { NR: 0.90, CF: 25, CS: 40 },
    K: { NR: 0.90, CF: 60, CS: 35 }
  },
  'Other': {
    N: { NR: 2.50, CF: 45, CS: 30 },
    P: { NR: 0.60, CF: 25, CS: 40 },
    K: { NR: 2.20, CF: 60, CS: 35 }
  }
};
