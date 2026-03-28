import { isPlanExpired } from '../../utils/planAccess';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../App';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Ruler,
  Globe,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Compass,
  LandPlot
} from 'lucide-react';
import { REGION_DATABASE } from './regionDatabase';
import { toHectare, fromHectare } from './conversionEngine';
import { UNIVERSAL_CONSTANTS } from './conversionConstants';

const LandPage: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [input, setInput] = useState({
    value: 1,
    unit: 'Hectare',
    region: '',
    subRegion: ''
  });

  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-calculate on change
  useEffect(() => {
    if (input.value > 0) {
      calculate();
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: name === 'value' ? parseFloat(value) || 0 : value }));
  };

  const calculate = () => {
    // 1. Convert to Hectare (Base)
    let ha = 0;
    
    // Check if standard unit
    if (['Hectare', 'Acre', 'Square Meter', 'Square Feet', 'Square Kilometer'].includes(input.unit)) {
      if (input.unit === 'Hectare') ha = input.value;
      else if (input.unit === 'Acre') ha = input.value * UNIVERSAL_CONSTANTS.ACRE;
      else if (input.unit === 'Square Meter') ha = input.value * UNIVERSAL_CONSTANTS.SQ_METER;
      else if (input.unit === 'Square Feet') ha = input.value * UNIVERSAL_CONSTANTS.SQ_FEET;
      else if (input.unit === 'Square Kilometer') ha = input.value * UNIVERSAL_CONSTANTS.SQ_KM;
    } 
    // Regional Unit Logic
    else if (input.region && REGION_DATABASE[input.region]) {
      const regionData = REGION_DATABASE[input.region];
      let factor = 0;

      if (input.subRegion && regionData.subRegions && regionData.subRegions[input.subRegion]) {
        factor = regionData.subRegions[input.subRegion][input.unit] || 0;
      } else {
        factor = regionData.units[input.unit] || 0;
      }

      if (factor > 0) ha = input.value * factor;
    }

    // 2. Convert Hectare to All
    if (ha > 0) {
      const converted = fromHectare(ha, input.region, input.subRegion);
      setResult(converted);
    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Regional Land Converter',
          inputData: { timestamp: new Date().toISOString() },
          outputData: converted,
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  
    } else {
      setResult(null);
    }
  };

  const getAvailableUnits = () => {
    const standard = ['Hectare', 'Acre', 'Square Meter', 'Square Feet', 'Square Kilometer'];
    let regional: string[] = [];

    if (input.region && REGION_DATABASE[input.region]) {
      const regionData = REGION_DATABASE[input.region];
      if (input.subRegion && regionData.subRegions && regionData.subRegions[input.subRegion]) {
        regional = Object.keys(regionData.subRegions[input.subRegion]);
      } else {
        regional = Object.keys(regionData.units);
      }
    }

    return [...standard, ...regional];
  };

  return (
    <div className="min-h-screen bg-agri-bg pb-20">
      {/* Header */}
      <div className="bg-[#8D6E63] text-white py-16 px-6 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <LandPlot size={400} className="absolute -right-20 -bottom-20 rotate-12" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
            <Ruler size={16} className="text-white" />
            <span className="text-xs font-bold tracking-widest uppercase">Agri-Intelligence Tool 06</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Regional Land Converter</h1>
          <p className="text-xl text-stone-200 font-light max-w-2xl">
            Precision area conversion engine supporting local units (Bigha, Guntha, Kanal) across Indian states.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Compass size={20} className="text-amber-600" /> Conversion Settings
              </h2>
              
              <div className="space-y-6">
                {/* Region Selection */}
                <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block flex items-center gap-1">
                      <MapPin size={10} /> Select State (Optional)
                    </label>
                    <select 
                      name="region" 
                      value={input.region} 
                      onChange={(e) => {
                        handleInputChange(e);
                        setInput(prev => ({ ...prev, subRegion: '', unit: 'Hectare' })); // Reset sub-region and unit on state change
                      }} 
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none"
                    >
                      <option value="">-- Standard / International --</option>
                      {Object.keys(REGION_DATABASE).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Sub-Region (Conditional) */}
                  {input.region && REGION_DATABASE[input.region]?.subRegions && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block flex items-center gap-1">
                        <MapPin size={10} /> Select Region Type
                      </label>
                      <select 
                        name="subRegion" 
                        value={input.subRegion} 
                        onChange={handleInputChange} 
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none"
                      >
                        <option value="">-- Select Specific Region --</option>
                        {Object.keys(REGION_DATABASE[input.region].subRegions!).map(sr => <option key={sr} value={sr}>{sr}</option>)}
                      </select>
                      <p className="text-[10px] text-amber-600 italic mt-1">
                        * Required for accurate Bigha conversion in {input.region}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Value & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Area Value</label>
                    <input
                      type="number"
                      name="value"
                      value={input.value}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-agri-secondary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Unit</label>
                    <select 
                      name="unit" 
                      value={input.unit} 
                      onChange={handleInputChange} 
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none"
                    >
                      {getAvailableUnits().map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  {/* Primary Result */}
                  <div className="bg-[#8D6E63] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                      <Globe size={150} />
                    </div>
                    <div className="relative z-10 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Standardized Area</p>
                      <h3 className="text-6xl font-serif font-bold mb-2">
                        {result.hectare.toFixed(4)} <span className="text-2xl font-sans font-light opacity-60">ha</span>
                      </h3>
                      <div className="flex justify-center gap-8 mt-6">
                        <div>
                          <p className="text-3xl font-bold">{result.acre.toFixed(2)}</p>
                          <p className="text-[10px] uppercase tracking-widest opacity-60">Acres</p>
                        </div>
                        <div className="w-px bg-white/20 h-10"></div>
                        <div>
                          <p className="text-3xl font-bold">{result.sqm.toFixed(0)}</p>
                          <p className="text-[10px] uppercase tracking-widest opacity-60">Sq. Meters</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Table */}
                  <div className="bg-white rounded-[3rem] border border-stone-100 overflow-hidden shadow-premium">
                    <div className="px-8 py-6 bg-stone-50 border-b border-stone-100">
                      <h3 className="text-xs font-black uppercase tracking-widest text-agri-primary">Detailed Conversion Table</h3>
                    </div>
                    <div className="p-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {/* Standard Units */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2">International</h4>
                          <div className="flex justify-between text-sm"><span className="text-stone-500">Hectare</span> <span className="font-bold">{result.hectare.toFixed(4)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-stone-500">Acre</span> <span className="font-bold">{result.acre.toFixed(4)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-stone-500">Sq. Meter</span> <span className="font-bold">{result.sqm.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-stone-500">Sq. Feet</span> <span className="font-bold">{result.sqft.toFixed(2)}</span></div>
                        </div>

                        {/* Regional Units (If applicable) */}
                        {Object.keys(result.regional).length > 0 && (
                          <div className="space-y-4 col-span-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2">
                              Regional Units ({input.region || 'Standard'})
                            </h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                              {Object.entries(result.regional).map(([u, val]: any) => (
                                <div key={u} className="flex justify-between text-sm">
                                  <span className="text-stone-500">{u}</span>
                                  <span className="font-bold text-amber-700">{val.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-stone-100 border-dashed">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-6">
                    <Ruler size={40} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-agri-primary mb-2">Select Unit & Region</h3>
                  <p className="text-stone-400 text-sm max-w-xs">Choose a state to see accurate local unit conversions (e.g., UP Bigha vs. Punjab Bigha).</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandPage;
