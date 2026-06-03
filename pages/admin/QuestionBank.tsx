import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, Plus, Search, Edit, Trash2, Tag, UploadCloud, CheckCircle, 
  AlertCircle, ArrowLeft, Download, Calendar, Star, FileJson, X, ExternalLink
} from 'lucide-react';
import { db } from '../../src/firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { parseCSV, validateAndConvertCSV } from '../../utils/csvParser';
import { downloadCSVTemplate } from '../../utils/csvTemplate';
import { AccessControlPanel, AccessControlState } from '../../src/components/AccessControlPanel';

interface QuestionOption {
  key: string;
  text: string;
}

interface QuestionItem {
  text: string;
  options: QuestionOption[];
  correct: string;
  explanation: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  marks?: number;
  negativeMarks?: number;
  prevYearRef?: string;
}

interface QuestionBankItem {
  id: string;
  name: string;
  subject: string;
  examTarget: string;
  difficulty: string;
  isPremium: boolean;
  accessControl?: {
    type: 'all' | 'plan_based' | 'specific_users';
    plans: string[];
    freePreviewQuestions: number;
    emails?: string[];
  };
  status: 'Pending' | 'Approved' | 'Live' | 'Scheduled' | 'Rejected' | 'Archived';
  questionsCount: number;
  blobUrl: string;
  uploadedAt: string;
  featured: boolean;
  sourceFormat?: 'csv' | 'json';
  questions?: QuestionItem[];
}

const ALL_EXAMS = [
  "ICAR UG", "ICAR AIEEA-PG", "ICAR JRF", "ICAR SRF", "CUET-UG Agriculture", "CUET-PG Agriculture", "UPCATET", "Rajasthan JET", "MHT-CET Agriculture", "KCET Agriculture",
  "AP EAPCET", "TS EAMCET", "AGRICET", "CG PAT", "BHU Agriculture Entrance", "UGC-NET Agriculture", "ASRB NET", "ASRB ARS", "ASRB SMS", "IBPS AFO",
  "NABARD Grade A", "NABARD Grade B", "RRB Agriculture Officer", "RBI Grade B", "FCI AG-III", "FCI Manager Technical", "FSSAI Technical Officer", "IFFCO AGT", "KRIBHCO Recruitment", "NFL Recruitment",
  "RCF Recruitment", "NSC Recruitment", "CCI Recruitment", "NAFED Recruitment", "NDDB Recruitment", "Central Silk Board Recruitment", "Central Warehousing Corporation Recruitment", "NHB Recruitment", "UPSC IFoS", "Forest Range Officer",
  "Agriculture Officer (AO)", "Assistant Agriculture Officer (AAO)", "Agriculture Development Officer (ADO)", "Agriculture Extension Officer (AEO)", "Rural Agriculture Extension Officer (RAEO)", "Block Agriculture Officer (BAO)", "Senior Agriculture Development Officer (SADO)", "Agriculture Inspector", "Seed Inspector", "Soil Conservation Officer",
  "Horticulture Officer", "Plant Protection Officer", "Sugarcane Supervisor (Ganna Paryavekshak)", "Agriculture Technical Assistant (AGTA)", "Agriculture Coordinator", "Assistant Director Agriculture", "ADA Agriculture Exam", "RHEO Exam", "Agriculture Supervisor", "Agriculture Field Assistant",
  "Village Agriculture Assistant", "Agriculture Demonstrator", "Farm Manager Recruitment", "KVK Subject Matter Specialist", "ICAR Scientist Recruitment", "Agricultural Research Associate", "UPPSC Agriculture Services", "UPSSSC AGTA", "UPSSSC Sugarcane Supervisor", "BPSC BAO",
  "RPSC Agriculture Officer", "RSMSSB Agriculture Supervisor", "MP RAEO", "MP SADO", "MP Agriculture Development Officer", "HPSC ADO", "PPSC ADO", "HPPSC ADO", "MPSC Agriculture Service Exam", "KPSC Agriculture Officer",
  "Kerala PSC Agricultural Officer", "TNPSC Agricultural Officer", "TNPSC Assistant Agricultural Officer", "APPSC Agriculture Officer", "Telangana AEO", "OPSC AAO", "WBPSC Agriculture Extension Officer", "CG Vyapam RAEO", "Jharkhand Block Agriculture Officer", "Assam Agriculture Development Officer",
  "J&K Agriculture Extension Officer", "UPSC Civil Services", "SSC CGL", "SSC CHSL", "Railway Recruitment Exams", "LIC AAO", "EPFO Exams", "State PCS Exams", "Cooperative Bank Agriculture Officer", "IDBI AAO"
];

export default function QuestionBank() {
  const [banks, setBanks] = useState<QuestionBankItem[]>([
    {
      id: 'qb_1',
      name: 'Agronomy Weed Management MCQ Prep',
      subject: 'Agronomy',
      examTarget: 'IBPS-AFO',
      difficulty: 'Medium',
      isPremium: true,
      status: 'Live',
      questionsCount: 45,
      blobUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agronomy-weed-prep-894.json',
      uploadedAt: '2026-06-03 07:15',
      featured: true
    },
    {
      id: 'qb_2',
      name: 'ICAR NET Horticulture Science Masterclass',
      subject: 'Horticulture',
      examTarget: 'ICAR NET',
      difficulty: 'Hard',
      isPremium: false,
      status: 'Pending',
      questionsCount: 120,
      blobUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/horticulture-masterclass-122.json',
      uploadedAt: '2026-06-02 14:30',
      featured: false
    }
  ]);
  
  const [selectedTab, setSelectedTab] = useState<'All' | 'Live' | 'Pending' | 'Scheduled' | 'Archived'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedBank, setSelectedBank] = useState<QuestionBankItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('Agronomy');
  const [formExam, setFormExam] = useState('IBPS AFO');
  const [otherExam, setOtherExam] = useState('');
  const [otherSubject, setOtherSubject] = useState('');
  const [formDiff, setFormDiff] = useState('Medium');
  const [formPremium, setFormPremium] = useState(false);
  const [accessStyle, setAccessStyle] = useState<AccessControlState>({
    type: 'all',
    plans: ['monthly', 'quarterly', 'annual'],
    freePreviewQuestions: 0,
    emails: []
  });

  useEffect(() => {
    setFormPremium(accessStyle.type === 'plan_based');
  }, [accessStyle.type]);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json' | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validatedQuestions, setValidatedQuestions] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    document.title = "Question Bank Controls | Agrigence";
    fetchBanksFromFirestore();
  }, []);

  const fetchBanksFromFirestore = async () => {
    try {
      const snap = await getDocs(collection(db, 'question_banks'));
      if (!snap.empty) {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuestionBankItem));
        setBanks(list);
      }
    } catch (e) {
      console.warn("Using default client simulated state for question banks.", e);
    }
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext !== 'json' && ext !== 'csv') {
      setValidationErrors(["Strict JSON or CSV file standard is required! Please upload a valid .json or .csv document."]);
      setFormFile(null);
      setFileType(null);
      setValidatedQuestions([]);
      return;
    }

    setFormFile(file);
    setValidationErrors([]);
    setFileType(ext as 'csv' | 'json');

    if (ext === 'csv') {
      try {
        const parsed = await parseCSV(file);
        const result = validateAndConvertCSV(parsed);
        if (!result.valid) {
          const errorsHelp = result.errors.map(err => {
            let help = err;
            if (err.toLowerCase().includes('missing required columns')) {
              help += ' - Download the CSV template and use the exact column headers';
            } else if (err.toLowerCase().includes('correct must be')) {
              help += ' - The "correct" column must contain only: A, B, C, or D';
            } else if (err.toLowerCase().includes('option is empty')) {
              help += ' - The correct answer option has no text — check that column';
            } else if (err.toLowerCase().includes('text is empty')) {
              help += ' - Some rows have blank question text — delete those rows';
            } else if (err.toLowerCase().includes('explanation is empty')) {
              help += ' - All questions need an explanation — this is shown to students after the test';
            }
            return help;
          });
          setValidationErrors(errorsHelp.slice(0, 10));
          setValidatedQuestions([]);
          setFormFile(null);
        } else {
          setValidationErrors([]);
          setValidatedQuestions(result.questions);
          if (!formName) {
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            setFormName(baseName.replace(/[-_]/g, ' '));
          }
          showToast(`Prereview validation successful! Passed ${result.questions.length} CSV questions.`, 'success');
        }
      } catch (err: any) {
        setValidationErrors([`CSV parsing failed: ${err.message}`]);
        setValidatedQuestions([]);
        setFormFile(null);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsed = JSON.parse(text);

          if (!Array.isArray(parsed)) {
            setValidationErrors(["Payload error: Root JSON structure must be an array of Question objects."]);
            setValidatedQuestions([]);
            return;
          }

          const errors: string[] = [];
          const validated: QuestionItem[] = [];

          parsed.forEach((item, index) => {
            const prefix = `Question ${index + 1}: `;
            if (!item.text) {
              errors.push(`${prefix}Missing required text field.`);
            }
            if (!Array.isArray(item.options) || item.options.length < 2) {
              errors.push(`${prefix}Options array must possess at least 2 distinct entries with key and text.`);
            } else {
              item.options.forEach((opt: any, optIdx: number) => {
                if (!opt.key || !opt.text) {
                  errors.push(`${prefix}Option at position ${optIdx + 1} is missing key or text.`);
                }
              });
            }
            if (!item.correct) {
              errors.push(`${prefix}Missing correct option designator (e.g., "A" or "B").`);
            }
            if (!item.explanation) {
              errors.push(`${prefix}Missing explanatory text.`);
            }

            if (errors.length === 0) {
              validated.push({
                text: item.text,
                options: item.options,
                correct: item.correct,
                explanation: item.explanation,
                subject: item.subject || formSubject,
                topic: item.topic || 'General',
                difficulty: item.difficulty || formDiff.toLowerCase(),
                marks: item.marks || 1,
                negativeMarks: item.negativeMarks || 0.25,
                prevYearRef: item.prevYearRef || ''
              });
            }
          });

          if (errors.length > 0) {
            setValidationErrors(errors.slice(0, 10)); // limit preview
            setValidatedQuestions([]);
            setFormFile(null);
          } else {
            setValidationErrors([]);
            setValidatedQuestions(validated);
            if (!formName) {
              const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              setFormName(baseName.replace(/[-_]/g, ' '));
            }
            showToast(`Prereview validation successful! Passed ${validated.length} JSON queries.`, 'success');
          }
        } catch (err: any) {
          setValidationErrors([`File parse error: Invalid JSON layout sequence: ${err.message}`]);
          setValidatedQuestions([]);
          setFormFile(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formFile || validatedQuestions.length === 0) {
      showToast("Ensure your upload passes validation constraints before submitting", 'error');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Convert validatedQuestions array into a JSON Blob
      const jsonBlob = new Blob(
        [JSON.stringify(validatedQuestions, null, 2)],
        { type: 'application/json' }
      );
      const outputFileName = `${formName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;

      const formData = new FormData();
      formData.append('file', jsonBlob, outputFileName);
      formData.append('bankName', formName);
      formData.append('subject', formSubject === 'Other' ? (otherSubject.trim() || 'Other') : formSubject);
      formData.append('examTarget', formExam === 'Other' ? (otherExam.trim() || 'Other') : formExam);
      formData.append('difficulty', formDiff);
      formData.append('isPremium', formPremium.toString());
      formData.append('accessControl', JSON.stringify({
        type: accessStyle.type,
        plans: accessStyle.plans,
        freePreviewQuestions: accessStyle.freePreviewQuestions,
        emails: accessStyle.emails
      }));
      formData.append('sourceFormat', fileType || 'json');
      formData.append('totalQuestions', validatedQuestions.length.toString());

      // Get Firebase Auth user ID token, if firebase auth is active
      let token = '';
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        if (auth.currentUser) {
          token = await auth.currentUser.getIdToken();
        }
      } catch (authErr) {
        console.warn("Failed retrieving active Firebase ID Token:", authErr);
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/banks/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upload failed (${res.status}): ${errText}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Add to local state
      const finalExam = formExam === 'Other' ? (otherExam.trim() || 'Other') : formExam;
      const finalSubject = formSubject === 'Other' ? (otherSubject.trim() || 'Other') : formSubject;
      const newBank: QuestionBankItem = {
        id: data.bankId,
        name: formName,
        subject: finalSubject,
        examTarget: finalExam,
        difficulty: formDiff,
        isPremium: formPremium,
        accessControl: {
          type: accessStyle.type,
          plans: accessStyle.plans,
          freePreviewQuestions: accessStyle.freePreviewQuestions,
          emails: accessStyle.emails
        },
        status: 'Pending',
        questionsCount: validatedQuestions.length,
        blobUrl: data.blobUrl,
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        featured: false,
        sourceFormat: fileType || 'json',
        questions: validatedQuestions.slice(0, 10)
      };

      setBanks(prev => [newBank, ...prev]);
      showToast(`Uploaded ${validatedQuestions.length} questions successfully!`, 'success');
      
      // Cleanup Form
      setFormName('');
      setFormFile(null);
      setFileType(null);
      setOtherExam('');
      setOtherSubject('');
      setValidatedQuestions([]);
      setShowUploadForm(false);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed uploading bank", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bankId: string, name: string, status: 'Approved' | 'Live' | 'Scheduled' | 'Rejected' | 'Archived') => {
    try {
      await updateDoc(doc(db, 'question_banks', bankId), { status }).catch(() => {});
      setBanks(prev => prev.map(b => b.id === bankId ? { ...b, status } : b));
      if (selectedBank?.id === bankId) {
        setSelectedBank(prev => prev ? { ...prev, status } : null);
      }
      showToast(`Marked "${name}" content status as ${status}!`);
    } catch (e) {
      showToast("Access update restriction or connection offline", 'error');
    }
  };

  const handleFeaturedToggle = async (bankId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'question_banks', bankId), { featured: !current }).catch(() => {});
      setBanks(prev => prev.map(b => b.id === bankId ? { ...b, featured: !current } : b));
      if (selectedBank?.id === bankId) {
        setSelectedBank(prev => prev ? { ...prev, featured: !current } : null);
      }
      showToast(current ? "Unfeatured Item" : "Featured Item successfully");
    } catch (e) {
      showToast("Error updating featured state", 'error');
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    if (deleteConfirmText.toLowerCase() !== selectedBank?.name.toLowerCase()) {
      showToast("Double verification required: Type the exact check bank name", 'error');
      return;
    }

    try {
      await deleteDoc(doc(db, 'question_banks', bankId)).catch(() => {});
      setBanks(prev => prev.filter(b => b.id !== bankId));
      setSelectedBank(null);
      setIsDeleting(null);
      setDeleteConfirmText('');
      showToast("Purged database trace record of question bank package");
    } catch (e) {
      showToast("Failed removing document metadata", 'error');
    }
  };

  const filteredBanks = banks.filter(bank => {
    const tabMatch = selectedTab === 'All' || bank.status === selectedTab;
    const searchMatch = bank.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        bank.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return tabMatch && searchMatch;
  });

  return (
    <div className="space-y-6 font-sans text-[#0f4225]">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[250] max-w-sm p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-[#e8f5ee] border-2 border-[#2d8a52] text-[#0f4225]' : 'bg-red-50 border-2 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} className="text-[#2d8a52]" /> : <AlertCircle size={18} className="text-red-500" />}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Main Back Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif">Academic Banks Management</h1>
          <p className="text-xs text-stone-500 mt-1">
            Build premium diagnostic packages, approve pending content, and schedule release calendar nodes.
          </p>
        </div>
        <div>
          {!showUploadForm && (
            <button 
              onClick={() => setShowUploadForm(true)}
              className="bg-[#0f4225] hover:bg-[#1a6b3a] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <UploadCloud size={16} />
              <span>Upload Question Bank</span>
            </button>
          )}
        </div>
      </div>

      {showUploadForm ? (
        /* Upload Form Screen */
        <div className="bg-white border-2 border-[#2d8a52]/10 rounded-3xl p-8 max-w-3xl mx-auto shadow-md">
          <button 
            onClick={() => setShowUploadForm(false)} 
            className="flex items-center gap-2 text-[#0f4225] hover:opacity-80 text-xs font-bold mb-6"
          >
            <ArrowLeft size={16} /> Back to questions list
          </button>
          
          <h2 className="text-xl font-serif font-bold text-black border-b pb-4 mb-6">Ingest New Question Bank</h2>

          <form onSubmit={handleUploadSubmit} className="space-y-6 text-xs font-medium text-stone-600">
            <div>
               <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">Package / Bank Name</label>
               <input 
                 type="text" 
                 value={formName}
                 onChange={e => setFormName(e.target.value)}
                 placeholder="e.g. Weed Taxonomy General Mock Exam Pack3"
                 required
                 className="w-full bg-stone-50 text-black border border-stone-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-[#2d8a52]"
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                 <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">Primary Subject Discipline</label>
                 <select 
                   value={formSubject} 
                   onChange={e => setFormSubject(e.target.value)}
                   className="w-full bg-stone-50 text-black border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:border-[#2d8a52] mb-2"
                 >
                   <option>Agronomy</option>
                   <option>Horticulture</option>
                   <option>Soil Science</option>
                   <option>Genetics</option>
                   <option>Plant Pathology</option>
                   <option>Entomology</option>
                   <option>Extension</option>
                   <option value="Other">Other (Specify manually)</option>
                 </select>
                 {formSubject === 'Other' && (
                   <input
                     type="text"
                     placeholder="Enter custom subject"
                     value={otherSubject}
                     onChange={e => setOtherSubject(e.target.value)}
                     className="w-full bg-stone-50 text-black border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:border-[#2d8a52]"
                     required
                   />
                 )}
              </div>

              <div>
                 <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">Exam Target Category</label>
                 <select 
                   value={formExam} 
                   onChange={e => setFormExam(e.target.value)}
                   className="w-full bg-stone-50 text-black border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:border-[#2d8a52] mb-2"
                 >
                   {ALL_EXAMS.map(exam => (
                     <option key={exam} value={exam}>{exam}</option>
                   ))}
                   <option value="Other">Other (Specify manually)</option>
                 </select>
                 {formExam === 'Other' && (
                   <input
                     type="text"
                     placeholder="Enter custom exam name"
                     value={otherExam}
                     onChange={e => setOtherExam(e.target.value)}
                     className="w-full bg-stone-50 text-black border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:border-[#2d8a52]"
                     required
                   />
                 )}
              </div>

              <div>
                 <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">Difficulty Curve</label>
                 <select 
                   value={formDiff} 
                   onChange={e => setFormDiff(e.target.value)}
                   className="w-full bg-stone-50 text-black border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:border-[#2d8a52]"
                 >
                   <option>Easy</option>
                   <option>Medium</option>
                   <option>Hard</option>
                 </select>
              </div>
            </div>

            <div className="pt-2">
              <AccessControlPanel 
                access={accessStyle} 
                onChange={(updated) => setAccessStyle(updated)} 
              />
            </div>

            {/* Template Download and Instructions */}
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200/50 rounded-2xl">
              <div>
                <p className="font-bold text-amber-900 text-xs">CSV Import Option Enabled</p>
                <p className="text-[10px] text-amber-700">Import structured questions easily with Microsoft Excel or Google Sheets using CSV.</p>
              </div>
              <button
                type="button"
                onClick={downloadCSVTemplate}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-xl transition-all shadow-md flex items-center gap-1.5 uppercase tracking-wider shrink-0"
              >
                <Download size={13} />
                <span>↓ Download CSV Template</span>
              </button>
            </div>

            {/* Drag & Drop Uplader Board */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-stone-300 hover:border-[#2d8a52] bg-stone-50 hover:bg-[#e8f5ee]/10 p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all"
            >
              <FileJson size={32} className="text-stone-400 mb-3" />
              <p className="text-xs font-bold text-black">Drag and drop original MCQ CSV or JSON documents here</p>
              <p className="text-[10px] text-stone-400 mt-1">Both `.json` array list or `.csv` tabular structured formats are fully supported.</p>
              
              <input 
                type="file" 
                id="file_uploader" 
                accept=".json,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button 
                type="button"
                onClick={() => document.getElementById('file_uploader')?.click()}
                className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[10px] rounded-lg transition-colors"
              >
                Browse directory files
              </button>
            </div>

            {formFile && (
               <div className="p-3.5 bg-[#e8f5ee] border border-[#2d8a52]/20 text-[#0f4225] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <FileJson size={18} />
                     <div>
                        <p className="font-bold">{formFile.name}</p>
                        <p className="text-[10px] opacity-75">
                           Type: <span className="font-bold uppercase text-[#0f4225]">{fileType}</span> • Size: {(formFile.size / 1024).toFixed(1)} KB • Completed schema validation check
                        </p>
                     </div>
                  </div>
                  <button type="button" onClick={() => { setFormFile(null); setValidatedQuestions([]); setFileType(null); }} className="p-1 hover:bg-[#d8edd6] rounded">
                     <X size={16} />
                  </button>
               </div>
            )}

            {/* Validation Feedback Inline and Preview */}
            {validationErrors.length > 0 && (
               <div className="p-4 bg-red-50 border-2 border-red-100 text-red-950 rounded-xl space-y-2">
                  <h4 className="font-bold flex items-center gap-2"><AlertCircle size={16} className="text-red-500" /> Validation failed constraints</h4>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] font-mono">
                     {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
               </div>
            )}

            {validatedQuestions.length > 0 && (
               <div className="border border-[#2d8a52]/20 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-[#e8f5ee] px-4 py-3 border-b border-[#2d8a52]/10 flex items-center justify-between">
                     <span className="font-bold text-[#0f4225] flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-[#2d8a52]" /> First 3 questions preview
                     </span>
                     <span className="bg-[#0f4225] text-white px-2 py-0.5 rounded font-black text-[9px]">
                        Total: {validatedQuestions.length} Items Validated
                     </span>
                  </div>
                  <div className="p-4 bg-stone-50 space-y-4 max-h-60 overflow-y-auto">
                     {validatedQuestions.slice(0, 3).map((q, idx) => (
                       <div key={idx} className="p-3 bg-white border border-stone-200 rounded-xl">
                          <p className="font-bold text-black border-b pb-1.5 mb-2">Q{idx + 1}. {q.text}</p>
                          <div className="grid grid-cols-2 gap-2 mb-2 font-mono text-[10px]">
                             {q.options.map(opt => (
                               <div key={opt.key} className={`p-1.5 rounded border text-stone-600 ${opt.key === q.correct ? 'bg-green-50 border-green-300 font-bold text-green-800' : 'bg-white border-stone-100'}`}>
                                  {opt.key}. {opt.text}
                               </div>
                             ))}
                          </div>
                          <p className="text-[10px] text-stone-400 font-medium"><b className="text-stone-700">Expl.</b> {q.explanation}</p>
                       </div>
                     ))}
                  </div>
               </div>
            )}

            <div className="flex gap-4 justify-end pt-4 border-t">
               <button 
                 type="button" 
                 onClick={() => { setShowUploadForm(false); setFormFile(null); setValidatedQuestions([]); }}
                 className="px-5 py-3 border border-stone-200 text-stone-500 font-bold hover:bg-stone-50 rounded-xl transition-all"
               >
                 Cancel upload
               </button>
               <button 
                 type="submit"
                 disabled={validatedQuestions.length === 0 || isLoading}
                 className="px-7 py-3 bg-[#0f4225] hover:bg-[#1a6b3a] disabled:bg-[#0f4225]/50 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-all"
               >
                 {isLoading ? 'Ingesting data package...' : 'Upload & Commit to Stage'}
               </button>
            </div>
          </form>
        </div>
      ) : (
        /* Question banks lists catalog page */
        <div className="bg-white border border-[#0f4225]/10 rounded-2xl overflow-hidden shadow-sm">
          {/* Filtering bar tab list */}
          <div className="bg-stone-50/80 px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
             <div className="flex gap-2 text-stone-500 font-bold">
               {(['All', 'Live', 'Pending', 'Scheduled', 'Archived'] as const).map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setSelectedTab(tab)}
                   className={`px-4 py-2 rounded-xl text-xs transition-colors ${
                     selectedTab === tab ? 'bg-[#0f4225] text-white shadow-md font-black' : 'hover:bg-stone-100'
                   }`}
                 >
                   {tab}
                 </button>
               ))}
             </div>

             <div className="relative max-w-xs w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by package title & subject..."
                  className="w-full bg-white text-black border border-stone-200 pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#2d8a52]"
                />
             </div>
          </div>

          <div className="overflow-x-auto text-xs text-stone-500 font-medium select-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100/50 text-[#0f4225] font-black uppercase tracking-wider border-b">
                  <th className="px-6 py-4">Title Name</th>
                  <th className="px-6 py-4">Subject Core</th>
                  <th className="px-6 py-4 text-center">Questions</th>
                  <th className="px-6 py-4 text-center">Source</th>
                  <th className="px-6 py-4 text-center">Difficulty</th>
                  <th className="px-6 py-4 text-center">Tier Status</th>
                  <th className="px-6 py-4 text-center">Featured</th>
                  <th className="px-6 py-4">Uploaded</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-black font-semibold">
                {filteredBanks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-stone-400 bg-white">
                      <FolderOpen size={36} className="mx-auto text-stone-300 mb-2" />
                      <p className="text-xs">No matching question banks found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBanks.map(bank => (
                    <tr key={bank.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="font-bold text-black hover:text-[#2d8a52] cursor-pointer" onClick={() => setSelectedBank(bank)}>
                              {bank.name}
                            </span>
                            <span className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1.5 font-mono">
                               <span>ID: {bank.id}</span>
                               <span>•</span>
                               <span>Target: {bank.examTarget}</span>
                            </span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="bg-[#e8f5ee] text-[#0f4225] px-2.5 py-1 rounded font-black uppercase tracking-wider text-[9px]">
                            {bank.subject}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-[#0f4225]">
                         {bank.questionsCount}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`px-2 py-0.5 border rounded text-[10px] font-black uppercase tracking-wider ${
                           bank.sourceFormat === 'csv' ? 'bg-amber-50 text-amber-700 border-amber-300/40' : 'bg-blue-50 text-blue-700 border-blue-300/40'
                         }`}>
                           {bank.sourceFormat || 'json'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                           bank.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                           bank.difficulty === 'Hard' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                         }`}>
                           {bank.difficulty}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                           bank.status === 'Live' ? 'bg-[#e8f5ee] text-[#0f4225]' :
                           bank.status === 'Pending' ? 'bg-[#fdf3df] text-[#b87c0a]' : 'bg-stone-100 text-stone-500'
                         }`}>
                           {bank.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <button onClick={() => handleFeaturedToggle(bank.id, bank.featured)} className="focus:outline-none">
                            <Star size={16} className={bank.featured ? 'text-[#b87c0a] fill-[#b87c0a]' : 'text-stone-300'} />
                         </button>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono text-stone-500 shrink-0">
                         {bank.uploadedAt}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                           <button onClick={() => setSelectedBank(bank)} className="px-2.5 py-1.5 bg-stone-100 hover:bg-[#e8f5ee] hover:text-[#0f4225] rounded-lg transition-colors font-bold text-[10px]" title="Detail View">
                              Verify Details
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail inspect Drawer / Modal panel */}
      {selectedBank && (
         <div className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm flex items-center justify-end animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white h-screen shadow-2xl flex flex-col justify-between py-6 px-8 relative animate-in slide-in-from-right duration-300">
              <button 
                onClick={() => { setSelectedBank(null); setIsDeleting(null); }}
                className="absolute top-6 right-6 p-1.5 hover:bg-stone-100 rounded text-stone-400 hover:text-black transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex-1 overflow-y-auto space-y-6 progress-scrollbar pr-2 mt-4 select-none">
                 <div>
                    <span className="bg-[#e8f5ee] text-[#0f4225] font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full">
                       {selectedBank.subject} • {selectedBank.examTarget}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-black mt-2 leading-snug">{selectedBank.name}</h3>
                    <p className="text-[10px] text-stone-400 font-mono mt-1">Package UUID: {selectedBank.id}</p>
                 </div>

                 {/* Indicators Grid */}
                 <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 bg-[#f8faf9] border border-[#0f4225]/10 rounded-xl">
                       <p className="text-stone-400 text-[9px] uppercase font-black tracking-wider">Total Items</p>
                       <p className="font-black text-sm text-[#0f4225] mt-0.5">{selectedBank.questionsCount}</p>
                    </div>
                    <div className="p-3 bg-[#f8faf9] border border-[#0f4225]/10 rounded-xl">
                       <p className="text-stone-400 text-[9px] uppercase font-black tracking-wider">Difficulty</p>
                       <p className="font-black text-sm text-[#b87c0a] mt-0.5">{selectedBank.difficulty}</p>
                    </div>
                    <div className="p-3 bg-[#f8faf9] border border-[#0f4225]/10 rounded-xl">
                       <p className="text-stone-400 text-[9px] uppercase font-black tracking-wider">Access Policy</p>
                       <p className="font-black text-sm text-[#0f4225] mt-0.5 capitalize">
                         {selectedBank.accessControl?.type === 'plan_based' 
                           ? 'Pro Tier' 
                           : selectedBank.accessControl?.type === 'specific_users' 
                           ? 'Whitelisted' 
                           : selectedBank.isPremium 
                           ? 'Pro Only' 
                           : 'Free'}
                       </p>
                    </div>
                 </div>

                 {/* Vercel Storage Link */}
                 <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <h4 className="font-bold text-xs text-black flex items-center gap-2">
                       <Download size={14} className="text-[#2d8a52]" /> Package Vercel Storage Endpoint
                    </h4>
                    <p className="text-[10px] text-stone-400 mt-1 truncate font-mono bg-white p-2.5 rounded border">
                       {selectedBank.blobUrl}
                    </p>
                    <div className="flex gap-2 mt-3">
                       <a 
                         href={selectedBank.blobUrl} 
                         download 
                         target="_blank"
                         rel="noopener noreferrer"
                         className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-600 border rounded-lg font-bold text-[10px] inline-flex items-center gap-1.5 transition-colors"
                       >
                         <ExternalLink size={12} /> External Download
                       </a>
                    </div>
                 </div>

                 {/* Content preview inline */}
                 <div>
                    <h4 className="font-black text-[10px] uppercase tracking-wider text-stone-400 mb-2">Ingestion Questions Preview (10 items limit)</h4>
                    <div className="space-y-3">
                       {(selectedBank.questions || [
                         { text: "Simulated taxonomical review soil query?", options: [{ key: 'A', text: "Sample option A" }, { key: 'B', text: "Sample Correct Option" }], correct: 'B', explanation: "Standard validation pass explanation metadata." }
                       ]).map((q, qIndex) => (
                         <div key={qIndex} className="p-3 border rounded-xl bg-stone-50/50">
                            <p className="font-bold text-black">Q{qIndex + 1}. {q.text}</p>
                            <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px] font-mono">
                               {q.options.map((opt, oIdx) => (
                                 <span key={oIdx} className={`p-1 border rounded ${opt.key === q.correct ? 'bg-green-50 text-green-800 border-green-200 font-semibold' : 'bg-white'}`}>
                                    {opt.key}. {opt.text}
                                 </span>
                               ))}
                            </div>
                            <p className="text-[10px] text-stone-400 font-medium mt-1.5"><b className="text-stone-700">Expl:</b> {q.explanation}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Action Node controls panel */}
                 <div className="pt-4 border-t border-stone-100">
                    <h4 className="font-black text-[10px] uppercase text-stone-400 tracking-wider mb-3">Moderation Command Console</h4>
                    <div className="flex flex-wrap gap-2">
                       {selectedBank.status !== 'Approved' && selectedBank.status !== 'Live' && (
                         <button 
                           onClick={() => handleStatusChange(selectedBank.id, selectedBank.name, 'Approved')}
                           className="bg-[#2d8a52] hover:bg-[#1a6b3a] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                         >
                           Approve
                         </button>
                       )}
                       {selectedBank.status !== 'Live' && (
                         <button 
                           onClick={() => handleStatusChange(selectedBank.id, selectedBank.name, 'Live')}
                           className="bg-[#0f4225] hover:bg-[#1a6b3a] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                         >
                           Publish Live Now
                         </button>
                       )}
                       {selectedBank.status !== 'Archived' && (
                         <button 
                           onClick={() => handleStatusChange(selectedBank.id, selectedBank.name, 'Archived')}
                           className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                         >
                           Archive Pack
                         </button>
                       )}
                       <button 
                         onClick={() => handleFeaturedToggle(selectedBank.id, selectedBank.featured)}
                         className="border hover:bg-stone-50 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                       >
                         {selectedBank.featured ? 'Unfeature Content' : 'Feature on Home Home'}
                       </button>
                    </div>
                 </div>

                 {/* Danger deletion check box */}
                 <div className="p-4 bg-red-50 border-2 border-red-100 rounded-xl space-y-3">
                    <h4 className="font-black text-xs text-red-950 flex items-center gap-1.5">
                       <Trash2 size={15} /> Purge record sequence
                    </h4>
                    
                    {isDeleting ? (
                       <div className="space-y-2">
                          <p className="text-[10px] text-red-700 font-bold">Type the exact package name <b className="font-mono text-black">"{selectedBank.name}"</b> below to authorise deletion:</p>
                          <input 
                            type="text" 
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            placeholder="Type exactly..."
                            className="w-full bg-white text-black border border-red-200 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-red-500"
                          />
                          <div className="flex gap-2">
                             <button onClick={() => handleDeleteBank(selectedBank.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold">
                                Confirm Authorised Purge
                             </button>
                             <button onClick={() => { setIsDeleting(null); setDeleteConfirmText(''); }} className="bg-white border text-stone-500 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                                Lock File
                             </button>
                          </div>
                       </div>
                    ) : (
                       <button onClick={() => setIsDeleting(selectedBank.id)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors text-[10px]">
                          Delete Record File Target
                       </button>
                    )}
                 </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                 <button 
                   onClick={() => { setSelectedBank(null); setIsDeleting(null); }}
                   className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
                 >
                   Dismiss Preview Panel
                 </button>
              </div>
           </div>
         </div>
      )}

    </div>
  );
}
