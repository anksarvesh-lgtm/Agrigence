import { isPlanExpired } from '../../utils/planAccess';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../src/authContext';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Trash2, Plus, AlertTriangle, Download, Settings2, Table as TableIcon } from 'lucide-react';
import { Factor, TreatmentCombination, FactorialResult } from './factorialTypes';
import { generateFactorial } from './factorialEngine';
import { assignCodes } from './treatmentCoder';
import { validateFactorial } from './factorialValidator';

export default function FactorialPage() {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [factors, setFactors] = useState<Factor[]>([
    { id: 'f1', name: 'Variety', levels: ['V1', 'V2'] },
    { id: 'f2', name: 'Nitrogen', levels: ['N0', 'N60', 'N120'] }
  ]);
  
  const [replications, setReplications] = useState<number>(3);
  const [result, setResult] = useState<FactorialResult | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const addFactor = () => {
    if (factors.length >= 5) {
      setWarnings(["Maximum of 5 factors allowed."]);
      return;
    }
    const nextNum = factors.length + 1;
    setFactors([...factors, { id: `f${Date.now()}`, name: `Factor ${nextNum}`, levels: ['L1', 'L2'] }]);
  };

  const removeFactor = (id: string) => {
    setFactors(factors.filter(f => f.id !== id));
  };

  const updateFactorName = (id: string, name: string) => {
    setFactors(factors.map(f => f.id === id ? { ...f, name } : f));
  };

  const updateFactorLevels = (id: string, levelsStr: string) => {
    const levels = levelsStr.split(',').map(l => l.trim()).filter(l => l);
    setFactors(factors.map(f => f.id === id ? { ...f, levels } : f));
  };

  const handleGenerate = () => {
    const validationWarnings = validateFactorial(factors);
    
    // Check for errors (warnings starting with "Error")
    const hasErrors = validationWarnings.some(w => w.startsWith('Error'));
    
    setWarnings(validationWarnings);
    
    if (hasErrors) {
      setResult(null);
    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Factorial Generator',
          inputData: { timestamp: new Date().toISOString() },
          outputData: null,
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }).catch(console.error);
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  
      return;
    }

    const factorDict: Record<string, string[]> = {};
    factors.forEach(f => {
      factorDict[f.name] = f.levels;
    });

    const rawCombinations = generateFactorial(factorDict);
    const codedCombinations = assignCodes(rawCombinations);

    setResult({
      factors: [...factors],
      combinations: codedCombinations,
      totalTreatments: codedCombinations.length,
      recommendedReps: replications,
      totalPlots: codedCombinations.length * replications
    });
  };

  const handleExport = () => {
    if (!result) return;
    
    const factorNames = result.factors.map(f => f.name);
    const headers = ['TID', ...factorNames];
    
    const rows = result.combinations.map(combo => {
      return [
        combo.TID,
        ...factorNames.map(fn => `"${combo[fn] || ''}"`)
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Factorial_Treatments_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-indigo-100 p-3 rounded-xl">
          <Network className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Factorial Generator</h1>
          <p className="text-stone-500 text-sm">Treatment Combination Builder for Multi-Factor Experiments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-stone-500" />
                Define Factors
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {factors.map((f) => (
                <div key={f.id} className="space-y-3 border border-stone-100 p-4 rounded-xl bg-stone-50 relative group">
                  <button 
                    onClick={() => removeFactor(f.id)}
                    className="absolute top-2 right-2 p-1 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Factor Name</label>
                    <input 
                      type="text" 
                      value={f.name}
                      onChange={(e) => updateFactorName(f.id, e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                      placeholder="e.g., Nitrogen"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Levels (comma separated)</label>
                    <input 
                      type="text" 
                      value={f.levels.join(', ')}
                      onChange={(e) => updateFactorLevels(f.id, e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                      placeholder="e.g., N0, N60, N120"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">{f.levels.length} level(s) detected</p>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={addFactor}
                className="mt-2 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 w-full justify-center py-2 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus size={16} /> Add Factor
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-stone-500" />
                Experiment Settings
              </h2>
            </div>
            <div className="p-5">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Replications</label>
              <input 
                type="number" 
                value={replications}
                onChange={(e) => setReplications(parseInt(e.target.value) || 1)}
                min={1}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
          >
            Generate Factorial Design
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
                  <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Factors</p>
                  <p className="text-2xl font-light text-stone-800">{result.factors.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Treatments</p>
                  <p className="text-2xl font-light text-stone-800">{result.totalTreatments}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Replications</p>
                  <p className="text-2xl font-light text-stone-800">{result.recommendedReps}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Total Plots</p>
                  <p className="text-2xl font-light text-stone-800">{result.totalPlots}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                  <h2 className="font-semibold text-stone-800">Treatment Combinations</h2>
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Download size={16} /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white sticky top-0 shadow-sm">
                      <tr>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">TID</th>
                        {result.factors.map(f => (
                          <th key={f.id} className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">{f.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {result.combinations.map((combo, i) => (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="py-2 px-4 text-sm font-mono font-medium text-indigo-600">{combo.TID}</td>
                          {result.factors.map(f => (
                            <td key={f.id} className="py-2 px-4 text-sm text-stone-600">{combo[f.name]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[400px] bg-stone-50 border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-stone-400 p-6 text-center">
              <Network className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-stone-500">No Combinations Generated</p>
              <p className="text-sm mt-1 max-w-sm">Define your factors and levels, then click Generate Factorial Design.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
