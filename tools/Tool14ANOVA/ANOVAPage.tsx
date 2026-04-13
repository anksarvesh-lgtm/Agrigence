import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Download,
  Settings2,
  Table as TableIcon,
  ClipboardPaste,
  Wand2,
  Loader2,
  Lock
} from 'lucide-react';
import { Observation, AnovaSummary, DesignType } from './anovaTypes';
import { calculateANOVA } from './anovaCore';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

export default function ANOVAPage() {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [design, setDesign] = useState<DesignType>('RCBD');
  const [data, setData] = useState<Observation[]>([
    { id: '1', replication: 'R1', treatment: 'T1', value: 45 },
    { id: '2', replication: 'R1', treatment: 'T2', value: 50 },
    { id: '3', replication: 'R2', treatment: 'T1', value: 47 },
    { id: '4', replication: 'R2', treatment: 'T2', value: 52 },
  ]);
  
  const [result, setResult] = useState<AnovaSummary | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const generateAiInterpretation = async () => {
    if (!result) return;
    setIsGeneratingAi(true);
    try {
      const prompt = `You are an expert agricultural statistician. I have just run an ANOVA analysis.
      Here are the results:
      Design: ${design}
      CV (%): ${result.cv.toFixed(2)}
      LSD: ${result.lsd.toFixed(4)}
      F-Calculated: ${result.fCalc.toFixed(2)}
      Is Significant: ${result.isSignificant ? 'Yes' : 'No'}
      
      Mean Comparison:
      ${result.means.map(m => `Treatment ${m.treatment}: Mean = ${m.mean.toFixed(2)}, Grouping = ${m.grouping}`).join('\n')}
      
      Please provide a concise, 2-3 paragraph interpretation of these results suitable for a scientific report's "Results and Discussion" section. Explain what the significance means, which treatments performed best based on the groupings, and if the CV indicates good experimental precision.`;

      // Interpretation logic removed
      setAiInterpretation("AI interpretation disabled.");
    } catch (error) {
      console.error("Interpretation failed:", error);
      setAiInterpretation("Failed to generate interpretation.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const addRow = () => {
    setData([...data, { id: `obs-${Date.now()}`, replication: 'R1', treatment: 'T1', value: 0 }]);
  };

  const removeRow = (id: string) => {
    setData(data.filter(d => d.id !== id));
  };

  const updateRow = (id: string, field: keyof Observation, value: any) => {
    setData(data.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const rows = text.trim().split('\n');
    const newData: Observation[] = [];
    
    rows.forEach((row, i) => {
      const cols = row.split('\t');
      if (cols.length >= 3) {
        newData.push({
          id: `obs-${Date.now()}-${i}`,
          replication: cols[0].trim(),
          treatment: cols[1].trim(),
          value: parseFloat(cols[2].trim()) || 0
        });
      }
    });
    
    if (newData.length > 0) {
      setData([...data, ...newData]);
    }
  };

  const handleCalculate = () => {
    const newWarnings: string[] = [];
    
    const repGroups = new Set(data.map(d => d.replication));
    if (repGroups.size < 2) {
      newWarnings.push("Error: Minimum 2 replications required for ANOVA.");
    }
    
    const trtGroups = new Set(data.map(d => d.treatment));
    if (trtGroups.size < 2) {
      newWarnings.push("Error: Minimum 2 treatments required.");
    }

    // Check for missing cells (basic check: total obs should equal reps * trts)
    if (data.length !== repGroups.size * trtGroups.size) {
      newWarnings.push("Warning: Dataset may be unbalanced or missing cells. Results might be inaccurate.");
    }

    setWarnings(newWarnings);
    
    if (newWarnings.some(w => w.startsWith('Error'))) {
      setResult(null);
      return;
    }

    const summary = calculateANOVA(data, design);
    
    if (summary.cv > 20) {
      setWarnings(prev => [...prev, "Warning: CV > 20%. Indicates low precision or high experimental error."]);
    }
    
    setResult(summary);

    // Log history if subscribed
    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'ANOVA Engine',
          inputData: { design, dataCount: data.length },
          outputData: summary,
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }).catch(console.error);
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  };

  const handleExport = () => {
    if (!result) return;
    
    let csvContent = "ANOVA TABLE\nSource,DF,SS,MS,F\n";
    result.table.forEach(row => {
      csvContent += `${row.source},${row.df},${row.ss.toFixed(4)},${row.ms?.toFixed(4) || ''},${row.f?.toFixed(4) || ''}\n`;
    });
    
    csvContent += "\nMEAN COMPARISON\nTreatment,Mean,Grouping\n";
    result.means.forEach(m => {
      csvContent += `${m.treatment},${m.mean.toFixed(4)},${m.grouping}\n`;
    });
    
    csvContent += `\nSTATISTICS\nCV (%),${result.cv.toFixed(2)}\nLSD,${result.lsd.toFixed(4)}\nGrand Mean,${result.grandMean.toFixed(4)}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ANOVA_Results_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-purple-100 p-3 rounded-xl">
          <BarChart2 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">ANOVA Engine</h1>
          <p className="text-stone-500 text-sm">Experimental Data Analysis Tool</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-stone-500" />
                Design Settings
              </h2>
            </div>
            <div className="p-5">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Experimental Design</label>
              <select 
                value={design}
                onChange={(e) => setDesign(e.target.value as DesignType)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              >
                <option value="CRD">CRD (Completely Randomized Design)</option>
                <option value="RCBD">RCBD (Randomized Complete Block Design)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-stone-500" />
                Observations
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-stone-500">
                <ClipboardPaste size={12} /> Paste from Excel
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
                      <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Rep</th>
                      <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Trt</th>
                      <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Yield</th>
                      <th className="py-2 px-3 border-b border-stone-200"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {data.map((d) => (
                      <tr key={d.id} className="hover:bg-stone-50">
                        <td className="p-1">
                          <input 
                            type="text" 
                            value={d.replication}
                            onChange={(e) => updateRow(d.id, 'replication', e.target.value)}
                            className="w-full bg-transparent border-none px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-purple-500 rounded"
                          />
                        </td>
                        <td className="p-1">
                          <input 
                            type="text" 
                            value={d.treatment}
                            onChange={(e) => updateRow(d.id, 'treatment', e.target.value)}
                            className="w-full bg-transparent border-none px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-purple-500 rounded"
                          />
                        </td>
                        <td className="p-1">
                          <input 
                            type="number" 
                            value={d.value}
                            onChange={(e) => updateRow(d.id, 'value', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border-none px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-purple-500 rounded"
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button 
                            onClick={() => removeRow(d.id)}
                            className="text-stone-400 hover:text-red-500 p-1"
                          >
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
                className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 w-full justify-center py-2 border border-dashed border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Plus size={16} /> Add Row
              </button>
            </div>
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
          >
            Calculate ANOVA
          </button>

          <AnimatePresence>
            {warnings.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                  <AlertTriangle size={16} />
                  Validation Alerts
                </div>
                <ul className="space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                      <span className="mt-0.5">•</span>
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
          {result ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">CV (%)</p>
                  <p className="text-2xl font-light text-stone-800">{result.cv.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">LSD (0.05)</p>
                  <p className="text-2xl font-light text-stone-800">{result.lsd.toFixed(4)}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">F Calculated</p>
                  <p className="text-2xl font-light text-stone-800">{result.fCalc.toFixed(2)}</p>
                </div>
                <div className={`p-4 rounded-2xl border shadow-sm ${result.isSignificant ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${result.isSignificant ? 'text-emerald-700' : 'text-stone-500'}`}>Significance</p>
                  <p className={`text-xl font-medium ${result.isSignificant ? 'text-emerald-600' : 'text-stone-600'}`}>
                    {result.isSignificant ? 'Significant' : 'Non-Significant'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                  <h2 className="font-semibold text-stone-800">ANOVA Table</h2>
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <Download size={16} /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white">
                      <tr>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Source</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">DF</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">SS</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">MS</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">F</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {result.table.map((row, i) => (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="py-3 px-4 text-sm font-medium text-stone-800">{row.source}</td>
                          <td className="py-3 px-4 text-sm text-stone-600">{row.df}</td>
                          <td className="py-3 px-4 text-sm font-mono text-stone-600">{row.ss.toFixed(4)}</td>
                          <td className="py-3 px-4 text-sm font-mono text-stone-600">{row.ms !== null ? row.ms.toFixed(4) : '-'}</td>
                          <td className="py-3 px-4 text-sm font-mono font-bold text-purple-600">{row.f !== null ? row.f.toFixed(4) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-5 py-4 border-b border-stone-200">
                  <h2 className="font-semibold text-stone-800">Mean Comparison</h2>
                  <p className="text-xs text-stone-500 mt-1">Groupings based on LSD (0.05)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white">
                      <tr>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Treatment</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Mean</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Grouping</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {result.means.map((m, i) => (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="py-3 px-4 text-sm font-medium text-stone-800">{m.treatment}</td>
                          <td className="py-3 px-4 text-sm font-mono text-stone-600">{m.mean.toFixed(4)}</td>
                          <td className="py-3 px-4 text-sm font-bold text-purple-600">{m.grouping}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-purple-50/50 rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between">
                  <h2 className="font-semibold text-purple-900 flex items-center gap-2">
                    <Wand2 size={18} className="text-purple-600" /> AI Interpretation
                  </h2>
                  {!isPlanActive ? (
                    <Link to="/subscription" className="flex items-center gap-2 text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors">
                      <Lock size={14} /> Premium Feature
                    </Link>
                  ) : !aiInterpretation && (
                    <button 
                      onClick={generateAiInterpretation}
                      disabled={isGeneratingAi}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {isGeneratingAi ? <Loader2 size={16} className="animate-spin" /> : 'Generate Interpretation'}
                    </button>
                  )}
                </div>
                {isPlanActive && aiInterpretation && (
                  <div className="p-5">
                    <div className="prose prose-sm prose-purple max-w-none text-stone-700 whitespace-pre-wrap">
                      {aiInterpretation}
                    </div>
                    <button 
                      onClick={generateAiInterpretation}
                      disabled={isGeneratingAi}
                      className="mt-4 text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      {isGeneratingAi ? <Loader2 size={12} className="animate-spin" /> : 'Regenerate'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full min-h-[400px] bg-stone-50 border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-stone-400 p-6 text-center">
              <BarChart2 className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-stone-500">No Analysis Yet</p>
              <p className="text-sm mt-1 max-w-sm">Enter your experimental observations and click Calculate ANOVA to view results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
