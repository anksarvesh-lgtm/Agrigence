import { Paper } from './literatureStore';

export function formatAPA(p: Paper): string {
  return `${p.author} (${p.year}). ${p.title}. ${p.journal}. ${p.doi ? `https://doi.org/${p.doi}` : ''}`.trim();
}

export function formatHarvard(p: Paper): string {
  return `${p.author}, ${p.year}. ${p.title}. ${p.journal}.`;
}

export function formatICAR(p: Paper): string {
  return `${p.author}. ${p.year}. ${p.title}. ${p.journal}.`;
}
