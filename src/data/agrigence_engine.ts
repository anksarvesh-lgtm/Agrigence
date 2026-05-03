
export interface MandiData {
  city: string;
  crop: string;
  min_price: number;
  max_price: number;
  arrival: string;
  unit: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
}

export interface SchemeData {
  slug: string;
  name: string;
  eligibility: string;
  benefits: string;
  application_process: string;
  official_link: string;
  highlights: string[];
  faqs: { q: string; a: string }[];
}

export interface CropData {
  slug: string;
  name: string;
  scientific_name: string;
  season: string;
  soil_type: string;
  fertilizer: string;
  yield: string;
  climate_req: string;
  sowing_depth: string;
  spacing: string;
  highlights: string[];
  faqs: { q: string; a: string }[];
}

export const mandiPrices: MandiData[] = [
  { city: 'Neemuch', crop: 'Soybean', min_price: 4200, max_price: 4850, arrival: '2500 Quintals', unit: 'Quintal', date: '2024-05-03', trend: 'up' },
  { city: 'Indore', crop: 'Wheat', min_price: 2100, max_price: 2450, arrival: '5000 Quintals', unit: 'Quintal', date: '2024-05-03', trend: 'stable' },
  { city: 'Mandsaur', crop: 'Garlic', min_price: 8000, max_price: 15000, arrival: '1200 Bags', unit: 'Quintal', date: '2024-05-03', trend: 'up' },
  // ... Imagine 50+ entries here
];

export const schemes: SchemeData[] = [
  {
    slug: 'pm-kisan-samman-nidhi',
    name: 'PM-Kisan Samman Nidhi',
    eligibility: 'Small and marginal farmers with landholdings up to 2 hectares.',
    benefits: '₹6,000 per year provided in three equal installments of ₹2,000.',
    application_process: 'Via PM-Kisan portal, CSC centers, or Nodal Officers (Agriculture).',
    official_link: 'https://pmkisan.gov.in',
    highlights: [
      'Direct Benefit Transfer (DBT) to bank accounts',
      'Covers 100% of small farm families',
      'Bi-annual KYC update mandatory'
    ],
    faqs: [
      { q: 'What is PM-Kisan?', a: 'PM-Kisan is a central sector scheme for providing income support to small and marginal farmer families.' },
      { q: 'Who is eligible?', a: 'All landholding farmer families are eligible, subject to certain exclusion criteria like institutional landholders.' },
      { q: 'How to check status?', a: 'Status can be checked on the official PM-Kisan portal using Aadhaar or Mobile number.' }
    ]
  }
];

export const cropAdvisory: CropData[] = [
  {
    slug: 'soybean-farming-guide',
    name: 'Soybean',
    scientific_name: 'Glycine max',
    season: 'Kharif (June - October)',
    soil_type: 'Well-drained loamy to heavy soil with pH 6.5 to 7.5',
    fertilizer: 'NPK 20:60:40 kg/ha',
    yield: '20-25 Quintals/ha',
    climate_req: 'Warm climate with 600-1000mm rainfall',
    sowing_depth: '3-4 cm',
    spacing: '45cm x 10cm',
    highlights: [
      'Top protein source for poultry and cattle',
      'Nitrogen-fixing legume crop',
      'Requires seed treatment with Rhizobium culture'
    ],
    faqs: [
      { q: 'Best time to sow Soybean?', a: 'The ideal time is between June 15 and July 15, immediately after the onset of monsoon.' },
      { q: 'Major pests of Soybean?', a: 'Girdle beetle and tobacco caterpillar are major pests. Use Pheromone traps for monitoring.' },
      { q: 'Water requirement?', a: 'Critical stages for irrigation are flowering and pod filling.' }
    ]
  }
];
