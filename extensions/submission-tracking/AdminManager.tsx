
import React, { useEffect, useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Article } from '../../types';
import { getMetaFile, updateMetaStatus, SubmissionMeta } from './meta-handler';
import { Save, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const AdminManager: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [metaData, setMetaData] = useState<Record<string, SubmissionMeta>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<SubmissionMeta['status']>('Pending');
  const [tempRemarks, setTempRemarks] = useState('');

  useEffect(() => {
    const load = async () => {
      const arts = await mockBackend.getArticles();
      setArticles(arts);
      
      const data: Record<string, SubmissionMeta> = {};
      for (const art of arts) {
        const meta = await getMetaFile(art);
        if (meta) {
          data[art.id] = meta;
        } else {
          // Initialize missing meta
          data[art.id] = {
            articleId: art.id,
            title: art.title,
            author: art.authorName,
            submittedAt: art.submissionDate,
            status: 'Pending',
            remarks: '',
            lastUpdated: art.submissionDate
          };
        }
      }
      setMetaData(data);
      setLoading(false);
    };
    load();
  }, []);

  const startEdit = (id: string, current: SubmissionMeta) => {
    setEditingId(id);
    setTempStatus(current.status);
    setTempRemarks(current.remarks);
  };

  const handleSave = async (id: string) => {
    await updateMetaStatus(id, tempStatus, tempRemarks);
    
    // Refresh local state
    const article = articles.find(a => a.id === id);
    if (article) {
        const updated = await getMetaFile(article);
        if (updated) {
          setMetaData(prev => ({ ...prev, [id]: updated }));
        }
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white">Submission Status Manager</h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Sidecar Metadata Protocol</p>
        </div>
      </div>

      <div className="grid gap-4">
        {articles.map(art => {
          const meta = metaData[art.id] || { status: 'Pending', remarks: '' };
          const isEditing = editingId === art.id;

          return (
            <div key={art.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{art.id.slice(0,8)}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${meta.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {meta.status}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{art.title}</h3>
                  <p className="text-white/50 text-xs mt-1">Author: {art.authorName}</p>
                </div>

                <div className="flex-1 bg-black/20 p-4 rounded-xl border border-white/5">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Status</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none"
                          value={tempStatus}
                          onChange={e => setTempStatus(e.target.value as any)}
                        >
                          <option value="Pending" className="bg-stone-900">Pending</option>
                          <option value="Under Review" className="bg-stone-900">Under Review</option>
                          <option value="Approved" className="bg-stone-900">Approved</option>
                          <option value="Published" className="bg-stone-900">Published</option>
                          <option value="Rejected" className="bg-stone-900">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Remarks</label>
                        <input 
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none"
                          value={tempRemarks}
                          onChange={e => setTempRemarks(e.target.value)}
                          placeholder="Add review notes..."
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest">Cancel</button>
                        <button onClick={() => handleSave(art.id)} className="px-4 py-1.5 rounded-lg bg-agri-secondary text-agri-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform">
                          <Save size={12} /> Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-between" onClick={() => startEdit(art.id, meta)}>
                      <div>
                        <p className="text-[9px] font-bold text-white/30 uppercase mb-1">Reviewer Remarks</p>
                        <p className="text-white/70 text-xs italic">{meta.remarks || 'No remarks added.'}</p>
                      </div>
                      <button className="self-end mt-4 text-[10px] font-bold text-agri-secondary uppercase tracking-widest hover:underline">
                        Edit Metadata
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminManager;
