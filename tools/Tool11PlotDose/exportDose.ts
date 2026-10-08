export function exportDoseToCSV(data: any[], filename: string) {
  const headers = ['Treatment', 'Field Rate', 'Plot Dose', 'Unit', 'Total Required'];
  const rows = data.map(d => [
    `"${d.treatment}"`,
    `"${d.fieldRate}"`,
    d.plotDose.toFixed(4),
    `"${d.unit}"`,
    d.totalRequired.toFixed(4)
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
