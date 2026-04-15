
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { safeStringify } from '../lib/safeStringify';
import { ToolHistory } from '../types';
import { ChevronLeft, Clock, Wrench, CheckCircle, XCircle, Database, Layout } from 'lucide-react';

const DataViewer = ({ data, level = 0 }: { data: any, level?: number }) => {
  if (data === null || data === undefined) return <span className="text-stone-400 italic text-sm">N/A</span>;
  
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <span className="font-mono text-stone-800 text-sm">{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-stone-400 italic text-sm">Empty List</span>;
    
    // If it's an array of primitives, show as comma separated
    if (data.every(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')) {
      return <span className="font-mono text-stone-800 text-sm">{data.join(', ')}</span>;
    }

    return (
      <div className="flex flex-col gap-2 w-full">
        {data.map((item, index) => (
          <div key={index} className="rounded-lg p-3 border border-stone-100 bg-stone-50/50">
            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1 block">Item {index + 1}</span>
            <DataViewer data={item} level={level + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return <span className="text-stone-400 italic text-sm">Empty Data</span>;
    
    return (
      <div className="flex flex-col gap-2 w-full">
        {keys.map(key => (
          <div key={key} className="flex flex-col md:flex-row md:items-start gap-2 border-b border-stone-100 pb-2 last:border-0 last:pb-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 w-full md:w-1/3 pt-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div className="text-sm break-words w-full">
              <DataViewer data={data[key]} level={level + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span className="font-mono text-stone-800 text-sm">{safeStringify(data)}</span>;
};

const ToolHistoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<ToolHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      mockBackend.getToolHistoryItem(id).then(data => {
        setHistory(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-agri-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <XCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-serif font-bold text-agri-primary">History Not Found</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-6 text-agri-secondary font-bold hover:underline flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-8 text-stone-400 hover:text-agri-primary transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
        >
          <ChevronLeft size={16} /> Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
          <div className="p-8 md:p-12 border-b border-stone-100 bg-stone-50/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl ${history.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} flex items-center justify-center shadow-sm`}>
                  {history.status === 'SUCCESS' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-agri-primary">{history.toolName}</h1>
                  <div className="flex items-center gap-4 mt-2 text-stone-400 text-xs font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(history.timestamp).toLocaleString()}</span>
                    <span className={`px-2 py-0.5 rounded ${history.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {history.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {/* Input Data */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-agri-secondary mb-6 flex items-center gap-2">
                <Wrench size={16} /> Input Parameters
              </h3>
              <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
                <DataViewer data={history.inputData} />
              </div>
            </section>

            {/* Output Data */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-agri-secondary mb-6 flex items-center gap-2">
                <Layout size={16} /> Tool Results
              </h3>
              <div className="bg-agri-primary/5 rounded-3xl p-6 border border-agri-primary/10">
                <DataViewer data={history.outputData} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolHistoryDetail;
