
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User } from './types';
import { mockBackend } from './services/mockBackend';

// Layouts and Pages
import Layout from './components/Layout';
import AdminLayout from './layouts/AdminLayout';
import PopupAnnouncement from './components/PopupAnnouncement';

import Home from './pages/Home';
import EditorialBoard from './pages/EditorialBoard';
import AuthorGuidelines from './pages/AuthorGuidelines';
import News from './pages/News';
import Journals from './pages/Journals';
import Submission from './pages/Submission';
import Dashboard from './pages/Dashboard';
import Subscription from './pages/Subscription';
import AboutContact from './pages/AboutContact';
import Login from './pages/Login';
import Products from './pages/Products';
import Consultation from './pages/Consultation';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Preloader from './components/Preloader';

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
    const stored = localStorage.getItem('agri_session');
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('agri_session', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agri_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
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
      <HashRouter>
        <PopupAnnouncement />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="editorial-board" element={<EditorialBoard />} />
            <Route path="guidelines" element={<AuthorGuidelines />} />
            <Route path="news" element={<News />} />
            <Route path="journals" element={<Journals />} />
            <Route path="about-contact" element={<AboutContact />} />
            <Route path="products" element={<Products />} />
            <Route path="consultation" element={<Consultation />} />
            <Route path="login" element={<Login />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="submission" element={<ProtectedRoute><Submission /></ProtectedRoute>} />
            <Route path="subscription" element={<Subscription />} />
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
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="navigation" element={<NavigationManager />} />
            <Route path="layout" element={<LayoutManager />} />
            <Route path="inquiries" element={<InquiryManager />} />
            <Route path="pages" element={<StaticPagesEditor />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="plans" element={<SubscriptionPlans />} />
            <Route path="payments" element={<Payments />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="templates" element={<TemplateManager />} />
            <Route path="seo" element={<SEOSettings />} />
            <Route path="articles" element={<ContentManagement />} />
            <Route path="blogs" element={<ContentManagement />} />
            <Route path="magazines" element={<ContentManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="board" element={<EditorialBoardManagement />} />
            <Route path="leadership" element={<LeadershipManagement />} />
            <Route path="popup" element={<PopupManager />} />
            <Route path="news" element={<AdminNewsManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="broadcast" element={<NotificationManager />} />
            <Route path="trash" element={<TrashManager />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
