import React, { useState } from 'react';
import { Calendar, X, Loader2 } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { useAuth } from '../src/authContext';

interface AddDobModalProps {
  onClose: () => void;
}

const AddDobModal: React.FC<AddDobModalProps> = ({ onClose }) => {
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dob) return;
    setIsLoading(true);
    try {
      await mockBackend.updateUser(user.id, { ...user, dob });
      onClose();
    } catch (error) {
      console.error("Failed to update DOB", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-serif font-bold text-agri-primary mb-2">Complete Your Profile</h2>
        <p className="text-stone-500 text-sm mb-6">Please add your Date of Birth to enable password reset functionality in the future.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
            <input 
              type="date" 
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary outline-none transition-all text-sm font-medium"
              required
              value={dob}
              onChange={e => setDob(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-agri-primary text-white font-bold py-3 rounded-xl hover:bg-agri-secondary transition-all flex items-center justify-center gap-2">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Save Date of Birth'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDobModal;
