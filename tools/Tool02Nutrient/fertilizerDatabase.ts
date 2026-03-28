import { FertilizerMaterial } from './nutrientTypes';

export const FERTILIZER_DATABASE: FertilizerMaterial[] = [
  // ORGANIC MANURES
  { id: 'fym', name: 'Farmyard Manure (FYM)', category: 'Organic', N: 0.5, P: 0.2, K: 0.5, efficiency: 0.35 },
  { id: 'compost', name: 'Compost', category: 'Organic', N: 1.0, P: 0.5, K: 1.0, efficiency: 0.40 },
  { id: 'vermicompost', name: 'Vermicompost', category: 'Organic', N: 1.75, P: 0.7, K: 1.2, efficiency: 0.45 },
  { id: 'green-manure', name: 'Green Manure (Dhaincha/Sunhemp)', category: 'Organic', N: 2.25, P: 0.5, K: 1.5, efficiency: 0.50 },
  { id: 'poultry-manure', name: 'Poultry Manure', category: 'Organic', N: 3.0, P: 2.5, K: 1.5, efficiency: 0.50 },
  { id: 'sheep-goat-manure', name: 'Sheep/Goat Manure', category: 'Organic', N: 2.5, P: 1.0, K: 2.0, efficiency: 0.45 },
  { id: 'pig-manure', name: 'Pig Manure', category: 'Organic', N: 0.6, P: 0.4, K: 0.5, efficiency: 0.35 },
  { id: 'neem-cake', name: 'Neem Cake', category: 'Organic', N: 4.5, P: 1.0, K: 1.5, efficiency: 0.50 },
  { id: 'mustard-cake', name: 'Mustard Cake', category: 'Organic', N: 5.0, P: 1.8, K: 1.2, efficiency: 0.50 },
  { id: 'groundnut-cake', name: 'Groundnut Cake', category: 'Organic', N: 7.0, P: 1.5, K: 1.3, efficiency: 0.50 },
  { id: 'soybean-meal', name: 'Soybean Meal', category: 'Organic', N: 7.0, P: 2.0, K: 1.5, efficiency: 0.50 },
  { id: 'bone-meal', name: 'Bone Meal', category: 'Organic', N: 3.5, P: 20.0, K: 0, efficiency: 0.40 },
  { id: 'blood-meal', name: 'Blood Meal', category: 'Organic', N: 11.5, P: 1.0, K: 0, efficiency: 0.55 },
  { id: 'fish-meal', name: 'Fish Meal', category: 'Organic', N: 6.5, P: 3.0, K: 1.5, efficiency: 0.50 },
  { id: 'feather-meal', name: 'Feather Meal', category: 'Organic', N: 13.0, P: 0, K: 0, efficiency: 0.55 },
  // CHEMICAL FERTILIZERS
  { id: 'urea', name: 'Urea', category: 'Chemical', N: 46, P: 0, K: 0, efficiency: 0.8 },
  { id: 'dap', name: 'DAP', category: 'Chemical', N: 18, P: 46, K: 0, efficiency: 0.8 },
  { id: 'mop', name: 'MOP', category: 'Chemical', N: 0, P: 0, K: 60, efficiency: 0.8 },
  { id: 'ssp', name: 'SSP', category: 'Chemical', N: 0, P: 16, K: 0, efficiency: 0.8 },
  { id: 'npk-12-32-16', name: 'NPK 12:32:16', category: 'Chemical', N: 12, P: 32, K: 16, efficiency: 0.8 },
  { id: 'npk-10-26-26', name: 'NPK 10:26:26', category: 'Chemical', N: 10, P: 26, K: 26, efficiency: 0.8 },
  { id: 'npk-19-19-19', name: 'NPK 19:19:19', category: 'Chemical', N: 19, P: 19, K: 19, efficiency: 0.8 },
  { id: 'npk-20-20-0', name: 'NPK 20:20:0', category: 'Chemical', N: 20, P: 20, K: 0, efficiency: 0.8 }
];
