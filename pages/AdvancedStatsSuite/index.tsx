import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Plus, FileSpreadsheet, BarChart2, Save, Download, 
  Settings, Trash2, Edit2, Play, ChevronRight, FileText, Activity
} from 'lucide-react';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import DatasetList from './DatasetList';
import DatasetEditor from './DatasetEditor';
import AnalysisPanel from './AnalysisPanel';
import { canAccessResearch, isPlanExpired } from '../../utils/planAccess';

export interface DatasetColumn {
  id: string;
  name: string;
  type: 'Numeric' | 'Text' | 'Percentage' | 'Date' | 'Category';
  unit?: string;
}

export interface Dataset {
  id: string;
  name: string;
  cropName: string;
  experimentType: string;
  designType: string;
  year: string;
  location: string;
  treatments: number;
  replications: number;
  columns: DatasetColumn[];
  data: any[][];
  createdAt: string;
  updatedAt: string;
}

const AdvancedStatsSuite: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isResearchPlan = canAccessResearch(user, planDetails);
  const isExpired = isPlanExpired(user);

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit' | 'analyze'>('list');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    if (user) {
      loadDatasets();
    }
  }, [user]);

  const loadDatasets = async () => {
    try {
      const data = await mockBackend.getUserFieldData(user!.id);
      const userDatasets = data
        .filter(d => d.dataset_name.startsWith('AdvancedStatsSuite_'))
        .map(d => d.data[0] as unknown as Dataset);
      setDatasets(userDatasets);
    } catch (error) {
      console.error("Failed to load datasets", error);
    }
  };

  const saveDataset = async (dataset: Dataset) => {
    try {
      const existingData = await mockBackend.getUserFieldData(user!.id);
      const existingRecord = existingData.find(d => 
        d.dataset_name.startsWith('AdvancedStatsSuite_') && 
        (d.data[0] as unknown as Dataset).id === dataset.id
      );
      
      const isTemporary = !isResearchPlan || isExpired;

      await mockBackend.saveUserFieldData({
        id: existingRecord?.id,
        user_id: user!.id,
        dataset_name: `AdvancedStatsSuite_${dataset.name}`,
        variables: ['dataset'],
        data: [dataset as any],
        is_temporary: isTemporary,
        created_at: existingRecord?.created_at || new Date().toISOString()
      });
      
      if (isTemporary) {
        alert('Dataset saved temporarily. It will be deleted after a few hours. Subscribe to store your datasets for 365 days.');
      } else {
        alert('Dataset saved successfully!');
      }

      await loadDatasets();
      setActiveDataset(dataset);
    } catch (error) {
      console.error("Failed to save dataset", error);
      alert("Failed to save dataset");
    }
  };

  const deleteDataset = async (datasetId: string) => {
    try {
      const existingData = await mockBackend.getUserFieldData(user!.id);
      const existingRecord = existingData.find(d => 
        d.dataset_name.startsWith('AdvancedStatsSuite_') && 
        (d.data[0] as unknown as Dataset).id === datasetId
      );
      
      if (existingRecord?.id) {
        await mockBackend.deleteUserFieldData(existingRecord.id);
        await loadDatasets();
        if (activeDataset?.id === datasetId) {
          setActiveDataset(null);
          setActiveTab('list');
        }
      }
    } catch (error) {
      console.error("Failed to delete dataset", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-agri-primary flex items-center gap-3">
            <Activity className="text-agri-secondary" size={32} />
            Advanced Research Data & Statistical Analysis Suite
          </h1>
          <p className="text-stone-500 mt-2 text-sm">
            Customizable research data entry and advanced statistical analysis system.
          </p>
        </div>
      </div>

      {/* Subscription Warning */}
      {(!isResearchPlan || isExpired) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-8">
          <Activity className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm text-amber-800 font-medium">
              Data entered without a subscription is temporary and will be automatically deleted after a few hours. 
              <br className="hidden md:block" />
              Subscribe to store your datasets for 365 days.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'list' 
                ? 'bg-agri-primary text-white shadow-md' 
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100'
            }`}
          >
            <Database size={18} />
            My Experiments
          </button>
          <button
            onClick={() => {
              setActiveDataset(null);
              setActiveTab('create');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'create' 
                ? 'bg-agri-primary text-white shadow-md' 
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100'
            }`}
          >
            <Plus size={18} />
            Create New Dataset
          </button>
          
          {activeDataset && (
            <>
              <div className="my-4 border-t border-stone-200"></div>
              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                Active Dataset
              </div>
              <button
                onClick={() => setActiveTab('edit')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'edit' 
                    ? 'bg-agri-secondary text-white shadow-md' 
                    : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100'
                }`}
              >
                <FileSpreadsheet size={18} />
                Data Entry
              </button>
              <button
                onClick={() => setActiveTab('analyze')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'analyze' 
                    ? 'bg-agri-secondary text-white shadow-md' 
                    : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100'
                }`}
              >
                <BarChart2 size={18} />
                Run Analysis
              </button>
            </>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-100 p-6 min-h-[600px]">
          {activeTab === 'list' && (
            <DatasetList 
              datasets={datasets} 
              onSelect={(dataset) => {
                setActiveDataset(dataset);
                setActiveTab('edit');
              }}
              onDelete={deleteDataset}
            />
          )}
          
          {(activeTab === 'create' || activeTab === 'edit') && (
            <DatasetEditor 
              dataset={activeDataset} 
              onSave={(dataset) => {
                saveDataset(dataset);
                if (activeTab === 'create') {
                  setActiveTab('edit');
                }
              }}
            />
          )}

          {activeTab === 'analyze' && activeDataset && (
            <AnalysisPanel dataset={activeDataset} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedStatsSuite;
