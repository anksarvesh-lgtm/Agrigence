import React, { useRef, useState } from 'react';
import { 
  Download, FileText, Share2, Printer, 
  BarChart2, TrendingUp, Grid, Activity, PieChart, Settings
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, ZAxis, ComposedChart
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Dataset } from '../AdvancedResearchSuite';

interface ResultsViewProps {
  results: any;
  dataset: Dataset;
}

import ExportControl from '../../../components/ExportControl';

const ResultsView: React.FC<ResultsViewProps> = ({ results, dataset }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [graphType, setGraphType] = useState<'bar' | 'line' | 'scatter'>('bar');

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("Research Analysis Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Dataset: ${dataset.name}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    
    let yPos = 50;

    results.data.forEach((item: any, index: number) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text(item.variable || item.pair || `Analysis ${index + 1}`, 14, yPos);
      yPos += 10;

      if (item.stats) {
        // Descriptive / Correlation
        const headers = Object.keys(item.stats).map(k => k.toUpperCase());
        const data = [Object.values(item.stats).map(v => String(v))];
        
        (doc as any).autoTable({
          startY: yPos,
          head: [headers],
          body: data,
          theme: 'grid'
        });
        yPos = (doc as any).lastAutoTable.finalY + 20;
      } else if (item.anova) {
        // ANOVA
        const anova = item.anova;
        
        // ANOVA Table
        doc.setFontSize(10);
        doc.text("ANOVA Table", 14, yPos);
        yPos += 6;
        
        const headers = ["Source", "DF", "SS", "MS", "F", "Sig"];
        const data = anova.table.map((row: any) => [
          row.source, row.df, row.ss, row.ms, row.f, row.sig
        ]);

        (doc as any).autoTable({
          startY: yPos,
          head: [headers],
          body: data,
          theme: 'striped'
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Interpretation
        doc.setFontSize(10);
        doc.text(`Interpretation: ${anova.interpretation}`, 14, yPos);
        yPos += 10;
        
        // Means
        doc.text("Treatment Means", 14, yPos);
        yPos += 6;
        
        const meanHeaders = ["Treatment", "Mean", "Group"];
        const meanData = anova.means.map((m: any) => [m.treatment, m.mean, m.group]);
        
        (doc as any).autoTable({
          startY: yPos,
          head: [meanHeaders],
          body: meanData,
          theme: 'grid'
        });
        yPos = (doc as any).lastAutoTable.finalY + 20;
      } else if (item.regression) {
        // Regression
        doc.setFontSize(10);
        doc.text(`Equation: ${item.regression.equation}`, 14, yPos);
        yPos += 6;
        doc.text(`R-Squared: ${item.regression.rSquared}`, 14, yPos);
        yPos += 6;
        doc.text(`Interpretation: ${item.regression.interpretation}`, 14, yPos);
        yPos += 14;
      } else if (item.hypothesis) {
        // Hypothesis
        doc.setFontSize(10);
        doc.text(`Test: ${item.hypothesis.testType}`, 14, yPos);
        yPos += 6;
        doc.text(`t-Statistic: ${item.hypothesis.tStatistic}`, 14, yPos);
        yPos += 6;
        doc.text(`Interpretation: ${item.hypothesis.interpretation}`, 14, yPos);
        yPos += 14;
      } else if (item.pca) {
        // PCA
        doc.setFontSize(10);
        doc.text(`Interpretation: ${item.pca.interpretation}`, 14, yPos);
        yPos += 10;
        
        doc.text("Explained Variance", 14, yPos);
        yPos += 6;
        const headers = item.pca.explainedVariance.map((_: any, i: number) => `PC${i+1}`);
        const data = [item.pca.explainedVariance];
        (doc as any).autoTable({
          startY: yPos,
          head: [headers],
          body: data,
          theme: 'grid'
        });
        yPos = (doc as any).lastAutoTable.finalY + 20;
      }
    });

    doc.save(`${dataset.name}_Report.pdf`);
  };

  const handleExport = (format: 'docx' | 'xlsx' | 'pdf') => {
    if (format === 'pdf') {
      handleDownloadPDF();
    } else if (format === 'xlsx') {
      // Implement Excel export logic here (using xlsx library)
      alert("Excel export functionality to be implemented.");
    } else if (format === 'docx') {
      // Implement Word export logic here
      alert("Word export functionality to be implemented.");
    }
  };

  return (
    <div className="space-y-8" ref={reportRef}>
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif font-bold text-agri-primary">Analysis Results</h2>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportControl onExport={handleExport} />
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 text-stone-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-50 transition-colors">
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-12">
        {results.data.map((item: any, index: number) => (
          <div key={index} className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-agri-primary/10 rounded-lg flex items-center justify-center text-agri-primary">
                {item.anova ? <Grid size={18} /> : 
                 item.regression ? <BarChart2 size={18} /> :
                 item.hypothesis ? <Activity size={18} /> :
                 item.pca ? <Settings size={18} /> :
                 item.cluster ? <PieChart size={18} /> :
                 <Activity size={18} />}
              </div>
              {item.variable || item.pair}
            </h3>

            {/* Descriptive Stats */}
            {item.stats && !item.pair && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {Object.entries(item.stats).map(([key, val]) => (
                  <div key={key} className="bg-stone-50 p-4 rounded-2xl text-center border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">{key}</span>
                    <span className="text-lg font-black text-stone-800">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Correlation */}
            {item.pair && item.stats && (
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Coefficient (r)</span>
                  <p className="text-3xl font-black text-blue-900 mt-1">{item.stats.coefficient}</p>
                </div>
                <p className="text-sm font-medium text-blue-800 italic max-w-md text-right">
                  "{item.stats.interpretation}"
                </p>
              </div>
            )}

            {/* Regression */}
            {item.regression && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Equation</span>
                    <p className="text-xl font-black text-emerald-900 mt-2 font-mono">{item.regression.equation}</p>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">R-Squared</span>
                    <p className="text-3xl font-black text-emerald-900 mt-1">{item.regression.rSquared}</p>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center">
                    <p className="text-sm font-medium text-emerald-800 italic">
                      "{item.regression.interpretation}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hypothesis */}
            {item.hypothesis && (
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">{item.hypothesis.testType}</span>
                  <span className="text-2xl font-black text-purple-900">t = {item.hypothesis.tStatistic}</span>
                </div>
                <p className="text-sm font-medium text-purple-800 italic">
                  "{item.hypothesis.interpretation}"
                </p>
              </div>
            )}

            {/* PCA */}
            {item.pca && (
              <div className="space-y-6">
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Explained Variance</h4>
                  <div className="flex gap-4 flex-wrap">
                    {item.pca.explainedVariance.map((v: string, i: number) => (
                      <div key={i} className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
                        <span className="text-[10px] text-stone-400 font-bold mr-2">PC{i+1}</span>
                        <span className="font-mono font-bold text-stone-700">{v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-stone-500 mt-4 italic">"{item.pca.interpretation}"</p>
                </div>
              </div>
            )}

            {/* ANOVA Results */}
            {item.anova && (
              <div className="space-y-8">
                {/* Interpretation Banner */}
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4">
                  <TrendingUp className="text-emerald-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-1">Statistical Interpretation</h4>
                    <p className="text-emerald-700 font-medium italic">"{item.anova.interpretation}"</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* ANOVA Table */}
                  <div className="overflow-hidden rounded-2xl border border-stone-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-stone-50 text-stone-500 font-bold uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3">Source</th>
                          <th className="px-6 py-3">DF</th>
                          <th className="px-6 py-3">SS</th>
                          <th className="px-6 py-3">MS</th>
                          <th className="px-6 py-3">F-Val</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {item.anova.table.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-stone-50/50">
                            <td className="px-6 py-3 font-bold text-stone-700">{row.source}</td>
                            <td className="px-6 py-3 text-stone-600">{row.df}</td>
                            <td className="px-6 py-3 text-stone-600">{row.ss}</td>
                            <td className="px-6 py-3 text-stone-600">{row.ms}</td>
                            <td className="px-6 py-3 font-mono font-bold text-stone-800">
                              {row.f} {row.sig === '*' && <span className="text-red-500">*</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Means Table */}
                  <div className="overflow-hidden rounded-2xl border border-stone-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-stone-50 text-stone-500 font-bold uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3">Treatment</th>
                          <th className="px-6 py-3">Mean Value</th>
                          <th className="px-6 py-3">Group</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {item.anova.means.map((m: any, i: number) => (
                          <tr key={i} className="hover:bg-stone-50/50">
                            <td className="px-6 py-3 font-bold text-stone-700">{m.treatment}</td>
                            <td className="px-6 py-3 font-mono text-stone-600">{m.mean}</td>
                            <td className="px-6 py-3">
                              <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs font-bold uppercase">
                                {m.group}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Graphs */}
                <div className="h-96 w-full mt-8 bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Treatment Means Visualization</h4>
                    <div className="flex bg-white rounded-lg p-1 border border-stone-200">
                      <button 
                        onClick={() => setGraphType('bar')}
                        className={`p-2 rounded-md transition-colors ${graphType === 'bar' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                        <BarChart2 size={16} />
                      </button>
                      <button 
                        onClick={() => setGraphType('line')}
                        className={`p-2 rounded-md transition-colors ${graphType === 'line' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                        <TrendingUp size={16} />
                      </button>
                      <button 
                        onClick={() => setGraphType('scatter')}
                        className={`p-2 rounded-md transition-colors ${graphType === 'scatter' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                        <Activity size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height="100%">
                    {graphType === 'bar' ? (
                      <BarChart data={item.anova.means}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="treatment" stroke="#a8a29e" fontSize={12} tickLine={false} />
                        <YAxis stroke="#a8a29e" fontSize={12} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          cursor={{ fill: '#f5f5f4' }}
                        />
                        <Legend />
                        <Bar dataKey="mean" fill="#4A7C59" radius={[4, 4, 0, 0]} barSize={40} name="Mean Value" />
                      </BarChart>
                    ) : graphType === 'line' ? (
                      <LineChart data={item.anova.means}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="treatment" stroke="#a8a29e" fontSize={12} tickLine={false} />
                        <YAxis stroke="#a8a29e" fontSize={12} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="mean" stroke="#4A7C59" strokeWidth={3} dot={{ r: 6 }} name="Mean Value" />
                      </LineChart>
                    ) : (
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="treatment" type="category" stroke="#a8a29e" fontSize={12} tickLine={false} allowDuplicatedCategory={false} />
                        <YAxis dataKey="mean" stroke="#a8a29e" fontSize={12} tickLine={false} />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Legend />
                        <Scatter name="Mean Value" data={item.anova.means} fill="#4A7C59" />
                      </ScatterChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsView;
