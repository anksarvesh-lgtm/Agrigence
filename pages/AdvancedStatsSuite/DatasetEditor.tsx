import React, { useState, useEffect } from 'react';
import { Dataset, DatasetColumn } from './index';
import { Plus, Trash2, Save, Download, Upload, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DatasetEditorProps {
  dataset: Dataset | null;
  onSave: (dataset: Dataset) => void;
}

const DatasetEditor: React.FC<DatasetEditorProps> = ({ dataset, onSave }) => {
  const [formData, setFormData] = useState<Partial<Dataset>>({
    name: '',
    cropName: '',
    experimentType: '',
    designType: 'RBD',
    year: new Date().getFullYear().toString(),
    location: '',
    treatments: 3,
    replications: 3,
    columns: [
      { id: 'col_1', name: 'Plant Height', type: 'Numeric', unit: 'cm' },
      { id: 'col_2', name: 'Yield per Plot', type: 'Numeric', unit: 'kg' }
    ],
    data: []
  });

  const [isEditingMeta, setIsEditingMeta] = useState(!dataset);

  useEffect(() => {
    if (dataset) {
      setFormData(dataset);
      setIsEditingMeta(false);
    } else {
      setFormData({
        name: '',
        cropName: '',
        experimentType: '',
        designType: 'RBD',
        year: new Date().getFullYear().toString(),
        location: '',
        treatments: 3,
        replications: 3,
        columns: [
          { id: 'col_1', name: 'Plant Height', type: 'Numeric', unit: 'cm' },
          { id: 'col_2', name: 'Yield per Plot', type: 'Numeric', unit: 'kg' }
        ],
        data: []
      });
      setIsEditingMeta(true);
    }
  }, [dataset]);

  const handleGenerateGrid = () => {
    if (!formData.name || !formData.treatments || !formData.replications) {
      alert("Please fill in required fields: Name, Treatments, and Replications.");
      return;
    }

    const rows = formData.treatments! * formData.replications!;
    const newData = Array.from({ length: rows }, (_, i) => {
      const trt = Math.floor(i / formData.replications!) + 1;
      const rep = (i % formData.replications!) + 1;
      const rowData = [
        `T${trt}`,
        `R${rep}`,
        ...formData.columns!.map(() => '')
      ];
      return rowData;
    });

    setFormData(prev => ({ ...prev, data: newData }));
    setIsEditingMeta(false);
  };

  const handleDataChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...(formData.data || [])];
    newData[rowIndex][colIndex] = value;
    setFormData(prev => ({ ...prev, data: newData }));
  };

  const addColumn = () => {
    const newCol: DatasetColumn = {
      id: `col_${Date.now()}`,
      name: `New Column ${formData.columns!.length + 1}`,
      type: 'Numeric'
    };
    
    setFormData(prev => ({
      ...prev,
      columns: [...(prev.columns || []), newCol],
      data: prev.data?.map(row => [...row, '']) || []
    }));
  };

  const removeColumn = (index: number) => {
    if (window.confirm('Remove this column and its data?')) {
      setFormData(prev => ({
        ...prev,
        columns: prev.columns?.filter((_, i) => i !== index),
        data: prev.data?.map(row => row.filter((_, i) => i !== index + 2)) // +2 for Trt and Rep
      }));
    }
  };

  const updateColumn = (index: number, updates: Partial<DatasetColumn>) => {
    setFormData(prev => {
      const newCols = [...(prev.columns || [])];
      newCols[index] = { ...newCols[index], ...updates };
      return { ...prev, columns: newCols };
    });
  };

  const handleSave = () => {
    if (!formData.name) {
      alert("Dataset name is required.");
      return;
    }
    
    const datasetToSave: Dataset = {
      id: dataset?.id || `ds_${Date.now()}`,
      name: formData.name || 'Untitled Dataset',
      cropName: formData.cropName || '',
      experimentType: formData.experimentType || '',
      designType: formData.designType || 'RBD',
      year: formData.year || '',
      location: formData.location || '',
      treatments: formData.treatments || 3,
      replications: formData.replications || 3,
      columns: formData.columns || [],
      data: formData.data || [],
      createdAt: dataset?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(datasetToSave);
  };

  const exportToExcel = () => {
    if (!formData.data || formData.data.length === 0) return;
    
    const headers = ['Treatment', 'Replication', ...(formData.columns?.map(c => `${c.name} ${c.unit ? `(${c.unit})` : ''}`) || [])];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...formData.data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${formData.name || 'Dataset'}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      if (data.length > 1) {
        // Assume first row is headers
        const headers = data[0];
        const newCols: DatasetColumn[] = [];
        
        // Skip first two columns assuming they are Trt and Rep
        for (let i = 2; i < headers.length; i++) {
          newCols.push({
            id: `col_${Date.now()}_${i}`,
            name: headers[i] || `Column ${i-1}`,
            type: 'Numeric'
          });
        }
        
        setFormData(prev => ({
          ...prev,
          columns: newCols,
          data: data.slice(1)
        }));
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-agri-primary">
          {isEditingMeta ? 'Dataset Configuration' : 'Data Entry Sheet'}
        </h2>
        
        {!isEditingMeta && (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditingMeta(true)}
              className="px-3 py-1.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-2"
            >
              <Settings size={14} /> Configure
            </button>
            <button 
              onClick={exportToExcel}
              className="px-3 py-1.5 text-xs font-bold text-agri-primary bg-agri-primary/10 hover:bg-agri-primary/20 rounded-lg flex items-center gap-2"
            >
              <Download size={14} /> Export
            </button>
            <label className="px-3 py-1.5 text-xs font-bold text-agri-secondary bg-agri-secondary/10 hover:bg-agri-secondary/20 rounded-lg flex items-center gap-2 cursor-pointer">
              <Upload size={14} /> Import
              <input type="file" accept=".xlsx, .csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button 
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-bold text-white bg-agri-primary hover:bg-agri-primary/90 rounded-lg flex items-center gap-2 shadow-md"
            >
              <Save size={14} /> Save Dataset
            </button>
          </div>
        )}
      </div>

      {isEditingMeta ? (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Dataset Name *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-agri-secondary outline-none font-bold text-agri-primary"
                placeholder="e.g., Wheat Yield Trial 2024"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Crop Name</label>
              <input 
                type="text" 
                value={formData.cropName} 
                onChange={e => setFormData({...formData, cropName: e.target.value})}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-agri-secondary outline-none"
                placeholder="e.g., Wheat"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Experiment Type</label>
              <input 
                type="text" 
                value={formData.experimentType} 
                onChange={e => setFormData({...formData, experimentType: e.target.value})}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-agri-secondary outline-none"
                placeholder="e.g., Fertilizer Trial"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Design Type *</label>
              <select 
                value={formData.designType} 
                onChange={e => setFormData({...formData, designType: e.target.value})}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-agri-secondary outline-none font-bold"
              >
                <option value="CRD">CRD (Completely Randomized Design)</option>
                <option value="RBD">RBD (Randomized Block Design)</option>
                <option value="Factorial RBD">Factorial RBD</option>
                <option value="Split Plot">Split Plot</option>
                <option value="Strip Plot">Strip Plot</option>
                <option value="Latin Square">Latin Square Design</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Treatments *</label>
                <input 
                  type="number" 
                  min="2"
                  value={formData.treatments} 
                  onChange={e => setFormData({...formData, treatments: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-agri-secondary outline-none font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Replications *</label>
                <input 
                  type="number" 
                  min="2"
                  value={formData.replications} 
                  onChange={e => setFormData({...formData, replications: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-agri-secondary outline-none font-bold text-center"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Year</label>
                <input 
                  type="text" 
                  value={formData.year} 
                  onChange={e => setFormData({...formData, year: e.target.value})}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-agri-secondary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Location</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-agri-secondary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-agri-primary uppercase tracking-wider">Variables / Columns</h3>
              <button 
                onClick={addColumn}
                className="px-3 py-1.5 text-xs font-bold text-agri-secondary bg-agri-secondary/10 hover:bg-agri-secondary/20 rounded-lg flex items-center gap-2"
              >
                <Plus size={14} /> Add Variable
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.columns?.map((col, index) => (
                <div key={col.id} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-stone-200">
                  <input 
                    type="text" 
                    value={col.name}
                    onChange={e => updateColumn(index, { name: e.target.value })}
                    className="flex-1 p-2 border border-stone-200 rounded-lg text-sm font-bold outline-none focus:border-agri-secondary"
                    placeholder="Variable Name"
                  />
                  <select 
                    value={col.type}
                    onChange={e => updateColumn(index, { type: e.target.value as any })}
                    className="w-32 p-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-agri-secondary"
                  >
                    <option value="Numeric">Numeric</option>
                    <option value="Text">Text</option>
                    <option value="Percentage">Percentage</option>
                    <option value="Date">Date</option>
                    <option value="Category">Category</option>
                  </select>
                  <input 
                    type="text" 
                    value={col.unit || ''}
                    onChange={e => updateColumn(index, { unit: e.target.value })}
                    className="w-24 p-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-agri-secondary text-center"
                    placeholder="Unit (e.g. cm)"
                  />
                  <button 
                    onClick={() => removeColumn(index)}
                    className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-stone-200 flex justify-end">
            <button 
              onClick={handleGenerateGrid}
              className="px-6 py-3 bg-agri-primary text-white font-bold rounded-xl shadow-md hover:bg-agri-primary/90 transition-colors"
            >
              Generate Data Grid
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200">
                  <th className="p-3 text-xs font-black text-stone-500 uppercase tracking-wider border-r border-stone-200 w-24 text-center">Trt</th>
                  <th className="p-3 text-xs font-black text-stone-500 uppercase tracking-wider border-r border-stone-200 w-24 text-center">Rep</th>
                  {formData.columns?.map((col, idx) => (
                    <th key={col.id} className="p-3 text-xs font-black text-agri-primary uppercase tracking-wider border-r border-stone-200 min-w-[150px]">
                      {col.name} {col.unit && <span className="text-stone-400 text-[10px]">({col.unit})</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.data?.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="p-2 border-r border-stone-200">
                      <input 
                        type="text" 
                        value={row[0] || ''} 
                        onChange={e => handleDataChange(rowIndex, 0, e.target.value)}
                        className="w-full bg-transparent text-center font-bold text-stone-600 outline-none"
                      />
                    </td>
                    <td className="p-2 border-r border-stone-200">
                      <input 
                        type="text" 
                        value={row[1] || ''} 
                        onChange={e => handleDataChange(rowIndex, 1, e.target.value)}
                        className="w-full bg-transparent text-center font-bold text-stone-600 outline-none"
                      />
                    </td>
                    {formData.columns?.map((col, colIndex) => (
                      <td key={col.id} className="p-0 border-r border-stone-200 relative group">
                        <input 
                          type={col.type === 'Numeric' ? 'number' : 'text'} 
                          value={row[colIndex + 2] || ''} 
                          onChange={e => handleDataChange(rowIndex, colIndex + 2, e.target.value)}
                          className="w-full h-full p-3 bg-transparent outline-none focus:bg-agri-secondary/5 focus:ring-inset focus:ring-2 focus:ring-agri-secondary text-sm"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex justify-between">
            <span>{formData.data?.length || 0} rows</span>
            <span>Use Tab to move between cells. Copy/Paste supported via Import.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetEditor;
