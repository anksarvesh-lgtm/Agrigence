import React, { useState } from 'react';
import { useAuth } from '../src/authContext';
import { Calculator, Plus, Minus } from 'lucide-react';
import { computeANOVA, ANOVAInput, ANOVAOutput } from '../lib/anovaCalculations';
import { db } from '../src/firebase';
import { collection, addDoc } from 'firebase/firestore';
import ToolsNavigation from '../components/ToolsNavigation';

const AnovaEngine: React.FC = () => {
  const { user, planDetails } = useAuth();
  const [design, setDesign] = useState<'CRD' | 'RBD' | 'LSD' | 'Factorial RBD'>('CRD');
  const [postHoc, setPostHoc] = useState<'None' | 'LSD' | 'Tukey' | 'DMRT'>('LSD');
  
  const [rawData, setRawData] = useState<string>('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  
  const [responseCol, setResponseCol] = useState<string>('');
  const [treatmentCol, setTreatmentCol] = useState<string>('');
  const [blockCol, setBlockCol] = useState<string>('');
  const [rowCol, setRowCol] = useState<string>('');
  const [colCol, setColCol] = useState<string>('');
  const [factorACol, setFactorACol] = useState<string>('');
  const [factorBCol, setFactorBCol] = useState<string>('');

  const [results, setResults] = useState<ANOVAOutput | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParseData = () => {
    if (!rawData.trim()) {
      setError("Please paste some data first.");
      return;
    }
    
    // Auto-detect delimiter (tab or comma)
    const delimiter = rawData.indexOf('\t') !== -1 ? '\t' : ',';
    
    import('papaparse').then((Papa) => {
      Papa.default.parse(rawData, {
        header: true,
        skipEmptyLines: true,
        delimiter: delimiter,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setParsedData(results.data);
            const cols = Object.keys(results.data[0] as object);
            setColumns(cols);
            
            // Auto-select columns if possible
            if (cols.length > 0) setResponseCol(cols[cols.length - 1]);
            if (cols.length > 1) setTreatmentCol(cols[0]);
            if (cols.length > 2) setBlockCol(cols[1]);
            
            setError(null);
          } else {
            setError("Could not parse data. Ensure it has headers.");
          }
        },
        error: (err: any) => {
          setError(err.message);
        }
      });
    });
  };

  const runAnova = () => {
    setError(null);
    if (parsedData.length === 0) {
      setError("Please parse data first.");
      return;
    }
    if (!responseCol) {
      setError("Please select a response variable.");
      return;
    }

    try {
      const input: ANOVAInput = {
        design,
        data: parsedData,
        responseCol,
        treatmentCol,
        blockCol,
        rowCol,
        colCol,
        factorACol,
        factorBCol,
        postHoc
      };
      const output = computeANOVA(input);
      setResults(output);
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation.");
    }
  };

  const handleSave = async () => {
    if (!user) {
      setSaveMessage({ type: 'error', text: 'Please log in to save analyses.' });
      return;
    }
    
    const isPaid = planDetails && planDetails.price > 0;
    if (!isPaid) {
      setSaveMessage({ type: 'error', text: 'Saving data is a Premium feature. Please upgrade your subscription.' });
      return;
    }

    if (!results) return;

    setIsSaving(true);
    setSaveMessage(null);
    try {
      await addDoc(collection(db, 'saved_analyses'), {
        userId: user.id,
        type: 'ANOVA',
        createdAt: new Date().toISOString(),
        design,
        postHoc,
        results
      });
      setSaveMessage({ type: 'success', text: 'Analysis saved successfully!' });
    } catch (err) {
      console.error("Error saving analysis:", err);
      setSaveMessage({ type: 'error', text: 'Failed to save analysis.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex bg-stone-50 min-h-screen">
      <ToolsNavigation />
      <div className="flex-1 p-8 space-y-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-stone-800 font-serif">Agrigence ANOVA Engine</h1>
            {planDetails && planDetails.price > 0 ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">Premium Active</span>
            ) : (
              <span className="px-3 py-1 bg-stone-200 text-stone-600 text-xs font-bold rounded-full uppercase tracking-wider">Free Tier</span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              
              {/* Step 1: Design Selection */}
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <span className="bg-agri-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  Experimental Design
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={design} onChange={(e) => {
                    setDesign(e.target.value as any);
                    setResults(null);
                  }}>
                    <option value="CRD">CRD (Completely Randomized Design)</option>
                    <option value="RBD">RBD (Randomized Block Design)</option>
                    <option value="LSD">LSD (Latin Square Design)</option>
                    <option value="Factorial RBD">Factorial RBD (2 Factors)</option>
                  </select>
                  <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={postHoc} onChange={(e) => setPostHoc(e.target.value as any)}>
                    <option value="None">No Post-Hoc Test</option>
                    <option value="LSD">LSD (Least Significant Difference)</option>
                    <option value="Tukey">Tukey's HSD</option>
                    <option value="DMRT">Duncan's Multiple Range Test (DMRT)</option>
                  </select>
                </div>
              </div>

              {/* Step 2: Data Input */}
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <span className="bg-agri-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Paste Data (Excel/CSV)
                </h3>
                <p className="text-xs text-stone-500">Paste your data with headers. Columns can be separated by tabs or commas.</p>
                <textarea 
                  className="w-full h-48 p-3 border border-stone-200 rounded-lg text-sm font-mono whitespace-pre"
                  placeholder="Trt&#9;Rep&#9;Yield&#10;T1&#9;R1&#9;12.5&#10;T1&#9;R2&#9;13.1&#10;..."
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                />
                <button 
                  onClick={handleParseData}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Parse Data
                </button>
              </div>

              {/* Step 3: Column Mapping */}
              {columns.length > 0 && (
                <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
                  <h3 className="font-bold text-stone-800 flex items-center gap-2">
                    <span className="bg-agri-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                    Map Columns
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Response Variable (Y)</label>
                      <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={responseCol} onChange={e => setResponseCol(e.target.value)}>
                        <option value="">Select Column...</option>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {design === 'CRD' && (
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">Treatment Column</label>
                        <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={treatmentCol} onChange={e => setTreatmentCol(e.target.value)}>
                          <option value="">Select Column...</option>
                          {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    )}

                    {design === 'RBD' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Treatment Column</label>
                          <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={treatmentCol} onChange={e => setTreatmentCol(e.target.value)}>
                            <option value="">Select Column...</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Block / Replication Column</label>
                          <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={blockCol} onChange={e => setBlockCol(e.target.value)}>
                            <option value="">Select Column...</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    {design === 'LSD' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Treatment Column</label>
                          <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={treatmentCol} onChange={e => setTreatmentCol(e.target.value)}>
                            <option value="">Select Column...</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Row Column</label>
                          <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={rowCol} onChange={e => setRowCol(e.target.value)}>
                            <option value="">Select Column...</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Column Column</label>
                          <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={colCol} onChange={e => setColCol(e.target.value)}>
                            <option value="">Select Column...</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    {design === 'Factorial RBD' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Factor A Column</label>
                          <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={factorACol} onChange={e => setFactorACol(e.target.value)}>
                            <option value="">Select Column...</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Factor B Column</label>
                          <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={factorBCol} onChange={e => setFactorBCol(e.target.value)}>
                            <option value="">Select Column...</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Block / Replication Column</label>
                          <select className="w-full p-2 border border-stone-200 rounded-lg text-sm bg-white" value={blockCol} onChange={e => setBlockCol(e.target.value)}>
                            <option value="">Select Column...</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

                  <button 
                    onClick={runAnova}
                    className="w-full bg-agri-primary hover:bg-agri-primary/90 text-white py-3 rounded-lg font-medium transition-colors mt-4"
                  >
                    Run Analysis
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {results ? (
                <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col gap-6 p-6">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                    <h3 className="text-2xl font-serif font-bold text-stone-800">ANOVA Results ({design})</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border border-stone-200">
                      <thead className="bg-stone-50 border-b">
                        <tr>
                          <th className="px-4 py-2 border-r">Source</th>
                          <th className="px-4 py-2 text-right border-r">df</th>
                          <th className="px-4 py-2 text-right border-r">SS</th>
                          <th className="px-4 py-2 text-right border-r">MS</th>
                          <th className="px-4 py-2 text-right border-r">F-cal</th>
                          <th className="px-4 py-2 text-right border-r">F-tab (5%)</th>
                          <th className="px-4 py-2 text-right">F-tab (1%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {design === 'RBD' && results.SSB !== undefined && (
                          <tr className="border-b">
                            <td className="px-4 py-2 border-r">Replications/Blocks</td>
                            <td className="px-4 py-2 text-right border-r">{results.dfB}</td>
                            <td className="px-4 py-2 text-right border-r">{results.SSB.toFixed(4)}</td>
                            <td className="px-4 py-2 text-right border-r">{results.MSB?.toFixed(4)}</td>
                            <td className="px-4 py-2 text-right border-r">-</td>
                            <td className="px-4 py-2 text-right border-r">-</td>
                            <td className="px-4 py-2 text-right">-</td>
                          </tr>
                        )}
                        {design === 'LSD' && results.SSR !== undefined && results.SSC !== undefined && (
                          <>
                            <tr className="border-b">
                              <td className="px-4 py-2 border-r">Rows</td>
                              <td className="px-4 py-2 text-right border-r">{results.dfR}</td>
                              <td className="px-4 py-2 text-right border-r">{results.SSR.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r">{results.MSR?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r">-</td>
                              <td className="px-4 py-2 text-right border-r">-</td>
                              <td className="px-4 py-2 text-right">-</td>
                            </tr>
                            <tr className="border-b">
                              <td className="px-4 py-2 border-r">Columns</td>
                              <td className="px-4 py-2 text-right border-r">{results.dfC}</td>
                              <td className="px-4 py-2 text-right border-r">{results.SSC.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r">{results.MSC?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r">-</td>
                              <td className="px-4 py-2 text-right border-r">-</td>
                              <td className="px-4 py-2 text-right">-</td>
                            </tr>
                          </>
                        )}
                        
                        {design === 'Factorial RBD' ? (
                          <>
                            <tr className="border-b">
                              <td className="px-4 py-2 border-r">Blocks</td>
                              <td className="px-4 py-2 text-right border-r">{results.dfB}</td>
                              <td className="px-4 py-2 text-right border-r">{results.SSB?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r">{results.MSB?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r">-</td>
                              <td className="px-4 py-2 text-right border-r">-</td>
                              <td className="px-4 py-2 text-right">-</td>
                            </tr>
                            <tr className="border-b">
                              <td className="px-4 py-2 border-r font-bold">Factor A</td>
                              <td className="px-4 py-2 text-right border-r">{results.dfA}</td>
                              <td className="px-4 py-2 text-right border-r">{results.SSA?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r">{results.MSA?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r font-bold">
                                {results.FA?.toFixed(4)}
                                {(results.FA || 0) > (results.FtabA01 || 0) ? '**' : (results.FA || 0) > (results.FtabA05 || 0) ? '*' : ' ns'}
                              </td>
                              <td className="px-4 py-2 text-right border-r">{results.FtabA05?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right">{results.FtabA01?.toFixed(4)}</td>
                            </tr>
                            <tr className="border-b">
                              <td className="px-4 py-2 border-r font-bold">Factor B</td>
                              <td className="px-4 py-2 text-right border-r">{results.dfFactorB}</td>
                              <td className="px-4 py-2 text-right border-r">{results.SSFactorB?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r">{results.MSFactorB?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r font-bold">
                                {results.FFactorB?.toFixed(4)}
                                {(results.FFactorB || 0) > (results.FtabB01 || 0) ? '**' : (results.FFactorB || 0) > (results.FtabB05 || 0) ? '*' : ' ns'}
                              </td>
                              <td className="px-4 py-2 text-right border-r">{results.FtabB05?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right">{results.FtabB01?.toFixed(4)}</td>
                            </tr>
                            <tr className="border-b bg-stone-50">
                              <td className="px-4 py-2 border-r font-bold">Interaction (A x B)</td>
                              <td className="px-4 py-2 text-right border-r">{results.dfAB}</td>
                              <td className="px-4 py-2 text-right border-r">{results.SSAB?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r">{results.MSAB?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right border-r font-bold">
                                {results.FAB?.toFixed(4)}
                                {(results.FAB || 0) > (results.FtabAB01 || 0) ? '**' : (results.FAB || 0) > (results.FtabAB05 || 0) ? '*' : ' ns'}
                              </td>
                              <td className="px-4 py-2 text-right border-r">{results.FtabAB05?.toFixed(4)}</td>
                              <td className="px-4 py-2 text-right">{results.FtabAB01?.toFixed(4)}</td>
                            </tr>
                          </>
                        ) : (
                          <tr className="border-b bg-stone-50">
                            <td className="px-4 py-2 border-r font-bold">Treatments</td>
                            <td className="px-4 py-2 text-right border-r">{results.dfT}</td>
                            <td className="px-4 py-2 text-right border-r">{results.SSTR?.toFixed(4)}</td>
                            <td className="px-4 py-2 text-right border-r">{results.MST?.toFixed(4)}</td>
                            <td className="px-4 py-2 text-right border-r font-bold">
                              {results.F?.toFixed(4)}
                              {(results.F || 0) > (results.Ftab01 || 0) ? '**' : (results.F || 0) > (results.Ftab05 || 0) ? '*' : ' ns'}
                            </td>
                            <td className="px-4 py-2 text-right border-r">{results.Ftab05?.toFixed(4)}</td>
                            <td className="px-4 py-2 text-right">{results.Ftab01?.toFixed(4)}</td>
                          </tr>
                        )}

                        <tr className="border-b">
                          <td className="px-4 py-2 border-r">Error</td>
                          <td className="px-4 py-2 text-right border-r">{results.dfE}</td>
                          <td className="px-4 py-2 text-right border-r">{results.SSE.toFixed(4)}</td>
                          <td className="px-4 py-2 text-right border-r">{results.MSE.toFixed(4)}</td>
                          <td className="px-4 py-2 text-right border-r">-</td>
                          <td className="px-4 py-2 text-right border-r">-</td>
                          <td className="px-4 py-2 text-right">-</td>
                        </tr>
                        <tr className="bg-stone-50 font-bold">
                          <td className="px-4 py-2 border-r">Total</td>
                          <td className="px-4 py-2 text-right border-r">
                            {(results.dfT || 0) + (results.dfB || 0) + (results.dfR || 0) + (results.dfC || 0) + (results.dfA || 0) + (results.dfFactorB || 0) + (results.dfAB || 0) + results.dfE}
                          </td>
                          <td className="px-4 py-2 text-right border-r">{results.SST.toFixed(4)}</td>
                          <td className="px-4 py-2 text-right border-r">-</td>
                          <td className="px-4 py-2 text-right border-r">-</td>
                          <td className="px-4 py-2 text-right border-r">-</td>
                          <td className="px-4 py-2 text-right">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      {design === 'Factorial RBD' ? (
                        <>
                          <p className="text-sm"><strong>SE(m) A:</strong> {results.semA?.toFixed(4)}</p>
                          <p className="text-sm"><strong>SE(d) A:</strong> {results.sedA?.toFixed(4)}</p>
                          <p className="text-sm"><strong>SE(m) B:</strong> {results.semB?.toFixed(4)}</p>
                          <p className="text-sm"><strong>SE(d) B:</strong> {results.sedB?.toFixed(4)}</p>
                          <p className="text-sm"><strong>SE(m) AxB:</strong> {results.semAB?.toFixed(4)}</p>
                          <p className="text-sm"><strong>SE(d) AxB:</strong> {results.sedAB?.toFixed(4)}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm"><strong>F-calculated:</strong> {results.F?.toFixed(4)}</p>
                          <p className="text-sm"><strong>F-tabulated (5%):</strong> {results.Ftab05?.toFixed(4)}</p>
                          <p className="text-sm"><strong>Result:</strong> {(results.F || 0) > (results.Ftab05 || 0) ? 'Significant' : 'Not Significant'}</p>
                          <p className="text-sm"><strong>SE(m):</strong> {results.sem?.toFixed(4)}</p>
                          <p className="text-sm"><strong>SE(d):</strong> {results.sed?.toFixed(4)}</p>
                        </>
                      )}
                    </div>
                    
                    {results.postHocMethod !== 'None' && results.criticalValues.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-bold">Critical Values ({results.postHocMethod} at 5%)</p>
                        {results.criticalValues.length === 1 ? (
                          <p className="text-sm">CV = {results.criticalValues[0].toFixed(4)}</p>
                        ) : (
                          <div className="text-xs text-stone-600 max-h-24 overflow-y-auto">
                            {results.criticalValues.map((cv, idx) => (
                              <div key={idx}>R{idx + 2} = {cv.toFixed(4)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {results.treatmentMeans.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-bold text-stone-800 mb-2">
                        {design === 'Factorial RBD' ? 'Interaction Means (A x B) & Grouping' : 'Treatment Means & Grouping'}
                      </h4>
                      <table className="w-full text-sm text-left border border-stone-200">
                        <thead className="bg-stone-50 border-b">
                          <tr>
                            <th className="px-4 py-2 border-r">Treatment</th>
                            <th className="px-4 py-2 border-r text-right">Mean</th>
                            <th className="px-4 py-2 border-r text-right">n</th>
                            {results.postHocMethod !== 'None' && <th className="px-4 py-2">Significance Group</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {results.treatmentMeans.map((tm, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="px-4 py-2 border-r">{tm.id}</td>
                              <td className="px-4 py-2 border-r text-right">{tm.mean.toFixed(4)}</td>
                              <td className="px-4 py-2 border-r text-right">{tm.n}</td>
                              {results.postHocMethod !== 'None' && <td className="px-4 py-2 font-bold text-blue-600">{tm.grouping}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {results.postHocMethod !== 'None' && (
                        <p className="text-xs text-stone-500 mt-2 italic">
                          * Means sharing the same letter are not significantly different according to {results.postHocMethod} (p &lt; 0.05).
                        </p>
                      )}
                    </div>
                  )}

                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                    <h4 className="font-bold text-stone-800 mb-2">Interpretation</h4>
                    <div className="text-sm text-stone-700 leading-relaxed space-y-2">
                      {design === 'Factorial RBD' ? (
                        <>
                          <p>
                            <strong>Factor A:</strong> The F-calculated value ({results.FA?.toFixed(2)}) is 
                            {(results.FA || 0) > (results.FtabA05 || 0) ? ' greater ' : ' less '} 
                            than the F-tabulated value at 5% significance ({results.FtabA05?.toFixed(2)}). 
                            Therefore, the differences among Factor A means are 
                            <strong>{(results.FA || 0) > (results.FtabA05 || 0) ? ' statistically significant.' : ' not statistically significant.'}</strong>
                          </p>
                          <p>
                            <strong>Factor B:</strong> The F-calculated value ({results.FFactorB?.toFixed(2)}) is 
                            {(results.FFactorB || 0) > (results.FtabB05 || 0) ? ' greater ' : ' less '} 
                            than the F-tabulated value at 5% significance ({results.FtabB05?.toFixed(2)}). 
                            Therefore, the differences among Factor B means are 
                            <strong>{(results.FFactorB || 0) > (results.FtabB05 || 0) ? ' statistically significant.' : ' not statistically significant.'}</strong>
                          </p>
                          <p>
                            <strong>Interaction (A x B):</strong> The F-calculated value ({results.FAB?.toFixed(2)}) is 
                            {(results.FAB || 0) > (results.FtabAB05 || 0) ? ' greater ' : ' less '} 
                            than the F-tabulated value at 5% significance ({results.FtabAB05?.toFixed(2)}). 
                            Therefore, the interaction effect is 
                            <strong>{(results.FAB || 0) > (results.FtabAB05 || 0) ? ' statistically significant.' : ' not statistically significant.'}</strong>
                          </p>
                        </>
                      ) : (
                        <p>
                          The F-calculated value ({results.F?.toFixed(2)}) is 
                          {(results.F || 0) > (results.Ftab05 || 0) ? ' greater ' : ' less '} 
                          than the F-tabulated value at 5% significance ({results.Ftab05?.toFixed(2)}). 
                          Therefore, the null hypothesis is {(results.F || 0) > (results.Ftab05 || 0) ? 'rejected' : 'accepted'}, indicating that there are 
                          <strong>{(results.F || 0) > (results.Ftab05 || 0) ? ' statistically significant ' : ' no statistically significant '}</strong> 
                          differences among the treatment means.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl text-stone-400">
                  <Calculator size={48} className="mb-4 text-stone-300" />
                  <p>No Analysis Results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnovaEngine;
