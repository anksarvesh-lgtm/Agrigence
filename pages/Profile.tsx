import React, { useState } from 'react';
import { useAuth } from '../src/authContext';
import { db } from '../src/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User, Save, Edit3, X, CheckCircle, GraduationCap, MapPin, Target, Globe } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobileNumber: user?.mobileNumber || '',
    qualification: user?.qualification || '',
    state: user?.state || '',
    targetExams: user?.targetExams || [],
    language: user?.preferredLanguage || 'English',
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const examsList = ['IBPS AFO', 'NABARD Grade A', 'FCI', 'State Agriculture Exams', 'ICAR JRF', 'IFFCO AGT', 'CWC'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExamToggle = (exam: string) => {
    setFormData(prev => {
      const exams = prev.targetExams.includes(exam)
        ? prev.targetExams.filter(e => e !== exam)
        : [...prev.targetExams, exam];
      return { ...prev, targetExams: exams };
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      const userRef = doc(db, 'users', user.id);
      const updatedUser = {
        ...user,
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        qualification: formData.qualification,
        state: formData.state,
        targetExams: formData.targetExams,
        preferredLanguage: formData.language,
      };
      await setDoc(userRef, updatedUser, { merge: true });
      login(updatedUser as any);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/80">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-slate-950 text-4xl shadow-lg shadow-emerald-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{user?.name}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Target size={14} className="text-emerald-400" /> {user?.targetExams?.[0] || 'Target Exam not set'}
                <span className="text-slate-600">•</span>
                <MapPin size={14} className="text-teal-400" /> {user?.state || 'Location not set'}
              </p>
            </div>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-slate-700"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </header>

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 font-bold">
            <CheckCircle size={20} />
            {successMsg}
          </div>
        )}

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User size={20} className="text-emerald-500" /> Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              ) : (
                <p className="px-4 py-3 bg-slate-950/40 border border-slate-800/50 rounded-xl text-slate-200">{user?.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
              <p className="px-4 py-3 bg-slate-950/40 border border-slate-800/50 rounded-xl text-slate-400">{user?.email}</p>
              <p className="text-[10px] text-slate-500">Email cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              ) : (
                <p className="px-4 py-3 bg-slate-950/40 border border-slate-800/50 rounded-xl text-slate-200">{user?.mobileNumber || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">State</label>
              {isEditing ? (
                <select 
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">Select State</option>
                  {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <p className="px-4 py-3 bg-slate-950/40 border border-slate-800/50 rounded-xl text-slate-200">{user?.state || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Qualification</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="qualification"
                  placeholder="e.g. B.Sc Agriculture"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              ) : (
                <p className="px-4 py-3 bg-slate-950/40 border border-slate-800/50 rounded-xl text-slate-200">{user?.qualification || 'Not provided'}</p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preferred Language</label>
              {isEditing ? (
                <select 
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Hinglish">Hinglish</option>
                </select>
              ) : (
                <p className="px-4 py-3 bg-slate-950/40 border border-slate-800/50 rounded-xl text-slate-200">{user?.preferredLanguage || 'English'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target size={20} className="text-emerald-500" /> Target Exams
            </h2>
          </div>

          {isEditing ? (
            <div className="flex flex-wrap gap-3">
              {examsList.map(exam => (
                <button
                  key={exam}
                  onClick={() => handleExamToggle(exam)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.targetExams.includes(exam)
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 border'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 border hover:bg-slate-800'
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.targetExams?.map(exam => (
                <span key={exam} className="px-4 py-2 bg-slate-950/40 border border-slate-800 text-sm text-slate-200 rounded-xl">
                  {exam}
                </span>
              ))}
              {(!user?.targetExams || user.targetExams.length === 0) && (
                <p className="text-sm text-slate-500">No exams selected.</p>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex items-center justify-end gap-4 sticky bottom-6 bg-slate-900 p-4 border border-slate-800 rounded-2xl shadow-2xl">
            <button 
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user?.name || '',
                  mobileNumber: user?.mobileNumber || '',
                  qualification: user?.qualification || '',
                  state: user?.state || '',
                  targetExams: user?.targetExams || [],
                  language: user?.preferredLanguage || 'English',
                });
              }}
              className="px-6 py-3 bg-transparent text-slate-400 hover:text-white rounded-xl font-bold transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
