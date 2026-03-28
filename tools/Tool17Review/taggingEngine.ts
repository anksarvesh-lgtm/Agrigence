import { Paper } from './literatureStore';

export function filterByTheme(papers: Paper[], theme: string): Paper[] {
  if (!theme || theme === 'All') return papers;
  return papers.filter(p => p.theme.toLowerCase() === theme.toLowerCase());
}

export function filterByCrop(papers: Paper[], crop: string): Paper[] {
  if (!crop || crop === 'All') return papers;
  return papers.filter(p => p.crop.toLowerCase() === crop.toLowerCase());
}

export function filterByYearRange(papers: Paper[], startYear: number, endYear: number): Paper[] {
  return papers.filter(p => p.year >= startYear && p.year <= endYear);
}

export function getUniqueThemes(papers: Paper[]): string[] {
  return Array.from(new Set(papers.map(p => p.theme))).filter(Boolean).sort();
}

export function getUniqueCrops(papers: Paper[]): string[] {
  return Array.from(new Set(papers.map(p => p.crop))).filter(Boolean).sort();
}
