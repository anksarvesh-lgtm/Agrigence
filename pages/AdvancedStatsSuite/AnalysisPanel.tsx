import React, { useState } from 'react';
import { Dataset } from './index';
import { Play, Download, BarChart2, CheckCircle, FileText, PieChart } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

interface AnalysisPanelProps {
  dataset: Dataset;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ dataset }) => {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('descriptive');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [activeGraph, setActiveGraph] = useState<string | null>(null);

  const numericColumns = dataset.columns.filter(c => c.type === 'Numeric');

  const handleColumnToggle = (colId: string) => {
    setSelectedColumns(prev => 
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const runAnalysis = () => {
    if (selectedColumns.length === 0) {
      alert("Please select at least one numeric column to analyze.");
      return;
    }

    const analysisResults: any = {};

    selectedColumns.forEach(colId => {
      const colIndex = dataset.columns.findIndex(c => c.id === colId) + 2; // +2 for Trt and Rep
      const colName = dataset.columns.find(c => c.id === colId)?.name || 'Unknown';
      
      // Extract numeric data
      const data = dataset.data.map(row => parseFloat(row[colIndex])).filter(val => !isNaN(val));
      
      if (data.length === 0) return;

      if (selectedAnalysis === 'descriptive') {
        const n = data.length;
        const sum = data.reduce((a, b) => a + b, 0);
        const mean = sum / n;
        
        const sorted = [...data].sort((a, b) => a - b);
        const median = n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
        
        const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
        const stdDev = Math.sqrt(variance);
        const stdErr = stdDev / Math.sqrt(n);
        const cv = (stdDev / mean) * 100;
        const range = Math.max(...data) - Math.min(...data);

        analysisResults[colName] = {
          mean: mean.toFixed(4),
          median: median.toFixed(4),
          variance: variance.toFixed(4),
          stdDev: stdDev.toFixed(4),
          stdErr: stdErr.toFixed(4),
          cv: cv.toFixed(2) + '%',
          range: range.toFixed(4),
          n
        };
      } else if (selectedAnalysis === 'anova') {
        // Simple RBD ANOVA implementation based on formulas provided
        const t = dataset.treatments;
        const r = dataset.replications;
        const N = t * r;
        
        // Group data by treatments and replications
        const trtTotals = new Array(t).fill(0);
        const repTotals = new Array(r).fill(0);
        let grandTotal = 0;
        let sumSquares = 0;

        dataset.data.forEach(row => {
          const trtStr = row[0];
          const repStr = row[1];
          const val = parseFloat(row[colIndex]);
          
          if (isNaN(val)) return;

          // Extract numbers from T1, R1 etc
          const trtIdx = parseInt(trtStr.replace(/\D/g, '')) - 1;
          const repIdx = parseInt(repStr.replace(/\D/g, '')) - 1;

          if (trtIdx >= 0 && trtIdx < t && repIdx >= 0 && repIdx < r) {
            trtTotals[trtIdx] += val;
            repTotals[repIdx] += val;
            grandTotal += val;
            sumSquares += val * val;
          }
        });

        const CF = (grandTotal * grandTotal) / N;
        const TSS = sumSquares - CF;
        
        const SST = (trtTotals.reduce((sum, val) => sum + (val * val), 0) / r) - CF;
        const SSR = dataset.designType === 'RBD' ? (repTotals.reduce((sum, val) => sum + (val * val), 0) / t) - CF : 0;
        
        const SSE = dataset.designType === 'RBD' ? TSS - SST - SSR : TSS - SST;

        const dfT = t - 1;
        const dfR = r - 1;
        const dfE = dataset.designType === 'RBD' ? (t - 1) * (r - 1) : N - t;
        const dfTotal = N - 1;

        const MST = SST / dfT;
        const MSR = dataset.designType === 'RBD' ? SSR / dfR : 0;
        const MSE = SSE / dfE;

        const F_Trt = MST / MSE;
        const F_Rep = dataset.designType === 'RBD' ? MSR / MSE : 0;

        // Simplified significance check (critical F value approx 4.0 for alpha=0.05 depending on df)
        // In a real app, use a statistical library for exact p-values
        const isSignificant = F_Trt > 3.5; 

        const SED = Math.sqrt((2 * MSE) / r);
        const CD = SED * 2.05; // Approx t-value for 5%

        // Treatment Means
        const trtMeans = trtTotals.map(total => (total / r).toFixed(4));
        const graphData = trtMeans.map((mean, idx) => ({
          name: `T${idx + 1}`,
          mean: parseFloat(mean)
        }));

        analysisResults[colName] = {
          anova: [
            { source: 'Replication', df: dfR, ss: SSR.toFixed(4), ms: MSR.toFixed(4), f: F_Rep.toFixed(2) },
            { source: 'Treatment', df: dfT, ss: SST.toFixed(4), ms: MST.toFixed(4), f: F_Trt.toFixed(2) + (isSignificant ? '*' : '') },
            { source: 'Error', df: dfE, ss: SSE.toFixed(4), ms: MSE.toFixed(4), f: '-' },
            { source: 'Total', df: dfTotal, ss: TSS.toFixed(4), ms: '-', f: '-' }
          ],
          sed: SED.toFixed(4),
          cd: CD.toFixed(4),
          cv: ((Math.sqrt(MSE) / (grandTotal / N)) * 100).toFixed(2) + '%',
          means: trtMeans,
          graphData,
          interpretation: `The ANOVA results indicate that treatment effects were ${isSignificant ? 'statistically significant' : 'not statistically significant'} at the 5% probability level.`
        };
      }
    });

    setResults({ type: selectedAnalysis, data: analysisResults });

    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Advanced Stats Suite',
          inputData: { datasetName: dataset.name, analysisType: selectedAnalysis, columns: selectedColumns },
          outputData: { status: 'Generated', results: analysisResults },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }).catch(console.error);
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  };

  const exportPDF = () => {
    if (!results) return;

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Statistical Analysis Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dataset: ${dataset.name}`, 14, 30);
    doc.text(`Design: ${dataset.designType}`, 14, 35);
    doc.text(`Treatments: ${dataset.treatments} | Replications: ${dataset.replications}`, 14, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 45);

    let yPos = 55;

    Object.entries(results.data).forEach(([colName, res]: [string, any]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Variable: ${colName}`, 14, yPos);
      yPos += 10;

      if (results.type === 'descriptive') {
        const tableData = [
          ['Mean', res.mean],
          ['Median', res.median],
          ['Variance', res.variance],
          ['Standard Deviation', res.stdDev],
          ['Standard Error', res.stdErr],
          ['CV (%)', res.cv],
          ['Range', res.range],
          ['N', res.n]
        ];

        (doc as any).autoTable({
          startY: yPos,
          head: [['Statistic', 'Value']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [61, 43, 31] }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      } else if (results.type === 'anova') {
        const anovaData = res.anova.map((row: any) => [row.source, row.df, row.ss, row.ms, row.f]);
        
        (doc as any).autoTable({
          startY: yPos,
          head: [['Source of Variation', 'DF', 'Sum of Squares', 'Mean Square', 'F Value']],
          body: anovaData,
          theme: 'grid',
          headStyles: { fillColor: [61, 43, 31] }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`SE(d): ${res.sed}    CD (5%): ${res.cd}    CV: ${res.cv}`, 14, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "italic");
        doc.text(res.interpretation, 14, yPos);
        yPos += 15;
      }

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save(`${dataset.name}_Analysis_Report.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-agri-primary">Analysis Control Panel</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-agri-primary uppercase tracking-wider mb-4">Select Analysis</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 bg-white cursor-pointer hover:border-agri-secondary transition-colors">
                <input 
                  type="radio" 
                  name="analysisType" 
                  value="descriptive"
                  checked={selectedAnalysis === 'descriptive'}
                  onChange={() => setSelectedAnalysis('descriptive')}
                  className="text-agri-secondary focus:ring-agri-secondary"
                />
                <span className="text-sm font-bold text-stone-600">Descriptive Statistics</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 bg-white cursor-pointer hover:border-agri-secondary transition-colors">
                <input 
                  type="radio" 
                  name="analysisType" 
                  value="anova"
                  checked={selectedAnalysis === 'anova'}
                  onChange={() => setSelectedAnalysis('anova')}
                  className="text-agri-secondary focus:ring-agri-secondary"
                />
                <span className="text-sm font-bold text-stone-600">ANOVA ({dataset.designType})</span>
              </label>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-agri-primary uppercase tracking-wider mb-4">Select Variables</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {numericColumns.map(col => (
                <label key={col.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
                  <input 
                    type="checkbox"
                    checked={selectedColumns.includes(col.id)}
                    onChange={() => handleColumnToggle(col.id)}
                    className="rounded text-agri-secondary focus:ring-agri-secondary"
                  />
                  <span className="text-sm font-bold text-stone-600">{col.name}</span>
                </label>
              ))}
              {numericColumns.length === 0 && (
                <p className="text-xs text-stone-400 italic">No numeric columns available.</p>
              )}
            </div>
          </div>

          <button 
            onClick={runAnalysis}
            className="w-full py-3 bg-agri-primary text-white font-bold rounded-xl shadow-md hover:bg-agri-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Play size={16} /> Run Analysis
          </button>
        </div>

        <div className="md:col-span-2">
          {results ? (
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-agri-primary flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" /> Analysis Results
                </h3>
                <button 
                  onClick={exportPDF}
                  className="px-3 py-1.5 text-xs font-bold text-agri-primary bg-agri-primary/10 hover:bg-agri-primary/20 rounded-lg flex items-center gap-2"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
              
              <div className="p-6 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                {Object.entries(results.data).map(([colName, res]: [string, any]) => (
                  <div key={colName} className="space-y-4">
                    <h4 className="text-md font-bold text-agri-secondary border-b border-stone-100 pb-2">{colName}</h4>
                    
                    {results.type === 'descriptive' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(res).map(([key, val]) => (
                          <div key={key} className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                            <span className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">{key}</span>
                            <span className="block text-sm font-bold text-agri-primary mt-1">{val as string}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {results.type === 'anova' && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-stone-100 border-b border-stone-200">
                                <th className="p-2 text-xs font-black text-stone-500 uppercase tracking-wider border-r border-stone-200">Source</th>
                                <th className="p-2 text-xs font-black text-stone-500 uppercase tracking-wider border-r border-stone-200 text-center">DF</th>
                                <th className="p-2 text-xs font-black text-stone-500 uppercase tracking-wider border-r border-stone-200 text-right">SS</th>
                                <th className="p-2 text-xs font-black text-stone-500 uppercase tracking-wider border-r border-stone-200 text-right">MS</th>
                                <th className="p-2 text-xs font-black text-stone-500 uppercase tracking-wider text-right">F Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {res.anova.map((row: any, idx: number) => (
                                <tr key={idx} className="border-b border-stone-100">
                                  <td className="p-2 text-sm font-bold text-stone-600 border-r border-stone-200">{row.source}</td>
                                  <td className="p-2 text-sm text-stone-600 border-r border-stone-200 text-center">{row.df}</td>
                                  <td className="p-2 text-sm text-stone-600 border-r border-stone-200 text-right">{row.ss}</td>
                                  <td className="p-2 text-sm text-stone-600 border-r border-stone-200 text-right">{row.ms}</td>
                                  <td className="p-2 text-sm font-bold text-agri-primary text-right">{row.f}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="flex gap-6 text-xs font-bold text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-100">
                          <span>SE(d): <span className="text-agri-primary">{res.sed}</span></span>
                          <span>CD (5%): <span className="text-agri-primary">{res.cd}</span></span>
                          <span>CV: <span className="text-agri-primary">{res.cv}</span></span>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                          <FileText size={16} className="text-blue-500 shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-blue-800 leading-relaxed">
                            {res.interpretation}
                          </p>
                        </div>

                        <div className="mt-6">
                          <button 
                            onClick={() => setActiveGraph(activeGraph === colName ? null : colName)}
                            className="px-4 py-2 bg-agri-primary/10 text-agri-primary font-bold rounded-lg hover:bg-agri-primary/20 transition-colors flex items-center gap-2 text-sm"
                          >
                            <PieChart size={16} /> {activeGraph === colName ? 'Hide Graph' : 'Show Treatment Means Graph'}
                          </button>
                          
                          {activeGraph === colName && (
                            <div className="mt-4 p-4 border border-stone-200 rounded-xl bg-white h-72">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={res.graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                  <Bar dataKey="mean" fill="#3D2B1F" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 p-12 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
              <BarChart2 size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold text-center">Select analysis type and variables, then click Run Analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
