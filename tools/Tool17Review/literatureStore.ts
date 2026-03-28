export interface Paper {
  id: string;
  author: string;
  year: number;
  title: string;
  journal: string;
  doi?: string;
  crop: string;
  theme: string;
  findings: string;
  method: string;
  location: string;
}

export function savePapers(papers: Paper[]): void {
  try {
    localStorage.setItem('agri_review_papers', JSON.stringify(papers));
  } catch (e) {
    console.error('Failed to save papers', e);
  }
}

export function loadPapers(): Paper[] {
  try {
    const data = localStorage.getItem('agri_review_papers');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load papers', e);
    return [];
  }
}
