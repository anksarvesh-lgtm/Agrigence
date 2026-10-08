import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Download,
  Settings2,
  ListOrdered
} from 'lucide-react';
import { convertToDose, UnitType } from './unitConverter';
import { validateDoseInputs } from './doseValidator';
import { exportDoseToCSV } from './exportDose';

interface TreatmentInput {
  id: string;
  name: string;
  rate: number;
  unit: UnitType;
  isAi: boolean;
  aiPercent: number;
}

interface DoseResult {
  treatment: string;
  fieldRate: string;
  plotDose: number;
  unit: string;
  totalRequired: number;
}

import { useAuth } from '../../src/authContext';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

export default function PlotDosePage() {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [plotLength, setPlotLength] = useState<number>(5);
  const [plotWidth, setPlotWidth] = useState<number>(4);
  const [numPlots, setNumPlots] = useState<number>(3);
  const [sprayVolume, setSprayVolume] = useState<number>(10);
  
  const [treatments, setTreatments] = useState<TreatmentInput[]>([
    { id: 't1', name: 'Urea', rate: 120, unit: 'kg/ha', isAi: false, aiPercent: 46 },
    { id: 't2', name: 'Pesticide A', rate: 2, unit: 'ml/L', isAi: false, aiPercent: 100 }
  ]);
  
  const [results, setResults] = useState<DoseResult[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  const plotArea = plotLength * plotWidth;

  const addTreatment = () => {
    const nextNum = treatments.length + 1;
    setTreatments([...treatments, { 
      id: `t${Date.now()}`, 
      name: `Treatment ${nextNum}`, 
      rate: 0, 
      unit: 'kg/ha', 
      isAi: false, 
      aiPercent: 100 
    }]);
  };

  const removeTreatment = (id: string) => {
    setTreatments(treatments.filter(t => t.id !== id));
  };

  const updateTreatment = (id: string, field: keyof TreatmentInput, value: any) => {
    setTreatments(treatments.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleCalculate = () => {
    let allWarnings: string[] = [];
    let newResults: DoseResult[] = [];
    
    if (plotArea <= 0) {
      allWarnings.push("Invalid plot dimensions.");
    }
    
    treatments.forEach(t => {
      const tWarnings = validateDoseInputs(plotArea, t.rate, t.isAi ? t.aiPercent : undefined, t.unit === 'ppm' ? t.rate : undefined);
      allWarnings = [...allWarnings, ...tWarnings];
      
      const { plotDose, displayUnit } = convertToDose(
        t.rate, 
        t.unit, 
        plotArea, 
        sprayVolume, 
        t.isAi, 
        t.aiPercent
      );
      
      let fieldRateStr = `${t.rate} ${t.unit}`;
      if (t.isAi) {
        fieldRateStr += ` (${t.aiPercent}% AI)`;
      }
      
      newResults.push({
        treatment: t.name,
        fieldRate: fieldRateStr,
        plotDose: plotDose,
        unit: displayUnit,
        totalRequired: plotDose * (numPlots || 1)
      });
    });
    
    setWarnings([...new Set(allWarnings)]);
    setResults(newResults);

    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Plot Dose Calculator',
          inputData: { plotLength, plotWidth, numPlots, sprayVolume, treatments },
          outputData: { status: 'Generated' },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }).catch(console.error);
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  };

  const handleExport = () => {
    if (results.length > 0) {
      exportDoseToCSV(results, `Plot_Dose_Calculation_${Date.now()}.csv`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-emerald-100 p-3 rounded-xl">
          <Calculator className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Plot Dose Calculator</h1>
          <p className="text-stone-500 text-sm">Field Rate → Experimental Plot Quantity Converter</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-stone-500" />
                Plot Parameters
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Length (m)</label>
                  <input 
                    type="number" 
                    value={plotLength}
                    onChange={(e) => setPlotLength(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Width (m)</label>
                  <input 
                    type="number" 
                    value={plotWidth}
                    onChange={(e) => setPlotWidth(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex justify-between items-center">
                <span className="text-sm text-stone-600 font-medium">Plot Area</span>
                <span className="text-lg font-bold text-emerald-600">{plotArea.toFixed(2)} m²</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">No. of Plots</label>
                  <input 
                    type="number" 
                    value={numPlots}
                    onChange={(e) => setNumPlots(parseInt(e.target.value) || 1)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Spray Vol (L/plot)</label>
                  <input 
                    type="number" 
                    value={sprayVolume}
                    onChange={(e) => setSprayVolume(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-stone-500" />
                Treatments
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {treatments.map((t) => (
                <div key={t.id} className="space-y-3 border border-stone-100 p-4 rounded-xl bg-stone-50 relative group">
                  <button 
                    onClick={() => removeTreatment(t.id)}
                    className="absolute top-2 right-2 p-1 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Treatment Name</label>
                    <input 
                      type="text" 
                      value={t.name}
                      onChange={(e) => updateTreatment(t.id, 'name', e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Rate</label>
                      <input 
                        type="number" 
                        value={t.rate}
                        onChange={(e) => updateTreatment(t.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Unit</label>
                      <select 
                        value={t.unit}
                        onChange={(e) => updateTreatment(t.id, 'unit', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      >
                        <option value="kg/ha">kg/ha</option>
                        <option value="g/ha">g/ha</option>
                        <option value="L/ha">L/ha</option>
                        <option value="ml/ha">ml/ha</option>
                        <option value="ppm">PPM</option>
                        <option value="%">%</option>
                        <option value="ml/L">ml/L</option>
                        <option value="g/L">g/L</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={t.isAi}
                        onChange={(e) => updateTreatment(t.id, 'isAi', e.target.checked)}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Active Ingredient?
                    </label>
                    
                    {t.isAi && (
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs text-stone-500">AI %</span>
                        <input 
                          type="number" 
                          value={t.aiPercent}
                          onChange={(e) => updateTreatment(t.id, 'aiPercent', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={addTreatment}
                className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 w-full justify-center py-2 border border-dashed border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <Plus size={16} /> Add Treatment
              </button>
            </div>
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
          >
            Generate Plot Dose
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
          {results.length > 0 ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                  <h2 className="font-semibold text-stone-800">Plot Dose Table</h2>
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <Download size={16} /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white">
                      <tr>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Treatment</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Field Rate</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Plot Dose</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {results.map((res, i) => (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="py-3 px-4 text-sm font-medium text-stone-800">{res.treatment}</td>
                          <td className="py-3 px-4 text-sm text-stone-500">{res.fieldRate}</td>
                          <td className="py-3 px-4 text-sm font-mono text-emerald-600 font-bold">{res.plotDose.toFixed(4)}</td>
                          <td className="py-3 px-4 text-sm text-stone-500">{res.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-5 py-4 border-b border-stone-200">
                  <h2 className="font-semibold text-stone-800">Total Material Required</h2>
                  <p className="text-xs text-stone-500 mt-1">For {numPlots} plots</p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((res, i) => (
                      <div key={i} className="border border-stone-100 rounded-xl p-4 flex items-center justify-between bg-stone-50">
                        <span className="text-sm font-medium text-stone-700">{res.treatment}</span>
                        <div className="text-right">
                          <span className="text-lg font-bold text-stone-800 font-mono">{res.totalRequired.toFixed(4)}</span>
                          <span className="text-xs text-stone-500 ml-1">{res.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[400px] bg-stone-50 border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-stone-400 p-6 text-center">
              <Calculator className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-stone-500">No Calculation Yet</p>
              <p className="text-sm mt-1 max-w-sm">Enter your plot dimensions and field rates, then click Generate Plot Dose.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
