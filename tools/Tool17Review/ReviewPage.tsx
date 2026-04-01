import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter, Download, Trash2, AlertTriangle, FileText } from 'lucide-react';
import { Paper, savePapers, loadPapers } from './literatureStore';
import { validatePaper } from './reviewValidator';
import { filterByTheme, filterByCrop, getUniqueThemes, getUniqueCrops } from './taggingEngine';
import { buildMatrix } from './matrixBuilder';
import { formatAPA } from './citationFormatter';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

export default function ReviewPage() {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Filters
  const [themeFilter, setThemeFilter] = useState('All');
  const [cropFilter, setCropFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Paper>>({
    author: '', year: new Date().getFullYear(), title: '', journal: '',
    doi: '', crop: '', theme: '', findings: '', method: '', location: ''
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.restoreData) {
      const data = location.state.restoreData;
      if (data.papers !== undefined) setPapers(data.papers);
      if (data.isAdding !== undefined) setIsAdding(data.isAdding);
      if (data.themeFilter !== undefined) setThemeFilter(data.themeFilter);
      if (data.cropFilter !== undefined) setCropFilter(data.cropFilter);
      if (data.searchQuery !== undefined) setSearchQuery(data.searchQuery);
      if (data.formData !== undefined) setFormData(data.formData);
      if (data.formErrors !== undefined) setFormErrors(data.formErrors);
    }
  }, [location.state]);

  useEffect(() => {
    setPapers(loadPapers());
  }, []);

  const handleSave = () => {
    const { isValid, errors } = validatePaper(formData, papers);
    
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    const newPaper: Paper = {
      id: Date.now().toString(),
      author: formData.author!,
      year: Number(formData.year),
      title: formData.title!,
      journal: formData.journal || '',
      doi: formData.doi || '',
      crop: formData.crop || '',
      theme: formData.theme || '',
      findings: formData.findings!,
      method: formData.method || '',
      location: formData.location || ''
    };

    const updatedPapers = [...papers, newPaper];
    setPapers(updatedPapers);
    savePapers(updatedPapers);

    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Literature Review',
          inputData: { action: 'Add Paper', paper: newPaper },
          outputData: { status: 'Saved' },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
    
    setIsAdding(false);
    setFormData({ author: '', year: new Date().getFullYear(), title: '', journal: '', doi: '', crop: '', theme: '', findings: '', method: '', location: '' });
    setFormErrors([]);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this paper?')) {
      const updatedPapers = papers.filter(p => p.id !== id);
      setPapers(updatedPapers);
      savePapers(updatedPapers);
    }
  };

  const handleExportMatrix = () => {
    const matrix = buildMatrix(filteredPapers);
    if (matrix.length === 0) return;

    let csv = 'Study,Theme,Result,Method,Location\n';
    matrix.forEach(row => {
      csv += `"${row.study}","${row.theme}","${row.result}","${row.method}","${row.location}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Literature_Matrix_${Date.now()}.csv`;
    link.click();
  };

  // Apply filters
  let filteredPapers = papers;
  if (themeFilter !== 'All') filteredPapers = filterByTheme(filteredPapers, themeFilter);
  if (cropFilter !== 'All') filteredPapers = filterByCrop(filteredPapers, cropFilter);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredPapers = filteredPapers.filter(p => 
      p.author.toLowerCase().includes(q) || 
      p.title.toLowerCase().includes(q) || 
      p.findings.toLowerCase().includes(q)
    );
  }

  const uniqueThemes = getUniqueThemes(papers);
  const uniqueCrops = getUniqueCrops(papers);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Review Organizer</h1>
            <p className="text-stone-500 text-sm">Literature Management & Evidence Structuring</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          {isAdding ? 'Cancel' : <><Plus size={18} /> Add Paper</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Add New Literature</h2>
          
          {formErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <ul className="list-disc pl-5 space-y-1">
                {formErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Author(s) *</label>
              <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="e.g. Singh et al." className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Year *</label>
              <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">DOI (Optional)</label>
              <input type="text" value={formData.doi} onChange={e => setFormData({...formData, doi: e.target.value})} placeholder="10.1016/j.fcr..." className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Title *</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Effect of INM on Wheat..." className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Journal</label>
              <input type="text" value={formData.journal} onChange={e => setFormData({...formData, journal: e.target.value})} placeholder="Field Crops Research" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Crop</label>
              <input type="text" value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} placeholder="Wheat" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Theme</label>
              <input type="text" value={formData.theme} onChange={e => setFormData({...formData, theme: e.target.value})} placeholder="Nutrient Management" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Key Findings *</label>
              <textarea value={formData.findings} onChange={e => setFormData({...formData, findings: e.target.value})} rows={2} placeholder="Yield increased 18%..." className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Methodology</label>
              <input type="text" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} placeholder="RCBD, 3 Replications" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Uttar Pradesh, India" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-colors">
              Save Paper
            </button>
          </div>
        </div>
      )}

      {/* Filters & Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search authors, titles, findings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          
          <select 
            value={themeFilter} 
            onChange={e => setThemeFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="All">All Themes</option>
            {uniqueThemes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select 
            value={cropFilter} 
            onChange={e => setCropFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="All">All Crops</option>
            {uniqueCrops.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button 
          onClick={handleExportMatrix}
          disabled={filteredPapers.length === 0}
          className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Download size={16} /> Export Matrix CSV
        </button>
      </div>

      {/* Literature List */}
      <div className="space-y-4">
        {filteredPapers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-stone-900">No literature found</h3>
            <p className="text-stone-500 mt-1">Add papers to start building your review database.</p>
          </div>
        ) : (
          filteredPapers.map(paper => (
            <div key={paper.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 hover:border-indigo-300 transition-colors group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-stone-900">{paper.author} ({paper.year})</span>
                    {paper.theme && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full">{paper.theme}</span>}
                    {paper.crop && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full">{paper.crop}</span>}
                  </div>
                  <h3 className="text-lg font-medium text-indigo-900 leading-tight mb-2">{paper.title}</h3>
                  <p className="text-sm text-stone-600 mb-3">{paper.journal} {paper.doi && <span className="text-stone-400">| DOI: {paper.doi}</span>}</p>
                  
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                    <p className="text-sm text-stone-800"><span className="font-semibold text-stone-600">Key Finding:</span> {paper.findings}</p>
                  </div>
                  
                  <div className="mt-3 flex gap-4 text-xs text-stone-500">
                    {paper.method && <span><span className="font-medium">Method:</span> {paper.method}</span>}
                    {paper.location && <span><span className="font-medium">Location:</span> {paper.location}</span>}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(paper.id)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete paper"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
