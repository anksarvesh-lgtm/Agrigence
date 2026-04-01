import { useLocation } from 'react-router-dom';

import React, { useState , useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Maximize
} from 'lucide-react';
import { SeedRateInput, SeedRateResult } from './seedRateTypes';
import { CROP_TYPES, AREA_UNITS, AREA_CONVERSION } from './seedRateConstants';
import * as formulas from './seedRateFormulas';
import { validateSeed } from './seedRateValidation';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

const SeedRatePage: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [input, setInput] = useState<SeedRateInput>({
    seedLotName: '',
    purity: 90,
    germination: 85,
    hardSeed: 0,
    tgWeight: 40,
    targetPopulation: 250,
    emergence: 80,
    cropType: 'Wheat',
    pricePerKg: 0,
    fieldArea: 1,
    areaUnit: 'Hectare'
  });

  const [result, setResult] = useState<SeedRateResult | null>(null);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.restoreData) {
      const data = location.state.restoreData;
      setInput(data);
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = e.target.type === 'number' ? parseFloat(value) || 0 : value;
    setInput(prev => ({ ...prev, [name]: val }));
  };

  const calculate = async () => {
    const pls = formulas.calculatePLS(input.purity, input.germination);
    const bulk = formulas.bulkRequired(pls);
    const cost = formulas.costPerPLS(input.pricePerKg, bulk);
    const sr = formulas.sowingRate(
      input.targetPopulation,
      input.tgWeight,
      input.germination,
      input.emergence
    );
    const adjustedSr = formulas.adjustedSowingRate(sr, input.hardSeed);
    
    const areaInHa = input.fieldArea * AREA_CONVERSION[input.areaUnit];
    const total = formulas.totalSeed(adjustedSr, areaInHa);
    
    const warnings = validateSeed(input);

    const resultData = {
      pls,
      bulkRequired: bulk,
      costPerPLS: cost,
      sowingRate: sr,
      adjustedSowingRate: adjustedSr,
      totalSeed: total,
      warnings
    };

    setResult(resultData);

    // Log history if subscribed
    if (user && isPlanActive) {
      try {
        await mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Seed Rate Calculator',
          inputData: input,
          outputData: resultData,
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  };

  const InputField = ({ label, name, type = "number", required = false, min, max, step }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={(input as any)[name]}
        onChange={handleInputChange}
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
      <div className="bg-agri-primary text-white py-16 px-6 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <TrendingUp size={400} className="absolute -right-20 -bottom-20 rotate-12" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
            <Calculator size={16} className="text-agri-secondary" />
            <span className="text-xs font-bold tracking-widest uppercase">Agri-Intelligence Tool 01</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Seed Rate Calculator</h1>
          <p className="text-xl text-stone-300 font-light max-w-2xl">
            Optimize your crop establishment with deterministic scientific calculations for precise seed requirements.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Maximize size={20} className="text-agri-secondary" /> Input Parameters
              </h2>

              <div className="space-y-8">
                {/* Section 1: Seed Quality */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-agri-secondary border-b border-stone-100 pb-2">Seed Quality Details</h3>
                  <InputField label="Seed Lot Name" name="seedLotName" type="text" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Purity (%)" name="purity" required min="0" max="100" />
                    <InputField label="Germination (%)" name="germination" required min="0" max="100" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Hard Seed (%)" name="hardSeed" min="0" max="100" />
                    <InputField label="1000 Grain Weight (g)" name="tgWeight" required min="0.1" step="0.1" />
                  </div>
                </div>

                {/* Section 2: Crop Establishment */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-agri-secondary border-b border-stone-100 pb-2">Crop Establishment</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Crop Type <span className="text-red-500">*</span></label>
                    <select
                      name="cropType"
                      value={input.cropType}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-agri-secondary focus:border-transparent outline-none transition-all appearance-none"
                    >
                      {CROP_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Target Population (plants/m²)" name="targetPopulation" required min="1" />
                    <InputField label="Field Emergence (%)" name="emergence" required min="0" max="100" />
                  </div>
                </div>

                {/* Section 3 & 4: Economic & Area */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-agri-secondary border-b border-stone-100 pb-2">Economic & Field Area</h3>
                  <InputField label="Purchase Price (per kg)" name="pricePerKg" min="0" step="0.01" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Field Area" name="fieldArea" required min="0.01" step="0.01" />
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Area Unit <span className="text-red-500">*</span></label>
                      <select
                        name="areaUnit"
                        value={input.areaUnit}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-agri-secondary focus:border-transparent outline-none transition-all appearance-none"
                      >
                        {AREA_UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={calculate}
                  className="w-full py-5 bg-agri-secondary text-agri-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-agri-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  Run Calculation <ArrowRight size={16} />
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
                  <div className="grid md:grid-cols-2 gap-6">
                    <ResultCard label="Pure Live Seed (PLS)" value={result.pls} unit="%" icon={CheckCircle2} color="emerald-500" />
                    <ResultCard label="Bulk Required" value={result.bulkRequired} unit="kg per PLS kg" icon={TrendingUp} />
                    <ResultCard label="Cost per PLS kg" value={result.costPerPLS} unit="Currency" icon={DollarSign} color="amber-500" />
                    <ResultCard label="Sowing Rate" value={result.sowingRate} unit="kg/ha" icon={Maximize} />
                  </div>

                  <div className="bg-agri-primary rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                      <TrendingUp size={150} />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-agri-secondary mb-4">Final Recommendation</p>
                      <div className="grid md:grid-cols-2 gap-10">
                        <div>
                          <h4 className="text-sm font-bold text-white/60 mb-2 uppercase tracking-widest">Adjusted Sowing Rate</h4>
                          <p className="text-5xl font-serif font-bold text-agri-secondary">{result.adjustedSowingRate.toFixed(2)} <span className="text-lg font-sans font-normal text-white/40">kg/ha</span></p>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white/60 mb-2 uppercase tracking-widest">Total Seed Required</h4>
                          <p className="text-5xl font-serif font-bold text-white">{result.totalSeed.toFixed(2)} <span className="text-lg font-sans font-normal text-white/40">kg</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {result.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 space-y-4">
                      <h4 className="text-amber-800 font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                        <AlertTriangle size={18} /> Diagnostic Warnings
                      </h4>
                      <ul className="space-y-2">
                        {result.warnings.map((w, i) => (
                          <li key={i} className="text-amber-700 text-sm flex items-center gap-2">
                            <span className="w-1 h-1 bg-amber-400 rounded-full"></span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-stone-100 border-dashed">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-6">
                    <Calculator size={40} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-agri-primary mb-2">Ready for Calculation</h3>
                  <p className="text-stone-400 text-sm max-w-xs">Enter your seed and field details on the left to generate a precise sowing recommendation.</p>
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
                    <Info size={14} className="text-agri-secondary" /> Scientific Formulas
                  </span>
                  {showFormulas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showFormulas && (
                  <div className="px-6 py-6 border-t border-stone-50 bg-stone-50/30">
                    <div className="grid md:grid-cols-2 gap-6 text-[10px] font-mono text-stone-500">
                      <div className="p-4 bg-white rounded-xl border border-stone-100">
                        <p className="text-agri-secondary mb-2 font-bold">Pure Live Seed (PLS)</p>
                        <code>(Purity * Germination) / 100</code>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-stone-100">
                        <p className="text-agri-secondary mb-2 font-bold">Bulk Required</p>
                        <code>100 / PLS</code>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-stone-100">
                        <p className="text-agri-secondary mb-2 font-bold">Sowing Rate (kg/ha)</p>
                        <code>(Target Pop * TGW) / (Germination * Emergence)</code>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-stone-100">
                        <p className="text-agri-secondary mb-2 font-bold">Adjusted Rate</p>
                        <code>Sowing Rate * (1 + HardSeed/100)</code>
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
                    <CheckCircle2 size={14} className="text-agri-secondary" /> Business Rules
                  </span>
                  {showRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showRules && (
                  <div className="px-6 py-6 border-t border-stone-50 bg-stone-50/30">
                    <ul className="space-y-3 text-xs text-stone-600">
                      <li className="flex gap-3"><span className="text-agri-secondary font-bold">01</span> PLS below 30% triggers a "Not Recommended" warning.</li>
                      <li className="flex gap-3"><span className="text-agri-secondary font-bold">02</span> Purity below 80% is flagged as sub-commercial standard.</li>
                      <li className="flex gap-3"><span className="text-agri-secondary font-bold">03</span> Germination below 70% is flagged as sub-commercial standard.</li>
                      <li className="flex gap-3"><span className="text-agri-secondary font-bold">04</span> Hard seed above 10% recommends pre-treatment.</li>
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

export default SeedRatePage;
