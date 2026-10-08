import { isPlanExpired } from '../../utils/planAccess';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../src/authContext';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  PieChart,
  BarChart3,
  Calculator,
  Briefcase,
  Users,
  Tractor,
  Sprout
} from 'lucide-react';
import { CostInputs, CostResult } from './economicsTypes';
import { calculateEconomics } from './costFormulas';
import { runScenarios } from './scenarioEngine';

const EconomicsPage: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [inputs, setInputs] = useState<CostInputs>({
    hiredLabor: 5000,
    bullockLabor: 2000,
    machineLabor: 3000,
    seedCost: 1500,
    fertilizerCost: 4000,
    plantProtection: 1000,
    manureCost: 2000,
    irrigationCharges: 1500,
    landRevenue: 500,
    depreciation: 1000,
    miscExpenses: 500,
    workingCapitalDuration: 6,
    interestRate: 7,
    rentPaidLeasedLand: 0,
    rentalValueOwnedLand: 10000,
    interestOnFixedCapital: 2000,
    familyLaborDays: 20,
    imputedWageRate: 300,
    yieldObtained: 45,
    marketPrice: 2200,
    byProductIncome: 5000
  });

  const [result, setResult] = useState<CostResult | null>(null);
  const [scenarios, setScenarios] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const calculate = () => {
    const res = calculateEconomics(inputs);
    setResult(res);
    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Farm Economics Analyzer',
          inputData: { timestamp: new Date().toISOString() },
          outputData: res,
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }).catch(console.error);
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  
    const scen = runScenarios(inputs);
    setScenarios(scen);
  };

  const InputField = ({ label, name, value, onChange, icon: Icon }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-agri-secondary focus:border-transparent outline-none transition-all"
      />
    </div>
  );

  const ResultCard = ({ label, value, subtext, color = "agri-primary" }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{label}</p>
      <p className={`text-2xl font-serif font-bold text-${color}`}>
        ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </p>
      {subtext && <p className="text-[10px] text-stone-400 mt-1">{subtext}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-agri-bg pb-20">
      {/* Header */}
      <div className="bg-[#2C3E50] text-white py-16 px-6 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <DollarSign size={400} className="absolute -right-20 -bottom-20 rotate-12" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
            <Calculator size={16} className="text-agri-secondary" />
            <span className="text-xs font-bold tracking-widest uppercase">Agri-Intelligence Tool 05</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Farm Economics Analyzer</h1>
          <p className="text-xl text-stone-300 font-light max-w-2xl">
            Comprehensive profitability analysis using standard agricultural cost concepts (A1, A2, B1, B2, C1, C2, C3).
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 1. Paid-Out Costs (A1) */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Briefcase size={20} className="text-agri-secondary" /> Operational Costs (A1)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Hired Labor (₹)" name="hiredLabor" value={inputs.hiredLabor} onChange={handleInputChange} icon={Users} />
                <InputField label="Bullock Labor (₹)" name="bullockLabor" value={inputs.bullockLabor} onChange={handleInputChange} icon={Tractor} />
                <InputField label="Machine Labor (₹)" name="machineLabor" value={inputs.machineLabor} onChange={handleInputChange} icon={Tractor} />
                <InputField label="Seed Cost (₹)" name="seedCost" value={inputs.seedCost} onChange={handleInputChange} icon={Sprout} />
                <InputField label="Fertilizer (₹)" name="fertilizerCost" value={inputs.fertilizerCost} onChange={handleInputChange} />
                <InputField label="Plant Protection (₹)" name="plantProtection" value={inputs.plantProtection} onChange={handleInputChange} />
                <InputField label="Manure (₹)" name="manureCost" value={inputs.manureCost} onChange={handleInputChange} />
                <InputField label="Irrigation (₹)" name="irrigationCharges" value={inputs.irrigationCharges} onChange={handleInputChange} />
                <InputField label="Land Revenue (₹)" name="landRevenue" value={inputs.landRevenue} onChange={handleInputChange} />
                <InputField label="Depreciation (₹)" name="depreciation" value={inputs.depreciation} onChange={handleInputChange} />
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-2 gap-4">
                <InputField label="Working Cap. Duration (Mo)" name="workingCapitalDuration" value={inputs.workingCapitalDuration} onChange={handleInputChange} />
                <InputField label="Interest Rate (%)" name="interestRate" value={inputs.interestRate} onChange={handleInputChange} />
              </div>
            </div>

            {/* 2. Land & Capital */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <TrendingUp size={20} className="text-agri-secondary" /> Land & Capital
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Rent Paid (Leased) (₹)" name="rentPaidLeasedLand" value={inputs.rentPaidLeasedLand} onChange={handleInputChange} />
                <InputField label="Rental Value (Owned) (₹)" name="rentalValueOwnedLand" value={inputs.rentalValueOwnedLand} onChange={handleInputChange} />
                <InputField label="Interest on Fixed Cap (₹)" name="interestOnFixedCapital" value={inputs.interestOnFixedCapital} onChange={handleInputChange} />
              </div>
            </div>

            {/* 3. Family Labor */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Users size={20} className="text-agri-secondary" /> Family Labor
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Family Labor Days" name="familyLaborDays" value={inputs.familyLaborDays} onChange={handleInputChange} />
                <InputField label="Imputed Wage (₹/day)" name="imputedWageRate" value={inputs.imputedWageRate} onChange={handleInputChange} />
              </div>
            </div>

            {/* 4. Output */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <PieChart size={20} className="text-agri-secondary" /> Production Output
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Yield (q/ha)" name="yieldObtained" value={inputs.yieldObtained} onChange={handleInputChange} />
                <InputField label="Market Price (₹/q)" name="marketPrice" value={inputs.marketPrice} onChange={handleInputChange} />
                <InputField label="By-Product Income (₹)" name="byProductIncome" value={inputs.byProductIncome} onChange={handleInputChange} />
              </div>

              <button
                onClick={calculate}
                className="w-full mt-8 py-5 bg-agri-secondary text-agri-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-agri-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
              >
                Calculate Profitability <ArrowRight size={16} />
              </button>
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
                  className="space-y-8"
                >
                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-6">
                    <ResultCard label="Gross Income" value={result.grossIncome} subtext="Total Revenue" color="emerald-600" />
                    <ResultCard label="Net Income (Profit)" value={result.netIncome} subtext="Gross - Cost C3" color={result.netIncome >= 0 ? "emerald-600" : "red-500"} />
                    <ResultCard label="Cost per Quintal" value={result.costPerQuintal} subtext="Break-even Price" color="amber-600" />
                  </div>

                  {/* Cost Hierarchy Table */}
                  <div className="bg-white rounded-[3rem] border border-stone-100 overflow-hidden shadow-premium">
                    <div className="px-8 py-6 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-widest text-agri-primary">Cost Hierarchy Analysis</h3>
                      <button onClick={() => setShowDetails(!showDetails)} className="text-[10px] font-bold text-agri-secondary uppercase tracking-widest flex items-center gap-1">
                        {showDetails ? "Hide Details" : "Show Details"} <ChevronDown size={12} className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <div className="p-8">
                      <table className="w-full text-left text-sm">
                        <thead className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100">
                          <tr>
                            <th className="pb-4">Cost Concept</th>
                            <th className="pb-4">Description</th>
                            <th className="pb-4 text-right">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50 font-mono text-stone-600">
                          <tr>
                            <td className="py-4 font-bold text-agri-primary">Cost A1</td>
                            <td className="py-4 text-xs">All actual expenses + Interest on working capital</td>
                            <td className="py-4 text-right font-bold">₹{result.costA1.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          </tr>
                          <tr>
                            <td className="py-4 font-bold text-agri-primary">Cost A2</td>
                            <td className="py-4 text-xs">Cost A1 + Rent paid for leased land</td>
                            <td className="py-4 text-right font-bold">₹{result.costA2.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          </tr>
                          <tr>
                            <td className="py-4 font-bold text-agri-primary">Cost B1</td>
                            <td className="py-4 text-xs">Cost A1 + Interest on fixed capital assets</td>
                            <td className="py-4 text-right font-bold">₹{result.costB1.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          </tr>
                          <tr>
                            <td className="py-4 font-bold text-agri-primary">Cost B2</td>
                            <td className="py-4 text-xs">Cost B1 + Rental value of owned land + Rent paid</td>
                            <td className="py-4 text-right font-bold">₹{result.costB2.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          </tr>
                          <tr>
                            <td className="py-4 font-bold text-agri-primary">Cost C1</td>
                            <td className="py-4 text-xs">Cost B1 + Imputed value of family labor</td>
                            <td className="py-4 text-right font-bold">₹{result.costC1.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          </tr>
                          <tr>
                            <td className="py-4 font-bold text-agri-primary">Cost C2</td>
                            <td className="py-4 text-xs">Cost B2 + Imputed value of family labor</td>
                            <td className="py-4 text-right font-bold">₹{result.costC2.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          </tr>
                          <tr className="bg-stone-50/50">
                            <td className="py-4 font-bold text-agri-secondary text-base">Cost C3</td>
                            <td className="py-4 text-xs font-bold text-agri-primary">Cost C2 + 10% Managerial Cost (Total Cost)</td>
                            <td className="py-4 text-right font-bold text-agri-secondary text-base">₹{result.costC3.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Scenario Analysis */}
                  {scenarios && (
                    <div className="bg-[#2C3E50] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-5">
                        <BarChart3 size={150} />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-agri-secondary mb-6">Sensitivity Analysis (Net Income Impact)</p>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-widest">Price Change</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span>+10% Price</span>
                                <span className="font-bold text-emerald-400">₹{scenarios.priceIncrease.netIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span>-10% Price</span>
                                <span className="font-bold text-red-400">₹{scenarios.priceDecrease.netIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-widest">Yield Change</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span>+15% Yield</span>
                                <span className="font-bold text-emerald-400">₹{scenarios.yieldIncrease.netIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span>-10% Yield</span>
                                <span className="font-bold text-red-400">₹{scenarios.yieldDecrease.netIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {result.netIncome < 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 flex items-start gap-4">
                      <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
                      <div>
                        <h4 className="text-red-800 font-bold text-sm uppercase tracking-widest mb-1">Profitability Warning</h4>
                        <p className="text-red-700 text-xs">
                          The current operation is generating a net loss based on Cost C3. Consider reducing operational costs (A1) or improving yield efficiency to reach the break-even yield of {result.breakEvenYield.toFixed(1)} q/ha.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-stone-100 border-dashed">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-6">
                    <Calculator size={40} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-agri-primary mb-2">Ready to Analyze</h3>
                  <p className="text-stone-400 text-sm max-w-xs">Enter your farm's operational costs and production data to generate a detailed economic report.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicsPage;
