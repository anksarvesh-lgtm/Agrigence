import { useLocation } from 'react-router-dom';
import React, { useState , useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Settings2, 
  Download, 
  AlertTriangle,
  Wand2,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { ReportData, GeneratedSection } from './writingTypes';
import { generateFullReport } from './sectionBuilder';
import { enhanceText } from './aiAdapter';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

export default function WritingPage() {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [reportType, setReportType] = useState('thesis');
  const [data, setData] = useState<ReportData>({
    experiment: {
      design: 'RCBD',
      replications: 3,
      plotSize: 20,
      treatmentCount: 8
    },
    anova: {
      fValue: 4.52,
      cv: 12.5,
      isSignificant: true,
      bestTreatment: 'T3',
      bestYield: 52.4
    },
    climate: {
      totalGDD: 1500,
      heatStressDays: 5
    }
  });
  const [customNotes, setCustomNotes] = useState("We observed a lot of weed growth in plot 2. I applied herbicide on day 15.");
  const [sections, setSections] = useState<GeneratedSection[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.restoreData) {
      const data = location.state.restoreData;
      if (data.reportType !== undefined) setReportType(data.reportType);
      if (data.data !== undefined) setData(data.data);
      if (data.customNotes !== undefined) setCustomNotes(data.customNotes);
      if (data.sections !== undefined) setSections(data.sections);
      if (data.warnings !== undefined) setWarnings(data.warnings);
      if (data.isAiEnabled !== undefined) setIsAiEnabled(data.isAiEnabled);
      if (data.isGenerating !== undefined) setIsGenerating(data.isGenerating);
    }
  }, [location.state]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const newWarnings: string[] = [];
    
    if (!data.experiment) newWarnings.push("Warning: Missing experiment design data. Methodology will be incomplete.");
    if (!data.anova) newWarnings.push("Error: Missing ANOVA results. Cannot generate Results section.");
    
    setWarnings(newWarnings);
    
    if (newWarnings.some(w => w.startsWith('Error'))) {
      setSections([]);
      setIsGenerating(false);
      return;
    }

    let generated = generateFullReport(data, customNotes);
    
    if (isAiEnabled) {
      // Apply AI enhancement (currently a pass-through stub)
      generated = await Promise.all(generated.map(async (sec) => ({
        title: sec.title,
        content: await enhanceText(sec.content)
      })));
    }
    
    setSections(generated);
    setIsGenerating(false);

    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'AI Writing Assistant',
          inputData: { reportType, data, customNotes },
          outputData: { status: 'Generated' },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExport = () => {
    if (sections.length === 0) return;
    
    let docContent = "SCIENTIFIC REPORT DRAFT\n\n";
    sections.forEach(sec => {
      docContent += `${sec.title}\n${sec.content}\n\n`;
    });
    
    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Scientific_Draft_${Date.now()}.txt`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-teal-100 p-3 rounded-xl">
          <FileText className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Writing Assistant</h1>
          <p className="text-stone-500 text-sm">Scientific Writing Support for Reports & Thesis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-stone-500" />
                Report Settings
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Report Type</label>
                <select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                >
                  <option value="thesis">Thesis Chapter</option>
                  <option value="paper">Research Paper</option>
                  <option value="report">Trial Report</option>
                </select>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAiEnabled}
                    onChange={(e) => setIsAiEnabled(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-stone-700 flex items-center gap-1">
                    Enable AI Enhancement <Wand2 size={14} className="text-teal-500" />
                  </span>
                </label>
                <p className="text-[10px] text-stone-500 mt-1 ml-6">Refines readability (requires connection).</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-500" />
                Custom Notes
              </h2>
            </div>
            <div className="p-5">
              <p className="text-xs text-stone-500 mb-2">Enter informal notes. The assistant will convert them to passive scientific tone.</p>
              <textarea 
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={4}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                placeholder="e.g., We observed a lot of weed growth..."
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-stone-300 text-white font-medium py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? 'Generating...' : 'Generate Scientific Draft'}
          </button>

          <AnimatePresence>
            {warnings.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                  <AlertTriangle size={16} />
                  Validation Alerts
                </div>
                <ul className="space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                Generated Draft
              </h2>
              <button 
                onClick={handleExport}
                disabled={sections.length === 0}
                className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
              >
                <Download size={16} /> Export TXT
              </button>
            </div>
            
            <div className="flex-1 p-6 bg-white overflow-y-auto">
              {sections.length > 0 ? (
                <div className="space-y-8 max-w-[800px] mx-auto font-serif text-stone-800 leading-relaxed">
                  {sections.map((sec, i) => (
                    <div key={i} className="group relative">
                      <h3 className="text-lg font-bold text-stone-900 mb-3 font-sans">{sec.title}</h3>
                      <p className="text-[15px] text-stone-700 whitespace-pre-wrap">{sec.content}</p>
                      
                      <button 
                        onClick={() => handleCopy(sec.content)}
                        className="absolute top-0 right-0 p-2 text-stone-400 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg border border-stone-200 shadow-sm"
                        title="Copy section"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-stone-500">No Draft Generated</p>
                  <p className="text-sm mt-1 max-w-sm">Click "Generate Scientific Draft" to build your report based on the experimental data.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
