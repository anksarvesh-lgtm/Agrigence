
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Download, FileText, Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { StatsResult } from '../utils/statistics';

interface ResultViewerProps {
  result: StatsResult;
  testName: string;
  datasetName: string;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ result, testName, datasetName }) => {
  const chartData = [
    { name: 'Mean', value: result.mean },
    { name: 'Std Dev', value: result.stdDev },
    { name: 'Min', value: result.min },
    { name: 'Max', value: result.max }
  ];

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.entries(result).map(([k, v]) => `${k},${v}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stats_${datasetName}_${testName}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handleDownloadPDF = () => {
    alert('PDF generation is being processed by the server. You will receive a notification when it is ready.');
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden mt-10">
      <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 text-white p-2 rounded-lg">
            <Activity size={18} />
          </div>
          <h3 className="font-serif font-bold text-lg text-agri-primary">Statistical Results: {testName}</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadCSV} className="p-2 bg-stone-100 text-stone-500 rounded-lg hover:bg-stone-200 transition-all" title="Download CSV">
            <Download size={16} />
          </button>
          <button onClick={handleDownloadPDF} className="p-2 bg-stone-100 text-stone-500 rounded-lg hover:bg-stone-200 transition-all" title="Download PDF Report">
            <FileText size={16} />
          </button>
        </div>
      </div>

      <div className="p-8 grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Mean (x̄)</p>
              <p className="text-2xl font-bold text-agri-primary">{result.mean.toFixed(4)}</p>
            </div>
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Std Dev (σ)</p>
              <p className="text-2xl font-bold text-agri-primary">{result.stdDev.toFixed(4)}</p>
            </div>
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Variance (σ²)</p>
              <p className="text-2xl font-bold text-agri-primary">{result.variance.toFixed(4)}</p>
            </div>
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Sample Size (n)</p>
              <p className="text-2xl font-bold text-agri-primary">{result.n}</p>
            </div>
          </div>

          {result.correlation !== undefined && (
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="text-emerald-600" size={20} />
                <h4 className="font-bold text-emerald-800">Pearson Correlation (r)</h4>
              </div>
              <p className="text-3xl font-bold text-emerald-600 mb-2">{result.correlation.toFixed(4)}</p>
              <p className="text-xs text-emerald-700 font-medium">
                {Math.abs(result.correlation) > 0.7 ? 'Strong positive correlation' : Math.abs(result.correlation) > 0.3 ? 'Moderate correlation' : 'Weak correlation'}
              </p>
            </div>
          )}

          {result.regression && (
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="text-indigo-600" size={20} />
                <h4 className="font-bold text-indigo-800">Linear Regression</h4>
              </div>
              <p className="text-xl font-mono text-indigo-600 mb-2">Y = {result.regression.intercept.toFixed(4)} + {result.regression.slope.toFixed(4)}X</p>
              <p className="text-xs text-indigo-700 font-medium">R-Squared (R²): {result.regression.r2.toFixed(4)}</p>
            </div>
          )}

          {result.fValue !== undefined && (
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-3 mb-3">
                <BarChart2 className="text-amber-600" size={20} />
                <h4 className="font-bold text-amber-800">ANOVA Result</h4>
              </div>
              <p className="text-3xl font-bold text-amber-600 mb-2">F = {result.fValue.toFixed(4)}</p>
              <p className="text-xs text-amber-700 font-medium">Degrees of Freedom: {result.df}</p>
            </div>
          )}
        </div>

        <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 min-h-[400px]">
          <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart2 size={14} /> Data Visualization
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultViewer;
