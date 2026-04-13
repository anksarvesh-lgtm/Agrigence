import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Save, AlertCircle } from 'lucide-react';

const AdsTxtManager: React.FC = () => {
  const [adsTxt, setAdsTxt] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from a database or file
    // For now, we'll mock it
    setAdsTxt('google.com, pub-7206167612469004, DIRECT, f08c47fec0942fa0');
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // In a real app, this would save to the database
      // await mockBackend.updateAdsTxt(adsTxt);
      setMessage({ text: 'ads.txt updated successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to update ads.txt', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-serif">Manage ads.txt</h1>
      <div className="bg-white p-6 rounded-xl shadow-admin border border-admin-border">
        <textarea
          value={adsTxt}
          onChange={(e) => setAdsTxt(e.target.value)}
          className="w-full h-64 p-4 border border-admin-inputBorder rounded-lg font-mono text-sm"
          placeholder="google.com, pub-..., DIRECT, ..."
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-agri-primary text-white rounded-lg hover:bg-agri-secondary transition-colors"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save ads.txt'}
          </button>
        </div>
        {message && (
          <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <AlertCircle size={18} />
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsTxtManager;
