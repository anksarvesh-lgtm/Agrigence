import { Paper } from './literatureStore';

export function validatePaper(paper: Partial<Paper>, existingPapers: Paper[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!paper.author || paper.author.trim() === '') {
    errors.push('Author is required.');
  }

  if (!paper.year || isNaN(paper.year) || paper.year < 1800 || paper.year > new Date().getFullYear() + 1) {
    errors.push('Valid year is required.');
  }

  if (!paper.title || paper.title.trim() === '') {
    errors.push('Title is required.');
  }

  if (!paper.findings || paper.findings.trim() === '') {
    errors.push('Key findings are required.');
  }

  if (paper.doi && paper.doi.trim() !== '') {
    const isDuplicate = existingPapers.some(p => p.doi === paper.doi && p.id !== paper.id);
    if (isDuplicate) {
      errors.push('A paper with this DOI already exists.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
