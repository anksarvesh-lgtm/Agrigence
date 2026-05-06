import React, { useState, useRef } from 'react';
import { 
  Beaker, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ArrowRight, 
  Download, 
  History,
  Trash2,
  ChevronDown,
  Loader2,
  Camera,
  Layers,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../src/authContext';
import { db } from '../../src/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { auth } from '../../src/firebase';
import { GoogleGenAI } from "@google/genai";

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface SoilData {
  ph: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  organicMatter: string;
  ec: string;
}

const SoilAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [soilData, setSoilData] = useState<SoilData>({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    organicMatter: '',
    ec: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSoilData({ ...soilData, [e.target.name]: e.target.value });
  };

  const loadSampleData = () => {
    setSoilData({
      ph: '6.5',
      nitrogen: '45',
      phosphorus: '22',
      potassium: '150',
      organicMatter: '1.2',
      ec: '0.8'
    });
  };

  const [isListening, setIsListening] = useState<string | null>(null);

  const startVoiceInput = (fieldName: keyof SoilData) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = user?.language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(fieldName);
    recognition.onend = () => setIsListening(null);
    recognition.onerror = () => setIsListening(null);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const cleanValue = transcript.replace(/[^0-9.]/g, '');
      if (cleanValue) {
        setSoilData(prev => ({ ...prev, [fieldName]: cleanValue }));
      }
    };

    recognition.start();
  };

  const analyzeSoil = async () => {
    if (!user) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const prompt = `You are a professional agricultural scientist. Analyze the soil data provided below for an Indian farm. 
      Provide a highly detailed report including:
      1. STATUS: Assessment of each nutrient level (Low/Optimal/High).
      2. FERTILIZATION PLAN: Specific dosage (e.g. quantity per acre) of Urea, DAP, MOP, or organic alternatives based on the levels.
      3. INPUT RECOMMENDATIONS: Precise commercial product categories (e.g. Zinc Sulphate, Boron) if deficient.
      4. APPLICATION TIMING: When to apply (basal dose vs top dressing).
      5. CROPS: 3 most suitable crops for this soil.
      
      Manual Data: ${JSON.stringify(soilData)}
      
      Respond in clear Markdown with bullet points and bold headings. Language: ${user?.language === 'hi' ? 'Hindi' : 'English (with common Indian farming terms like ' + String.fromCharCode(39) + 'Bhur-bhuri' + String.fromCharCode(39) + ' or ' + String.fromCharCode(39) + 'Desi Khaad' + String.fromCharCode(39) + ')'}.`;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      
      let result;
      if (preview) {
        result = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{ 
            role: 'user', 
            parts: [
              { text: prompt },
              { 
                inlineData: { 
                    data: preview.split(',')[1], 
                    mimeType: 'image/jpeg' 
                } 
              }
            ] 
          }]
        });
      } else {
        result = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{ parts: [{ text: prompt }] }]
        });
      }

      const analysisText = result.text || '';
      setAnalysis(analysisText);

      // Save to Firestore
      try {
        await addDoc(collection(db, 'soil_reports'), {
          userId: user.id,
          timestamp: new Date().toISOString(),
          soilData,
          analysis: analysisText,
          status: 'COMPLETED'
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'soil_reports');
      }

      fetchHistory();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'soil_reports'),
        where('userId', '==', user.id),
        orderBy('timestamp', 'desc')
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'soil_reports');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-24 pt-12 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#92745B]/10 p-3 rounded-2xl">
              <Beaker className="text-[#92745B]" size={28} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Bharat Krishi Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-4">
            Soil Health <span className="text-emerald-600">A.I. Analyzer</span>
          </h1>
          <p className="text-stone-500 font-medium max-w-2xl leading-relaxed">
            Upload your soil test report or enter values manually. Our AI Hub AI Models will analyze your soil health and provide precise fertilization, irrigation, and crop suitability recommendations.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-stone-200/50 border border-stone-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-stone-900">Upload Report</h2>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#92745B] bg-[#92745B]/5 px-3 py-1 rounded-full">
                  <Camera size={12} /> Live Scan Enabled
                </div>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer group ${preview ? 'border-emerald-500 bg-emerald-50/10' : 'border-stone-200 hover:border-[#92745B] hover:bg-stone-50'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                
                {preview ? (
                  <div className="relative inline-block">
                    <img src={preview} alt="Soil Report Preview" className="max-h-60 rounded-2xl shadow-lg border-4 border-white" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
                      className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-full shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center text-stone-400 group-hover:scale-110 group-hover:bg-[#92745B]/10 group-hover:text-[#92745B] transition-all">
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-stone-900">Drop soil report here</p>
                      <p className="text-sm text-stone-500 font-medium">PNG, JPG or PDF (Max 10MB)</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-10 border-t border-stone-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                      <FileText size={16} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-stone-900">Manual Input (Optional)</h3>
                  </div>
                  <button 
                    onClick={loadSampleData}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 transition-all"
                  >
                    Load Sample Data
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { name: 'ph', label: 'pH Level', placeholder: 'e.g. 6.5' },
                    { name: 'nitrogen', label: 'Nitrogen (N)', placeholder: 'kg/ha' },
                    { name: 'phosphorus', label: 'Phosphorus (P)', placeholder: 'kg/ha' },
                    { name: 'potassium', label: 'Potassium (K)', placeholder: 'kg/ha' },
                    { name: 'organicMatter', label: 'Organic Matter', placeholder: '%' },
                    { name: 'ec', label: 'Elec. Cond. (EC)', placeholder: 'dS/m' }
                  ].map((field) => (
                    <div key={field.name} className="space-y-1 relative group/field">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1 flex items-center justify-between">
                        {field.label}
                        <button 
                          onClick={() => startVoiceInput(field.name as keyof SoilData)}
                          className={`hover:text-[#92745B] transition-colors ${isListening === field.name ? 'text-red-500 animate-pulse' : ''}`}
                        >
                          <Mic size={10} />
                        </button>
                      </label>
                      <input 
                        type="number"
                        name={field.name}
                        value={(soilData as any)[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl py-3 px-4 text-xs font-bold focus:border-[#92745B] outline-none transition-all pr-8"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={analyzeSoil}
                disabled={loading || (!preview && !soilData.ph)}
                className="w-full mt-10 bg-[#92745B] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-[#92745B]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={20} /> AI Analyzing...</>
                ) : (
                  <><Zap className="fill-white" size={20} /> Generate AI Recommendations <ArrowRight size={20} /></>
                )}
              </button>
            </div>

            {/* Analysis Result */}
            <AnimatePresence>
              {analysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-stone-100"
                >
                  <div className="bg-[#2d5a27] p-8 text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-2xl">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Analysis Complete</h3>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Optimized for Current Season</p>
                      </div>
                    </div>
                    <button className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all">
                      <Download size={20} />
                    </button>
                  </div>
                  
                  <div className="p-8 md:p-12 prose prose-stone max-w-none">
                    <div className="markdown-body">
                      <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-stone-50 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-stone-500 font-medium text-sm">
                      <AlertCircle size={16} className="text-amber-500" />
                      Note: Always consult a local agronomist before heavy application.
                    </div>
                    <button className="text-emerald-700 font-black text-xs uppercase tracking-widest hover:underline">Share Analysis</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white">
              <h3 className="text-xl font-black mb-6">How it works</h3>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Submit Data', desc: 'Securely upload your soil test certificate or data.' },
                  { step: '02', title: 'AI Processing', desc: 'AI Hub AI Models scan values for N, P, K, pH and organic carbon.' },
                  { step: '03', title: 'Insights', desc: 'Get tailored fertilization & crop suitability data.' }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-emerald-400 font-black text-lg leading-none">{item.step}</span>
                    <div>
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <History size={18} className="text-[#92745B]" /> Recent Reports
                </h3>
                <button 
                  onClick={() => { setShowHistory(!showHistory); fetchHistory(); }}
                  className="text-[10px] font-black uppercase tracking-widest text-[#92745B] hover:underline"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {history.slice(0, 3).map((report: any) => (
                  <div key={report.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-[#92745B] uppercase tracking-widest">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <p className="text-sm font-bold text-stone-700">Soil Analysis #{report.id.slice(-4)}</p>
                    <p className="text-[10px] text-stone-400 font-medium">Status: COMPLETED</p>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-stone-400 font-medium">No previous reports found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilAnalyzer;
