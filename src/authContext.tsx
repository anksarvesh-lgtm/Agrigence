
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from './firebase';
import { mockBackend } from '../services/mockBackend';
import { User, SubscriptionPlan } from '../types';

interface AuthContextType {
  user: User | null;
  planDetails: SubscriptionPlan | null;
  login: (u: User) => void;
  logout: () => void;
  isLoading: boolean;
  showDobModal: boolean;
  setShowDobModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  planDetails: null, 
  login: () => {}, 
  logout: () => {}, 
  isLoading: true, 
  showDobModal: false, 
  setShowDobModal: () => {} 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [planDetails, setPlanDetails] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDobModal, setShowDobModal] = useState(false);

  useEffect(() => {
    let userUnsub: (() => void) | null = null;
    let cleanupInterval: NodeJS.Timeout | null = null;

    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await mockBackend.syncUser(firebaseUser);
          
          if (userUnsub) userUnsub();
          
          userUnsub = mockBackend.subscribeToUser(firebaseUser.uid, async (userData) => {
             if (userData) {
               setUser(userData);
               
               if (userData.subscriptionTier) {
                 const plans = await mockBackend.getPlans();
                 const plan = plans.find(p => p.name === userData.subscriptionTier);
                 setPlanDetails(plan || null);
               } else {
                 setPlanDetails(null);
               }
               
               if (userData.role === 'SUPER_ADMIN' || userData.role === 'ADMIN') {
                 if (!cleanupInterval) {
                   mockBackend.cleanupTemporaryData().catch(() => {});
                   cleanupInterval = setInterval(() => {
                     mockBackend.cleanupTemporaryData().catch(() => {});
                   }, 30 * 60 * 1000);
                 }
               } else if (cleanupInterval) {
                 clearInterval(cleanupInterval);
                 cleanupInterval = null;
               }

               if (!userData.dob) {
                 setShowDobModal(true);
               } else {
                 setShowDobModal(false);
               }
             }
          });

        } catch (error: any) {
          console.error("Failed to sync user profile", error);
          setUser(null);
        }
      } else {
        if (userUnsub) userUnsub();
        userUnsub = null;
        if (cleanupInterval) {
          clearInterval(cleanupInterval);
          cleanupInterval = null;
        }
        setUser(null);
        setShowDobModal(false);
      }
      setIsLoading(false);
    });

    return () => {
      authUnsub();
      if (cleanupInterval) clearInterval(cleanupInterval);
      if (userUnsub) userUnsub();
    };
  }, []);

  const login = (u: User) => {
    setUser(u);
  };

  const logout = async () => {
    await mockBackend.logout();
    setUser(null);
    setPlanDetails(null);
    setShowDobModal(false);
  };

  return (
    <AuthContext.Provider value={{ user, planDetails, login, logout, isLoading, showDobModal, setShowDobModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-emerald-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export const CompetitiveProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-emerald-400">Verifying session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
};

export const KisanProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) return <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center font-serif text-[#92745B]">Validating Farm Credentials...</div>;
  if (!user) return <Navigate to="/kisan/login" state={{ from: location }} replace />;

  return <>{children}</>;
};
