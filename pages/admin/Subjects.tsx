import React from 'react';
import { Layers, Plus, Folder, SubscriptIcon, List } from 'lucide-react';

export default function Subjects() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-black">Subjects & Taxonomy</h1>
          <p className="text-sm text-stone-500 mt-1">Manage the hierarchy of Subjects, Topics, and Sub-topics.</p>
        </div>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-bold hover:bg-stone-800 transition-colors">
          <Plus size={18} />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subjects List */}
        <div className="dashboard-card bg-white p-6 rounded-2xl border border-admin-border flex flex-col gap-4">
          <h3 className="font-bold border-b border-admin-border pb-3">Subjects</h3>
          <ul className="flex flex-col gap-2">
            <li className="p-3 bg-agri-secondary/10 border border-agri-secondary/30 rounded-xl flex items-center justify-between text-sm font-bold text-agri-secondary cursor-pointer">
              <div className="flex items-center gap-2"><Folder size={16}/> Agronomy</div>
              <span className="text-xs bg-white px-2 py-0.5 rounded text-black border border-agri-secondary/20">42 Topics</span>
            </li>
            <li className="p-3 bg-stone-50 border border-admin-border hover:border-gray-300 rounded-xl flex items-center justify-between text-sm font-medium text-stone-700 cursor-pointer">
              <div className="flex items-center gap-2"><Folder size={16}/> Soil Science</div>
              <span className="text-xs bg-white px-2 py-0.5 rounded border border-admin-border">28 Topics</span>
            </li>
            <li className="p-3 bg-stone-50 border border-admin-border hover:border-gray-300 rounded-xl flex items-center justify-between text-sm font-medium text-stone-700 cursor-pointer">
              <div className="flex items-center gap-2"><Folder size={16}/> Plant Pathology</div>
              <span className="text-xs bg-white px-2 py-0.5 rounded border border-admin-border">15 Topics</span>
            </li>
          </ul>
        </div>

        {/* Topics List */}
        <div className="dashboard-card bg-white p-6 rounded-2xl border border-admin-border flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-admin-border pb-3">
             <h3 className="font-bold">Topics in Agronomy</h3>
             <button className="text-xs font-bold text-agri-secondary flex items-center gap-1"><Plus size={14}/> Add Topic</button>
          </div>
          <ul className="flex flex-col gap-2">
            <li className="p-2.5 bg-stone-50 border border-admin-border rounded-xl flex items-center justify-between text-sm font-medium text-stone-700 cursor-pointer">
              <div className="flex items-center gap-2"><List size={14} className="text-stone-400"/> Crop Production</div>
            </li>
            <li className="p-2.5 bg-stone-50 border border-admin-border rounded-xl flex items-center justify-between text-sm font-medium text-stone-700 cursor-pointer">
              <div className="flex items-center gap-2"><List size={14} className="text-stone-400"/> Weed Management</div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
