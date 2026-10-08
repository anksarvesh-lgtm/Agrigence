import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  FileSpreadsheet, 
  Download, 
  Info,
  ChevronRight,
  TrendingUp,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FieldRow, computeAnova, AnovaResult, generateSummary } from '../../utils/anova';
import { calculateRowMean } from '../../utils/statistics';
import { importExcelData } from '../../utils/excelImport';

interface FieldDataTableProps {
  onSave?: (rows: FieldRow[], anovaResult: AnovaResult | null) => void;
}

const FieldDataTable: React.FC<FieldDataTableProps> = ({ onSave }) => {
  const [rows, setRows] = useState<FieldRow[]>([
    { plotNo: "101", replication: "R1", treatment: "T1", control: false, observations: [0, 0, 0], mean: 0 }
  ]);
  const [columnCount, setColumnCount] = useState(3);
  const [anovaResult, setAnovaResult] = useState<AnovaResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addRow = () => {
    setRows(prev => [
      ...prev,
      {
        plotNo: "",
        replication: `R${prev.length + 1}`,
        treatment: `T${prev.length + 1}`,
        control: false,
        observations: Array(columnCount).fill(0),
        mean: 0
      }
    ]);
  };

  const removeRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const addColumn = () => {
    setColumnCount(prev => prev + 1);
    setRows(prev => prev.map(row => ({
      ...row,
      observations: [...row.observations, 0]
    })));
  };

  const removeColumn = () => {
    if (columnCount <= 1) return;
    setColumnCount(prev => prev - 1);
    setRows(prev => prev.map(row => ({
      ...row,
      observations: row.observations.slice(0, -1),
      mean: calculateRowMean(row.observations.slice(0, -1))
    })));
  };

  const updateRow = (index: number, field: keyof FieldRow, value: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const updateObservation = (rowIndex: number, colIndex: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updated = [...rows];
    updated[rowIndex].observations[colIndex] = numValue;
    updated[rowIndex].mean = calculateRowMean(updated[rowIndex].observations);
    setRows(updated);
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedRows = await importExcelData(file);
      if (importedRows.length > 0) {
        setRows(importedRows);
        setColumnCount(importedRows[0].observations.length);
      }
    } catch (err) {
      alert('Failed to import Excel file. Please check the format.');
      console.error(err);
    }
  };

  const runAnova = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = computeAnova(rows);
      setAnovaResult(result);
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
          <div className="flex items-center gap-3">
            <div className="bg-agri-secondary text-white p-2 rounded-lg">
              <FileSpreadsheet size={18} />
            </div>
            <h3 className="font-serif font-bold text-lg text-agri-primary">Data Entry Table</h3>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
              <Download size={14} /> Import Excel
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelImport} />
            </label>
            <button 
              onClick={addColumn}
              className="bg-agri-secondary/10 text-agri-secondary hover:bg-agri-secondary hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Plus size={14} /> Add Observation
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 border-b border-stone-100">
                <th className="px-6 py-5 w-24">Plot No</th>
                <th className="px-6 py-5 w-24">Rep</th>
                <th className="px-6 py-5 w-32">Treatment</th>
                <th className="px-6 py-5 w-24 text-center">Control</th>
                {Array.from({ length: columnCount }).map((_, i) => (
                  <th key={i} className="px-6 py-5 min-w-[100px] text-center">
                    Obs {i + 1}
                  </th>
                ))}
                <th className="px-6 py-5 w-24 text-center bg-agri-secondary/5 text-agri-secondary">Mean</th>
                <th className="px-6 py-5 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={row.plotNo} 
                      onChange={(e) => updateRow(rowIndex, 'plotNo', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent focus:border-agri-secondary outline-none text-sm font-bold text-agri-primary"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={row.replication} 
                      onChange={(e) => updateRow(rowIndex, 'replication', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent focus:border-agri-secondary outline-none text-sm text-stone-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={row.treatment} 
                      onChange={(e) => updateRow(rowIndex, 'treatment', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent focus:border-agri-secondary outline-none text-sm text-stone-600"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={row.control} 
                      onChange={(e) => updateRow(rowIndex, 'control', e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-agri-secondary focus:ring-agri-secondary"
                    />
                  </td>
                  {row.observations.map((obs, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <input 
                        type="number" 
                        value={obs || ''} 
                        onChange={(e) => updateObservation(rowIndex, colIndex, e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary transition-all"
                      />
                    </td>
                  ))}
                  <td className="px-6 py-4 text-center bg-agri-secondary/5 font-mono font-bold text-agri-secondary text-sm">
                    {row.mean.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => removeRow(rowIndex)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-stone-50/50 border-t border-stone-100 flex justify-between items-center">
          <button 
            onClick={addRow}
            className="flex items-center gap-2 text-agri-primary hover:text-agri-secondary transition-colors text-sm font-bold"
          >
            <Plus size={18} /> Add New Plot Row
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={runAnova}
              disabled={isAnalyzing || rows.length < 2}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isAnalyzing || rows.length < 2 ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-agri-primary text-white shadow-lg shadow-agri-primary/20 hover:scale-105 active:scale-95'}`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Calculator size={16} /> Run ANOVA
                </>
              )}
            </button>
            {onSave && (
              <button 
                onClick={() => onSave(rows, anovaResult)}
                className="flex items-center gap-2 px-8 py-3 bg-white border border-stone-200 text-agri-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-stone-50 transition-all"
              >
                <Save size={16} /> Save Dataset
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {anovaResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-stone-100 bg-emerald-50/30 flex items-center gap-3">
                <div className="bg-emerald-500 text-white p-2 rounded-lg">
                  <TrendingUp size={18} />
                </div>
                <h3 className="font-serif font-bold text-lg text-emerald-900">ANOVA Summary Table</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 border-b border-stone-100">
                      <th className="px-8 py-5">Source of Variation</th>
                      <th className="px-8 py-5 text-center">df</th>
                      <th className="px-8 py-5 text-center">SS</th>
                      <th className="px-8 py-5 text-center">MS</th>
                      <th className="px-8 py-5 text-center">F-Value</th>
                      <th className="px-8 py-5 text-center">F-Crit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    <tr>
                      <td className="px-8 py-5 font-bold text-agri-primary text-sm">Treatments</td>
                      <td className="px-8 py-5 text-center text-sm">{anovaResult.sourceOfVariation.treatment.df}</td>
                      <td className="px-8 py-5 text-center text-sm font-mono">{anovaResult.sourceOfVariation.treatment.ss.toFixed(4)}</td>
                      <td className="px-8 py-5 text-center text-sm font-mono">{anovaResult.sourceOfVariation.treatment.ms.toFixed(4)}</td>
                      <td className={`px-8 py-5 text-center text-sm font-mono font-bold ${anovaResult.sourceOfVariation.treatment.significant ? 'text-emerald-600' : 'text-stone-600'}`}>
                        {anovaResult.sourceOfVariation.treatment.f.toFixed(4)}
                        {anovaResult.sourceOfVariation.treatment.significant && '*'}
                      </td>
                      <td className="px-8 py-5 text-center text-sm font-mono text-stone-400">{anovaResult.sourceOfVariation.treatment.fCrit.toFixed(4)}</td>
                    </tr>
                    <tr>
                      <td className="px-8 py-5 font-bold text-agri-primary text-sm">Error</td>
                      <td className="px-8 py-5 text-center text-sm">{anovaResult.sourceOfVariation.error.df}</td>
                      <td className="px-8 py-5 text-center text-sm font-mono">{anovaResult.sourceOfVariation.error.ss.toFixed(4)}</td>
                      <td className="px-8 py-5 text-center text-sm font-mono">{anovaResult.sourceOfVariation.error.ms.toFixed(4)}</td>
                      <td className="px-8 py-5"></td>
                      <td className="px-8 py-5"></td>
                    </tr>
                    <tr className="bg-stone-50/30">
                      <td className="px-8 py-5 font-bold text-agri-primary text-sm">Total</td>
                      <td className="px-8 py-5 text-center text-sm">{anovaResult.sourceOfVariation.total.df}</td>
                      <td className="px-8 py-5 text-center text-sm font-mono">{anovaResult.sourceOfVariation.total.ss.toFixed(4)}</td>
                      <td className="px-8 py-5"></td>
                      <td className="px-8 py-5"></td>
                      <td className="px-8 py-5"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-agri-primary rounded-[2.5rem] p-8 text-white shadow-premium relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Info size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="font-serif font-bold text-2xl mb-6">Statistical Interpretation</h3>
                <div className="space-y-6">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">Conclusion</p>
                    <p className="text-lg font-medium leading-relaxed">
                      {anovaResult.interpretation}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mb-1">Grand Mean</p>
                      <p className="text-xl font-bold font-mono">{anovaResult.grandMean.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mb-1">CV (%)</p>
                      <p className="text-xl font-bold font-mono">{anovaResult.cv.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-white/50 text-[10px] leading-relaxed italic">
                      * Significance tested at α = 0.05 level. CV below 20% generally indicates acceptable experimental precision for field trials.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FieldDataTable;
