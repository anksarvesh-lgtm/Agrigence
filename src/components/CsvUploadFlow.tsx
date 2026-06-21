import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, CheckCircle, AlertCircle, ArrowLeft, UploadCloud, FileJson, Calendar, Download, Search, Settings, Tag, User, Hash, FileText, ChevronRight, ChevronLeft, Percent, Layers
} from 'lucide-react';
import { db } from '../../src/firebase';
import { parseCSV, validateAndConvertCSV, QuestionItem } from '../../utils/csvParser';
import { AccessControlPanel, AccessControlState } from './AccessControlPanel';
import { downloadCSVTemplate } from '../../utils/csvTemplate';

const ALL_EXAMS = [
  "ICAR UG", "ICAR AIEEA-PG", "ICAR JRF", "ICAR SRF", "CUET-UG Agriculture", "CUET-PG Agriculture", "UPCATET", "Rajasthan JET", "MHT-CET Agriculture", "KCET Agriculture",
  "IBPS AFO", "NABARD Grade A", "NABARD Grade B", "RRB Agriculture Officer", "RBI Grade B", "FCI AG-III", "FSSAI Technical Officer", "IFFCO AGT", "KRIBHCO Recruitment",
  "Agriculture Officer (AO)", "Assistant Agriculture Officer (AAO)", "Agriculture Development Officer (ADO)", "Agriculture Extension Officer (AEO)", "Rural Agriculture Extension Officer (RAEO)", "Block Agriculture Officer (BAO)", "Senior Agriculture Development Officer (SADO)",
  "Agriculture Technical Assistant (AGTA)", "UPSSSC AGTA", "UPSSSC Sugarcane Supervisor", "BPSC BAO", "RPSC Agriculture Officer", "RSMSSB Agriculture Supervisor", "MP RAEO", "MP SADO",
  "UPSC Civil Services", "SSC CGL", "State PCS Exams"
];

interface Analytics {
  totalQuestions: number;
  difficultyDistribution: Record<string, number>;
  marksDistribution: Record<string, number>;
  subjects: string[];
  topics: string[];
  missingExplanations: number;
  duplicates: number;
}

export function CsvUploadFlow({ onClose, onSuccess }: { onClose: () => void, onSuccess: (bank: any) => void }) {
  const [step, setStep] = useState<1 | 2>(1); // 1: file picking, 2: preview/metadata
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json' | null>(null);
  
  // Parsed Questions / Validation
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Metadata state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examTargets, setExamTargets] = useState<string[]>([]);
  
  // Marking overrides
  const [overrideMarks, setOverrideMarks] = useState(false);
  const [globalCorrectMarks, setGlobalCorrectMarks] = useState(1);
  const [globalNegativeMarks, setGlobalNegativeMarks] = useState(0.25);
  
  // Settings
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [allowReview, setAllowReview] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  
  // Access Control
  const [accessStyle, setAccessStyle] = useState<AccessControlState>({
    type: 'all',
    plans: ['monthly', 'quarterly', 'annual'],
    freePreviewQuestions: 0,
    emails: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Pagination for preview
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Process selected file
  const processFile = async (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'json') {
      setValidationErrors(["Please upload a valid .csv or .json file."]);
      return;
    }

    setFile(selectedFile);
    setFileType(ext as 'csv' | 'json');

    // Auto-suggest title
    let baseTitle = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
    baseTitle = baseTitle.replace(/[-_]/g, ' ');
    // Title case
    baseTitle = baseTitle.replace(/\b\w/g, c => c.toUpperCase());
    setTitle(baseTitle);

    if (ext === 'csv') {
      try {
        const parsed = await parseCSV(selectedFile);
        const result = validateAndConvertCSV(parsed);
        
        if (result.validRows === 0) {
          setValidationErrors(result.errors.slice(0, 10));
          setQuestions([]);
        } else {
          setValidationErrors(result.errors); // Show warnings/skipped errors
          setQuestions(result.questions);
          setStep(2); // move to step 2 after valid parsing
        }
      } catch (err: any) {
        setValidationErrors([`Parsing failed: ${err.message}`]);
      }
    } else {
      // JSON flow (similar logic)
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) throw new Error("JSON must be an array of questions");
          
          setQuestions(parsed);
          setStep(2);
        } catch (err: any) {
          setValidationErrors([`JSON Error: ${err.message}`]);
        }
      }
      reader.readAsText(selectedFile);
    }
  };

  const currentQuestions = useMemo(() => {
    return questions.map((q) => {
      let finalMarks = q.marks || 1;
      let finalNegative = q.negativeMarks || 0;
      if (overrideMarks) {
        finalMarks = globalCorrectMarks;
        finalNegative = globalNegativeMarks;
      }
      return {
        ...q,
        marks: finalMarks,
        negativeMarks: finalNegative
      };
    });
  }, [questions, overrideMarks, globalCorrectMarks, globalNegativeMarks]);

  const analytics: Analytics = useMemo(() => {
    const subjectsSet = new Set<string>();
    const topicsSet = new Set<string>();
    const diffMap: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    const marksMap: Record<string, number> = {};
    let missingExps = 0;
    
    // Duplicate detection
    const textSet = new Set<string>();
    let duplicates = 0;

    currentQuestions.forEach(q => {
      if (q.subject) subjectsSet.add(q.subject);
      if (q.topic) topicsSet.add(q.topic);
      
      const diff = q.difficulty?.toLowerCase() || 'medium';
      diffMap[diff] = (diffMap[diff] || 0) + 1;

      const marksKey = `${q.marks}`;
      marksMap[marksKey] = (marksMap[marksKey] || 0) + 1;

      if (!q.explanation || q.explanation.length < 5) {
        missingExps++;
      }

      const normalizedText = q.text.toLowerCase().replace(/\s+/g, ' ').trim();
      if (textSet.has(normalizedText)) {
        duplicates++;
      } else {
        textSet.add(normalizedText);
      }
    });

    return {
      totalQuestions: currentQuestions.length,
      difficultyDistribution: diffMap,
      marksDistribution: marksMap,
      subjects: Array.from(subjectsSet),
      topics: Array.from(topicsSet),
      missingExplanations: missingExps,
      duplicates
    };
  }, [currentQuestions]);


  const handleSubmit = async () => {
    setIsLoading(true);
    setUploadError('');
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const blobContent = JSON.stringify({ questions: currentQuestions });
      const jsonBlob = new Blob([blobContent], { type: 'application/json' });
      const uploadFile = new File([jsonBlob], `upload.json`, { type: 'application/json' });

      const finalExam = examTargets.length > 0 ? examTargets.join(', ') : 'All Exams';
      const finalSubject = analytics.subjects.length > 0 ? analytics.subjects[0] : 'General';
      const isPremium = accessStyle.type !== 'all';

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('bankName', title);
      formData.append('description', description);
      formData.append('subject', finalSubject);
      formData.append('examTarget', finalExam);
      formData.append('difficulty', "Mixed");
      formData.append('isPremium', String(isPremium));
      formData.append('sourceFormat', fileType || 'json');
      formData.append('accessControl', JSON.stringify({
        type: accessStyle.type,
        plans: accessStyle.plans,
        freePreviewQuestions: accessStyle.freePreviewQuestions,
        emails: accessStyle.emails
      }));
      formData.append('settings', JSON.stringify({
        shuffleQuestions,
        randomizeOptions,
        allowReview,
        showLeaderboard
      }));
      formData.append('analytics', JSON.stringify(analytics));

      const response = await fetch('/api/admin/banks/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        let errStr = 'Upload failed';
        try { const d = await response.json(); errStr = d.error || errStr; } catch(e){}
        throw new Error(errStr);
      }

      const responseData = await response.json();

      const newBank = {
        id: responseData.bankId,
        name: title,
        description,
        subject: finalSubject,
        examTarget: finalExam,
        difficulty: "Mixed",
        isPremium,
        accessControl: accessStyle,
        status: 'Pending',
        questionsCount: currentQuestions.length,
        storageUrl: responseData.blobUrl,
        storageProvider: 'vercel_blob',
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        featured: false,
        sourceFormat: fileType || 'json',
        questions: currentQuestions.slice(0, 5),
        analytics
      };

      onSuccess(newBank);

    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const paginatedQuestions = currentQuestions.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="fixed inset-0 bg-neutral-950/80 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md">
      <div className="bg-[#0f1118] w-full max-w-[1400px] h-full max-h-[95vh] rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10 relative">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              {step === 1 ? <UploadCloud className="text-emerald-500" /> : <FileJson className="text-amber-500" />}
              {step === 1 ? 'Import Question Bank' : 'Review & Configure Import'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">Professional Content Management System Importer</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-[#0B1120]">
          {step === 1 && (
            <div className="p-8 max-w-4xl mx-auto py-12 flex flex-col items-center">
               <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
                  className="w-full border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors rounded-3xl p-16 flex flex-col items-center justify-center text-center cursor-pointer group"
                  onClick={() => document.getElementById('csv-upload-input')?.click()}
                >
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10">
                    <UploadCloud size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Drag & Drop CSV/JSON File Here</h3>
                  <p className="text-slate-400 max-w-md text-sm leading-relaxed mb-8">
                    Upload a properly formatted spreadsheet containing your questions. We automatically detect subjects, options, marks, and negative marking constraints.
                  </p>
                  
                  <input 
                    type="file" 
                    id="csv-upload-input" 
                    accept=".csv,.json"
                    className="hidden" 
                    onChange={(e) => e.target.files && processFile(e.target.files[0])} 
                  />
                  
                  <button className="px-8 py-3 bg-white text-emerald-950 font-bold rounded-xl shadow-xl hover:bg-emerald-50 transition-colors">
                    Browse Files
                  </button>
                </div>

                <div className="mt-8">
                   <button 
                     onClick={downloadCSVTemplate}
                     className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-2 hover:underline"
                   >
                     <Download size={16} /> Download CSV Template
                   </button>
                </div>

                {validationErrors.length > 0 && (
                  <div className="w-full mt-8 bg-red-950/30 border border-red-500/20 rounded-xl p-6">
                    <h4 className="text-red-400 font-bold flex items-center gap-2 mb-4"><AlertCircle size={18} /> Compilation Errors</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {validationErrors.map((e, idx) => (
                        <li key={idx} className="text-red-200/80 text-sm">{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col lg:flex-row h-full">
               {/* Left Sidebar: Settings */}
               <div className="w-full lg:w-[400px] border-r border-white/5 bg-slate-900/30 overflow-y-auto p-6 flex flex-col gap-8 shrink-0">
                  
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Tag size={14}/> General Setting</h3>
                    <div className="space-y-4">
                       <div>
                         <label className="text-xs text-slate-400 mb-1.5 block">Question Bank Title</label>
                         <input 
                           type="text" 
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 outline-none placeholder-slate-600 font-medium"
                           placeholder="Ex: IBPS AFO Final Prep 1"
                         />
                       </div>
                       <div>
                         <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
                         <textarea 
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                           className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 outline-none placeholder-slate-600 font-medium min-h-[80px] resize-y"
                           placeholder="This mock test contains 200 MCQs covering..."
                         />
                       </div>
                       <div>
                         <label className="text-xs text-slate-400 mb-1.5 block">Exam Targets (Multi-select)</label>
                         <div className="flex flex-wrap gap-2">
                            {examTargets.map(tgt => (
                              <div key={tgt} className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                {tgt} <X size={12} className="cursor-pointer" onClick={() => setExamTargets(prev => prev.filter(t => t !== tgt))}/>
                              </div>
                            ))}
                            <select 
                              className="bg-transparent border border-dashed border-slate-700 text-slate-400 text-xs rounded-md px-2 py-1 outline-none max-w-[120px]"
                              onChange={(e) => {
                                if (e.target.value && !examTargets.includes(e.target.value)) {
                                  setExamTargets(prev => [...prev, e.target.value]);
                                }
                                e.target.value = "";
                              }}
                            >
                              <option value="">+ Add</option>
                              {ALL_EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Marking Rules */}
                  <div>
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Percent size={14}/> Marking Rules</h3>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                       <label className="flex items-center gap-3 cursor-pointer">
                         <input type="checkbox" checked={!overrideMarks} onChange={() => setOverrideMarks(false)} className="accent-emerald-500" />
                         <span className="text-sm text-slate-300">Use marks from CSV automatically</span>
                       </label>
                       
                       <div className="border-t border-slate-800 pt-4">
                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                          <input type="checkbox" checked={overrideMarks} onChange={() => setOverrideMarks(true)} className="accent-emerald-500" />
                          <span className="text-sm text-slate-300">Override marks globally</span>
                        </label>
                        {overrideMarks && (
                          <div className="grid grid-cols-2 gap-3 mt-2">
                             <div>
                               <label className="text-xs text-slate-500 mb-1 block">Correct</label>
                               <input type="number" step="0.5" value={globalCorrectMarks} onChange={e => setGlobalCorrectMarks(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-sm outline-none"/>
                             </div>
                             <div>
                               <label className="text-xs text-slate-500 mb-1 block">Negative</label>
                               <input type="number" step="0.25" value={globalNegativeMarks} onChange={e => setGlobalNegativeMarks(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-sm outline-none"/>
                             </div>
                          </div>
                        )}
                       </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div>
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Settings size={14}/> Delivery Setting</h3>
                    <div className="space-y-3">
                       <label className="flex items-center gap-3 cursor-pointer">
                         <input type="checkbox" checked={shuffleQuestions} onChange={e => setShuffleQuestions(e.target.checked)} className="accent-emerald-500 w-4 h-4 rounded" />
                         <span className="text-sm text-slate-300">Shuffle questions per user</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer">
                         <input type="checkbox" checked={randomizeOptions} onChange={e => setRandomizeOptions(e.target.checked)} className="accent-emerald-500 w-4 h-4 rounded" />
                         <span className="text-sm text-slate-300">Randomize internal options order</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer">
                         <input type="checkbox" checked={showLeaderboard} onChange={e => setShowLeaderboard(e.target.checked)} className="accent-emerald-500 w-4 h-4 rounded" />
                         <span className="text-sm text-slate-300">Show Global Leaderboard</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer">
                         <input type="checkbox" checked={allowReview} onChange={e => setAllowReview(e.target.checked)} className="accent-emerald-500 w-4 h-4 rounded" />
                         <span className="text-sm text-slate-300">Enable answer review/explanations</span>
                       </label>
                    </div>
                  </div>

                  {/* Access Control */}
                  <div>
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Layers size={14}/> Access Firewall</h3>
                    <AccessControlPanel access={accessStyle} onChange={setAccessStyle} />
                  </div>

               </div>

               {/* Right Main Area: Analytics & Preview */}
               <div className="flex-1 p-6 overflow-y-auto">
                 
                 {/* Analytics Banner */}
                 <div className="bg-gradient-to-br from-slate-900 to-[#101930] rounded-2xl border border-slate-800 p-6 mb-8 flex flex-wrap gap-8 items-center shadow-lg">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-widest">Total Checks</p>
                      <p className="text-4xl font-black text-white">{analytics.totalQuestions}</p>
                    </div>
                    
                    <div className="h-12 w-px bg-slate-800 hidden md:block"></div>
                    
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-widest">Difficulty Spread</p>
                      <div className="flex items-center gap-3">
                         <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/20">{analytics.difficultyDistribution.easy || 0} E</span>
                         <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold border border-amber-500/20">{analytics.difficultyDistribution.medium || 0} M</span>
                         <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold border border-red-500/20">{analytics.difficultyDistribution.hard || 0} H</span>
                      </div>
                    </div>

                    <div className="h-12 w-px bg-slate-800 hidden md:block"></div>

                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-widest">Detected Subjects</p>
                      <p className="text-sm text-slate-300 font-mono">{analytics.subjects.length > 2 ? `${analytics.subjects.slice(0, 2).join(', ')} +${analytics.subjects.length - 2}` : analytics.subjects.join(', ') || 'General'}</p>
                    </div>
                    
                    <div className="flex-1"></div>

                    {/* Warning Chips */}
                    <div className="flex flex-col gap-2">
                       {analytics.missingExplanations > 0 && <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full flex items-center gap-2"><AlertCircle size={12}/> {analytics.missingExplanations} Missing Explanations</span>}
                       {analytics.duplicates > 0 && <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full flex items-center gap-2"><AlertCircle size={12}/> {analytics.duplicates} Text Duplicates</span>}
                       {validationErrors.length > 0 && <span className="text-xs bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full flex items-center gap-2"><AlertCircle size={12}/> {validationErrors.length} Syntax Warnings</span>}
                    </div>
                 </div>

                 {/* Questions Table Preview */}
                 <div className="bg-[#0f1423] border border-slate-800 shadow-xl rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                       <h3 className="font-bold text-white flex items-center gap-2">
                         <Search size={18} className="text-emerald-500" />
                         Preview Content
                       </h3>
                       <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>Page {page} of {Math.ceil(currentQuestions.length / rowsPerPage)}</span>
                          <div className="flex gap-1">
                             <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded transition-colors"><ChevronLeft size={16}/></button>
                             <button onClick={() => setPage(p => p < Math.ceil(currentQuestions.length / rowsPerPage) ? p + 1 : p)} disabled={page >= Math.ceil(currentQuestions.length / rowsPerPage)} className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded transition-colors"><ChevronRight size={16}/></button>
                          </div>
                       </div>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-slate-900/80 text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
                                <th className="p-4 font-black w-12 text-center">#</th>
                                <th className="p-4 font-black min-w-[300px]">Question Snippet</th>
                                <th className="p-4 font-black">Subject</th>
                                <th className="p-4 font-black text-center">Ans</th>
                                <th className="p-4 font-black text-center">Marks</th>
                                <th className="p-4 font-black text-center">Diff</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 bg-transparent">
                             {paginatedQuestions.map((q, idx) => (
                               <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                                  <td className="p-4 text-xs text-slate-500 text-center font-mono py-5">
                                    {(page - 1) * rowsPerPage + idx + 1}
                                  </td>
                                  <td className="p-4">
                                     <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">{q.text}</p>
                                     <div className="mt-2 flex gap-4 text-xs font-mono">
                                       <span className="text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"><strong className="text-emerald-500">A.</strong> {q.options[0]?.text}</span>
                                       <span className="text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"><strong className="text-emerald-500">B.</strong> {q.options[1]?.text}</span>
                                     </div>
                                  </td>
                                  <td className="p-4">
                                     <span className="text-xs text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-md whitespace-nowrap border border-slate-700/50">{q.subject || 'N/A'}</span>
                                  </td>
                                  <td className="p-4 text-center">
                                     <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono mx-auto shadow-sm shadow-emerald-500/10 border border-emerald-500/20">
                                       {q.correct}
                                     </span>
                                  </td>
                                  <td className="p-4 text-center">
                                     <div className="flex flex-col items-center">
                                       <span className="text-sm font-bold text-white">+{q.marks}</span>
                                       <span className="text-[10px] text-red-400">-{q.negativeMarks}</span>
                                     </div>
                                  </td>
                                  <td className="p-4 text-center">
                                     <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${
                                        q.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' : 
                                        q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                     }`}>
                                       {q.difficulty?.substring(0, 3)}
                                     </span>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                       {paginatedQuestions.length === 0 && (
                          <div className="p-12 text-center text-slate-500 text-sm">No valid questions to preview.</div>
                       )}
                    </div>
                 </div>

               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step === 2 && (
          <div className="p-4 border-t border-white/5 bg-slate-900/50 flex justify-between items-center px-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setStep(1)} 
                className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 rounded-xl transition-colors"
                disabled={isLoading}
              >
                Cancel & Reloc
              </button>
              {uploadError && <span className="text-red-400 text-xs error-msg max-w-[200px] truncate">{uploadError}</span>}
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isLoading || !title || currentQuestions.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/50 flex items-center gap-2 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Publishing Securely...
                </>
              ) : (
                <>
                   <UploadCloud size={18} />
                   Confirm Import & Publish
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
