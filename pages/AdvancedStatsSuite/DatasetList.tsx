import React from 'react';
import { Dataset } from './index';
import { FileSpreadsheet, Trash2, Calendar, MapPin, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DatasetListProps {
  datasets: Dataset[];
  onSelect: (dataset: Dataset) => void;
  onDelete: (id: string) => void;
}

const DatasetList: React.FC<DatasetListProps> = ({ datasets, onSelect, onDelete }) => {
  if (datasets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-stone-400 p-12">
        <FileSpreadsheet size={64} className="mb-4 opacity-20" />
        <h3 className="text-xl font-serif font-bold text-agri-primary mb-2">No Datasets Found</h3>
        <p className="text-sm text-center max-w-md">
          Create a new dataset to start entering your research data and performing advanced statistical analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif font-bold text-agri-primary mb-6">My Experiments</h2>
      
      <div className="grid gap-4">
        {datasets.map((dataset, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={dataset.id}
            className="bg-stone-50 border border-stone-200 rounded-xl p-5 hover:border-agri-secondary/50 hover:shadow-md transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-agri-primary">{dataset.name}</h3>
                <span className="px-2 py-0.5 bg-agri-primary/10 text-agri-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                  {dataset.designType}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-xs font-bold text-stone-500">
                <span className="flex items-center gap-1"><Calendar size={14} /> {dataset.year}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {dataset.location}</span>
                <span>Crop: {dataset.cropName}</span>
                <span>Treatments: {dataset.treatments}</span>
                <span>Replications: {dataset.replications}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={() => onSelect(dataset)}
                className="flex-1 md:flex-none px-4 py-2 bg-agri-primary text-white rounded-lg text-xs font-bold hover:bg-agri-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={14} /> Edit Data
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this dataset?')) {
                    onDelete(dataset.id);
                  }
                }}
                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                title="Delete Dataset"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DatasetList;
