
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Download, FileText, Activity } from 'lucide-react';
import { UserFieldData } from '../types';
import { mockBackend } from '../services/mockBackend';
import { useAuth } from '../App';
import { canAccessResearch, isPlanExpired } from '../utils/planAccess';

interface DataEntryGridProps {
  onSave?: (data: UserFieldData) => void;
  initialData?: UserFieldData;
}

const DataEntryGrid: React.FC<DataEntryGridProps> = ({ onSave, initialData }) => {
  const { user, planDetails } = useAuth();
  const isResearchPlan = canAccessResearch(user, planDetails);
  const isExpired = isPlanExpired(user);
  const [datasetName, setDatasetName] = useState(initialData?.dataset_name || '');
  const [variables, setVariables] = useState<string[]>(initialData?.variables || ['Plot', 'Yield', 'Fertilizer']);
  const [rows, setRows] = useState<Record<string, any>[]>(initialData?.data || [
    { Plot: '1', Yield: '32', Fertilizer: '50' },
    { Plot: '2', Yield: '28', Fertilizer: '45' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addRow = () => {
    const newRow: Record<string, any> = {};
    variables.forEach(v => newRow[v] = '');
    setRows([...rows, newRow]);
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex: number, variable: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][variable] = value;
    setRows(newRows);
  };

  const addVariable = () => {
    const varName = prompt('Enter variable name:');
    if (varName && !variables.includes(varName)) {
      setVariables([...variables, varName]);
      setRows(rows.map(r => ({ ...r, [varName]: '' })));
    }
  };

  const handleSave = async () => {
    // Allow saving for everyone (even guests/non-subscribed), but mark as temporary if not subscribed
    
    if (!datasetName) {
      alert('Please enter a dataset name');
      return;
    }
    setIsSaving(true);
    try {
      const isTemporary = !user || !isResearchPlan || isExpired;

      const dataToSave: any = {
        id: initialData?.id,
        user_id: user?.id || 'guest', // Handle guest users if needed, or require login but not subscription
        dataset_name: datasetName,
        variables,
        data: rows,
        is_temporary: isTemporary
      };
      
      // If user is not logged in, we might need a way to identify them or just save to local storage?
      // For now, assuming user must be logged in to save to backend, even if temporary.
      // If the requirement implies guests can save, we need to handle user_id.
      // However, the prompt says "Non-Subscribed Users", implying they are users.
      // "Guest and registered users" - implies guests too.
      // If guest, user is null. We need to handle that.
      
      if (!user) {
         // For guests, we might just simulate a save or require login.
         // But the prompt says "All other tools are free for everyone (guest and registered)".
         // For Data Entry, it says "Non-Subscribed Users... can enter data temporarily".
         // Let's assume they need to be logged in to "save" to the dashboard, 
         // OR we save with a session ID for guests.
         // Given the backend expects user_id, let's assume for now we require login for "saving" to dashboard,
         // but maybe we can allow "export" without login.
         // But the prompt says "Their datasets will be stored for 365 days in the user dashboard" for subscribed.
         // For non-subscribed, "deleted after a few hours". This implies it IS stored on backend.
         
         if (!user) {
             alert("Please log in to save your data temporarily.");
             setIsSaving(false);
             return;
         }
      }

      const id = await mockBackend.saveUserFieldData(dataToSave);
      
      if (isTemporary) {
          alert('Dataset saved temporarily. It will be deleted after a few hours.');
      } else {
          alert('Dataset saved successfully!');
      }
      
      if (onSave) onSave({ ...dataToSave, id, created_at: new Date().toISOString() } as UserFieldData);
    } catch (e) {
      console.error(e);
      alert('Failed to save dataset');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim());
      const newRows = lines.slice(1).filter(l => l.trim()).map(line => {
        const values = line.split(',');
        const row: Record<string, any> = {};
        headers.forEach((h, i) => row[h] = values[i]?.trim() || '');
        return row;
      });

      setVariables(headers);
      setRows(newRows);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Subscription Warning */}
      {(!isResearchPlan || isExpired) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Dataset Name</label>
          <input 
            type="text" 
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            placeholder="e.g., Rice Yield Trial 2024"
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary transition-all"
          />
        </div>
        <div className="flex items-end gap-3">
          <button 
            onClick={addVariable}
            className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add Variable
          </button>
          <label className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Download size={14} /> Import CSV
            <input type="file" className="hidden" accept=".csv" onChange={handleCSVImport} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                {variables.map((v, i) => (
                  <th key={i} className="px-4 py-3 text-[10px] font-black text-stone-400 uppercase tracking-widest">{v}</th>
                ))}
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-stone-50/50 transition-colors">
                  {variables.map((v, colIndex) => (
                    <td key={colIndex} className="px-2 py-1">
                      <input 
                        type="text" 
                        value={row[v] || ''}
                        onChange={(e) => updateCell(rowIndex, v, e.target.value)}
                        className="w-full bg-transparent border-none px-2 py-2 text-sm outline-none focus:ring-1 focus:ring-agri-secondary/30 rounded-lg"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-1 text-right">
                    <button 
                      onClick={() => deleteRow(rowIndex)}
                      className="text-stone-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button 
          onClick={addRow}
          className="w-full py-3 bg-stone-50/50 text-stone-400 text-[10px] font-black uppercase tracking-widest hover:bg-stone-100 hover:text-stone-600 transition-all flex items-center justify-center gap-2 border-t border-stone-100"
        >
          <Plus size={14} /> Add New Row
        </button>
      </div>

      <div className="flex justify-end gap-3">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-agri-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-agri-primary/20 hover:bg-agri-secondary transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : <><Save size={14} /> Save Dataset</>}
        </button>
      </div>
    </div>
  );
};

export default DataEntryGrid;
