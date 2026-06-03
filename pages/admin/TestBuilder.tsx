import React from 'react';
import { Layers, Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function TestBuilder() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-black">Test Management</h1>
          <p className="text-sm text-stone-500 mt-1">Create, edit, and manage mock tests, sectional tests, and quizzes.</p>
        </div>
        <button className="flex items-center gap-2 bg-agri-secondary text-white px-4 py-2 rounded-xl font-bold hover:bg-agri-secondary/90 transition-colors">
          <Plus size={18} />
          <span>Create New Test</span>
        </button>
      </div>

      <div className="dashboard-card bg-white p-6 rounded-2xl border border-admin-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input type="text" placeholder="Search tests (e.g. IBPS AFO Mock 1)..." className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-admin-border rounded-xl focus:outline-none focus:border-agri-secondary" />
          </div>
          <select className="bg-stone-50 border border-admin-border rounded-xl px-4 py-2 focus:outline-none">
            <option>All Categories</option>
            <option>Full Mocks</option>
            <option>Sectional Tests</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-admin-border text-sm font-bold text-stone-500">
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Questions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy Data */}
              <tr className="border-b border-admin-border/50 hover:bg-stone-50">
                <td className="py-3 px-4 font-bold text-black">IBPS AFO Mains Full Mock - 01</td>
                <td className="py-3 px-4 text-sm">Full Mocks</td>
                <td className="py-3 px-4 text-sm">60</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded p-1">Published</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="p-2 text-stone-400 hover:text-blue-500"><Edit size={16}/></button>
                  <button className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={16}/></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
