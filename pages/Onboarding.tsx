import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/authContext';
import { db } from '../src/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, CheckCircle, GraduationCap, MapPin, Globe, Sparkles, 
  ArrowRight, ArrowLeft, Smartphone, ShieldCheck, Mail, RefreshCw, Clock
} from 'lucide-react';

export default function Onboarding() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect unauthenticated user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.onboardingCompleted) {
      // If already completed onboarding, go to test-series
      navigate('/test-series');
    }
  }, [user, navigate]);

  // Steps: 1 = Personal Details, 2 = Qualification, 3 = Target Exams, 4 = Prep Level, 5 = OTP Mobile Verification
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(user?.name || '');
  const [language, setLanguage] = useState('English');
  const [state, setState] = useState('');
  const [qualification, setQualification] = useState('');
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [prepLevel, setPrepLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | ''>('');
  
  // Mobile Verification States
  const [dialCode, setDialCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpError, setOtpError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // States list for Indian States
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal', 'Delhi'
  ];

  // Professional Qualification options
  const qualificationOptions = [
    { value: '12th Pass', label: 'Higher Secondary (12th Pass)', desc: 'Completed basic science/agriculture stream' },
    { value: 'Diploma Agriculture', label: 'Diploma in Agriculture', desc: 'Polytechnic or institutional diploma holder' },
    { value: 'B.Sc Agriculture', label: 'B.Sc. Agriculture / allied', desc: 'Graduates in Agriculture, Horticulture, Forestry' },
    { value: 'M.Sc Agriculture', label: 'M.Sc. Agriculture / allied', desc: 'Post graduates pursuing specialized agri-sciences' },
    { value: 'B.Tech Agriculture', label: 'B.Tech. Agricultural Engineering', desc: 'Engineers focusing on farm tech & machinery' },
    { value: 'Veterinary Science', label: 'B.V.Sc & AH (Veterinary)', desc: 'Animal husbandry and veterinary sciences' },
    { value: 'Agriculture Engineering', label: 'Specialized Farm Engineering', desc: 'Other advanced agricultural methodologies' },
    { value: 'Other', label: 'Other Qualifications', desc: 'Fields seeking entry to allied sectors' }
  ];

  // Target Exams list
  const examOptions = [
    { value: 'IBPS AFO', label: 'IBPS AFO', desc: 'Agricultural Field Officer (Scale-I)' },
    { value: 'NABARD Grade A', label: 'NABARD Grade A', desc: 'Rural Development Bank Assistant Manager' },
    { value: 'ICAR AIEEA', label: 'ICAR AIEEA PG/JRF', desc: 'Master Degree Admissions & PhD Fellowships' },
    { value: 'Agriculture Supervisor', label: 'Agriculture Supervisor', desc: 'State Level Sub-ordinate Board Exams' },
    { value: 'FCI', label: 'FCI / CCI', desc: 'Food Corporation of India & Cotton Corporation' },
    { value: 'State Agriculture Officer', label: 'State ADO / AO', desc: 'Development and District Executive Officers' },
    { value: 'JRF/SRF', label: 'ICAR NET / JRF / SRF', desc: 'National-level teaching eligibility & doctoral grants' }
  ];

  const handleToggleExam = (val: string) => {
    if (selectedExams.includes(val)) {
      setSelectedExams(selectedExams.filter(e => e !== val));
    } else {
      setSelectedExams([...selectedExams, val]);
    }
  };

  // Handler for direct completion (skipped OTP)
  const handleCompletedOnboarding = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    if (!user) return;
    setOtpError('');
    setSubmitting(true);

    try {
      const fullMobile = `${dialCode} ${mobileNumber}`;

      // Table 1: users (merge core values to user object)
      const userRef = doc(db, 'users', user.id);
      const appUserUpdate = {
        name: fullName,
        mobileNumber: fullMobile,
        qualification: qualification,
        state: state,
        language: (language === 'English' ? 'en' : 'hi') as 'en' | 'hi',
        onboardingCompleted: true,
        targetExams: selectedExams,
        preparationLevel: prepLevel as 'Beginner' | 'Intermediate' | 'Advanced'
      };
      await setDoc(userRef, appUserUpdate, { merge: true });

      // Table 2: user_profiles
      await setDoc(doc(db, 'user_profiles', user.id), {
        userId: user.id,
        fullName: fullName,
        mobileNumber: fullMobile,
        qualification: qualification,
        state: state,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Table 3: onboarding_status
      await setDoc(doc(db, 'onboarding_status', user.id), {
        userId: user.id,
        completed: true,
        completedAt: new Date().toISOString(),
        stepsCompleted: ['personal', 'qualification', 'exams', 'prep', 'mobile']
      }, { merge: true });

      // Table 4: user_preferences
      await setDoc(doc(db, 'user_preferences', user.id), {
        userId: user.id,
        preferredLanguage: language,
        darkMode: true,
        emailNotifications: true,
        smsNotifications: true,
        weeklyDigest: true
      }, { merge: true });

      // Table 5: target_exams
      await setDoc(doc(db, 'target_exams', user.id), {
        userId: user.id,
        exams: selectedExams,
        primaryExam: selectedExams[0] || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Update local state context immediately
      login({
        ...user,
        ...appUserUpdate
      });

      // Clear onboarding redirect blocking
      navigate('/test-series');
    } catch (e: any) {
      console.error("Failed to commit onboarding details:", e);
      setOtpError("Database synchronization timed out. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!fullName.trim()) return alert('Please enter your full name');
      if (!state) return alert('Please specify your home state');
    } else if (step === 2) {
      if (!qualification) return alert('Please select a qualification card');
    } else if (step === 3) {
      if (selectedExams.length === 0) return alert('Please select at least one target exam');
    } else if (step === 4) {
      if (!prepLevel) return alert('Please select your current preparation level');
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress header */}
      <div className="w-full max-w-xl mb-10 text-center relative z-10">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 items-center justify-center">
          <Sparkles className="animate-spin text-emerald-400 w-6 h-6" style={{ animationDuration: '4s' }} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-emerald-400 mb-2">
          Personalize Your Prep Core
        </h1>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
          Step {step} of 5 &bull; {step === 1 ? 'Profile Setting' : step === 2 ? 'Qualification' : step === 3 ? 'Target Exams' : step === 4 ? 'Level Selection' : 'Mobile Number'}
        </p>

        {/* Dynamic Progress indicator */}
        <div className="flex gap-2 items-center justify-center mt-6 w-full px-6">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="flex-1 max-w-[60px] h-1.5 rounded-full bg-slate-800 border border-slate-700/50 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: step >= idx ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Glassmorphic Card Container */}
      <div className="w-full max-w-xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 md:p-10 relative z-10">
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <User size={22} className="text-emerald-400" /> Human Profile Details
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Help us adapt our high-yield agriculture recommendations and question weights.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="e.g. Ramesh Chandra" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-950/60 border border-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-emerald-500 text-slate-100 font-medium text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Preferred Language</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select 
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-emerald-500 text-slate-100 font-medium text-sm transition-all appearance-none cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">हिन्दी (Hindi)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">State of Residence</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select 
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-emerald-500 text-slate-100 font-medium text-sm transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select State</option>
                        {indianStates.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <GraduationCap size={22} className="text-emerald-400" /> Academic Qualification
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Select your current educational background for mock test difficulty scaling.
                </p>
              </div>

              {/* Qualification Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {qualificationOptions.map((opt) => (
                  <motion.button
                    type="button"
                    key={opt.value}
                    onClick={() => setQualification(opt.value)}
                    whileHover={{ y: -2 }}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      qualification === opt.value 
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold ${qualification === opt.value ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {opt.label}
                      </span>
                      {qualification === opt.value && <CheckCircle size={14} className="text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{opt.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck size={22} className="text-emerald-400" /> Select Target Exams
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  You can select multiple exams. We will tailor your syllabus milestones to match.
                </p>
              </div>

              {/* Target Exams Checkboxes List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {examOptions.map((opt) => {
                  const isChecked = selectedExams.includes(opt.value);
                  return (
                    <motion.button
                      type="button"
                      key={opt.value}
                      onClick={() => handleToggleExam(opt.value)}
                      whileHover={{ y: -2 }}
                      className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                        isChecked 
                          ? 'bg-emerald-500/10 border-emerald-500/50' 
                          : 'bg-slate-950/30 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="mt-1">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'border-slate-700 bg-slate-950'
                        }`}>
                          {isChecked && <CheckCircle size={10} className="stroke-slate-900" />}
                        </div>
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isChecked ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {opt.label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <Clock size={22} className="text-emerald-400" /> Preparation Level
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Assess your state objectively to help the AI Mentor suggest initial spaced repetition intervals.
                </p>
              </div>

              {/* Three detailed option cards */}
              <div className="space-y-3">
                {[
                  { value: 'Beginner', title: 'Beginner (0 - 6 Months Prep)', desc: 'Just starting. Focus on core agronomy concepts, basic crop biology, and terminology.' },
                  { value: 'Intermediate', title: 'Intermediate (6 - 18 Months Prep)', desc: 'Familiar with state/central patterns. Comfortable with pyqs but looking to optimize accuracy indices.' },
                  { value: 'Advanced', title: 'Advanced (18+ Months Prep)', desc: 'Solving sectional mocks above 75%. Need edge revision on minor genetics & soil physics.' }
                ].map((level) => (
                  <motion.button
                    type="button"
                    key={level.value}
                    onClick={() => setPrepLevel(level.value as any)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                      prepLevel === level.value 
                        ? 'bg-emerald-500/10 border-emerald-500/50' 
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        prepLevel === level.value ? 'border-emerald-500' : 'border-slate-700'
                      }`}>
                        {prepLevel === level.value && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      </div>
                    </div>
                    <div>
                      <span className={`text-sm font-bold block ${prepLevel === level.value ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {level.title}
                      </span>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{level.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <Smartphone size={22} className="text-emerald-400" /> Mobile Number
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Connect your phone number to enable instant exam alerts, notifications, and results.
                </p>
              </div>

              <div className="space-y-4">
                {otpError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-center">
                    {otpError}
                  </div>
                )}

                {/* Mobile number section */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Phone Number</label>
                    <div className="flex gap-2">
                      <select 
                        value={dialCode}
                        onChange={e => setDialCode(e.target.value)}
                        className="px-3 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-emerald-500 text-slate-100 font-medium text-sm transition-all"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US/CA)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+971">+971 (AE)</option>
                      </select>
                      <div className="relative flex-1">
                        <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="tel"
                          maxLength={10}
                          placeholder="10-Digit Mobile Number" 
                          value={mobileNumber}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            setMobileNumber(val);
                          }}
                          className="w-full pl-12 pr-4 py-4 bg-slate-950/60 border border-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-emerald-500 text-slate-100 font-medium text-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCompletedOnboarding}
                    disabled={submitting || mobileNumber.length < 10}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Completing...' : 'Complete Onboarding'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom row button navigation (for non-verification steps or back buttons) */}
        {step < 5 && (
          <div className="flex justify-between items-center mt-8 border-t border-slate-800/80 pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-widest ${
                step === 1 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 font-extrabold uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-1.5"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
