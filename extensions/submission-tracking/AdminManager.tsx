
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-black">Submission Status Manager</h1>
          <p className="text-black text-xs mt-1 uppercase tracking-widest font-bold">Sidecar Metadata Protocol</p>
        </div>
      </div>

      <div className="grid gap-4">
        {articles.map(art => {
          const meta = metaData[art.id] || { status: 'Pending', remarks: '' };
          const isEditing = editingId === art.id;

          return (
            <div key={art.id} className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-all shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black">{art.id.slice(0,8)}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase text-black border ${meta.status === 'Approved' ? 'bg-green-100 border-green-300' : 'bg-yellow-100 border-yellow-300'}`}>
                      {meta.status}
                    </span>
                  </div>
                  <h3 className="text-black font-bold text-lg">{art.title}</h3>
                  <p className="text-black text-xs mt-1 font-medium">Author: {art.authorName}</p>
                </div>

                <div className="flex-1 bg-stone-100 p-4 rounded-xl border border-stone-200">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-bold text-black uppercase block mb-1">Status</label>
                        <select 
                          className="w-full bg-white border border-stone-300 rounded-lg p-2 text-black text-xs outline-none focus:border-black focus:ring-1 focus:ring-black"
                          value={tempStatus}
                          onChange={e => setTempStatus(e.target.value as any)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Published">Published</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-black uppercase block mb-1">Remarks</label>
                        <input 
                          className="w-full bg-white border border-stone-300 rounded-lg p-2 text-black text-xs outline-none focus:border-black focus:ring-1 focus:ring-black"
                          value={tempRemarks}
                          onChange={e => setTempRemarks(e.target.value)}
                          placeholder="Add review notes..."
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-black hover:bg-stone-200 uppercase tracking-widest">Cancel</button>
                        <button onClick={() => handleSave(art.id)} className="px-4 py-1.5 rounded-lg bg-stone-200 text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-300 transition-colors border border-stone-300">
                          <Save size={12} /> Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-between cursor-pointer" onClick={() => startEdit(art.id, meta)}>
                      <div>
                        <p className="text-[9px] font-bold text-black uppercase mb-1">Reviewer Remarks</p>
                        <p className="text-black text-xs italic">{meta.remarks || 'No remarks added.'}</p>
                      </div>
                      <button className="self-end mt-4 text-[10px] font-bold text-black uppercase tracking-widest hover:underline">
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
