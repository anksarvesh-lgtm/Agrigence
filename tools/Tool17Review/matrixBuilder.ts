export function buildMatrix(papers: any[]): any[] {
  return papers.map(p => ({
    study: `${p.author}, ${p.year}`,
    theme: p.theme,
    result: p.findings,
    method: p.method,
    location: p.location
  }));
}
