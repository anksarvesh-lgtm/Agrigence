import { Plot } from './experimentTypes';

export function exportToCSV(plots: Plot[], filename: string) {
  const headers = ['Block', 'Plot Number', 'Treatment', 'Main Plot', 'Sub Plot'];
  
  const rows = plots.map(p => [
    p.block,
    p.plotNumber,
    `"${p.treatment}"`,
    `"${p.mainPlot || ''}"`,
    `"${p.subPlot || ''}"`
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
