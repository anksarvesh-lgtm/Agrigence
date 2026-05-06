import React, { useState } from 'react';
import { 
  Table, Plus, Trash2, Save, Download, FileSpreadsheet, 
  BarChart2, Calculator, Settings, ChevronRight, Database,
  FileText, TrendingUp, Grid, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatasetManager from './components/DatasetManager';
import DataEntryGrid from './components/DataEntryGrid';
import AnalysisControl from './components/AnalysisControl';
import ResultsView from './components/ResultsView';

export type VariableType = 'Numeric' | 'Text' | 'Percentage' | 'Date' | 'Dropdown';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  unit?: string;
  options?: string[]; // For dropdown
}

export interface Dataset {
  id: string;
  name: string;
  crop: string;
  experimentType: string;
  designType: string;
  year: string;
  location: string;
  treatments: number;
  replications: number;
  variables: Variable[];
  data: any[]; // Array of row objects
  createdAt: string;
}

import { useAuth } from '../../src/authContext';
import { canAccessResearch, isPlanExpired } from '../../utils/planAccess';
import DataStorageNotice from '../../components/DataStorageNotice';
import { Lock } from 'lucide-react';
import { mockBackend } from '../../services/mockBackend';

const AdvancedResearchSuite: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isSubscribed = user && planDetails && planDetails.id !== 'free' && !isPlanExpired(user);
  
  const [activeTab, setActiveTab] = useState<'datasets' | 'entry' | 'analysis' | 'results'>('datasets');
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-stone-50 pb-20 font-sans text-stone-800 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg text-center border border-stone-200">
          <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-agri-primary mb-4">Subscription Required</h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            The Advanced Research Data & Statistical Analysis Suite is a premium tool. Please subscribe to a plan to access professional data management and analysis features.
          </p>
          <button className="bg-agri-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-agri-secondary transition-colors shadow-lg shadow-agri-primary/20">
            View Plans
          </button>
        </div>
      </div>
    );
  }

  const handleDatasetSelect = (dataset: Dataset) => {
    setCurrentDataset(dataset);
    setActiveTab('entry');
  };

  const handleDataUpdate = (updatedData: any[]) => {
    if (currentDataset) {
      setCurrentDataset({ ...currentDataset, data: updatedData });
    }
  };

  const handleAnalysisRun = (results: any) => {
    setAnalysisResults(results);
    setActiveTab('results');

    if (user && isSubscribed && currentDataset) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Advanced Research Data & Statistical Analysis Suite',
          inputData: { datasetName: currentDataset.name, variables: currentDataset.variables.map(v => v.name) },
          outputData: { status: 'Generated', results: results },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }).catch(console.error);
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans text-stone-800">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 pt-8 pb-6 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-agri-primary text-white p-2 rounded-lg shadow-md">
                  <Calculator size={24} />
                </div>
                <h1 className="text-2xl font-serif font-bold text-agri-primary">
                  Advanced Research Data & Statistical Analysis Suite
                </h1>
              </div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-12">
                Professional Research Data Management & Analysis
              </p>
            </div>
            
            <div className="flex gap-2">
               {currentDataset && (
                 <div className="bg-agri-secondary/10 px-4 py-2 rounded-lg border border-agri-secondary/20 flex items-center gap-2">
                    <Database size={14} className="text-agri-secondary" />
                    <span className="text-xs font-bold text-agri-primary">{currentDataset.name}</span>
                 </div>
               )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-8 border-b border-stone-100">
            <button 
              onClick={() => setActiveTab('datasets')}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'datasets' 
                  ? 'border-agri-primary text-agri-primary' 
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              1. Datasets
            </button>
            <ChevronRight size={14} className="text-stone-300" />
            <button 
              onClick={() => currentDataset && setActiveTab('entry')}
              disabled={!currentDataset}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'entry' 
                  ? 'border-agri-primary text-agri-primary' 
                  : 'border-transparent text-stone-400 hover:text-stone-600 disabled:opacity-50'
              }`}
            >
              2. Data Entry
            </button>
            <ChevronRight size={14} className="text-stone-300" />
            <button 
              onClick={() => currentDataset && setActiveTab('analysis')}
              disabled={!currentDataset}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'analysis' 
                  ? 'border-agri-primary text-agri-primary' 
                  : 'border-transparent text-stone-400 hover:text-stone-600 disabled:opacity-50'
              }`}
            >
              3. Analysis
            </button>
            <ChevronRight size={14} className="text-stone-300" />
            <button 
              onClick={() => analysisResults && setActiveTab('results')}
              disabled={!analysisResults}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'results' 
                  ? 'border-agri-primary text-agri-primary' 
                  : 'border-transparent text-stone-400 hover:text-stone-600 disabled:opacity-50'
              }`}
            >
              4. Results
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <DataStorageNotice />
        <AnimatePresence mode="wait">
          {activeTab === 'datasets' && (
            <DatasetManager 
              key="datasets" 
              onSelect={handleDatasetSelect} 
            />
          )}
          {activeTab === 'entry' && currentDataset && (
            <DataEntryGrid 
              key="entry" 
              dataset={currentDataset} 
              onUpdate={handleDataUpdate}
              onNext={() => setActiveTab('analysis')}
            />
          )}
          {activeTab === 'analysis' && currentDataset && (
            <AnalysisControl 
              key="analysis" 
              dataset={currentDataset} 
              onRun={handleAnalysisRun} 
            />
          )}
          {activeTab === 'results' && analysisResults && (
            <ResultsView 
              key="results" 
              results={analysisResults} 
              dataset={currentDataset!}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdvancedResearchSuite;
