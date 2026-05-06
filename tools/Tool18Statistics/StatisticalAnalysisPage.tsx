import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart2, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Download,
  Settings2,
  Table as TableIcon,
  ClipboardPaste,
  Calculator,
  TrendingUp,
  Activity,
  FileText
} from 'lucide-react';
import { 
  calculateCRD, 
  calculateRBD, 
  calculateLSD,
  calculateFactorial2,
  getDescriptiveStats, 
  correlation, 
  regression,
  AnovaSummary,
  DescriptiveStats
} from '../../src/core/statsEngine';
import { exportStatisticalReport } from './exportStats';

type AnalysisType = 'ANOVA' | 'Descriptive' | 'Correlation' | 'Regression';
type DesignType = 'CRD' | 'RCBD' | 'LSD' | 'Factorial2';

interface DataRow {
  id: string;
  x: string; // Treatment or X variable
  y: string; // Replication or Y variable
  z?: string; // Column (for LSD)
  value: number;
}

import { useAuth } from '../../src/authContext';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

export default function StatisticalAnalysisPage() {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [analysisType, setAnalysisType] = useState<AnalysisType>('ANOVA');
  const [design, setDesign] = useState<DesignType>('CRD');
  const [data, setData] = useState<DataRow[]>([
    { id: '1', x: 'T1', y: 'R1', value: 45 },
    { id: '2', x: 'T2', y: 'R1', value: 50 },
    { id: '3', x: 'T1', y: 'R2', value: 47 },
    { id: '4', x: 'T2', y: 'R2', value: 52 },
  ]);
  
  const [anovaResult, setAnovaResult] = useState<AnovaSummary | null>(null);
  const [descResult, setDescResult] = useState<DescriptiveStats | null>(null);
  const [corrResult, setCorrResult] = useState<number | null>(null);
  const [regrResult, setRegrResult] = useState<{ slope: number, intercept: number, r2: number } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleExport = () => {
    let result = null;
    if (analysisType === 'ANOVA') result = anovaResult;
    else if (analysisType === 'Descriptive') result = descResult;
    else if (analysisType === 'Correlation') result = corrResult;
    else if (analysisType === 'Regression') result = regrResult;

    if (!result) {
      alert("Please run an analysis first.");
      return;
    }

    exportStatisticalReport(analysisType, result, data, analysisType === 'ANOVA' ? design : undefined);
  };

  const addRow = () => {
    setData([...data, { id: `obs-${Date.now()}`, x: 'T1', y: 'R1', z: 'C1', value: 0 }]);
  };

  const removeRow = (id: string) => {
    setData(data.filter(d => d.id !== id));
  };

  const updateRow = (id: string, field: keyof DataRow, value: any) => {
    setData(data.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    processRawText(text);
  };

  const processRawText = (text: string) => {
    const rows = text.trim().split('\n');
    const newData: DataRow[] = [];
    
    rows.forEach((row, i) => {
      // Split by tab or comma
      const cols = row.includes('\t') ? row.split('\t') : row.split(',');
      if (cols.length >= 3) {
        newData.push({
          id: `obs-${Date.now()}-${i}`,
          x: cols[0].trim(),
          y: cols[1].trim(),
          z: cols.length >= 4 ? cols[2].trim() : 'C1',
          value: parseFloat(cols[cols.length - 1].trim()) || 0
        });
      }
    });
    
    if (newData.length > 0) {
      setData([...data, ...newData]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processRawText(text);
    };
    reader.readAsText(file);
  };

  const handleCalculate = () => {
    setWarnings([]);
    const newWarnings: string[] = [];

    if (analysisType === 'ANOVA') {
      const repGroups = new Set(data.map(d => d.y));
      const trtGroups = new Set(data.map(d => d.x));
      
      if (repGroups.size < 2) newWarnings.push("Error: Minimum 2 replications required.");
      if (trtGroups.size < 2) newWarnings.push("Error: Minimum 2 treatments required.");
      if (data.length !== repGroups.size * trtGroups.size) {
        newWarnings.push("Warning: Dataset may be unbalanced or missing cells.");
      }

      if (newWarnings.some(w => w.startsWith('Error'))) {
        setWarnings(newWarnings);
        return;
      }

      if (design === 'CRD') {
        const groups: Record<string, number[]> = {};
        data.forEach(d => {
          if (!groups[d.x]) groups[d.x] = [];
          groups[d.x].push(d.value);
        });
        setAnovaResult(calculateCRD(groups));
      } else if (design === 'RCBD') {
        const groups: Record<string, Record<string, number>> = {};
        data.forEach(d => {
          if (!groups[d.x]) groups[d.x] = {};
          groups[d.x][d.y] = d.value;
        });
        setAnovaResult(calculateRBD(groups));
      } else if (design === 'LSD') {
        const p = Math.sqrt(data.length);
        if (p % 1 !== 0) {
          newWarnings.push("Error: LSD requires a square number of observations (p^2).");
        } else {
          const lsdData = data.map(d => ({
            treatment: d.x,
            row: d.y,
            col: d.z || 'C1',
            value: d.value
          }));
          try {
            setAnovaResult(calculateLSD(lsdData));
          } catch (e: any) {
            newWarnings.push(`Error: ${e.message}`);
          }
        }
      } else if (design === 'Factorial2') {
        const factorialData = data.map(d => ({
          a: d.x,
          b: d.z || 'B1',
          rep: d.y,
          value: d.value
        }));
        try {
          setAnovaResult(calculateFactorial2(factorialData));
        } catch (e: any) {
          newWarnings.push(`Error: ${e.message}`);
        }
      }
    } else if (analysisType === 'Descriptive') {
      const values = data.map(d => d.value);
      setDescResult(getDescriptiveStats(values));
    } else if (analysisType === 'Correlation' || analysisType === 'Regression') {
      const xValues = data.filter(d => d.y === 'X').map(d => d.value);
      const yValues = data.filter(d => d.y === 'Y').map(d => d.value);
      
      if (xValues.length !== yValues.length || xValues.length < 2) {
        newWarnings.push("Error: Correlation/Regression requires equal number of X and Y observations (min 2). Use 'X' and 'Y' in the second column.");
        setWarnings(newWarnings);
        return;
      }

      if (analysisType === 'Correlation') {
        setCorrResult(correlation(xValues, yValues));
      } else {
        setRegrResult(regression(xValues, yValues));
      }
    }

    setWarnings(newWarnings);

    if (user && isPlanActive && newWarnings.length === 0) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Statistical Analysis',
          inputData: { analysisType, design, data },
          outputData: { status: 'Generated' },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }).catch(console.error);
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Statistical Analysis</h1>
            <p className="text-stone-500 text-sm">Agricultural Research Data Engine</p>
          </div>
        </div>
        {(anovaResult || descResult || corrResult !== null || regrResult) && (
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-all"
          >
            <FileText size={14} /> Download PDF Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-stone-500" />
                Analysis Settings
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Analysis Type</label>
                <select 
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="ANOVA">ANOVA (CRD/RBD)</option>
                  <option value="Descriptive">Descriptive Statistics</option>
                  <option value="Correlation">Correlation Analysis</option>
                  <option value="Regression">Regression Analysis</option>
                </select>
              </div>

              {analysisType === 'ANOVA' && (
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Experimental Design</label>
                  <select 
                    value={design}
                    onChange={(e) => setDesign(e.target.value as DesignType)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="CRD">CRD (Completely Randomized)</option>
                    <option value="RCBD">RCBD (Randomized Block)</option>
                    <option value="LSD">LSD (Latin Square Design)</option>
                    <option value="Factorial2">Factorial (2-Factor)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-stone-500" />
                Data Input
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-stone-500">
                <ClipboardPaste size={12} /> Excel Paste
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div 
                className="max-h-[300px] overflow-y-auto border border-stone-200 rounded-xl"
                onPaste={handlePaste}
              >
                <table className="w-full text-left border-collapse">
                  <thead className="bg-stone-50 sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-200">
                        {analysisType === 'ANOVA' ? (design === 'Factorial2' ? 'Fact A' : 'Trt') : 'Var'}
                      </th>
                      <th className="py-2 px-3 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-200">
                        {analysisType === 'ANOVA' ? (design === 'LSD' ? 'Row' : 'Rep') : 'Group'}
                      </th>
                      {analysisType === 'ANOVA' && (design === 'LSD' || design === 'Factorial2') && (
                        <th className="py-2 px-3 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-200">
                          {design === 'LSD' ? 'Col' : 'Fact B'}
                        </th>
                      )}
                      <th className="py-2 px-3 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-200">Value</th>
                      <th className="py-2 px-3 border-b border-stone-200"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {data.map((d) => (
                      <tr key={d.id} className="hover:bg-stone-50">
                        <td className="p-1">
                          <input 
                            type="text" 
                            value={d.x}
                            onChange={(e) => updateRow(d.id, 'x', e.target.value)}
                            className="w-full bg-transparent border-none px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                          />
                        </td>
                        <td className="p-1">
                          <input 
                            type="text" 
                            value={d.y}
                            onChange={(e) => updateRow(d.id, 'y', e.target.value)}
                            className="w-full bg-transparent border-none px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                          />
                        </td>
                        {analysisType === 'ANOVA' && (design === 'LSD' || design === 'Factorial2') && (
                          <td className="p-1">
                            <input 
                              type="text" 
                              value={d.z || ''}
                              onChange={(e) => updateRow(d.id, 'z', e.target.value)}
                              className="w-full bg-transparent border-none px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                            />
                          </td>
                        )}
                        <td className="p-1">
                          <input 
                            type="number" 
                            value={d.value}
                            onChange={(e) => updateRow(d.id, 'value', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border-none px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button onClick={() => removeRow(d.id)} className="text-stone-300 hover:text-red-500 p-1">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button 
                onClick={addRow}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 w-full justify-center py-2 border border-dashed border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all"
              >
                <Plus size={14} /> Add Observation
              </button>
            </div>
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-emerald-600/10 transition-all active:scale-95"
          >
            Run Analysis
          </button>

          <AnimatePresence>
            {warnings.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-widest">
                  <AlertTriangle size={14} />
                  Validation Alerts
                </div>
                <ul className="space-y-1.5">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-[11px] text-amber-700 flex items-start gap-2 leading-relaxed">
                      <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          {analysisType === 'ANOVA' && anovaResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">CV (%)</p>
                  <p className="text-2xl font-bold text-stone-800">{anovaResult.cv.toFixed(2)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">CD (0.05)</p>
                  <p className="text-2xl font-bold text-stone-800">{anovaResult.lsd.toFixed(4)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">F Calculated</p>
                  <p className="text-2xl font-bold text-stone-800">{anovaResult.fCalc.toFixed(2)}</p>
                </div>
                <div className={`p-5 rounded-2xl border shadow-sm ${anovaResult.isSignificant ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${anovaResult.isSignificant ? 'text-emerald-700' : 'text-stone-400'}`}>Significance</p>
                  <p className={`text-xl font-bold ${anovaResult.isSignificant ? 'text-emerald-600' : 'text-stone-600'}`}>
                    {anovaResult.isSignificant ? 'Significant' : 'Non-Sig'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                  <h2 className="font-bold text-stone-800 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-stone-500" />
                    ANOVA Table
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50/50">
                      <tr>
                        <th className="py-3 px-6 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-200">Source</th>
                        <th className="py-3 px-6 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-200">DF</th>
                        <th className="py-3 px-6 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-200">SS</th>
                        <th className="py-3 px-6 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-200">MS</th>
                        <th className="py-3 px-6 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-200">F</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {anovaResult.table.map((row, i) => (
                        <tr key={i} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 px-6 text-sm font-bold text-stone-800">{row.source}</td>
                          <td className="py-4 px-6 text-sm text-stone-600">{row.df}</td>
                          <td className="py-4 px-6 text-sm font-mono text-stone-500">{row.ss.toFixed(4)}</td>
                          <td className="py-4 px-6 text-sm font-mono text-stone-500">{!isNaN(row.ms) ? row.ms.toFixed(4) : '-'}</td>
                          <td className="py-4 px-6 text-sm font-mono font-bold text-emerald-600">{!isNaN(row.f) ? row.f.toFixed(4) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {analysisType === 'Descriptive' && descResult && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
                <h2 className="font-bold text-stone-800">Descriptive Statistics</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-stone-100">
                {[
                  { label: 'Mean', value: descResult.mean.toFixed(4) },
                  { label: 'SD', value: descResult.sd.toFixed(4) },
                  { label: 'CV (%)', value: descResult.cv.toFixed(2) },
                  { label: 'Min', value: descResult.min.toFixed(4) },
                  { label: 'Max', value: descResult.max.toFixed(4) },
                  { label: 'Sum', value: descResult.sum.toFixed(4) },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-stone-800">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisType === 'Correlation' && corrResult !== null && (
            <div className="bg-white p-10 rounded-2xl border border-stone-200 shadow-sm text-center">
              <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Pearson Correlation Coefficient (r)</p>
              <p className="text-5xl font-bold text-stone-800 mb-4">{corrResult.toFixed(4)}</p>
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                {Math.abs(corrResult) > 0.7 ? 'Strong Correlation' : Math.abs(corrResult) > 0.3 ? 'Moderate Correlation' : 'Weak Correlation'}
              </div>
            </div>
          )}

          {analysisType === 'Regression' && regrResult && (
            <div className="space-y-6">
              <div className="bg-white p-10 rounded-2xl border border-stone-200 shadow-sm text-center">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Regression Equation</p>
                <p className="text-4xl font-bold text-stone-800 font-serif">
                  Y = {regrResult.intercept.toFixed(4)} + {regrResult.slope.toFixed(4)}X
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">R-Squared (R²)</p>
                  <p className="text-2xl font-bold text-stone-800">{regrResult.r2.toFixed(4)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Slope (b)</p>
                  <p className="text-2xl font-bold text-stone-800">{regrResult.slope.toFixed(4)}</p>
                </div>
              </div>
            </div>
          )}

          {!anovaResult && !descResult && corrResult === null && !regrResult && (
            <div className="h-full min-h-[400px] bg-stone-50 border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-stone-400 p-10 text-center">
              <BarChart2 className="w-16 h-16 mb-6 opacity-10" />
              <p className="font-bold text-stone-500 uppercase tracking-widest text-xs">Awaiting Analysis</p>
              <p className="text-sm mt-2 max-w-xs leading-relaxed">Enter your research data and select an analysis type to generate statistical insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
