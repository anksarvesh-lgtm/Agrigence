import React, { useState, useEffect } from 'react';
import { calculateANOVA, AnovaInput, AnovaOutput } from './anova';
import OutputSheets from './OutputSheets';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../App';
import { Download, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SampleRow {
  rIndex: number;
  tIndex: number;
  samples: string[];
  unit: string;
  notes: string;
}

const ResearcherConsole: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [t, setT] = useState(4);
  const [r, setR] = useState(4);
  const [n, setN] = useState(5); // Number of plants/samples
  
  const [treatments, setTreatments] = useState<string[]>(Array.from({ length: 4 }, (_, i) => `T${i + 1}`));
  const [replications, setReplications] = useState<string[]>(Array.from({ length: 4 }, (_, i) => `Rep ${i + 1}`));
  const [rows, setRows] = useState<SampleRow[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<{ input: AnovaInput; result: AnovaOutput } | null>(null);

  // Update matrix size when t, r, or n changes
  useEffect(() => {
    setTreatments(prev => {
      const next = [...prev];
      if (next.length < t) {
        for (let i = next.length; i < t; i++) next.push(`T${i + 1}`);
      } else if (next.length > t) {
        next.splice(t);
      }
      return next;
    });

    setReplications(prev => {
      const next = [...prev];
      if (next.length < r) {
        for (let i = next.length; i < r; i++) next.push(`Rep ${i + 1}`);
      } else if (next.length > r) {
        next.splice(r);
      }
      return next;
    });

    setRows(prev => {
      const next: SampleRow[] = [];
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < t; j++) {
          const existing = prev.find(row => row.rIndex === i && row.tIndex === j);
          if (existing) {
            const samples = [...existing.samples];
            if (samples.length < n) {
              for (let k = samples.length; k < n; k++) samples.push('');
            } else if (samples.length > n) {
              samples.splice(n);
            }
            next.push({ ...existing, samples });
          } else {
            next.push({
              rIndex: i,
              tIndex: j,
              samples: Array(n).fill(''),
              unit: 'cm',
              notes: ''
            });
          }
        }
      }
      return next;
    });
  }, [t, r, n]);

  const handleSampleChange = (rIndex: number, tIndex: number, sIndex: number, value: string) => {
    setRows(prev => prev.map(row => {
      if (row.rIndex === rIndex && row.tIndex === tIndex) {
        const newSamples = [...row.samples];
        newSamples[sIndex] = value;
        return { ...row, samples: newSamples };
      }
      return row;
    }));
    setError(null);
  };

  const handleRowChange = (rIndex: number, tIndex: number, field: 'unit' | 'notes', value: string) => {
    setRows(prev => prev.map(row => {
      if (row.rIndex === rIndex && row.tIndex === tIndex) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleTreatmentChange = (i: number, value: string) => {
    const newT = [...treatments];
    newT[i] = value;
    setTreatments(newT);
  };

  const handleReplicationChange = (j: number, value: string) => {
    const newR = [...replications];
    newR[j] = value;
    setReplications(newR);
  };

  const handleCalculate = () => {
    setError(null);
    setOutput(null);

    // Validate
    const numMatrix: number[][] = Array.from({ length: t }, () => Array(r).fill(0));
    
    for (const row of rows) {
      const validSamples = row.samples.map(s => parseFloat(s)).filter(s => !isNaN(s));
      if (validSamples.length < 5) {
        setError(`Row R${row.rIndex + 1}T${row.tIndex + 1} has less than 5 valid samples. Minimum 5 samples are required for statistical reliability.`);
        return;
      }
      const mean = validSamples.reduce((a, b) => a + b, 0) / validSamples.length;
      numMatrix[row.tIndex][row.rIndex] = mean;
    }

    const input: AnovaInput = {
      title: title || 'Untitled Experiment',
      treatments,
      replications,
      matrix: numMatrix
    };

    const result = calculateANOVA(input);
    if (result.error) {
      setError(result.message || 'An error occurred during calculation.');
      if (user) {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Research Data Lab (Manual)',
          status: 'FAILED',
          timestamp: new Date().toISOString(),
          inputData: input,
          outputData: { error: result.message }
        }).catch(console.error);
      }
    } else {
      setOutput({ input, result });
      if (user) {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Research Data Lab (Manual)',
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          inputData: input,
          outputData: result
        }).catch(console.error);
      }
    }
  };

  const handleExportCSV = () => {
    let csv = 'Replication,Treatment,CombinedID,PlantNo,Value,Unit,Notes\n';
    rows.forEach(row => {
      const repName = replications[row.rIndex];
      const trtName = treatments[row.tIndex];
      const combinedId = `R${row.rIndex + 1}T${row.tIndex + 1}`;
      row.samples.forEach((val, sIdx) => {
        if (val.trim() !== '') {
          csv += `"${repName}","${trtName}","${combinedId}",P${sIdx + 1},${val},"${row.unit}","${row.notes}"\n`;
        }
      });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'experiment'}_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleLoadSample = () => {
    setTitle('Wheat Height Study (CRD)');
    setT(2);
    setR(2);
    setN(5);
    setTreatments(['T1 (Control)', 'T2 (Treated)']);
    setReplications(['Rep 1', 'Rep 2']);
    
    setRows([
      { rIndex: 0, tIndex: 0, samples: ['45', '50', '47', '49', '50'], unit: 'cm', notes: 'Healthy' },
      { rIndex: 0, tIndex: 1, samples: ['48', '52', '50', '51', '53'], unit: 'cm', notes: 'Good' },
      { rIndex: 1, tIndex: 0, samples: ['46', '49', '48', '47', '50'], unit: 'cm', notes: 'Normal' },
      { rIndex: 1, tIndex: 1, samples: ['50', '54', '51', '52', '55'], unit: 'cm', notes: 'Excellent' },
    ]);
    
    setError(null);
    setOutput(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Meta Information Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d4cfc6] grid md:grid-cols-4 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Experiment / Study Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter experiment title..."
            className="w-full p-3 border border-[#d4cfc6] rounded-xl focus:outline-none focus:border-[#1a6b3c] focus:ring-1 focus:ring-[#1a6b3c] font-serif"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Date of Analysis</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-[#d4cfc6] rounded-xl focus:outline-none focus:border-[#1a6b3c] focus:ring-1 focus:ring-[#1a6b3c] font-serif"
          />
        </div>
        <div className="grid grid-cols-3 gap-4 md:col-span-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Treatments (t)</label>
            <input 
              type="number" 
              min={2} max={20}
              value={t}
              onChange={(e) => setT(Math.max(2, Math.min(20, parseInt(e.target.value) || 2)))}
              className="w-full p-3 border border-[#d4cfc6] rounded-xl focus:outline-none focus:border-[#1a6b3c] focus:ring-1 focus:ring-[#1a6b3c] font-serif text-center"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Reps (r)</label>
            <input 
              type="number" 
              min={2} max={20}
              value={r}
              onChange={(e) => setR(Math.max(2, Math.min(20, parseInt(e.target.value) || 2)))}
              className="w-full p-3 border border-[#d4cfc6] rounded-xl focus:outline-none focus:border-[#1a6b3c] focus:ring-1 focus:ring-[#1a6b3c] font-serif text-center"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Plants per R×T (n)</label>
            <input 
              type="number" 
              min={5} max={50}
              value={n}
              onChange={(e) => setN(Math.max(5, Math.min(50, parseInt(e.target.value) || 5)))}
              className="w-full p-3 border border-[#d4cfc6] rounded-xl focus:outline-none focus:border-[#1a6b3c] focus:ring-1 focus:ring-[#1a6b3c] font-serif text-center"
            />
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Treatment Names</label>
          <div className="flex flex-wrap gap-2">
            {treatments.map((trt, i) => (
              <input key={i} type="text" value={trt} onChange={e => handleTreatmentChange(i, e.target.value)} className="w-24 p-2 border border-[#d4cfc6] rounded-lg text-sm font-mono" />
            ))}
          </div>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Replication Names</label>
          <div className="flex flex-wrap gap-2">
            {replications.map((rep, i) => (
              <input key={i} type="text" value={rep} onChange={e => handleReplicationChange(i, e.target.value)} className="w-24 p-2 border border-[#d4cfc6] rounded-lg text-sm font-mono" />
            ))}
          </div>
        </div>
      </div>

      {/* Research Assistant Guidance */}
      <div className="bg-[#e8f4ee] p-4 rounded-xl border border-[#1a6b3c]/20 flex items-start gap-3">
        <div className="mt-0.5 text-[#1a6b3c]"><AlertCircle size={18} /></div>
        <div className="text-sm text-[#1a6b3c]">
          <strong className="block mb-1">Research Assistant Guidelines:</strong>
          <ul className="list-disc list-inside space-y-1 opacity-90">
            <li>Each treatment should have an equal number of replications.</li>
            <li>Minimum 5 plants per R×T improves statistical reliability.</li>
            <li>Avoid missing values for ANOVA compatibility.</li>
          </ul>
        </div>
      </div>

      {/* Data Entry Grid */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d4cfc6] overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#1a1a1a]">Hierarchical Experimental Data</h3>
          <button onClick={handleExportCSV} className="text-sm font-bold text-[#1a6b3c] flex items-center gap-2 hover:underline">
            <Download size={16} /> Export Flattened CSV
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 border border-[#d4cfc6] bg-[#1a6b3c] text-white font-mono text-sm whitespace-nowrap">Combined ID</th>
              {Array.from({ length: n }).map((_, i) => (
                <th key={i} className="p-3 border border-[#d4cfc6] bg-[#1a6b3c] text-white font-mono text-sm">P{i + 1}</th>
              ))}
              <th className="p-3 border border-[#d4cfc6] bg-[#1a6b3c] text-white font-mono text-sm whitespace-nowrap">Mean Value</th>
              <th className="p-3 border border-[#d4cfc6] bg-[#1a6b3c] text-white font-mono text-sm">Unit</th>
              <th className="p-3 border border-[#d4cfc6] bg-[#1a6b3c] text-white font-mono text-sm">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const combinedId = `R${row.rIndex + 1}T${row.tIndex + 1}`;
              const validSamples = row.samples.map(s => parseFloat(s)).filter(s => !isNaN(s));
              const mean = validSamples.length > 0 ? (validSamples.reduce((a, b) => a + b, 0) / validSamples.length).toFixed(2) : '-';
              const isComplete = validSamples.length >= 5;

              return (
                <tr key={`${row.rIndex}-${row.tIndex}`} className={!isComplete ? "bg-[#fef2f2]" : "bg-white"}>
                  <td className="p-3 border border-[#d4cfc6] font-bold text-[#1a6b3c] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isComplete ? <CheckCircle2 size={14} className="text-green-600" /> : <AlertCircle size={14} className="text-red-500" />}
                      {combinedId}
                    </div>
                  </td>
                  {row.samples.map((val, sIdx) => (
                    <td key={sIdx} className="p-0 border border-[#d4cfc6]">
                      <input 
                        type="text" 
                        value={val}
                        onChange={(e) => handleSampleChange(row.rIndex, row.tIndex, sIdx, e.target.value)}
                        placeholder="0.0"
                        className={`w-full bg-transparent text-right p-3 outline-none focus:ring-2 focus:ring-inset focus:ring-[#1a6b3c] font-mono text-sm ${val.trim() === '' ? 'bg-red-50/50' : ''}`}
                      />
                    </td>
                  ))}
                  <td className="p-3 border border-[#d4cfc6] text-center font-bold font-mono bg-[#f7f5f0]">{mean}</td>
                  <td className="p-0 border border-[#d4cfc6]">
                     <input type="text" value={row.unit} onChange={e => handleRowChange(row.rIndex, row.tIndex, 'unit', e.target.value)} className="w-full bg-transparent p-3 outline-none text-center text-sm" />
                  </td>
                  <td className="p-0 border border-[#d4cfc6]">
                     <input type="text" value={row.notes} onChange={e => handleRowChange(row.rIndex, row.tIndex, 'notes', e.target.value)} className="w-full bg-transparent p-3 outline-none text-sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-[#fef2f2] border-l-4 border-[#b91c1c] p-4 rounded-r-xl text-[#b91c1c] font-serif">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={handleCalculate}
          className="bg-[#1a6b3c] text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-[#2d8a54] transition-colors flex items-center gap-2"
        >
          ⚙ Calculate Statistics (ANOVA)
        </button>
        <button 
          onClick={handleLoadSample}
          className="bg-transparent border-2 border-[#1a6b3c] text-[#1a6b3c] px-6 py-3 rounded-xl font-bold hover:bg-[#e8f4ee] transition-colors flex items-center gap-2"
        >
          ▶ Load Sample Data
        </button>
      </div>

      {/* Output */}
      {output && (
        <OutputSheets input={output.input} output={output.result} />
      )}
    </div>
  );
};

export default ResearcherConsole;
