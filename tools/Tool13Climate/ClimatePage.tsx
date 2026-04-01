import { useLocation } from 'react-router-dom';
import React, { useState, useMemo , useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudSun, 
  Upload, 
  FileText, 
  Thermometer, 
  Sun, 
  Activity, 
  AlertTriangle, 
  Download,
  Calendar,
  LineChart as ChartIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { DailyWeatherData, CropInfo, ClimateAnalysisResult } from './climateTypes';
import { calculateGDD, calculatePTU, calculateHTU, calculateHUE } from './climateFormulas';
import { parseWeatherCSV } from './dataParser';
import { trackPhenology } from './phenologyEngine';
import { analyzeStress } from './stressAnalyzer';

const DEFAULT_TBASE: Record<string, number> = {
  'Wheat': 5,
  'Rice': 10,
  'Maize': 8,
  'Cotton': 12
};

import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

export default function ClimatePage() {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [crop, setCrop] = useState<string>('Wheat');
  const [plantingDate, setPlantingDate] = useState<string>('');
  const [tbase, setTbase] = useState<number>(5);
  const [yieldKg, setYieldKg] = useState<number>(0);
  const [csvContent, setCsvContent] = useState<string>('');
  const [weatherData, setWeatherData] = useState<DailyWeatherData[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ClimateAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.restoreData) {
      const data = location.state.restoreData;
      if (data.crop !== undefined) setCrop(data.crop);
      if (data.plantingDate !== undefined) setPlantingDate(data.plantingDate);
      if (data.tbase !== undefined) setTbase(data.tbase);
      if (data.yieldKg !== undefined) setYieldKg(data.yieldKg);
      if (data.csvContent !== undefined) setCsvContent(data.csvContent);
      if (data.weatherData !== undefined) setWeatherData(data.weatherData);
      if (data.analysisResult !== undefined) setAnalysisResult(data.analysisResult);
    }
  }, [location.state]);

  const handleCropChange = (newCrop: string) => {
    setCrop(newCrop);
    setTbase(DEFAULT_TBASE[newCrop] || 5);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      const parsed = parseWeatherCSV(text);
      if (parsed.length > 0) {
        setWeatherData(parsed);
        setError(null);
      } else {
        setError("Invalid CSV format. Please ensure it has Date, Tmax, Tmin, Sunshine Hours.");
      }
    };
    reader.readAsText(file);
  };

  const runAnalysis = () => {
    if (weatherData.length < 30) {
      setError("Insufficient data. Please provide at least 30 days of weather data for a meaningful analysis.");
      return;
    }

    // Validate data
    const invalidDay = weatherData.find(d => d.tmax < d.tmin);
    if (invalidDay) {
      setError(`Data error on ${invalidDay.date}: Tmax (${invalidDay.tmax}) cannot be less than Tmin (${invalidDay.tmin}).`);
      return;
    }

    let totalGDD = 0;
    let totalPTU = 0;
    let totalHTU = 0;
    const chartData: any[] = [];

    weatherData.forEach(day => {
      const gdd = calculateGDD(day.tmax, day.tmin, tbase);
      totalGDD += gdd;
      totalPTU += calculatePTU(gdd, day.dayLength);
      totalHTU += calculateHTU(gdd, day.sunshineHours);
      
      chartData.push({
        date: day.date,
        gdd: parseFloat(gdd.toFixed(2)),
        cumulativeGDD: parseFloat(totalGDD.toFixed(2))
      });
    });

    const stressReport = analyzeStress(weatherData);
    const phenologyProgression = trackPhenology(crop, weatherData, tbase);
    const hue = yieldKg > 0 ? calculateHUE(yieldKg, totalGDD) : undefined;

    setAnalysisResult({
      totalGDD,
      totalPTU,
      totalHTU,
      hue,
      stressReport,
      phenologyProgression
    });
    setError(null);

    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Climate & Phenology',
          inputData: { crop, plantingDate, tbase, yieldKg },
          outputData: { status: 'Generated' },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  };

  const chartData = useMemo(() => {
    if (!weatherData.length) return [];
    let cumGDD = 0;
    return weatherData.map(day => {
      const gdd = calculateGDD(day.tmax, day.tmin, tbase);
      cumGDD += gdd;
      return {
        date: day.date,
        gdd: parseFloat(gdd.toFixed(2)),
        cumGDD: parseFloat(cumGDD.toFixed(2))
      };
    });
  }, [weatherData, tbase]);

  const downloadSampleCSV = () => {
    const headers = "Date,Tmax,Tmin,SunshineHours,DayLength\n";
    const rows = [
      "2023-11-01,25,10,8,11",
      "2023-11-02,26,11,7.5,11",
      "2023-11-03,24,9,9,11"
    ].join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_weather_data.csv';
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-blue-100 p-3 rounded-xl">
          <CloudSun className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Climate Analyzer</h1>
          <p className="text-stone-500 text-sm">Agro-Meteorological Indices & Phenology Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-stone-500" />
                Crop Configuration
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Select Crop</label>
                <select 
                  value={crop}
                  onChange={(e) => handleCropChange(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {Object.keys(DEFAULT_TBASE).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Base Temp (°C)</label>
                  <input 
                    type="number" 
                    value={tbase}
                    onChange={(e) => setTbase(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Yield (kg/ha) - Opt</label>
                  <input 
                    type="number" 
                    value={yieldKg}
                    onChange={(e) => setYieldKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <Upload className="w-4 h-4 text-stone-500" />
                Weather Data
              </h2>
              <button 
                onClick={downloadSampleCSV}
                className="text-[10px] text-blue-600 hover:underline font-medium"
              >
                Sample CSV
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-500">Click or drag CSV file to upload</p>
                <p className="text-[10px] text-stone-400 mt-1">Date, Tmax, Tmin, Sunshine, DayLength</p>
              </div>

              {weatherData.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center">
                  <span className="text-xs text-blue-700 font-medium">{weatherData.length} Days Loaded</span>
                  <button 
                    onClick={() => setWeatherData([])}
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={runAnalysis}
            disabled={weatherData.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white font-medium py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Activity size={18} />
            Analyze Climate Impact
          </button>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          {analysisResult ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-3 h-3 text-orange-500" />
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Total GDD</p>
                  </div>
                  <p className="text-2xl font-light text-stone-800">{analysisResult.totalGDD.toFixed(1)}</p>
                  <p className="text-[10px] text-stone-400 mt-1">°C Days</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-3 h-3 text-yellow-500" />
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Total PTU</p>
                  </div>
                  <p className="text-2xl font-light text-stone-800">{analysisResult.totalPTU.toFixed(0)}</p>
                  <p className="text-[10px] text-stone-400 mt-1">GDD × Daylength</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Total HTU</p>
                  </div>
                  <p className="text-2xl font-light text-stone-800">{analysisResult.totalHTU.toFixed(0)}</p>
                  <p className="text-[10px] text-stone-400 mt-1">GDD × Sunshine</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-3 h-3 text-emerald-500" />
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">HUE</p>
                  </div>
                  <p className="text-2xl font-light text-stone-800">{analysisResult.hue?.toFixed(3) || 'N/A'}</p>
                  <p className="text-[10px] text-stone-400 mt-1">kg/ha per GDD</p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                    <ChartIcon className="w-4 h-4 text-blue-500" />
                    Thermal Time Accumulation
                  </h3>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorGdd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis 
                        dataKey="date" 
                        hide 
                      />
                      <YAxis 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val: number) => val.toLocaleString()}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        labelStyle={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cumGDD" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorGdd)" 
                        name="Cumulative GDD"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phenology */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                  <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                    <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-stone-500" />
                      Phenology Progress
                    </h2>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      {analysisResult.phenologyProgression.map((stage, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-stone-800">{stage.stage}</p>
                            <p className="text-[10px] text-stone-400">GDD Threshold: {stage.gddThreshold}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-stone-700">{stage.expectedDate}</p>
                            <p className="text-[10px] text-blue-500 font-mono">Acc. GDD: {stage.accumulatedGDD?.toFixed(1)}</p>
                          </div>
                        </div>
                      ))}
                      {analysisResult.phenologyProgression.length === 0 && (
                        <p className="text-sm text-stone-400 text-center py-4 italic">No stages reached with current data</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stress Report */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                  <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                    <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-stone-500" />
                      Stress Analysis
                    </h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Thermometer className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-red-900">Heat Stress Days</span>
                      </div>
                      <span className="text-lg font-bold text-red-600">{analysisResult.stressReport.heatStressDays}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Thermometer className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-blue-900">Cold Stress Days</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{analysisResult.stressReport.coldStressDays}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-stone-100 p-2 rounded-lg">
                          <Activity className="w-4 h-4 text-stone-600" />
                        </div>
                        <span className="text-sm font-medium text-stone-900">Thermal Deviation</span>
                      </div>
                      <span className="text-lg font-bold text-stone-600">{analysisResult.stressReport.thermalDeviation.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[500px] bg-stone-50 border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-stone-400 p-6 text-center">
              <CloudSun className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-stone-500 text-lg">Climate Analysis Ready</p>
              <p className="text-sm mt-2 max-w-sm">Upload your seasonal weather data to calculate GDD, PTU, HTU and track crop phenology progress.</p>
              <div className="mt-8 flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 font-bold mb-2">1</div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Upload CSV</span>
                </div>
                <div className="w-8 h-px bg-stone-300 mt-5" />
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 font-bold mb-2">2</div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Set Crop</span>
                </div>
                <div className="w-8 h-px bg-stone-300 mt-5" />
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 font-bold mb-2">3</div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Analyze</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
