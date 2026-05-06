import React, { useState, useEffect, useRef } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { GovtScheme } from '../../types';
import { useAuth } from '../../src/authContext';
import { useConfirm } from '../../components/ContextualConfirm';
import { Plus, Edit, Trash2, Landmark, Save, X, Search, Activity, Sparkles, Upload } from 'lucide-react';
import * as mammoth from 'mammoth';

const SchemesManagement: React.FC = () => {
    const { user } = useAuth();
    const { confirm } = useConfirm();
    const [schemes, setSchemes] = useState<GovtScheme[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [editingScheme, setEditingScheme] = useState<Partial<GovtScheme>>({});
    const [search, setSearch] = useState('');
    
    const [aiText, setAiText] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadSchemes();
    }, []);

    const loadSchemes = async () => {
        setLoading(true);
        const data = await mockBackend.getGovtSchemes();
        setSchemes(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
    };

    const handleSave = async () => {
        if (!editingScheme.title || !editingScheme.category) {
            alert("Title and Category are required.");
            return;
        }

        const payload: Partial<GovtScheme> = {
            ...editingScheme,
            isActive: editingScheme.isActive !== undefined ? editingScheme.isActive : true
        };

        if (payload.id) {
            await mockBackend.updateGovtScheme(payload.id, payload);
        } else {
            await mockBackend.addGovtScheme({
                ...payload,
                createdAt: new Date().toISOString()
            } as any);
        }

        setIsModalOpen(false);
        setEditingScheme({});
        loadSchemes();
    };

    const handleDelete = async (id: string) => {
        if (await confirm({ message: "Are you sure you want to delete this scheme alert?", type: 'danger' })) {
            await mockBackend.deleteGovtScheme(id);
            loadSchemes();
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target?.result as ArrayBuffer;
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    setAiText(result.value);
                } catch (err) {
                    alert("Failed to parse DOCX file.");
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert("Please upload a .docx file.");
        }
    };

    const handleAiExtract = async () => {
        if (!aiText.trim()) {
            alert("Please paste text or upload a document first.");
            return;
        }
        setIsExtracting(true);
        try {
            const res = await fetch('/api/extract-scheme-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: aiText })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to extract data');
            }

            const data = await res.json();
            
            // Map JSON to scheme
            setEditingScheme({
                title: data.title || '',
                description: data.description || '',
                detailedDesc: data.detailedDesc || '',
                category: ['SUBSIDY', 'LOAN', 'DEADLINE', 'OTHER'].includes(data.category?.toUpperCase()) ? data.category.toUpperCase() : 'OTHER',
                subsidyAmount: data.subsidyAmount || '',
                eligibility: data.eligibility || '',
                documents: Array.isArray(data.documents) ? data.documents : [],
                tags: Array.isArray(data.tags) ? data.tags : [],
                isActive: true
            });
            
            setIsAiModalOpen(false);
            setIsModalOpen(true);
            setAiText('');
        } catch (e: any) {
            alert(e.message || "An error occurred during AI extraction.");
        } finally {
            setIsExtracting(false);
        }
    };

    const filtered = schemes.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-admin-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-admin-text">Govt Scheme Alerts</h1>
                    <p className="text-admin-muted text-xs mt-1 uppercase tracking-widest font-bold">Manage Subsidies, Loans, and Deadlines</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsAiModalOpen(true)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all flex items-center gap-2 border border-indigo-200"
                    >
                        <Sparkles size={16} /> AI Import
                    </button>
                    <button 
                        onClick={() => { setEditingScheme({ category: 'SUBSIDY' }); setIsModalOpen(true); }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg flex items-center gap-2"
                    >
                        <Plus size={16} /> Create Alert
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-admin-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-admin-border flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search schemes..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-yellow-500 outline-none"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-admin-bg/50 text-[10px] uppercase tracking-widest text-admin-muted border-b border-admin-border">
                                <th className="p-4 font-bold">Title & Description</th>
                                <th className="p-4 font-bold">Category</th>
                                <th className="p-4 font-bold">Deadline</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-admin-muted text-sm animate-pulse">Loading...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-admin-muted text-sm">No schemes found.</td>
                                </tr>
                            ) : (
                                filtered.map(scheme => (
                                    <tr key={scheme.id} className="border-b border-admin-border hover:bg-admin-bg/30 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-admin-text text-sm mb-1">{scheme.title}</p>
                                            <p className="text-xs text-admin-muted line-clamp-1">{scheme.description}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase tracking-widest">
                                                {scheme.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-mono text-admin-secondary">{scheme.deadline || 'N/A'}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${scheme.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {scheme.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => { setEditingScheme(scheme); setIsModalOpen(true); }} className="p-2 hover:bg-yellow-50 text-admin-muted hover:text-yellow-600 rounded-lg transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(scheme.id)} className="p-2 hover:bg-red-50 text-admin-muted hover:text-red-500 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Landmark className="text-yellow-500" /> 
                                {editingScheme.id ? 'Edit Scheme Alert' : 'Create Scheme Alert'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                           <div>
                               <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Alert Title *</label>
                               <input type="text" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none" 
                                      value={editingScheme.title || ''} onChange={e => setEditingScheme({...editingScheme, title: e.target.value})} placeholder="e.g. PM Kisan Samman Nidhi Update"/>
                           </div>
                           
                           <div>
                               <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Description</label>
                               <textarea className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none h-32 resize-none" 
                                         value={editingScheme.description || ''} onChange={e => setEditingScheme({...editingScheme, description: e.target.value})} placeholder="Explain the benefits or requirements briefly..."/>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Category *</label>
                                   <select className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none" 
                                           value={editingScheme.category || 'SUBSIDY'} onChange={e => setEditingScheme({...editingScheme, category: e.target.value as any})}>
                                       <option value="SUBSIDY">Subsidy</option>
                                       <option value="LOAN">Loan</option>
                                       <option value="DEADLINE">Deadline Alert</option>
                                       <option value="OTHER">Other</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">State/Region</label>
                                   <input type="text" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none" 
                                          value={editingScheme.state || ''} onChange={e => setEditingScheme({...editingScheme, state: e.target.value})} placeholder="e.g. ALL, Uttar Pradesh, MP"/>
                               </div>
                           </div>

                           <div>
                               <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Detailed Description</label>
                               <textarea className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none h-32 resize-none" 
                                         value={editingScheme.detailedDesc || ''} onChange={e => setEditingScheme({...editingScheme, detailedDesc: e.target.value})} placeholder="Full details of the scheme..."/>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Core Benefit / Subsidy Amount</label>
                                   <input type="text" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none" 
                                          value={editingScheme.subsidyAmount || ''} onChange={e => setEditingScheme({...editingScheme, subsidyAmount: e.target.value})} placeholder="e.g. ₹6,000/year"/>
                               </div>
                               <div>
                                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Eligibility Criteria</label>
                                   <input type="text" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none" 
                                          value={editingScheme.eligibility || ''} onChange={e => setEditingScheme({...editingScheme, eligibility: e.target.value})} placeholder="Who can apply?"/>
                               </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Documents Required (Comma Separated)</label>
                                   <input type="text" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none" 
                                          value={editingScheme.documents?.join(', ') || ''} onChange={e => setEditingScheme({...editingScheme, documents: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} placeholder="Aadhaar, PAN..."/>
                               </div>
                               <div>
                                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Tags (Comma Separated)</label>
                                   <input type="text" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none" 
                                          value={editingScheme.tags?.join(', ') || ''} onChange={e => setEditingScheme({...editingScheme, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} placeholder="Subsidy, Farmer..."/>
                               </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Deadline (Optional)</label>
                                   <input type="date" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none" 
                                          value={editingScheme.deadline || ''} onChange={e => setEditingScheme({...editingScheme, deadline: e.target.value})}/>
                               </div>
                               <div>
                                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Official Application Link</label>
                                   <input type="url" className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none" 
                                          value={editingScheme.link || ''} onChange={e => setEditingScheme({...editingScheme, link: e.target.value})} placeholder="https://..."/>
                               </div>
                           </div>

                           <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                               <input type="checkbox" id="isActive" className="w-4 h-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500" 
                                      checked={editingScheme.isActive !== false} onChange={e => setEditingScheme({...editingScheme, isActive: e.target.checked})}/>
                               <label htmlFor="isActive" className="text-sm font-bold text-gray-700 uppercase tracking-widest">Mark as Active (Visible to users)</label>
                           </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-800 text-sm">Cancel</button>
                            <button onClick={handleSave} className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all text-sm">
                                <Save size={16} /> Save Alert
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Import Modal */}
            {isAiModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="text-indigo-500" /> 
                                AI Scheme Import
                            </h2>
                            <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                           <div>
                               <p className="text-sm font-medium text-gray-600 mb-4">
                                   Paste the contents of a scheme guideline or import a Word Document (.docx). Our AI will automatically extract the title, benefits, eligibility, and documents required.
                               </p>
                               <input 
                                   type="file" 
                                   accept=".docx" 
                                   ref={fileInputRef} 
                                   onChange={handleFileUpload}
                                   className="hidden" 
                               />
                               <button 
                                   onClick={() => fileInputRef.current?.click()}
                                   className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 hover:bg-indigo-50 transition-colors text-indigo-600 font-bold mb-4"
                               >
                                   <Upload size={24} className="mb-2" />
                                   Upload DOCX File
                               </button>
                               
                               <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Or Paste Scheme Text Below</label>
                               <textarea 
                                   className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:border-indigo-500 outline-none h-48 resize-none" 
                                   value={aiText} 
                                   onChange={e => setAiText(e.target.value)} 
                                   placeholder="The Government has introduced a new scheme offering..."
                               />
                           </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button onClick={() => setIsAiModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-800 text-sm" disabled={isExtracting}>Cancel</button>
                            <button 
                                onClick={handleAiExtract} 
                                disabled={isExtracting || !aiText.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isExtracting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Extracting Data...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} /> Auto-Fill Form
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchemesManagement;
