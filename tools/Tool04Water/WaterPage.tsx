import { isPlanExpired } from '../../utils/planAccess';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../src/authContext';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets,
  Sun,
  Wind,
  Thermometer,
  CloudRain,
  Sprout,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Settings,
  Waves,
  CalendarDays
} from 'lucide-react';
import { WeatherData, CropConfig, SoilConfig, IrrigationSystem, WaterResult } from './waterTypes';
import { calculateEto, slopeVPcurve, saturationVaporPressure, actualVaporPressure } from './etoFormulas';
import { KC_VALUES, getEtc } from './kcDatabase';
import { SOIL_DATABASE, calculateTAW, calculateRAW } from './soilDatabase';
import { updateSoilWaterBalance } from './waterBalance';
import { calculateGrossIrrigation } from './irrigationEngine';

const WaterPage: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [weather, setWeather] = useState<WeatherData>({
    tMax: 32,
    tMin: 22,
    rh: 60,
    windSpeed: 2.5,
    solarRad: 22,
    rainfall: 0
  });

  const [crop, setCrop] = useState<CropConfig>({
    type: 'Wheat',
    plantingDate: new Date().toISOString().split('T')[0],
    stage: 'mid'
  });

  const [soil, setSoil] = useState<SoilConfig>({
    type: 'Loam',
    rootDepth: 1.0,
    allowableDepletion: 50
  });

  const [irrigationSystem, setIrrigationSystem] = useState<IrrigationSystem>({
    name: 'Flood',
    efficiency: 55
  });

  const [result, setResult] = useState<WaterResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWeatherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWeather(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setCrop(prev => ({ ...prev, [name]: value }));
  };

  const handleSoilChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setSoil(prev => ({ ...prev, [name]: name === 'rootDepth' || name === 'allowableDepletion' ? parseFloat(value) : value }));
  };

  const calculate = () => {
    setLoading(true);
    setTimeout(() => {
      // 1. Calculate ETo (FAO-56)
      const Tmean = (weather.tMax + weather.tMin) / 2;
      const delta = slopeVPcurve(Tmean);
      const es = (saturationVaporPressure(weather.tMax) + saturationVaporPressure(weather.tMin)) / 2;
      const ea = actualVaporPressure(es, weather.rh);
      const Rn = weather.solarRad * 0.77; // Simplified Net Radiation estimation
      const G = 0; // Daily soil heat flux
      const gamma = 0.0665; // Psychrometric constant at sea level (simplified)

      const eto = calculateEto(delta, Rn, G, gamma, Tmean, weather.windSpeed, es, ea);

      // 2. Calculate ETc
      const kc = KC_VALUES[crop.type]?.[crop.stage] || 1.0;
      const etc = getEtc(eto, kc);

      // 3. Soil Water Balance
      const taw = calculateTAW(soil.type, soil.rootDepth);
      const raw = calculateRAW(taw, soil.allowableDepletion);
      
      // Assume initial depletion is 0 (field capacity) for this daily snapshot tool
      const balance = updateSoilWaterBalance(0, etc, weather.rainfall, 0, taw, raw);

      // 4. Irrigation Requirement
      const irrigationNeeded = balance.irrigationNeeded;
      const grossIrrigation = calculateGrossIrrigation(irrigationNeeded, irrigationSystem.efficiency);

      setResult({
        eto,
        etc,
        taw,
        raw,
        depletion: balance.depletion,
        irrigationNeeded,
        grossIrrigation,
        warnings: balance.warning ? [balance.warning] : []
      });
    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Water Requirement Calculator',
          inputData: { timestamp: new Date().toISOString() },
          outputData: { status: 'Generated' },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }).catch(console.error);
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  
      setLoading(false);
    }, 500);
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
      <div className="bg-[#0077B6] text-white py-16 px-6 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <Waves size={400} className="absolute -right-20 -bottom-20 rotate-12" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
            <Droplets size={16} className="text-white" />
            <span className="text-xs font-bold tracking-widest uppercase">Agri-Intelligence Tool 04</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Water Requirement Calculator</h1>
          <p className="text-xl text-blue-100 font-light max-w-2xl">
            FAO-56 Penman-Monteith engine for precise crop evapotranspiration (ETc) and irrigation scheduling.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 1. Weather Data */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Sun size={20} className="text-blue-500" /> Daily Weather
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Max Temp (°C)" name="tMax" value={weather.tMax} onChange={handleWeatherChange} icon={Thermometer} />
                <InputField label="Min Temp (°C)" name="tMin" value={weather.tMin} onChange={handleWeatherChange} icon={Thermometer} />
                <InputField label="Humidity (%)" name="rh" value={weather.rh} onChange={handleWeatherChange} icon={Droplets} />
                <InputField label="Wind (m/s)" name="windSpeed" value={weather.windSpeed} onChange={handleWeatherChange} icon={Wind} />
                <InputField label="Solar Rad (MJ/m²)" name="solarRad" value={weather.solarRad} onChange={handleWeatherChange} icon={Sun} />
                <InputField label="Rainfall (mm)" name="rainfall" value={weather.rainfall} onChange={handleWeatherChange} icon={CloudRain} />
              </div>
            </div>

            {/* 2. Crop & Soil */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Sprout size={20} className="text-emerald-500" /> Crop & Soil
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Crop Type</label>
                    <select name="type" value={crop.type} onChange={handleCropChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none">
                      {Object.keys(KC_VALUES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Stage</label>
                    <select name="stage" value={crop.stage} onChange={handleCropChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none">
                      <option value="initial">Initial</option>
                      <option value="mid">Mid-Season</option>
                      <option value="late">Late Season</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block">Soil Type</label>
                    <select name="type" value={soil.type} onChange={handleSoilChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none">
                      {Object.keys(SOIL_DATABASE).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <InputField label="Root Depth (m)" name="rootDepth" value={soil.rootDepth} onChange={handleSoilChange} />
                </div>
              </div>
            </div>

            {/* 3. Irrigation System */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Settings size={20} className="text-stone-500" /> System Efficiency
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {['Flood', 'Sprinkler', 'Drip'].map(sys => (
                    <button
                      key={sys}
                      onClick={() => setIrrigationSystem({ name: sys, efficiency: sys === 'Flood' ? 55 : sys === 'Sprinkler' ? 75 : 90 })}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${irrigationSystem.name === sys ? 'bg-blue-600 text-white shadow-lg' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                    >
                      {sys}
                    </button>
                  ))}
                </div>
                <div className="text-center text-xs text-stone-400">
                  Current Efficiency: <span className="font-bold text-blue-600">{irrigationSystem.efficiency}%</span>
                </div>
              </div>

              <button
                onClick={calculate}
                disabled={loading}
                className="w-full mt-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "Calculating..." : "Compute Water Needs"} <ArrowRight size={16} />
              </button>
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
                  {/* Status Header */}
                  <div className="bg-blue-50 border border-blue-100 rounded-[3rem] p-8 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <Droplets size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-blue-900">
                        {result.irrigationNeeded > 0 ? "Irrigation Required" : "No Irrigation Needed"}
                      </h3>
                      <p className="text-blue-700/70 text-sm">
                        {result.irrigationNeeded > 0 
                          ? `Soil moisture has depleted below critical levels. Apply ${result.grossIrrigation.toFixed(1)} mm of water.` 
                          : "Soil moisture is sufficient for current crop demand."}
                      </p>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Ref. ET (ET₀)</p>
                      <p className="text-2xl font-serif font-bold text-stone-700">{result.eto.toFixed(2)} <span className="text-xs font-sans font-normal text-stone-400">mm/d</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Crop ET (ETc)</p>
                      <p className="text-2xl font-serif font-bold text-emerald-600">{result.etc.toFixed(2)} <span className="text-xs font-sans font-normal text-stone-400">mm/d</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Net Irrigation</p>
                      <p className="text-2xl font-serif font-bold text-blue-600">{result.irrigationNeeded.toFixed(1)} <span className="text-xs font-sans font-normal text-stone-400">mm</span></p>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="bg-white rounded-[3rem] border border-stone-100 overflow-hidden shadow-premium">
                    <div className="px-8 py-6 bg-stone-50 border-b border-stone-100">
                      <h3 className="text-xs font-black uppercase tracking-widest text-agri-primary">Soil Water Balance</h3>
                    </div>
                    <div className="p-8 grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-stone-500">Total Available Water (TAW)</span>
                          <span className="font-bold">{result.taw.toFixed(0)} mm</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-stone-500">Readily Available Water (RAW)</span>
                          <span className="font-bold">{result.raw.toFixed(0)} mm</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-stone-500">Current Depletion</span>
                          <span className={`font-bold ${result.depletion > result.raw ? 'text-red-500' : 'text-emerald-500'}`}>{result.depletion.toFixed(1)} mm</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-stone-500">System Efficiency</span>
                          <span className="font-bold">{irrigationSystem.efficiency}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-stone-500">Gross Water Requirement</span>
                          <span className="font-bold text-blue-600">{result.grossIrrigation.toFixed(1)} mm</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-stone-500">Volume per Hectare</span>
                          <span className="font-bold text-blue-600">{(result.grossIrrigation * 10).toFixed(0)} m³</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {result.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 flex items-start gap-4">
                      <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
                      <div>
                        <h4 className="text-amber-800 font-bold text-sm uppercase tracking-widest mb-1">Advisory</h4>
                        <ul className="list-disc list-inside text-amber-700 text-xs space-y-1">
                          {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-stone-100 border-dashed">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-6">
                    <Droplets size={40} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-agri-primary mb-2">Water Balance Engine</h3>
                  <p className="text-stone-400 text-sm max-w-xs">Enter daily weather and crop data to calculate precise irrigation needs using FAO-56 standards.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterPage;
