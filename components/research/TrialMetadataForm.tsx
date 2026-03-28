import React from 'react';
import { ClipboardList, Calendar, Layers, Activity, Settings2 } from 'lucide-react';

export interface TrialMetadata {
  crop: string;
  date: string;
  replications: number;
  treatments: number;
  design: 'CRD' | 'RBD' | 'Split-Plot';
}

interface TrialMetadataFormProps {
  metadata: TrialMetadata;
  onChange: (metadata: TrialMetadata) => void;
}

const TrialMetadataForm: React.FC<TrialMetadataFormProps> = ({ metadata, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({
      ...metadata,
      [name]: name === 'replications' || name === 'treatments' ? parseInt(value) || 0 : value,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-premium mb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-agri-primary text-white p-2 rounded-lg">
          <ClipboardList size={20} />
        </div>
        <h3 className="font-serif font-bold text-xl text-agri-primary">Trial Metadata</h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} /> Crop Name
          </label>
          <input
            type="text"
            name="crop"
            value={metadata.crop}
            onChange={handleChange}
            placeholder="e.g. Wheat, Rice, Maize"
            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-primary/20 focus:border-agri-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar size={12} /> Experiment Date
          </label>
          <input
            type="date"
            name="date"
            value={metadata.date}
            onChange={handleChange}
            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-primary/20 focus:border-agri-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <Layers size={12} /> Experimental Design
          </label>
          <select
            name="design"
            value={metadata.design}
            onChange={handleChange}
            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-primary/20 focus:border-agri-primary transition-all appearance-none"
          >
            <option value="CRD">CRD (Completely Randomized)</option>
            <option value="RBD">RBD (Randomized Block Design)</option>
            <option value="Split-Plot">Split-Plot Design</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <Settings2 size={12} /> Number of Replications
          </label>
          <input
            type="number"
            name="replications"
            value={metadata.replications}
            onChange={handleChange}
            min="1"
            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-primary/20 focus:border-agri-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <Settings2 size={12} /> Number of Treatments
          </label>
          <input
            type="number"
            name="treatments"
            value={metadata.treatments}
            onChange={handleChange}
            min="1"
            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-primary/20 focus:border-agri-primary transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default TrialMetadataForm;
