import { isPlanExpired } from '../../utils/planAccess';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../src/authContext';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlaskConical, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Download,
  Grid3X3,
  Settings2
} from 'lucide-react';
import { DesignType, Treatment, Factor, LayoutResult } from './experimentTypes';
import { generateLayout } from './designEngine';
import { exportToCSV } from './exportPlan';

export default function ExperimentPage() {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [designType, setDesignType] = useState<DesignType>('RCBD');
  const [replications, setReplications] = useState<number>(3);
  const [plotLength, setPlotLength] = useState<number>(5);
  const [plotWidth, setPlotWidth] = useState<number>(4);
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 10000));
  
  const [treatments, setTreatments] = useState<Treatment[]>([
    { id: 't1', code: 'T1', description: 'Control' },
    { id: 't2', code: 'T2', description: 'NPK 100%' },
    { id: 't3', code: 'T3', description: 'NPK + FYM' }
  ]);
  
  const [factors, setFactors] = useState<Factor[]>([
    { id: 'f1', name: 'Nitrogen', levels: ['N0', 'N50', 'N100'] },
    { id: 'f2', name: 'Variety', levels: ['V1', 'V2'] }
  ]);
  
  const [mainPlotTreatments, setMainPlotTreatments] = useState<Treatment[]>([
    { id: 'm1', code: 'I1', description: 'Irrigation 1' },
    { id: 'm2', code: 'I2', description: 'Irrigation 2' }
  ]);
  
  const [subPlotTreatments, setSubPlotTreatments] = useState<Treatment[]>([
    { id: 's1', code: 'N1', description: 'Nitrogen 1' },
    { id: 's2', code: 'N2', description: 'Nitrogen 2' },
    { id: 's3', code: 'N3', description: 'Nitrogen 3' }
  ]);
  
  const [result, setResult] = useState<LayoutResult | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const addTreatment = () => {
    const nextNum = treatments.length + 1;
    setTreatments([...treatments, { id: `t${Date.now()}`, code: `T${nextNum}`, description: `Treatment ${nextNum}` }]);
  };

  const removeTreatment = (id: string) => {
    setTreatments(treatments.filter(t => t.id !== id));
  };

  const updateTreatment = (id: string, field: keyof Treatment, value: string) => {
    setTreatments(treatments.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addFactor = () => {
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

  const addMainPlotTreatment = () => {
    const nextNum = mainPlotTreatments.length + 1;
    setMainPlotTreatments([...mainPlotTreatments, { id: `m${Date.now()}`, code: `M${nextNum}`, description: `Main Plot ${nextNum}` }]);
  };

  const removeMainPlotTreatment = (id: string) => {
    setMainPlotTreatments(mainPlotTreatments.filter(t => t.id !== id));
  };

  const updateMainPlotTreatment = (id: string, field: keyof Treatment, value: string) => {
    setMainPlotTreatments(mainPlotTreatments.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addSubPlotTreatment = () => {
    const nextNum = subPlotTreatments.length + 1;
    setSubPlotTreatments([...subPlotTreatments, { id: `s${Date.now()}`, code: `S${nextNum}`, description: `Sub Plot ${nextNum}` }]);
  };

  const removeSubPlotTreatment = (id: string) => {
    setSubPlotTreatments(subPlotTreatments.filter(t => t.id !== id));
  };

  const updateSubPlotTreatment = (id: string, field: keyof Treatment, value: string) => {
    setSubPlotTreatments(subPlotTreatments.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleGenerate = () => {
    const newWarnings: string[] = [];
    
    if (replications < 2) {
      newWarnings.push("Low statistical power: Replications should be at least 2 (preferably 3 or more).");
    }
    
    if (designType === 'CRD' || designType === 'RCBD') {
      if (treatments.length < 2) {
        setWarnings(["Invalid experiment: At least 2 treatments are required."]);
        return;
      }
    } else if (designType === 'Factorial RCBD') {
      if (factors.length < 2) {
        setWarnings(["Invalid experiment: At least 2 factors are required for a factorial design."]);
        return;
      }
      if (factors.some(f => f.levels.length < 2)) {
        setWarnings(["Invalid experiment: Each factor must have at least 2 levels."]);
        return;
      }
    } else if (designType === 'Split Plot') {
      if (mainPlotTreatments.length < 2 || subPlotTreatments.length < 2) {
        setWarnings(["Invalid experiment: At least 2 main plot and 2 sub plot treatments are required."]);
        return;
      }
    }
    
    if (!plotLength || !plotWidth) {
      setWarnings(["Plot size missing: Please enter plot length and width."]);
      return;
    }

    const layout = generateLayout(
      designType,
      treatments,
      factors,
      mainPlotTreatments,
      subPlotTreatments,
      replications,
      seed,
      plotLength,
      plotWidth
    );
    
    setResult(layout);
    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Experiment Builder',
          inputData: { timestamp: new Date().toISOString() },
          outputData: layout,
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }).catch(console.error);
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  
    setWarnings(newWarnings);
  };

  const handleExport = () => {
    if (result) {
      exportToCSV(result.plots, `Experiment_Plan_${designType.replace(' ', '_')}_${Date.now()}.csv`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-indigo-100 p-3 rounded-xl">
          <FlaskConical className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Experiment Builder</h1>
          <p className="text-stone-500 text-sm">Field Trial Design Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-stone-500" />
                Design Parameters
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Design Type</label>
                <select 
                  value={designType}
                  onChange={(e) => {
                    setDesignType(e.target.value as DesignType);
                    setResult(null);
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="CRD">CRD (Completely Randomized Design)</option>
                  <option value="RCBD">RCBD (Randomized Complete Block Design)</option>
                  <option value="Factorial RCBD">Factorial RCBD</option>
                  <option value="Split Plot">Split Plot</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Replications</label>
                  <input 
                    type="number" 
                    value={replications}
                    onChange={(e) => setReplications(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Seed Value</label>
                  <input 
                    type="number" 
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Plot Length (m)</label>
                  <input 
                    type="number" 
                    value={plotLength}
                    onChange={(e) => setPlotLength(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Plot Width (m)</label>
                  <input 
                    type="number" 
                    value={plotWidth}
                    onChange={(e) => setPlotWidth(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {(designType === 'CRD' || designType === 'RCBD') && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-stone-500" />
                  Treatments
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {treatments.map((t) => (
                  <div key={t.id} className="flex gap-2 items-center group">
                    <input 
                      type="text" 
                      value={t.code}
                      onChange={(e) => updateTreatment(t.id, 'code', e.target.value)}
                      className="w-16 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                      placeholder="Code"
                    />
                    <input 
                      type="text" 
                      value={t.description}
                      onChange={(e) => updateTreatment(t.id, 'description', e.target.value)}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                      placeholder="Description"
                    />
                    <button 
                      onClick={() => removeTreatment(t.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addTreatment}
                  className="mt-2 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 w-full justify-center py-2 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <Plus size={16} /> Add Treatment
                </button>
              </div>
            </div>
          )}

          {designType === 'Factorial RCBD' && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-stone-500" />
                  Factors
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {factors.map((f) => (
                  <div key={f.id} className="space-y-2 border border-stone-100 p-3 rounded-xl bg-stone-50 relative group">
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
                        className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                        placeholder="e.g., Nitrogen"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Levels (comma separated)</label>
                      <input 
                        type="text" 
                        value={f.levels.join(', ')}
                        onChange={(e) => updateFactorLevels(f.id, e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                        placeholder="e.g., N0, N50, N100"
                      />
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
          )}

          {designType === 'Split Plot' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                  <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-stone-500" />
                    Main Plot Treatments
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  {mainPlotTreatments.map((t) => (
                    <div key={t.id} className="flex gap-2 items-center group">
                      <input 
                        type="text" 
                        value={t.code}
                        onChange={(e) => updateMainPlotTreatment(t.id, 'code', e.target.value)}
                        className="w-16 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                        placeholder="Code"
                      />
                      <input 
                        type="text" 
                        value={t.description}
                        onChange={(e) => updateMainPlotTreatment(t.id, 'description', e.target.value)}
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                        placeholder="Description"
                      />
                      <button 
                        onClick={() => removeMainPlotTreatment(t.id)}
                        className="p-1.5 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addMainPlotTreatment}
                    className="mt-2 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 w-full justify-center py-2 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Plus size={16} /> Add Main Plot
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                  <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-stone-500" />
                    Sub Plot Treatments
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  {subPlotTreatments.map((t) => (
                    <div key={t.id} className="flex gap-2 items-center group">
                      <input 
                        type="text" 
                        value={t.code}
                        onChange={(e) => updateSubPlotTreatment(t.id, 'code', e.target.value)}
                        className="w-16 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                        placeholder="Code"
                      />
                      <input 
                        type="text" 
                        value={t.description}
                        onChange={(e) => updateSubPlotTreatment(t.id, 'description', e.target.value)}
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                        placeholder="Description"
                      />
                      <button 
                        onClick={() => removeSubPlotTreatment(t.id)}
                        className="p-1.5 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addSubPlotTreatment}
                    className="mt-2 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 w-full justify-center py-2 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Plus size={16} /> Add Sub Plot
                  </button>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={handleGenerate}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
          >
            Generate Experimental Plan
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Total Plots</p>
                  <p className="text-3xl font-light text-stone-800">{result.plots.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Total Area</p>
                  <p className="text-3xl font-light text-stone-800">{result.totalArea.toFixed(2)} <span className="text-lg text-stone-400">m²</span></p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Export</p>
                    <p className="text-sm text-stone-600">Download CSV</p>
                  </div>
                  <button 
                    onClick={handleExport}
                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-5 py-4 border-b border-stone-200">
                  <h2 className="font-semibold text-stone-800">Field Layout Map</h2>
                  <p className="text-xs text-stone-500 mt-1">Schematic representation (Rows: {result.rows}, Cols: {result.cols})</p>
                </div>
                <div className="p-5 overflow-x-auto">
                  <div 
                    className="grid gap-2 min-w-max" 
                    style={{ gridTemplateColumns: `repeat(${result.cols}, minmax(80px, 1fr))` }}
                  >
                    {result.plots.map((plot, i) => (
                      <div 
                        key={i} 
                        className="border border-indigo-100 bg-indigo-50/50 rounded-lg p-3 text-center flex flex-col justify-center min-h-[80px]"
                      >
                        <span className="text-[10px] text-stone-400 font-mono mb-1">P-{plot.plotNumber}</span>
                        <span className="font-bold text-indigo-700 text-sm">{plot.treatment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-5 py-4 border-b border-stone-200">
                  <h2 className="font-semibold text-stone-800">Layout Table</h2>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white shadow-sm">
                      <tr>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Block/Rep</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Plot No.</th>
                        <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Treatment</th>
                        {(designType === 'Split Plot') && (
                          <>
                            <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Main Plot</th>
                            <th className="py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">Sub Plot</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {result.plots.map((plot, i) => (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="py-2 px-4 text-sm text-stone-600">{plot.block}</td>
                          <td className="py-2 px-4 text-sm font-mono text-stone-500">{plot.plotNumber}</td>
                          <td className="py-2 px-4 text-sm font-medium text-indigo-600">{plot.treatment}</td>
                          {(designType === 'Split Plot') && (
                            <>
                              <td className="py-2 px-4 text-sm text-stone-600">{plot.mainPlot}</td>
                              <td className="py-2 px-4 text-sm text-stone-600">{plot.subPlot}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[400px] bg-stone-50 border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-stone-400 p-6 text-center">
              <Grid3X3 className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-stone-500">No Layout Generated</p>
              <p className="text-sm mt-1 max-w-sm">Configure your design parameters and treatments, then click Generate Experimental Plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
