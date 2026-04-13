
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlaskConical, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Droplets,
  Leaf,
  Database
} from 'lucide-react';
import { SoilTestData, CropTarget, SelectedMaterial, NutrientResult, SoilType, PreviousCrop, Season } from './nutrientTypes';
import { FERTILIZER_DATABASE } from './fertilizerDatabase';
import { STCR_COEFFICIENTS } from './stcrConstants';
import * as formulas from './nutrientFormulas';
import * as engine from './nutrientEngine';
import { validateNutrients } from './nutrientValidation';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

const NutrientPage: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [soilData, setSoilData] = useState<SoilTestData>({
    availableN: 280,
    availableP: 15,
    availableK: 180,
    pH: 7.0,
    organicCarbon: 0.5,
    soilType: 'Alluvial',
    previousCrop: 'Cereal'
  });

  const [cropTarget, setCropTarget] = useState<CropTarget>({
    cropName: 'Wheat',
    targetYield: 45,
    season: 'Rabi'
  });

  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([]);
  const [result, setResult] = useState<NutrientResult | null>(null);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const handleSoilChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = e.target.type === 'number' ? parseFloat(value) || 0 : value;
    setSoilData((prev: SoilTestData) => ({ ...prev, [name]: val }));
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = e.target.type === 'number' ? parseFloat(value) || 0 : value;
    setCropTarget((prev: CropTarget) => ({ ...prev, [name]: val }));
  };

  const addMaterial = () => {
    const newMaterial: SelectedMaterial = {
      id: `mat_${Date.now()}`,
      material: FERTILIZER_DATABASE[0],
      qty: 100,
      price: 10
    };
    setSelectedMaterials(prev => [...prev, newMaterial]);
  };

  const removeMaterial = (id: string) => {
    setSelectedMaterials(prev => prev.filter(m => m.id !== id));
  };

  const updateMaterial = (id: string, updates: Partial<SelectedMaterial>) => {
    setSelectedMaterials(prev => prev.map(m => {
      if (m.id === id) {
        if (updates.material) {
          return { ...m, ...updates };
        }
        return { ...m, ...updates };
      }
      return m;
    }));
  };

  const calculate = () => {
    const coeffs = STCR_COEFFICIENTS[cropTarget.cropName] || STCR_COEFFICIENTS['Other'];
    
    // Step 1: Base STCR Requirement
    let reqN = formulas.requiredN(coeffs.N.NR, coeffs.N.CF, cropTarget.targetYield, coeffs.N.CS, soilData.availableN);
    let reqP = formulas.requiredP(coeffs.P.NR, coeffs.P.CF, cropTarget.targetYield, coeffs.P.CS, soilData.availableP);
    let reqK = formulas.requiredK(coeffs.K.NR, coeffs.K.CF, cropTarget.targetYield, coeffs.K.CS, soilData.availableK);

    // Step 2: Adjustments
    
    // Organic Carbon Adjustment: Reduce N by 10% for every 0.5% OC above 2%
    if (soilData.organicCarbon > 2.0) {
      const extraOC = soilData.organicCarbon - 2.0;
      const reductionFactor = Math.floor(extraOC / 0.5) * 0.10;
      reqN = reqN * (1 - reductionFactor);
    }

    // pH Adjustment
    if (soilData.pH < 6.5) {
      reqP = reqP * 1.10; // Increase P requirement 10%
    } else if (soilData.pH > 7.5) {
      reqP = reqP * 1.15; // Increase P requirement 15%
    }

    // Previous Legume Credit: Subtract 30 kg N/ha
    if (soilData.previousCrop === 'Legume') {
      reqN = Math.max(0, reqN - 30);
    }

    const required = {
      N: Math.max(0, reqN),
      P: Math.max(0, reqP),
      K: Math.max(0, reqK)
    };

    // Step 3 & 4: Supply from Materials
    const supplied = engine.totalSupply(selectedMaterials);
    
    // Step 5: Gap Analysis
    const gap = engine.calculateGap(required, supplied);
    
    // Step 6: Cost
    const cost = engine.totalCost(selectedMaterials);

    const tempResult: NutrientResult = {
      required,
      supplied,
      gap,
      cost,
      warnings: []
    };

    // Business Rule Validation
    tempResult.warnings = validateNutrients(soilData, selectedMaterials, tempResult);

    setResult(tempResult);

    // Log history if subscribed
    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Nutrient Management Tool',
          inputData: { soilData, cropTarget, selectedMaterials },
          outputData: tempResult,
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }).catch(console.error);
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  };

  const InputField = ({ label, name, value, onChange, type = "number", required = false, min, max, step }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-agri-secondary focus:border-transparent outline-none transition-all"
      />
    </div>
  );

  const ResultCard = ({ label, value, unit, icon: Icon, color = "agri-primary" }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-${color}/5 flex items-center justify-center text-${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{label}</p>
        <p className="text-2xl font-serif font-bold text-agri-primary">
          {typeof value === 'number' ? value.toFixed(2) : value} <span className="text-xs font-sans font-normal text-stone-400">{unit}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-agri-bg pb-20">
      {/* Header */}
      <div className="bg-[#0F392B] text-white py-16 px-6 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <FlaskConical size={400} className="absolute -right-20 -bottom-20 rotate-12" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
            <FlaskConical size={16} className="text-agri-secondary" />
            <span className="text-xs font-bold tracking-widest uppercase">Agri-Intelligence Tool 02</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Nutrient Requirement Tool</h1>
          <p className="text-xl text-stone-300 font-light max-w-2xl">
            Precision Soil Test Crop Response (STCR) planning for optimized fertilizer usage and maximum yield.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Droplets size={20} className="text-agri-secondary" /> Soil & Crop Data
              </h2>

              <div className="space-y-8">
                {/* Section 1: Soil Test */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-agri-secondary border-b border-stone-100 pb-2">Soil Test Data</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <InputField label="Avail. N (kg/ha)" name="availableN" value={soilData.availableN} onChange={handleSoilChange} required min="0" />
                    <InputField label="Avail. P (kg/ha)" name="availableP" value={soilData.availableP} onChange={handleSoilChange} required min="0" />
                    <InputField label="Avail. K (kg/ha)" name="availableK" value={soilData.availableK} onChange={handleSoilChange} required min="0" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Soil pH" name="pH" value={soilData.pH} onChange={handleSoilChange} required min="0" max="14" step="0.1" />
                    <InputField label="Org. Carbon (%)" name="organicCarbon" value={soilData.organicCarbon} onChange={handleSoilChange} required min="0" max="10" step="0.01" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Soil Type</label>
                      <select name="soilType" value={soilData.soilType} onChange={handleSoilChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none appearance-none">
                        <option value="Alluvial">Alluvial</option>
                        <option value="Black">Black</option>
                        <option value="Red">Red</option>
                        <option value="Laterite">Laterite</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Prev. Crop</label>
                      <select name="previousCrop" value={soilData.previousCrop} onChange={handleSoilChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none appearance-none">
                        <option value="Cereal">Cereal</option>
                        <option value="Legume">Legume</option>
                        <option value="Oilseed">Oilseed</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Crop Target */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-agri-secondary border-b border-stone-100 pb-2">Crop Target</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Crop Name</label>
                    <select name="cropName" value={cropTarget.cropName} onChange={handleCropChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none appearance-none">
                      {Object.keys(STCR_COEFFICIENTS).map(crop => <option key={crop} value={crop}>{crop}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Target Yield (q/ha)" name="targetYield" value={cropTarget.targetYield} onChange={handleCropChange} required min="1" />
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Season</label>
                      <select name="season" value={cropTarget.season} onChange={handleCropChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none appearance-none">
                        <option value="Kharif">Kharif</option>
                        <option value="Rabi">Rabi</option>
                        <option value="Zaid">Zaid</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Material Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-agri-secondary">Nutrient Sources</h3>
                    <button onClick={addMaterial} className="text-[10px] font-black uppercase tracking-widest text-agri-primary hover:text-agri-secondary flex items-center gap-1">
                      <Plus size={12} /> Add Source
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedMaterials.map((sm) => (
                      <div key={sm.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-4 relative group">
                        <button onClick={() => removeMaterial(sm.id)} className="absolute top-2 right-2 text-stone-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block">Material</label>
                          <select 
                            value={sm.material.id} 
                            onChange={(e) => {
                              const mat = FERTILIZER_DATABASE.find((f: any) => f.id === e.target.value);
                              if (mat) updateMaterial(sm.id, { material: mat });
                            }}
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none"
                          >
                            {FERTILIZER_DATABASE.map((f: any) => <option key={f.id} value={f.id}>{f.name} ({f.category})</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block">Qty (kg/ha)</label>
                            <input 
                              type="number" 
                              value={sm.qty} 
                              onChange={(e) => updateMaterial(sm.id, { qty: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block">Price (₹/kg)</label>
                            <input 
                              type="number" 
                              value={sm.price} 
                              onChange={(e) => updateMaterial(sm.id, { price: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4 text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                          <span>N: {sm.material.N}%</span>
                          <span>P: {sm.material.P}%</span>
                          <span>K: {sm.material.K}%</span>
                        </div>
                      </div>
                    ))}
                    {selectedMaterials.length === 0 && (
                      <p className="text-center text-xs text-stone-400 italic py-4">No materials selected. Add a source to calculate supply.</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={calculate}
                  className="w-full py-5 bg-agri-secondary text-agri-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-agri-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  Generate Recommendation <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* 1. Nutrient Requirement */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-agri-primary flex items-center gap-2">
                      <Database size={14} className="text-agri-secondary" /> STCR Nutrient Requirement (kg/ha)
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                      <ResultCard label="N Required" value={result.required.N} unit="kg/ha" icon={Leaf} color="emerald-600" />
                      <ResultCard label="P Required" value={result.required.P} unit="kg/ha" icon={Droplets} color="blue-600" />
                      <ResultCard label="K Required" value={result.required.K} unit="kg/ha" icon={TrendingUp} color="amber-600" />
                    </div>
                  </div>

                  {/* 2. Nutrient Supplied */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-agri-primary flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-agri-secondary" /> Supplied from Materials (kg/ha)
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">N Supplied</p>
                        <p className="text-xl font-bold text-emerald-600">{result.supplied.N.toFixed(2)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">P Supplied</p>
                        <p className="text-xl font-bold text-blue-600">{result.supplied.P.toFixed(2)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">K Supplied</p>
                        <p className="text-xl font-bold text-amber-600">{result.supplied.K.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Remaining Gap */}
                  <div className="bg-[#0F392B] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                      <AlertTriangle size={150} />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-agri-secondary mb-6">Remaining Nutrient Gap</p>
                      <div className="grid grid-cols-3 gap-10">
                        <div>
                          <h4 className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-widest">N Gap</h4>
                          <p className="text-4xl font-serif font-bold text-white">{result.gap.N.toFixed(1)} <span className="text-xs font-sans font-normal text-white/40">kg/ha</span></p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-widest">P Gap</h4>
                          <p className="text-4xl font-serif font-bold text-white">{result.gap.P.toFixed(1)} <span className="text-xs font-sans font-normal text-white/40">kg/ha</span></p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-widest">K Gap</h4>
                          <p className="text-4xl font-serif font-bold text-white">{result.gap.K.toFixed(1)} <span className="text-xs font-sans font-normal text-white/40">kg/ha</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Source Contribution Table */}
                  <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-100">
                        <tr>
                          <th className="px-6 py-4 font-black uppercase tracking-widest text-stone-400">Material</th>
                          <th className="px-6 py-4 font-black uppercase tracking-widest text-stone-400">Qty</th>
                          <th className="px-6 py-4 font-black uppercase tracking-widest text-stone-400">Avail. N</th>
                          <th className="px-6 py-4 font-black uppercase tracking-widest text-stone-400">Avail. P</th>
                          <th className="px-6 py-4 font-black uppercase tracking-widest text-stone-400">Avail. K</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {selectedMaterials.map(sm => {
                          const supply = engine.nutrientSupply(sm.qty, sm.material);
                          return (
                            <tr key={sm.id}>
                              <td className="px-6 py-4 font-bold text-agri-primary">{sm.material.name}</td>
                              <td className="px-6 py-4 text-stone-500">{sm.qty} kg/ha</td>
                              <td className="px-6 py-4 text-emerald-600 font-medium">{supply.N.toFixed(2)}</td>
                              <td className="px-6 py-4 text-blue-600 font-medium">{supply.P.toFixed(2)}</td>
                              <td className="px-6 py-4 text-amber-600 font-medium">{supply.K.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-stone-50/50 font-bold">
                        <tr>
                          <td colSpan={2} className="px-6 py-4 text-agri-primary uppercase tracking-widest text-[10px]">Total Cost</td>
                          <td colSpan={3} className="px-6 py-4 text-right text-lg text-agri-primary font-serif">₹ {result.cost.toFixed(2)} <span className="text-xs font-sans font-normal text-stone-400">/ ha</span></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* 5. Warnings */}
                  {result.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 space-y-4">
                      <h4 className="text-amber-800 font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                        <AlertTriangle size={18} /> Agronomic Advisory
                      </h4>
                      <ul className="space-y-2">
                        {result.warnings.map((w: string, i: number) => (
                          <li key={i} className="text-amber-700 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-stone-100 border-dashed">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-6">
                    <FlaskConical size={40} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-agri-primary mb-2">Ready for Planning</h3>
                  <p className="text-stone-400 text-sm max-w-xs">Enter your soil test results and select your available fertilizers to generate a scientific nutrient plan.</p>
                </div>
              )}
            </AnimatePresence>

            {/* Expandable Sections */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <button 
                  onClick={() => setShowFormulas(!showFormulas)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-all"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-agri-primary flex items-center gap-2">
                    <Info size={14} className="text-agri-secondary" /> STCR Equations & Adjustments
                  </span>
                  {showFormulas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showFormulas && (
                  <div className="px-6 py-6 border-t border-stone-50 bg-stone-50/30">
                    <div className="grid md:grid-cols-2 gap-6 text-[10px] font-mono text-stone-500">
                      <div className="p-4 bg-white rounded-xl border border-stone-100">
                        <p className="text-agri-secondary mb-2 font-bold">Base Requirement</p>
                        <code>((NR/CF)*100*T) - ((CS/100)*SN)</code>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-stone-100">
                        <p className="text-agri-secondary mb-2 font-bold">OC Adjustment</p>
                        <code>-10% N per 0.5% OC above 2%</code>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-stone-100">
                        <p className="text-agri-secondary mb-2 font-bold">pH Adjustment (P)</p>
                        <code>pH &lt; 6.5 (+10%), pH &gt; 7.5 (+15%)</code>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-stone-100">
                        <p className="text-agri-secondary mb-2 font-bold">Legume Credit</p>
                        <code>-30 kg N/ha</code>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <button 
                  onClick={() => setShowRules(!showRules)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-all"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-agri-primary flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-agri-secondary" /> Agronomic Rules
                  </span>
                  {showRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showRules && (
                  <div className="px-6 py-6 border-t border-stone-50 bg-stone-50/30">
                    <ul className="space-y-3 text-xs text-stone-600">
                      <li className="flex gap-3"><span className="text-agri-secondary font-bold">01</span> Organic N should not exceed 50% of total N supply.</li>
                      <li className="flex gap-3"><span className="text-agri-secondary font-bold">02</span> Critical K level is 120 kg/ha; below this requires urgent correction.</li>
                      <li className="flex gap-3"><span className="text-agri-secondary font-bold">03</span> Integrated Nutrient Management (INM) is recommended for all crops.</li>
                      <li className="flex gap-3"><span className="text-agri-secondary font-bold">04</span> Supply below 80% of requirement is flagged as under-fertilization.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutrientPage;
