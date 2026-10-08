
import { RegionConfig } from './landTypes';

export const REGION_DATABASE: Record<string, RegionConfig> = {
  'Uttar Pradesh': {
    name: 'Uttar Pradesh',
    units: {
      'Bigha (Standard)': 0.2529, // Standard
      'Biswa': 0.0126
    },
    subRegions: {
      'Western UP': { 'Bigha': 0.0625, 'Biswa': 0.003125 }, // Kacha Bigha
      'Central UP': { 'Bigha': 0.25, 'Biswa': 0.0125 },
      'Eastern UP (Pakka)': { 'Bigha': 0.281, 'Biswa': 0.01405 },
      'Official Average': { 'Bigha': 0.27, 'Biswa': 0.0135 }
    }
  },
  'Punjab': {
    name: 'Punjab',
    units: {
      'Bigha': 0.0843,
      'Kanal': 0.050585, // 1/8 acre
      'Marla': 0.002529, // 1/160 acre
      'Killa (Acre)': 0.404686
    }
  },
  'Haryana': {
    name: 'Haryana',
    units: {
      'Bigha': 0.0843,
      'Kanal': 0.050585,
      'Marla': 0.002529,
      'Killa (Acre)': 0.404686
    }
  },
  'Rajasthan': {
    name: 'Rajasthan',
    units: {
      'Bigha (Pucca)': 0.2529,
      'Bigha (Kachha)': 0.1618,
      'Biswa': 0.0126
    }
  },
  'Gujarat': {
    name: 'Gujarat',
    units: {
      'Bigha': 0.1618,
      'Guntha': 0.010117,
      'Vigha': 0.2378 // Some regions
    }
  },
  'Maharashtra': {
    name: 'Maharashtra',
    units: {
      'Guntha': 0.010117,
      'Acre': 0.404686,
      'Hectare': 1
    }
  },
  'Karnataka': {
    name: 'Karnataka',
    units: {
      'Gunta': 0.010117,
      'Acre': 0.404686,
      'Cent': 0.004047
    }
  },
  'Tamil Nadu': {
    name: 'Tamil Nadu',
    units: {
      'Ground': 0.02229, // 2400 sq ft
      'Cent': 0.004047, // 435.6 sq ft
      'Acre': 0.404686
    }
  },
  'West Bengal': {
    name: 'West Bengal',
    units: {
      'Bigha': 0.1338, // 1/3 acre approx (Standard in WB is 1333.33 sqm ~ 0.1333 ha)
      'Katha': 0.00669, // 1/20 bigha
      'Chatak': 0.000418
    }
  },
  'Bihar': {
    name: 'Bihar',
    units: {
      'Bigha': 0.2529, // Varies, often standard acre based
      'Katha': 0.01265,
      'Dhur': 0.000632
    }
  }
};
