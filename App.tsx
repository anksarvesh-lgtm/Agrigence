
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User } from './types';
import { mockBackend, auth, onAuthStateChanged } from './services/mockBackend';
import { Mail, LogOut, CheckCircle } from 'lucide-react';

// Layouts and Pages
import Layout from './components/Layout';
import AdminLayout from './layouts/AdminLayout';
import { ReviewerLayout } from './components/ReviewerLayout'; // New Layout
import PopupAnnouncement from './components/PopupAnnouncement';
import Preloader from './components/Preloader';
import GlobalUploadIndicator from './components/GlobalUploadIndicator';
import { ConfirmationProvider } from './components/ContextualConfirm';

import Home from './pages/Home';
import EditorialBoard from './pages/EditorialBoard';
import AuthorGuidelines from './pages/AuthorGuidelines';
import News from './pages/News';
import NewsView from './pages/NewsView';
import Journals from './pages/Journals';
import Blogs from './pages/Blogs';
import BlogView from './pages/BlogView';
import AboutContact from './pages/AboutContact';
import Products from './pages/Products';
import Consultation from './pages/Consultation';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Dashboard from './pages/Dashboard';
import ViewDocument from './pages/ViewDocument';
import Submission from './pages/Submission';
import Subscription from './pages/Subscription';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import ContentManagement from './pages/admin/ContentManagement';
import SubscriptionPlans from './pages/admin/SubscriptionPlans';
import Payments from './pages/admin/Payments';
import AdminNewsManagement from './pages/admin/AdminNewsManagement';
import EditorialBoardManagement from './pages/admin/EditorialBoardManagement';
import LeadershipManagement from './pages/admin/LeadershipManagement';
import PopupManager from './pages/admin/PopupManager';
import Settings from './pages/admin/Settings';
import Coupons from './pages/admin/Coupons';
import InquiryManager from './pages/admin/InquiryManager';
import NavigationManager from './pages/admin/NavigationManager';
import LayoutManager from './pages/admin/LayoutManager';
import StaticPagesEditor from './pages/admin/StaticPagesEditor';
import TemplateManager from './pages/admin/TemplateManager';
import SEOSettings from './pages/admin/SEOSettings';
import MediaLibrary from './pages/admin/MediaLibrary';
import NotificationManager from './pages/admin/NotificationManager';
import TrashManager from './pages/admin/TrashManager';
import AdminManager from './extensions/submission-tracking/AdminManager';
import SubmissionAdminPanel from './extensions/submission-admin/SubmissionAdminPanel';
import ReviewerDashboard from './pages/ReviewerDashboard'; // New Page

// Auth Context
interface AuthContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {}, isLoading: true });
export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for Auth state changes from Firebase
    let userUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Ensure user record exists (Create if first time login)
          await mockBackend.syncUser(firebaseUser);
          
          // 2. Subscribe to the real-time record to get plan updates instantly
          if (userUnsub) userUnsub(); // cleanup previous if any
          
          userUnsub = mockBackend.subscribeToUser(firebaseUser.uid, (userData) => {
             if (userData) setUser(userData);
          });

        } catch (error) {
          console.error("Failed to sync user profile", error);
          setUser(null);
        }
      } else {
        if (userUnsub) userUnsub();
        userUnsub = null;
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      authUnsub();
      if (userUnsub) userUnsub();
    };
  }, []);

  const login = (u: User) => {
    setUser(u);
  };

  const logout = async () => {
    await mockBackend.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Preloader />;

  return (
    <AuthProvider>
      <GlobalUploadIndicator />
      <HashRouter>
        <ConfirmationProvider>
          <PopupAnnouncement />
          <Routes>
            {/* Secure Document Viewer Route (No Layout) */}
            <Route path="/view-document/:id" element={<ViewDocument />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              {/* Redirect legacy path to new board route */}
              <Route path="editorial-board" element={<EditorialBoard />} />
              <Route path="board" element={<Navigate to="/editorial-board" replace />} />
              {/* Updated Author Guidelines Route */}
              <Route path="author-guidelines" element={<AuthorGuidelines />} />
              <Route path="guidelines" element={<Navigate to="/author-guidelines" replace />} />
              
              <Route path="news" element={<News />} />
              <Route path="news/:id" element={<NewsView />} />
              <Route path="journals" element={<Journals />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="blog/:id" element={<BlogView />} />
              <Route path="about-contact" element={<AboutContact />} />
              <Route path="products" element={<Products />} />
              <Route path="consultation" element={<Consultation />} />
              <Route path="login" element={<Login />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              
              {/* USER DASHBOARD */}
              <Route path="dashboard" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><Dashboard /></ProtectedRoute>} />
              <Route path="submission" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><Submission /></ProtectedRoute>} />
              <Route path="subscription" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><Subscription /></ProtectedRoute>} />
            </Route>

            {/* REVIEWER DASHBOARD (Strict Isolation) */}
            <Route 
              path="/reviewer" 
              element={
                <ProtectedRoute allowedRoles={['EDITORIAL_MEMBER', 'SUPER_ADMIN']}>
                  <ReviewerLayout />
                </ProtectedRoute>
              }
            >
               <Route index element={<ReviewerDashboard />} />
               <Route path="history" element={<ReviewerDashboard />} /> 
            </Route>

            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              
              {/* OPERATIONAL ROUTES (Admins + SuperAdmin) */}
              <Route path="dashboard" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="submissions" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><SubmissionAdminPanel /></ProtectedRoute>} />
              <Route path="payments" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Payments /></ProtectedRoute>} />
              <Route path="news" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><AdminNewsManagement /></ProtectedRoute>} />
              <Route path="blogs" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><ContentManagement /></ProtectedRoute>} />
              <Route path="inquiries" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><InquiryManager /></ProtectedRoute>} />
              <Route path="broadcast" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><NotificationManager /></ProtectedRoute>} />
              
              {/* SUPER ADMIN RESTRICTED ROUTES (System Configuration) */}
              <Route path="users" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><UserManagement /></ProtectedRoute>} />
              <Route path="plans" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SubscriptionPlans /></ProtectedRoute>} />
              <Route path="coupons" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Coupons /></ProtectedRoute>} />
              <Route path="templates" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><TemplateManager /></ProtectedRoute>} />
              <Route path="seo" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SEOSettings /></ProtectedRoute>} />
              <Route path="articles" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ContentManagement /></ProtectedRoute>} />
              <Route path="magazines" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ContentManagement /></ProtectedRoute>} />
              <Route path="products" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ProductManagement /></ProtectedRoute>} />
              <Route path="board" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><EditorialBoardManagement /></ProtectedRoute>} />
              <Route path="leadership" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><LeadershipManagement /></ProtectedRoute>} />
              <Route path="popup" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><PopupManager /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Settings /></ProtectedRoute>} />
              <Route path="media" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><MediaLibrary /></ProtectedRoute>} />
              <Route path="trash" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><TrashManager /></ProtectedRoute>} />
              <Route path="navigation" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><NavigationManager /></ProtectedRoute>} />
              <Route path="layout" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><LayoutManager /></ProtectedRoute>} />
              <Route path="pages" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><StaticPagesEditor /></ProtectedRoute>} />
              <Route path="tracker" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminManager /></ProtectedRoute>} />
            </Route>
          </Routes>
        </ConfirmationProvider>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
