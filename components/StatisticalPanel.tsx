
import React, { useState, useEffect } from 'react';
import { Calculator, ChevronRight, Activity, TrendingUp, BarChart2, Download, FileText } from 'lucide-react';
import { UserFieldData } from '../types';
import { mockBackend } from '../services/mockBackend';
import { useAuth } from '../App';
import { calculateBasicStats, calculateCorrelation, calculateRegression, calculateOneWayAnova, StatsResult } from '../utils/statistics';
import { canAccessResearch } from '../utils/planAccess';
import ResultViewer from './ResultViewer';

const StatisticalPanel: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isResearchPlan = canAccessResearch(user, planDetails);
  const [datasets, setDatasets] = useState<UserFieldData[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<string>('Mean');
  const [results, setResults] = useState<StatsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isResearchPlan) {
      mockBackend.getUserFieldData(user.id).then(setDatasets);
    } else {
      setDatasets([]);
    }
  }, [user, isResearchPlan]);

  const handleCalculate = () => {
    const dataset = datasets.find(d => d.id === selectedDataset);
    if (!dataset) {
      alert('Please select a dataset');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const data = dataset.data.map(r => parseFloat(r[dataset.variables[1]] || '0'));
      const x = dataset.data.map(r => parseFloat(r[dataset.variables[0]] || '0'));
      const y = dataset.data.map(r => parseFloat(r[dataset.variables[1]] || '0'));

      let res: StatsResult | null = null;
      switch (selectedTest) {
        case 'Mean':
        case 'Standard Deviation':
        case 'Variance':
          res = calculateBasicStats(data);
          break;
        case 'Correlation':
          res = { ...calculateBasicStats(y), correlation: calculateCorrelation(x, y) };
          break;
        case 'Regression':
          res = { ...calculateBasicStats(y), regression: calculateRegression(x, y) };
          break;
        case 'ANOVA (One Way)':
          // Assuming groups are defined by the first variable
          const groupsMap: Record<string, number[]> = {};
          dataset.data.forEach(r => {
            const group = r[dataset.variables[0]];
            const val = parseFloat(r[dataset.variables[1]] || '0');
            if (!groupsMap[group]) groupsMap[group] = [];
            groupsMap[group].push(val);
          });
          const groups = Object.values(groupsMap);
          const anova = calculateOneWayAnova(groups);
          res = { ...calculateBasicStats(data), fValue: anova.fValue, df: anova.dfBetween };
          break;
        default:
          res = calculateBasicStats(data);
      }
      setResults(res);
      setIsLoading(false);
    }, 500);
  };

  const proTests = ['Correlation', 'Regression', 'ANOVA (One Way)', 'T-Test'];
  // Unlock all tests for everyone as per new requirements
  const isTestLocked = false; 

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Select Dataset</label>
          <select 
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary transition-all"
          >
            <option value="">Choose a dataset...</option>
            {datasets.map(d => (
              <option key={d.id} value={d.id}>{d.dataset_name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Select Statistical Test</label>
          <select 
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary transition-all"
          >
            <optgroup label="Basic (Free)">
              <option value="Mean">Mean</option>
              <option value="Standard Deviation">Standard Deviation</option>
              <option value="Variance">Variance</option>
            </optgroup>
            <optgroup label="Advanced (Pro)">
              <option value="Correlation">Correlation</option>
              <option value="Regression">Regression</option>
              <option value="ANOVA (One Way)">ANOVA (One Way)</option>
              <option value="T-Test">T-Test</option>
              <option value="Chi-Square">Chi-Square</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleCalculate}
          disabled={isLoading || isTestLocked}
          className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 ${
            isTestLocked 
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
              : 'bg-agri-secondary text-white shadow-agri-secondary/20 hover:scale-105 active:scale-95'
          }`}
        >
          {isLoading ? 'Calculating...' : isTestLocked ? 'Upgrade to Unlock' : <><Calculator size={16} /> Run Statistical Engine</>}
        </button>
      </div>

      {results && (
        <ResultViewer 
          result={results} 
          testName={selectedTest} 
          datasetName={datasets.find(d => d.id === selectedDataset)?.dataset_name || ''} 
        />
      )}
    </div>
  );
};

export default StatisticalPanel;
