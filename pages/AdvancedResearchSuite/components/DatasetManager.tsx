import React, { useState } from 'react';
import { Plus, Trash2, Edit2, FileText, Calendar, MapPin, Database } from 'lucide-react';
import { Dataset, Variable } from '../AdvancedResearchSuite';

interface DatasetManagerProps {
  onSelect: (dataset: Dataset) => void;
}

const DatasetManager: React.FC<DatasetManagerProps> = ({ onSelect }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    crop: '',
    experimentType: 'Field Trial',
    designType: 'RBD',
    year: new Date().getFullYear().toString(),
    location: '',
    treatments: 3,
    replications: 3
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate initial variables based on design
    const initialVariables: Variable[] = [
      { id: 'plot', name: 'Plot No', type: 'Numeric' },
      { id: 'rep', name: 'Replication', type: 'Numeric' },
      { id: 'tr', name: 'Treatment', type: 'Text' },
    ];

    // Generate initial data rows
    const initialData = [];
    let plotNo = 1;
    for (let r = 1; r <= formData.replications; r++) {
      for (let t = 1; t <= formData.treatments; t++) {
        initialData.push({
          id: `row-${plotNo}`,
          plot: plotNo,
          rep: r,
          tr: `T${t}`,
          // Add empty placeholders for custom vars if any
        });
        plotNo++;
      }
    }

    const newDataset: Dataset = {
      id: Date.now().toString(),
      ...formData,
      variables: initialVariables,
      data: initialData,
      createdAt: new Date().toISOString()
    };

    setDatasets([...datasets, newDataset]);
    setIsCreating(false);
    onSelect(newDataset);
  };

  return (
    <div className="space-y-8">
      {!isCreating ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <button 
            onClick={() => setIsCreating(true)}
            className="border-2 border-dashed border-agri-primary/20 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-agri-primary/5 transition-all group h-64"
          >
            <div className="w-16 h-16 bg-agri-primary/10 rounded-full flex items-center justify-center text-agri-primary group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <span className="font-serif font-bold text-lg text-agri-primary">Create New Dataset</span>
          </button>

          {/* Existing Datasets */}
          {datasets.map(ds => (
            <div key={ds.id} className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-lg transition-all relative group h-64 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-stone-100 p-3 rounded-xl">
                  <Database size={24} className="text-stone-500" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-agri-primary">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="font-serif font-bold text-xl text-stone-800 mb-2 truncate">{ds.name}</h3>
              
              <div className="space-y-2 text-xs text-stone-500 mb-6 flex-1">
                <div className="flex items-center gap-2">
                  <FileText size={12} /> {ds.designType} Design
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} /> {ds.year} • {ds.crop}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} /> {ds.location || 'No Location'}
                </div>
              </div>

              <button 
                onClick={() => onSelect(ds)}
                className="w-full bg-stone-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-agri-primary transition-colors"
              >
                Open Dataset
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-stone-100">
          <h2 className="text-2xl font-serif font-bold text-agri-primary mb-6">Create Research Dataset</h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Dataset Name</label>
                <input 
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-agri-primary font-bold text-stone-800"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Wheat Yield Trial 2024"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Crop Name</label>
                <input 
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-agri-primary font-bold text-stone-800"
                  value={formData.crop}
                  onChange={e => setFormData({...formData, crop: e.target.value})}
                  placeholder="e.g. Wheat"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Design Type</label>
                <select 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-agri-primary font-bold text-stone-800"
                  value={formData.designType}
                  onChange={e => setFormData({...formData, designType: e.target.value})}
                >
                  <option value="CRD">CRD (Completely Randomized)</option>
                  <option value="RBD">RBD (Randomized Block)</option>
                  <option value="Factorial">Factorial RBD</option>
                  <option value="Split Plot">Split Plot</option>
                  <option value="Latin Square">Latin Square</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Experiment Type</label>
                <select 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-agri-primary font-bold text-stone-800"
                  value={formData.experimentType}
                  onChange={e => setFormData({...formData, experimentType: e.target.value})}
                >
                  <option>Field Trial</option>
                  <option>Lab Experiment</option>
                  <option>Greenhouse</option>
                  <option>Survey</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Treatments</label>
                <input 
                  type="number"
                  min="2"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-agri-primary font-bold text-stone-800"
                  value={formData.treatments}
                  onChange={e => setFormData({...formData, treatments: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Replications</label>
                <input 
                  type="number"
                  min="2"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-agri-primary font-bold text-stone-800"
                  value={formData.replications}
                  onChange={e => setFormData({...formData, replications: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Year</label>
                <input 
                  type="number"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-agri-primary font-bold text-stone-800"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Location</label>
                <input 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-agri-primary font-bold text-stone-800"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. Research Farm, Block A"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-stone-100 text-stone-500 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-agri-primary text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-agri-secondary transition-colors shadow-lg shadow-agri-primary/20"
              >
                Create Dataset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DatasetManager;
