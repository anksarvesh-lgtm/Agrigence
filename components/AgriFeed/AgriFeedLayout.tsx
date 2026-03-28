
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { auth } from '../../src/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import TermsModal from './TermsModal';
import { User } from '../../types';
import { Mail, Search, Bell, Home, LayoutGrid, Plus, User as UserIcon } from 'lucide-react';

const AgriFeedLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await mockBackend.getUser(firebaseUser.uid);
        setUser(userData);
        
        // Check if terms accepted
        const termsAccepted = localStorage.getItem(`agrifeed_terms_accepted_${firebaseUser.uid}`);
        if (!termsAccepted) {
          setShowTerms(true);
        }
        
        setLoading(false);
      } else {
        // Redirect to login if not authenticated
        navigate('/login', { state: { from: location.pathname } });
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const handleAcceptTerms = () => {
    if (user) {
      localStorage.setItem(`agrifeed_terms_accepted_${user.id}`, 'true');
      setShowTerms(false);
    }
  };

  const handleRejectTerms = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans">
      <TermsModal 
        isOpen={showTerms} 
        onAccept={handleAcceptTerms} 
        onReject={handleRejectTerms} 
      />
      
      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 p-4 flex items-center justify-between">
        <span className="font-bold text-lg text-agri-primary">Agrigence</span>
        <div className="flex items-center gap-3">
          <button className="p-2 text-stone-600 hover:bg-stone-100 rounded-full"><Search size={20} /></button>
          <button className="p-2 text-stone-600 hover:bg-stone-100 rounded-full"><Bell size={20} /></button>
          <button onClick={() => navigate('/agri-feed/inbox')} className="p-2 text-stone-600 hover:bg-stone-100 rounded-full">
            <Mail size={20} />
          </button>
        </div>
      </header>

      <div className="container mx-auto flex max-w-7xl">
        {/* Left Sidebar (Desktop Fixed, Mobile Hidden) */}
        <aside className="hidden md:block w-20 lg:w-64 sticky top-0 h-screen border-r border-stone-200 p-4">
          <LeftSidebar user={user} />
        </aside>

        {/* Main Feed (Center Column) */}
        <main className="flex-1 border-r border-stone-200 min-h-screen pb-20 md:pb-0">
          <Outlet context={{ user }} />
        </main>

        {/* Right Sidebar (Desktop Visible, Mobile Hidden) */}
        <aside className="hidden lg:block w-80 sticky top-0 h-screen overflow-y-auto p-4">
          <RightSidebar />
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 p-4 flex justify-around">
        <button onClick={() => navigate('/agri-feed/feed')}><Home size={24} /></button>
        <button onClick={() => navigate('/agri-feed/feed')}><LayoutGrid size={24} /></button>
        <button onClick={() => navigate('/agri-feed/feed')} className="bg-agri-primary text-white p-3 rounded-full -mt-6 shadow-lg"><Plus size={24} /></button>
        <button onClick={() => navigate('/agri-feed/inbox')}><Mail size={24} /></button>
        <button onClick={() => navigate(`/agri-feed/profile/${user?.id}`)}><UserIcon size={24} /></button>
      </nav>
    </div>
  );
};

export default AgriFeedLayout;
