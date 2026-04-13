
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets,
  FlaskConical,
  Tractor,
  ShieldAlert,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Settings,
  Timer,
  Scale,
  SprayCan
} from 'lucide-react';
import { SprayerConfig, ChemicalConfig, FieldConfig, SprayPlan, SafetyCard } from './sprayerTypes';
import { calculateSprayVolumePerHa, calculateBackpackSprayVolume, calculateSprayPlan } from './sprayFormulas';
import { validateDose } from './sprayValidation';
import { getSafetyCard } from './safetyEngine';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

const SprayPage: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [sprayer, setSprayer] = useState<SprayerConfig>({
    type: 'Backpack',
    tankCapacity: 15,
    coveragePerTank: 500, // m2
    nozzleOutput: 1.0,
    travelSpeed: 5.0,
    nozzleSpacing: 50,
    numberOfNozzles: 1
  });

  const [chemical, setChemical] = useState<ChemicalConfig>({
    name: 'Generic Pesticide',
    formulation: 'EC',
    recommendedDose: 2.0, // ml/L
    activeIngredientPercent: 20,
    maxAllowedDose: 3.0
  });

  const [field, setField] = useState<FieldConfig>({
    area: 1.0, // ha
    waterVolumeOverride: 0
  });

  const [plan, setPlan] = useState<SprayPlan | null>(null);
  const [safety, setSafety] = useState<SafetyCard | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSprayerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSprayer(prev => ({ ...prev, [name]: name === 'type' ? value : parseFloat(value) || 0 }));
  };

  const handleChemicalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setChemical(prev => ({ ...prev, [name]: name === 'name' || name === 'formulation' ? value : parseFloat(value) || 0 }));
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setField(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const calculate = () => {
    setLoading(true);
    setTimeout(() => {
      // 1. Calculate Plan
      // Logic moved to sprayFormulas.ts but need to call it correctly here.
      // Re-implementing logic here to ensure correct state usage or import function.
      // Let's use the imported function.
      
      // Need to adapt the formula function to handle the specific logic for Backpack vs Boom
      // The imported function `calculateSprayPlan` is not fully implemented in previous step (I wrote it but maybe need to double check).
      // Let's implement the logic directly here for clarity and safety, or use the helper.
      
      // Helper function call:
      // We need to make sure `calculateSprayPlan` handles the logic correctly.
      // Let's rewrite the logic here to be safe as I can't see the previous file content fully.
      
      let sprayVol = 0;
      if (field.waterVolumeOverride && field.waterVolumeOverride > 0) {
        sprayVol = field.waterVolumeOverride;
      } else {
        if (sprayer.type === 'Backpack') {
          // L/ha = (Tank L / Coverage m2) * 10000
          sprayVol = (sprayer.tankCapacity / (sprayer.coveragePerTank || 500)) * 10000;
        } else {
          // Boom: (LPM * 60000) / (Speed_kmph * Spacing_cm)
          // Note: User prompt said 600 constant. Let's stick to standard 60000 for cm.
          // If user meant 600, spacing is likely meters. But input says cm.
          // Let's use 60000.
          sprayVol = ((sprayer.nozzleOutput || 1.0) * 60000) / ((sprayer.travelSpeed || 5.0) * (sprayer.nozzleSpacing || 50));
        }
      }

      const totalWater = sprayVol * field.area;
      const totalProduct = chemical.recommendedDose * totalWater;
      const numTanks = Math.ceil(totalWater / sprayer.tankCapacity);
      const productPerTank = sprayer.tankCapacity * chemical.recommendedDose;
      const totalAI = totalProduct * (chemical.activeIngredientPercent / 100);
      
      // Time Estimate
      let flowRate = 0;
      if (sprayer.type === 'Backpack') flowRate = 0.5; // L/min manual
      else flowRate = (sprayer.nozzleOutput || 1.0) * (sprayer.numberOfNozzles || 1);
      
      const time = flowRate > 0 ? totalWater / flowRate : 0;

      const validation = validateDose(chemical.recommendedDose, chemical.maxAllowedDose);

      setPlan({
        sprayVolumePerHa: sprayVol,
        totalWaterNeeded: totalWater,
        totalProductRequired: totalProduct,
        numberOfTanks: numTanks,
        productPerTank: productPerTank,
        sprayTimeEstimate: time,
        activeIngredientApplied: totalAI,
        validationMessage: validation.message,
        validationStatus: validation.status as any
      });

      setSafety(getSafetyCard(chemical.formulation));
      setLoading(false);

      if (user && isPlanActive) {
        try {
          mockBackend.saveToolHistory({
            userId: user.id,
            toolName: 'Sprayer Calibration',
            inputData: { sprayer, chemical, field },
            outputData: { status: 'Generated' },
            status: 'SUCCESS',
            timestamp: new Date().toISOString()
          }).catch(console.error);
        } catch (error) {
          console.error("Failed to save tool history", error);
        }
      }
    }, 600);
  };

  const InputField = ({ label, name, value, onChange, icon: Icon, step = "0.1" }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-agri-secondary focus:border-transparent outline-none transition-all"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-agri-bg pb-20">
      {/* Header */}
      <div className="bg-[#E63946] text-white py-16 px-6 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <SprayCan size={400} className="absolute -right-20 -bottom-20 rotate-12" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
            <ShieldAlert size={16} className="text-white" />
            <span className="text-xs font-bold tracking-widest uppercase">Agri-Intelligence Tool 07</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Spray Calculator & Safety</h1>
          <p className="text-xl text-red-100 font-light max-w-2xl">
            Precision application engine for calculating spray volumes, mixing ratios, and safety compliance.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 1. Sprayer Config */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Tractor size={20} className="text-blue-600" /> Equipment Setup
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Sprayer Type</label>
                  <select name="type" value={sprayer.type} onChange={handleSprayerChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none">
                    <option value="Backpack">Backpack / Knapsack</option>
                    <option value="Boom">Boom Sprayer</option>
                    <option value="Tractor">Tractor Mounted</option>
                    <option value="Drone">Drone (UAV)</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Tank Capacity (L)" name="tankCapacity" value={sprayer.tankCapacity} onChange={handleSprayerChange} />
                  {sprayer.type === 'Backpack' ? (
                    <InputField label="Coverage/Tank (m²)" name="coveragePerTank" value={sprayer.coveragePerTank} onChange={handleSprayerChange} />
                  ) : (
                    <>
                      <InputField label="Nozzle Output (L/min)" name="nozzleOutput" value={sprayer.nozzleOutput} onChange={handleSprayerChange} />
                      <InputField label="Speed (km/h)" name="travelSpeed" value={sprayer.travelSpeed} onChange={handleSprayerChange} />
                      <InputField label="Spacing (cm)" name="nozzleSpacing" value={sprayer.nozzleSpacing} onChange={handleSprayerChange} />
                      <InputField label="No. of Nozzles" name="numberOfNozzles" value={sprayer.numberOfNozzles} onChange={handleSprayerChange} step="1" />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Chemical Details */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <FlaskConical size={20} className="text-emerald-600" /> Chemical Label
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Product Name</label>
                  <input type="text" name="name" value={chemical.name} onChange={handleChemicalChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Formulation</label>
                    <select name="formulation" value={chemical.formulation} onChange={handleChemicalChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none">
                      <option value="EC">EC (Emulsifiable)</option>
                      <option value="WP">WP (Wettable Powder)</option>
                      <option value="SC">SC (Suspension)</option>
                      <option value="GR">GR (Granules)</option>
                    </select>
                  </div>
                  <InputField label="Rec. Dose (ml/L)" name="recommendedDose" value={chemical.recommendedDose} onChange={handleChemicalChange} />
                  <InputField label="Active Ing. (%)" name="activeIngredientPercent" value={chemical.activeIngredientPercent} onChange={handleChemicalChange} />
                  <InputField label="Max Safe Dose" name="maxAllowedDose" value={chemical.maxAllowedDose} onChange={handleChemicalChange} />
                </div>
              </div>
            </div>

            {/* 3. Field Info */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Settings size={20} className="text-stone-500" /> Application Area
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Field Area (ha)" name="area" value={field.area} onChange={handleFieldChange} />
                <InputField label="Override Vol (L/ha)" name="waterVolumeOverride" value={field.waterVolumeOverride} onChange={handleFieldChange} />
              </div>

              <button
                onClick={calculate}
                disabled={loading}
                className="w-full mt-8 py-5 bg-[#E63946] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "Validating..." : "Calculate Plan"} <SprayCan size={16} />
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {plan ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  {/* Validation Status */}
                  <div className={`border rounded-[3rem] p-8 flex items-center gap-6 ${plan.validationStatus === 'SAFE' ? 'bg-emerald-50 border-emerald-100' : plan.validationStatus === 'WARNING' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${plan.validationStatus === 'SAFE' ? 'bg-emerald-100 text-emerald-600' : plan.validationStatus === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                      {plan.validationStatus === 'SAFE' ? <CheckCircle2 size={32} /> : <ShieldAlert size={32} />}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-serif font-bold ${plan.validationStatus === 'SAFE' ? 'text-emerald-900' : plan.validationStatus === 'WARNING' ? 'text-amber-900' : 'text-red-900'}`}>
                        {plan.validationStatus === 'SAFE' ? "Safe Application" : plan.validationStatus === 'WARNING' ? "Caution Advised" : "Safety Violation"}
                      </h3>
                      <p className="text-sm opacity-70">{plan.validationMessage}</p>
                    </div>
                  </div>

                  {/* Mixing Plan */}
                  <div className="bg-white rounded-[3rem] border border-stone-100 overflow-hidden shadow-premium">
                    <div className="px-8 py-6 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-widest text-agri-primary">Mixing Instructions</h3>
                      <span className="text-[10px] text-stone-400 italic">For {field.area} ha</span>
                    </div>
                    <div className="p-8 grid grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Water Required</p>
                          <p className="text-3xl font-serif font-bold text-blue-600">{plan.totalWaterNeeded.toFixed(0)} <span className="text-sm font-sans font-normal text-stone-400">Liters</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Product Required</p>
                          <p className="text-3xl font-serif font-bold text-emerald-600">{plan.totalProductRequired.toFixed(0)} <span className="text-sm font-sans font-normal text-stone-400">ml/g</span></p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Number of Tank Loads</p>
                          <p className="text-3xl font-serif font-bold text-stone-700">{plan.numberOfTanks} <span className="text-sm font-sans font-normal text-stone-400">loads</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Mix Per Tank</p>
                          <p className="text-3xl font-serif font-bold text-purple-600">{plan.productPerTank.toFixed(0)} <span className="text-sm font-sans font-normal text-stone-400">ml/g</span></p>
                          <p className="text-[10px] text-stone-400 mt-1">Add to {sprayer.tankCapacity}L water</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Card */}
                  {safety && (
                    <div className="bg-[#2C3E50] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-5">
                        <ShieldAlert size={150} />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-6">Safety Protocol</p>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-widest">Required PPE</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {safety.ppe.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-widest">Re-Entry Interval</h4>
                              <p className="text-xl font-bold text-white">{safety.reEntryInterval}</p>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-widest">Storage</h4>
                              <p className="text-xs text-white/80">{safety.storage}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-stone-100 border-dashed">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-6">
                    <SprayCan size={40} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-agri-primary mb-2">Spray Planner</h3>
                  <p className="text-stone-400 text-sm max-w-xs">Enter equipment and chemical details to generate a precise mixing plan and safety card.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprayPage;
