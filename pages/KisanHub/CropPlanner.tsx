import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  MapPin, 
  Droplets, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Download, 
  Volume2, 
  ChevronRight,
  Maximize2,
  Trash2,
  Save,
  RefreshCw,
  Search,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../src/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../App';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { auth } from '../../src/firebase';

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

// --- Types ---
interface CropData {
  id: string;
  name: string;
  season: string[];
  soil: string[];
  water: 'Low' | 'Medium' | 'High';
  profit_level: 'Low' | 'Medium' | 'High';
  duration_days: number;
}

interface CropPlan {
  id?: string;
  timestamp: string;
  input: any;
  recommendations: string;
  crops: string[];
}

// --- Sample Crop Database ---
const CROP_DATABASE: Omit<CropData, 'id'>[] = [
  { name: 'Tomato', season: ['Rabi', 'Zaid'], soil: ['Loamy', 'Sandy'], water: 'Medium', profit_level: 'High', duration_days: 90 },
  { name: 'Wheat', season: ['Rabi'], soil: ['Loamy', 'Clay'], water: 'Medium', profit_level: 'Medium', duration_days: 120 },
  { name: 'Rice (Paddy)', season: ['Kharif'], soil: ['Clay', 'Loamy'], water: 'High', profit_level: 'Medium', duration_days: 150 },
  { name: 'Cotton', season: ['Kharif'], soil: ['Black', 'Loamy'], water: 'Medium', profit_level: 'High', duration_days: 180 },
  { name: 'Mustard', season: ['Rabi'], soil: ['Sandy', 'Loamy'], water: 'Low', profit_level: 'Medium', duration_days: 110 },
  { name: 'Moong Dal', season: ['Zaid', 'Kharif'], soil: ['Loamy'], water: 'Low', profit_level: 'Medium', duration_days: 70 },
  { name: 'Sugarcane', season: ['Kharif'], soil: ['Clay', 'Loamy'], water: 'High', profit_level: 'High', duration_days: 360 },
  { name: 'Onion', season: ['Rabi', 'Kharif'], soil: ['Loamy', 'Sandy'], water: 'Medium', profit_level: 'High', duration_days: 120 },
  { name: 'Potato', season: ['Rabi'], soil: ['Loamy', 'Sandy'], water: 'Medium', profit_level: 'High', duration_days: 100 },
  { name: 'Maize', season: ['Kharif', 'Rabi'], soil: ['Loamy'], water: 'Medium', profit_level: 'Medium', duration_days: 110 }
];

const CropPlanner: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    location: '',
    landSize: '',
    landUnit: 'acre',
    soilType: 'Loamy',
    waterAvailability: 'Medium',
    irrigationType: 'Drip',
    season: 'Kharif',
    budget: 'Medium',
    experience: 'Intermediate',
    previousCrop: '',
    marketPreference: 'Mandi',
    riskLevel: 'Medium'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [suggestedCrops, setSuggestedCrops] = useState<string[]>([]);
  const [savedPlans, setSavedPlans] = useState<CropPlan[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchSavedPlans();
    }
  }, [user]);

  const fetchSavedPlans = async () => {
    if (!user || !user.id) return;
    const path = 'crop_plans';
    try {
      // Calculate 210 days ago
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - 210);
      const isoRetentionDate = retentionDate.toISOString();

      // Query with 210 days retention logic
      const q = query(
        collection(db, path), 
        where('userId', '==', user.id),
        where('timestamp', '>=', isoRetentionDate),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      const plans = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CropPlan));
      setSavedPlans(plans);
    } catch (e: any) {
      if (e.message?.includes('requires an index')) {
        console.warn("Firestore Index Required: Please check the browser console for the link to create the composite index for 'userId' and 'timestamp'.");
      }
      handleFirestoreError(e, OperationType.GET, path);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Rule Engine ---
  const getFilteredCrops = () => {
    return CROP_DATABASE.filter(crop => {
      const seasonMatch = crop.season.includes(formData.season);
      const soilMatch = crop.soil.includes(formData.soilType);
      const waterMatch = formData.waterAvailability === crop.water || crop.water === 'Low';
      return seasonMatch && soilMatch && waterMatch;
    }).map(c => c.name);
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    setResult(null);
    
    // 1. Filter crops from DB
    const filteredCrops = getFilteredCrops();
    setSuggestedCrops(filteredCrops);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `
        You are an expert agricultural advisor for Indian farmers. 
        Current Context: Year 2026, Climate-smart focused.

        User Farm Profile:
        - Location: ${formData.location}
        - Land: ${formData.landSize} ${formData.landUnit}
        - Soil: ${formData.soilType}
        - Water: ${formData.waterAvailability}
        - Season: ${formData.season}
        - Budget: ${formData.budget}
        - Experience: ${formData.experience}
        - Previously Grown: ${formData.previousCrop || 'Not mentioned'}
        - Market preference: ${formData.marketPreference}

        Pre-filtered suitable crops (from our database):
        ${filteredCrops.length > 0 ? filteredCrops.join(', ') : 'Suggest based on Indian climate for this season'}

        Please provide a detailed, farmer-friendly response in Markdown format covering:
        1. **Top 3 Recommended Crops** with detailed reasoning (SEO & Market trend focus).
        2. **Detailed Crop Timeline** (Land preparation, Seed selection, Sowing, Irrigation, Fertilization, Pest Management, Harvesting).
        3. **Cost vs Profit Estimation (INR)** (Itemized costs for inputs and labor vs expected returns).
        4. **Risk Shield**: Common pests/diseases and organic/chemical solutions.
        5. **Smart Selling Tips**: Mandi vs Export vs Digital platforms.

        Use professional, encouraging, and highly technical yet simple language suitable for a modern Indian farmer.
      `;
      
      const response = await (ai as any).models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt
      });
      
      const text = response.text || '';
      setResult(text);
      setStep(3);
    } catch (error) {
      console.error("AI Generation Error:", error);
      setResult("Sorry, I encountered an error while planning your crops. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async () => {
    if (!user || !user.id || !result) return;
    const path = 'crop_plans';
    try {
      await addDoc(collection(db, path), {
        userId: user.id,
        timestamp: new Date().toISOString(),
        input: formData,
        recommendations: result,
        crops: suggestedCrops
      });
      alert('Plan saved to your dashboard!');
      fetchSavedPlans();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  };

  const toggleHindi = () => {
    // In a real app, this would trigger a re-generation or translation
    alert("Voice synthesis and Hindi translation feature coming soon in next update!");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-gray-200 rounded-[2.5rem] p-12 text-center shadow-xl shadow-agri-secondary/5"
        >
          <div className="w-20 h-20 bg-agri-secondary/10 text-agri-secondary rounded-3xl flex items-center justify-center mx-auto mb-8">
            <LayoutDashboard size={40} />
          </div>
          <h2 className="text-3xl font-serif text-agri-primary mb-4 font-bold">Account Required</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Please sign in to access the AI Crop Planner and save your personalized cultivation strategies for up to 210 days.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full py-4 bg-agri-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-agri-primary/20 hover:scale-[1.02] transition-all"
          >
            Sign In Now
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-20 pt-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2 text-agri-secondary">
              <div className="p-2 bg-agri-secondary/10 rounded-lg">
                <Sprout size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">KisanHub Professional</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-agri-primary font-medium tracking-tight">
              AI Crop <span className="italic text-agri-accent">Planner</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm max-w-lg">
              Personalized agricultural intelligence to maximize your yield and profit using 2026 data.
            </p>
          </div>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-700 shadow-sm hover:border-agri-secondary transition-all"
          >
            <History size={16} />
            {showHistory ? 'View Planner' : 'Saved Plans'}
          </button>
        </div>

        {showHistory ? (
          <div className="space-y-6">
            {savedPlans.length > 0 ? savedPlans.map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-agri-bg rounded-xl text-agri-secondary">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{plan.input.location || 'Untitled Plan'}</h3>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        {new Date(plan.timestamp).toLocaleDateString()} • {plan.input.landSize} {plan.input.landUnit}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setFormData(plan.input);
                      setResult(plan.recommendations);
                      setSuggestedCrops(plan.crops);
                      setStep(3);
                      setShowHistory(false);
                    }}
                    className="p-3 text-agri-secondary bg-agri-secondary/5 rounded-xl hover:bg-agri-secondary hover:text-white transition-all"
                  >
                    <Maximize2 size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {plan.crops.map((c, j) => (
                    <span key={j} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-600">
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-300">
                <History size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 font-serif italic">No saved plans yet. Start planning today!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Sidebar Steps */}
            <div className="lg:col-span-3 space-y-4">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={`p-4 rounded-2xl border transition-all ${
                    step === s ? 'bg-agri-primary border-agri-primary text-white shadow-xl shadow-agri-primary/20' : 
                    step > s ? 'bg-white border-green-200 text-green-600' : 'bg-white border-gray-100 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black w-6 h-6 rounded-full border border-current flex items-center justify-center">
                      {s}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest">
                      {s === 1 ? 'Farm Profile' : s === 2 ? 'Review' : 'AI Recommendation'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white border border-gray-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm"
                  >
                    <h2 className="text-2xl font-serif text-agri-primary mb-8">Setup Your Farm Profile</h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Location */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <MapPin size={12} /> Location (State/District)
                        </label>
                        <input 
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g. Lucknow, Uttar Pradesh"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm focus:border-agri-secondary outline-none transition-all"
                        />
                      </div>

                      {/* Land Size */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <Droplets size={12} /> Land & Season
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="number"
                            name="landSize"
                            value={formData.landSize}
                            onChange={handleInputChange}
                            placeholder="Size"
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm focus:border-agri-secondary outline-none"
                          />
                          <select 
                            name="landUnit"
                            value={formData.landUnit}
                            onChange={handleInputChange}
                            className="bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold uppercase"
                          >
                            <option value="acre">Acre</option>
                            <option value="hectare">Hectare</option>
                            <option value="bigha">Bigha</option>
                          </select>
                        </div>
                      </div>

                      {/* More Inputs */}
                      {[
                        { label: 'Soil Type', name: 'soilType', options: ['Sandy', 'Loamy', 'Clay', 'Black', 'Red'] },
                        { label: 'Water Availability', name: 'waterAvailability', options: ['Low', 'Medium', 'High'] },
                        { label: 'Irrigation', name: 'irrigationType', options: ['Drip', 'Sprinkler', 'Rainfed', 'Traditional'] },
                        { label: 'Current Season', name: 'season', options: ['Kharif', 'Rabi', 'Zaid'] },
                        { label: 'Experience', name: 'experience', options: ['Beginner', 'Intermediate', 'Advanced'] },
                        { label: 'Risk Tolerance', name: 'riskLevel', options: ['Low', 'Medium', 'High'] }
                      ].map((item) => (
                        <div key={item.name} className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</label>
                          <select 
                            name={item.name}
                            value={(formData as any)[item.name]}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm focus:border-agri-secondary outline-none"
                          >
                            {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setStep(2)}
                      className="mt-12 w-full py-4 bg-agri-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-agri-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      Next Step <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-gray-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm"
                  >
                    <h2 className="text-2xl font-serif text-agri-primary mb-8 text-center">Confirm Your Details</h2>
                    
                    <div className="bg-agri-bg/50 rounded-3xl p-8 mb-10 border border-agri-bg">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(formData).map(([k, v]) => (
                          <div key={k}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{k.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-sm font-bold text-agri-primary">{v || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold uppercase tracking-widest text-xs"
                      >
                        Back to Edit
                      </button>
                      <button 
                        onClick={generatePlan}
                        disabled={isGenerating}
                        className="flex-[2] py-4 bg-agri-secondary text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-agri-secondary/20 disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <><RefreshCw size={18} className="animate-spin" /> Thinking...</>
                        ) : (
                          <><Sparkles size={18} /> Generate AI Plan</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && result && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-gray-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden"
                  >
                     {/* Result Toolbar */}
                     <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-agri-secondary/10 text-agri-secondary rounded-xl">
                              <Sprout size={24} />
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-900 leading-none mb-1">Your AI Crop Strategy</h3>
                              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Generated for {formData.location}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={toggleHindi} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-agri-secondary transition-colors" title="Listen in Hindi">
                              <Volume2 size={18} />
                           </button>
                           <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-agri-secondary transition-colors" title="Download PDF">
                              <Download size={18} />
                           </button>
                           <button onClick={savePlan} className="px-4 py-3 bg-agri-secondary/10 text-agri-secondary rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-agri-secondary hover:text-white transition-all flex items-center gap-2">
                              <Save size={14} /> Save Plan
                           </button>
                        </div>
                     </div>

                     {/* Main Content */}
                     <div className="prose prose-sm max-w-none prose-slate prose-img:rounded-3xl">
                        <Markdown>{result}</Markdown>
                     </div>

                     <div className="mt-12 flex items-center justify-center gap-4">
                        <button 
                          onClick={() => setStep(1)}
                          className="px-8 py-4 border border-gray-200 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                          New Strategy
                        </button>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal components for clean icons
const History = ({ size, className }: { size: number, className?: string }) => <Clock size={size} className={className} />;
const Sparkles = ({ size, className }: { size: number, className?: string }) => <TrendingUp size={size} className={className} />;

export default CropPlanner;
