import React, { useState } from 'react';
import { 
  Calculator, BarChart2, TrendingUp, Grid, Settings, 
  CheckCircle, AlertTriangle, ArrowRight, Activity, PieChart
} from 'lucide-react';
import { Dataset } from '../AdvancedResearchSuite';
import { 
  calculateDescriptive, 
  calculateANOVA, 
  calculateCorrelation,
  calculateRegression,
  calculatePCA,
  calculateHypothesisTest,
  calculateClusterAnalysis
} from '../utils/statistics';

interface AnalysisControlProps {
  dataset: Dataset;
  onRun: (results: any) => void;
}

const AnalysisControl: React.FC<AnalysisControlProps> = ({ dataset, onRun }) => {
  const [analysisType, setAnalysisType] = useState('Descriptive');
  const [selectedVars, setSelectedVars] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const numericVars = dataset.variables.filter(v => v.type === 'Numeric');

  const handleRun = () => {
    setIsProcessing(true);
    
    // Simulate processing delay for UX
    setTimeout(() => {
      let results: any = {
        type: analysisType,
        datasetName: dataset.name,
        timestamp: new Date().toISOString(),
        data: []
      };

      if (analysisType === 'Descriptive') {
        results.data = selectedVars.map(vId => {
          const varName = dataset.variables.find(v => v.id === vId)?.name;
          const values = dataset.data.map(r => parseFloat(r[vId])).filter(n => !isNaN(n));
          return {
            variable: varName,
            stats: calculateDescriptive(values)
          };
        });
      } else if (analysisType === 'ANOVA') {
        results.data = selectedVars.map(vId => {
          const varName = dataset.variables.find(v => v.id === vId)?.name;
          return {
            variable: varName,
            anova: calculateANOVA(dataset, vId)
          };
        });
      } else if (analysisType === 'Correlation') {
        // Pairwise correlation for all selected vars
        const correlations = [];
        for (let i = 0; i < selectedVars.length; i++) {
          for (let j = i + 1; j < selectedVars.length; j++) {
            const v1 = selectedVars[i];
            const v2 = selectedVars[j];
            const v1Name = dataset.variables.find(v => v.id === v1)?.name;
            const v2Name = dataset.variables.find(v => v.id === v2)?.name;
            
            correlations.push({
              pair: `${v1Name} vs ${v2Name}`,
              stats: calculateCorrelation(dataset, v1, v2)
            });
          }
        }
        results.data = correlations;
      } else if (analysisType === 'Regression') {
        if (selectedVars.length >= 2) {
           // Simple linear regression: First var as X, Second as Y
           const xId = selectedVars[0];
           const yId = selectedVars[1];
           const xName = dataset.variables.find(v => v.id === xId)?.name;
           const yName = dataset.variables.find(v => v.id === yId)?.name;

           results.data = [{
             variable: `${yName} (Y) on ${xName} (X)`,
             regression: calculateRegression(dataset, xId, yId)
           }];
        }
      } else if (analysisType === 'Hypothesis') {
        if (selectedVars.length >= 2) {
           const v1 = selectedVars[0];
           const v2 = selectedVars[1];
           const v1Name = dataset.variables.find(v => v.id === v1)?.name;
           const v2Name = dataset.variables.find(v => v.id === v2)?.name;

           results.data = [{
             variable: `${v1Name} vs ${v2Name}`,
             hypothesis: calculateHypothesisTest(dataset, v1, v2, 'unpaired')
           }];
        }
      } else if (analysisType === 'PCA') {
        results.data = [{
          variable: 'Principal Component Analysis',
          pca: calculatePCA(dataset, selectedVars)
        }];
      } else if (analysisType === 'Cluster') {
        results.data = [{
          variable: 'Cluster Analysis (K-Means)',
          cluster: calculateClusterAnalysis(dataset, selectedVars, 3)
        }];
      }

      onRun(results);
      setIsProcessing(false);
    }, 1500);
  };

  const toggleVar = (id: string) => {
    if (selectedVars.includes(id)) {
      setSelectedVars(selectedVars.filter(v => v !== id));
    } else {
      setSelectedVars([...selectedVars, id]);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Sidebar: Analysis Type */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm h-fit">
        <h3 className="font-serif font-bold text-lg text-agri-primary mb-6 flex items-center gap-2">
          <Settings size={20} /> Analysis Configuration
        </h3>
        
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-2">Select Analysis Method</label>
          {[
            { id: 'Descriptive', label: 'Descriptive Statistics', icon: Calculator },
            { id: 'ANOVA', label: 'Analysis of Variance (ANOVA)', icon: Grid },
            { id: 'Correlation', label: 'Correlation Matrix', icon: TrendingUp },
            { id: 'Regression', label: 'Linear Regression', icon: BarChart2 },
            { id: 'Hypothesis', label: 'Hypothesis Testing (t-test)', icon: Activity },
            { id: 'PCA', label: 'Principal Component Analysis', icon: Settings },
            { id: 'Cluster', label: 'Cluster Analysis', icon: PieChart },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => { setAnalysisType(type.id); setSelectedVars([]); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                analysisType === type.id 
                  ? 'bg-agri-primary text-white shadow-md' 
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <type.icon size={18} />
              {type.label}
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
            <CheckCircle size={14} /> Method Details
          </h4>
          <p className="text-xs text-blue-600 leading-relaxed">
            {analysisType === 'Descriptive' && "Calculates Mean, Median, Mode, Variance, SD, SE, Range, and CV% for selected variables."}
            {analysisType === 'ANOVA' && `Performs ${dataset.designType} analysis. Generates ANOVA table, F-test, Critical Difference (CD), and CV%.`}
            {analysisType === 'Correlation' && "Computes Pearson correlation coefficients between selected variable pairs to measure linear relationships."}
            {analysisType === 'Regression' && "Fits a linear regression model (Y = mX + c). Select Independent (X) then Dependent (Y) variable."}
            {analysisType === 'Hypothesis' && "Performs unpaired t-test between two selected variables to compare their means."}
            {analysisType === 'PCA' && "Reduces dimensionality of the dataset to identify principal components explaining maximum variance."}
            {analysisType === 'Cluster' && "Performs K-Means clustering to group similar observations based on selected variables."}
          </p>
        </div>
      </div>

      {/* Main: Variable Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
          <h3 className="font-serif font-bold text-xl text-stone-800 mb-2">Select Variables</h3>
          <p className="text-sm text-stone-500 mb-6">
            {analysisType === 'Regression' 
              ? "Select exactly 2 variables: First is Independent (X), Second is Dependent (Y)." 
              : analysisType === 'Hypothesis'
                ? "Select exactly 2 variables to compare."
                : `Choose the numeric variables to include in the ${analysisType} analysis.`}
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {numericVars.map(v => (
              <div 
                key={v.id}
                onClick={() => toggleVar(v.id)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                  selectedVars.includes(v.id)
                    ? 'border-agri-primary bg-agri-primary/5'
                    : 'border-stone-100 hover:border-agri-primary/30 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedVars.includes(v.id) ? 'border-agri-primary bg-agri-primary' : 'border-stone-300'
                  }`}>
                    {selectedVars.includes(v.id) && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <div>
                    <span className={`block font-bold text-sm ${selectedVars.includes(v.id) ? 'text-agri-primary' : 'text-stone-600'}`}>
                      {v.name}
                    </span>
                    {v.unit && <span className="text-[10px] text-stone-400 font-mono">({v.unit})</span>}
                    {analysisType === 'Regression' && selectedVars.indexOf(v.id) === 0 && <span className="text-[10px] text-blue-500 font-bold ml-2">(X)</span>}
                    {analysisType === 'Regression' && selectedVars.indexOf(v.id) === 1 && <span className="text-[10px] text-emerald-500 font-bold ml-2">(Y)</span>}
                  </div>
                </div>
                {['plot', 'rep'].includes(v.id) && (
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">System</span>
                )}
              </div>
            ))}
          </div>

          {selectedVars.length === 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700">
              <AlertTriangle size={18} />
              <span className="text-xs font-bold">Please select at least one variable to proceed.</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleRun}
            disabled={
              selectedVars.length === 0 || 
              isProcessing || 
              (analysisType === 'Regression' && selectedVars.length !== 2) ||
              (analysisType === 'Hypothesis' && selectedVars.length !== 2)
            }
            className="bg-agri-primary text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-agri-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running Analysis...
              </>
            ) : (
              <>
                Run Analysis <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisControl;
