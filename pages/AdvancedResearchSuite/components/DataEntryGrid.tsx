import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, Save, Download, FileSpreadsheet, 
  MoreHorizontal, ChevronDown, ArrowRight, Settings
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Dataset, Variable, VariableType } from '../AdvancedResearchSuite';

interface DataEntryGridProps {
  dataset: Dataset;
  onUpdate: (data: any[]) => void;
  onNext: () => void;
}

import ExportControl from '../../../components/ExportControl';

const DataEntryGrid: React.FC<DataEntryGridProps> = ({ dataset, onUpdate, onNext }) => {
  const [data, setData] = useState<any[]>(dataset.data);
  const [variables, setVariables] = useState<Variable[]>(dataset.variables);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: string} | null>(null);
  const [isAddingVar, setIsAddingVar] = useState(false);
  const [newVar, setNewVar] = useState<Partial<Variable>>({ type: 'Numeric' });

  // Sync with parent when local state changes
  useEffect(() => {
    // In a real app, you might debounce this
    onUpdate(data);
  }, [data]);

  const handleCellChange = (rowIndex: number, colId: string, value: string) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [colId]: value };
    setData(newData);
  };

  const handleAddColumn = () => {
    if (!newVar.name) return;
    const id = newVar.name.toLowerCase().replace(/\s+/g, '_');
    const newVariable: Variable = {
      id,
      name: newVar.name,
      type: newVar.type as VariableType,
      unit: newVar.unit
    };
    
    setVariables([...variables, newVariable]);
    
    // Update data rows with new key
    const newData = data.map(row => ({ ...row, [id]: '' }));
    setData(newData);
    setIsAddingVar(false);
    setNewVar({ type: 'Numeric' });
  };

  const handleDeleteColumn = (colId: string) => {
    if (confirm('Delete this column? Data will be lost.')) {
      setVariables(variables.filter(v => v.id !== colId));
      const newData = data.map(row => {
        const newRow = { ...row };
        delete newRow[colId];
        return newRow;
      });
      setData(newData);
    }
  };

  const handleAddRow = () => {
    const newRow: any = { id: `row-${Date.now()}` };
    variables.forEach(v => newRow[v.id] = '');
    setData([...data, newRow]);
  };

  // Excel Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws);
      
      // Basic mapping logic - could be more sophisticated
      // For now, just append rows and try to match keys
      const mappedData = jsonData.map((row: any, idx) => {
        const newRow: any = { id: `imported-${idx}` };
        variables.forEach(v => {
          // Try exact match or case-insensitive match
          const key = Object.keys(row).find(k => k.toLowerCase() === v.name.toLowerCase() || k.toLowerCase() === v.id);
          newRow[v.id] = key ? row[key] : '';
        });
        return newRow;
      });

      setData([...data, ...mappedData]);
    };
    reader.readAsBinaryString(file);
  };

  // Export
  const handleExport = (format: 'docx' | 'xlsx' | 'pdf') => {
    if (format === 'xlsx') {
      const exportData = data.map(row => {
        const newRow: any = {};
        variables.forEach(v => newRow[v.name] = row[v.id]);
        return newRow;
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${dataset.name}.xlsx`);
    } else {
      alert(`${format.toUpperCase()} export for raw data is not yet supported.`);
    }
  };

  // Copy-Paste Handler
  const handlePaste = (e: React.ClipboardEvent, rowIndex: number, colId: string) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').split('\n').map(row => row.split('\t'));
    
    const newData = [...data];
    const startColIndex = variables.findIndex(v => v.id === colId);
    
    pasteData.forEach((rowVals, rIdx) => {
      if (rowIndex + rIdx < newData.length) {
        rowVals.forEach((val, cIdx) => {
          const targetCol = variables[startColIndex + cIdx];
          if (targetCol) {
            newData[rowIndex + rIdx][targetCol.id] = val.trim();
          }
        });
      }
    });
    
    setData(newData);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAddingVar(true)}
            className="flex items-center gap-2 px-4 py-2 bg-agri-primary/10 text-agri-primary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-agri-primary hover:text-white transition-colors"
          >
            <Plus size={14} /> Add Variable
          </button>
          <div className="h-6 w-px bg-stone-200 mx-2" />
          <label className="flex items-center gap-2 px-4 py-2 bg-stone-50 text-stone-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-stone-100 cursor-pointer transition-colors">
            <FileSpreadsheet size={14} /> Import Excel
            <input type="file" accept=".xlsx, .csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <ExportControl onExport={handleExport} />
        </div>
        
        <button 
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2 bg-agri-primary text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-agri-secondary shadow-lg shadow-agri-primary/20 transition-all"
        >
          Proceed to Analysis <ArrowRight size={14} />
        </button>
      </div>

      {/* Add Variable Modal */}
      {isAddingVar && (
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 animate-in fade-in slide-in-from-top-4">
          <h4 className="text-sm font-bold text-agri-primary uppercase tracking-widest mb-4">Add New Column</h4>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Variable Name</label>
              <input 
                className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm font-bold w-48"
                value={newVar.name || ''}
                onChange={e => setNewVar({...newVar, name: e.target.value})}
                placeholder="e.g. Plant Height"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Data Type</label>
              <select 
                className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm font-bold w-32"
                value={newVar.type}
                onChange={e => setNewVar({...newVar, type: e.target.value as VariableType})}
              >
                <option>Numeric</option>
                <option>Text</option>
                <option>Percentage</option>
                <option>Date</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Unit (Optional)</label>
              <input 
                className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm font-bold w-24"
                value={newVar.unit || ''}
                onChange={e => setNewVar({...newVar, unit: e.target.value})}
                placeholder="cm, kg..."
              />
            </div>
            <button 
              onClick={handleAddColumn}
              className="px-4 py-2 bg-agri-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-agri-secondary"
            >
              Add Column
            </button>
            <button 
              onClick={() => setIsAddingVar(false)}
              className="px-4 py-2 bg-stone-200 text-stone-500 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-stone-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* The Grid */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="w-12 p-3 text-center text-stone-400 font-mono text-xs border-r border-stone-100">#</th>
              {variables.map(v => (
                <th key={v.id} className="p-3 text-left border-r border-stone-100 min-w-[120px] relative group">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-stone-700 uppercase tracking-wide">{v.name}</span>
                      {v.unit && <span className="text-[10px] text-stone-400 font-mono">({v.unit})</span>}
                    </div>
                    {['plot', 'rep', 'tr'].includes(v.id) ? null : (
                       <button 
                         onClick={() => handleDeleteColumn(v.id)}
                         className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-stone-300 hover:text-red-500 rounded transition-all"
                       >
                         <Trash2 size={12} />
                       </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rIdx) => (
              <tr key={row.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                <td className="p-3 text-center text-stone-300 font-mono text-xs border-r border-stone-100 bg-stone-50/30 select-none">
                  {rIdx + 1}
                </td>
                {variables.map((v, cIdx) => (
                  <td key={v.id} className="p-0 border-r border-stone-100 relative">
                    <input 
                      className={`w-full h-full px-3 py-2 bg-transparent focus:bg-blue-50 focus:outline-none text-sm font-mono text-stone-700 transition-colors ${
                        selectedCell?.row === rIdx && selectedCell?.col === v.id ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset z-10' : ''
                      }`}
                      value={row[v.id] || ''}
                      onChange={(e) => handleCellChange(rIdx, v.id, e.target.value)}
                      onFocus={() => setSelectedCell({row: rIdx, col: v.id})}
                      onPaste={(e) => handlePaste(e, rIdx, v.id)}
                      placeholder={v.type === 'Numeric' ? '0.00' : ''}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-2 bg-stone-50 border-t border-stone-200">
          <button 
            onClick={handleAddRow}
            className="w-full py-2 border-2 border-dashed border-stone-200 rounded-lg text-xs font-bold text-stone-400 uppercase tracking-widest hover:border-agri-primary/30 hover:text-agri-primary hover:bg-white transition-all"
          >
            + Add Row
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataEntryGrid;
