import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AnovaSummary, DescriptiveStats } from '../../src/core/statsEngine';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function exportStatisticalReport(
  type: string,
  result: any,
  data: any[],
  design?: string
) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // Emerald-600
  doc.text('Agricultural Statistical Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${timestamp}`, 14, 30);
  doc.text(`Analysis Type: ${type}${design ? ` (${design})` : ''}`, 14, 35);

  if (type === 'ANOVA' && result) {
    const res = result as AnovaSummary;
    
    // Summary Stats
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary Statistics', 14, 50);
    
    doc.autoTable({
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Grand Mean', res.grandMean.toFixed(4)],
        ['CV (%)', res.cv.toFixed(2)],
        ['CD (0.05)', res.lsd.toFixed(4)],
        ['F Calculated', res.fCalc.toFixed(4)],
        ['Significance', res.isSignificant ? 'Significant' : 'Non-Significant']
      ],
      theme: 'striped',
      headStyles: { fillStyle: [16, 185, 129] }
    });

    // ANOVA Table
    doc.text('ANOVA Table', 14, (doc as any).lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Source', 'DF', 'SS', 'MS', 'F']],
      body: res.table.map(row => [
        row.source,
        row.df,
        row.ss.toFixed(4),
        !isNaN(row.ms) ? row.ms.toFixed(4) : '-',
        !isNaN(row.f) ? row.f.toFixed(4) : '-'
      ]),
      theme: 'grid',
      headStyles: { fillStyle: [16, 185, 129] }
    });

    // Means Comparison
    doc.text('Means Comparison & Grouping', 14, (doc as any).lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Treatment', 'Mean', 'Grouping']],
      body: res.means.map(m => [
        m.treatment,
        m.mean.toFixed(4),
        m.grouping
      ]),
      theme: 'striped',
      headStyles: { fillStyle: [16, 185, 129] }
    });

  } else if (type === 'Descriptive' && result) {
    const res = result as DescriptiveStats;
    doc.setFontSize(12);
    doc.text('Descriptive Statistics', 14, 50);
    doc.autoTable({
      startY: 55,
      head: [['Statistic', 'Value']],
      body: [
        ['N', res.n],
        ['Mean', res.mean.toFixed(4)],
        ['Standard Deviation', res.sd.toFixed(4)],
        ['CV (%)', res.cv.toFixed(2)],
        ['Minimum', res.min.toFixed(4)],
        ['Maximum', res.max.toFixed(4)],
        ['Sum', res.sum.toFixed(4)]
      ],
      theme: 'striped',
      headStyles: { fillStyle: [16, 185, 129] }
    });
  } else if (type === 'Correlation' && result !== null) {
    doc.setFontSize(12);
    doc.text('Correlation Analysis', 14, 50);
    doc.autoTable({
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Pearson Correlation (r)', result.toFixed(4)],
        ['Strength', Math.abs(result) > 0.7 ? 'Strong' : Math.abs(result) > 0.3 ? 'Moderate' : 'Weak']
      ],
      theme: 'striped',
      headStyles: { fillStyle: [16, 185, 129] }
    });
  } else if (type === 'Regression' && result) {
    doc.setFontSize(12);
    doc.text('Regression Analysis', 14, 50);
    doc.autoTable({
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Equation', `Y = ${result.intercept.toFixed(4)} + ${result.slope.toFixed(4)}X`],
        ['R-Squared (R2)', result.r2.toFixed(4)],
        ['Slope (b)', result.slope.toFixed(4)],
        ['Intercept (a)', result.intercept.toFixed(4)]
      ],
      theme: 'striped',
      headStyles: { fillStyle: [16, 185, 129] }
    });
  }

  // Raw Data
  doc.addPage();
  doc.text('Input Data', 14, 22);
  const hasZ = data.some(d => d.z && d.z !== 'C1');
  doc.autoTable({
    startY: 30,
    head: [hasZ ? (design === 'Factorial2' ? ['Fact A', 'Rep', 'Fact B', 'Value'] : ['Trt', 'Row', 'Col', 'Value']) : ['Trt/Var', 'Rep/Group', 'Value']],
    body: data.map(d => hasZ ? [d.x, d.y, d.z, d.value] : [d.x, d.y, d.value]),
    theme: 'grid',
    headStyles: { fillStyle: [100, 116, 139] }
  });

  doc.save(`Statistical_Report_${type}_${Date.now()}.pdf`);
}
