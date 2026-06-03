
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User, SubscriptionPlan } from './types';
import { mockBackend } from './services/mockBackend';
import { auth } from './src/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Mail, LogOut, CheckCircle } from 'lucide-react';

import { HelmetProvider } from 'react-helmet-async';

// Layouts and Pages
import Layout from './components/Layout';
import { AuthProvider, useAuth, ProtectedRoute, CompetitiveProtectedRoute } from './src/authContext';
import AdminLayout from './layouts/AdminLayout';
import PopupAnnouncement from './components/PopupAnnouncement';
import Preloader from './components/Preloader';
import GlobalUploadIndicator from './components/GlobalUploadIndicator';
import { ConfirmationProvider } from './components/ContextualConfirm';
import { CheckPlan } from './middleware/checkPlan';
import VisitorTracker from './components/VisitorTracker';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import Revision from './pages/Revision';
import AiMentor from './pages/AiMentor';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import SubscriptionPlans from './pages/admin/SubscriptionPlans';
import Payments from './pages/admin/Payments';
import Settings from './pages/admin/Settings';
import Coupons from './pages/admin/Coupons';
import NotificationManager from './pages/admin/NotificationManager';
import TestBuilder from './pages/admin/TestBuilder';
import QuestionBank from './pages/admin/QuestionBank';
import Approvals from './pages/admin/Approvals';
import Featured from './pages/admin/Featured';
import Scheduled from './pages/admin/Scheduled';
import BulkUpload from './pages/admin/BulkUpload';
import Subjects from './pages/admin/Subjects';
import CookieConsentManager from './components/CookieConsentManager';
import AddDobModal from './components/AddDobModal';

import TestSeries from './pages/TestSeries';
import TestConfig from './pages/TestConfig';
import TestInterface from './pages/TestInterface';
import TestResults from './pages/TestResults';
import TestReview from './pages/TestReview';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Preloader />;

  return (
    <AuthProvider>
      <HelmetProvider>
        <AppContent />
      </HelmetProvider>
    </AuthProvider>
  );
};

const FaviconUpdater: React.FC = () => {
  useEffect(() => {
    return mockBackend.subscribeToSettings((data) => {
        if (data && data.logoUrl) {
            const updateFavicon = (url: string) => {
                const linkId = 'dynamic-favicon';
                const oldLink = document.getElementById(linkId);
                const newLink = document.createElement('link');
                newLink.id = linkId;
                newLink.rel = 'shortcut icon';
                newLink.type = 'image/png';
                newLink.href = url;
                if (oldLink) document.head.removeChild(oldLink);
                else document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
                document.head.appendChild(newLink);
            };
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const img = new Image();
                img.crossOrigin = "Anonymous"; 
                img.onload = () => {
                    try {
                        ctx.clearRect(0, 0, 64, 64);
                        const scale = Math.min(64 / img.width, 64 / img.height);
                        const w = img.width * scale; const h = img.height * scale;
                        const x = (64 - w) / 2; const y = (64 - h) / 2;
                        ctx.drawImage(img, x, y, w, h);
                        updateFavicon(canvas.toDataURL('image/png'));
                    } catch (e) { updateFavicon(data.logoUrl); }
                };
                img.onerror = () => updateFavicon(data.logoUrl);
                img.src = data.logoUrl;
            }
        }
    });
  }, []);
  return null;
};

const AppContent: React.FC = () => {
  const { showDobModal, setShowDobModal } = useAuth();
  return (
    <>
      <FaviconUpdater />
      <GlobalUploadIndicator />
      <CookieConsentManager />
      {showDobModal && <AddDobModal onClose={() => setShowDobModal(false)} />}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <VisitorTracker />
        <ConfirmationProvider>
          <PopupAnnouncement />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="test-series" element={<TestSeries />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="dashboard" element={<CompetitiveProtectedRoute><Dashboard /></CompetitiveProtectedRoute>} />
              <Route path="analytics" element={<CompetitiveProtectedRoute><Analytics /></CompetitiveProtectedRoute>} />
              <Route path="leaderboard" element={<CompetitiveProtectedRoute><Leaderboard /></CompetitiveProtectedRoute>} />
              <Route path="revision" element={<CompetitiveProtectedRoute><Revision /></CompetitiveProtectedRoute>} />
              <Route path="ai-mentor" element={<CompetitiveProtectedRoute><AiMentor /></CompetitiveProtectedRoute>} />
              <Route path="bookmarks" element={<CompetitiveProtectedRoute><Bookmarks /></CompetitiveProtectedRoute>} />
              <Route path="profile" element={<CompetitiveProtectedRoute><Profile /></CompetitiveProtectedRoute>} />
              <Route path="subscription" element={<Subscription />} />
            </Route>

            {/* Timed Proctor Assessment simulator routes */}
            <Route path="test/config/:bankId" element={<CompetitiveProtectedRoute><TestConfig /></CompetitiveProtectedRoute>} />
            <Route path="test/:sessionId" element={<CompetitiveProtectedRoute><TestInterface /></CompetitiveProtectedRoute>} />
            <Route path="test/results/:sessionId" element={<CompetitiveProtectedRoute><TestResults /></CompetitiveProtectedRoute>} />
            <Route path="test/review/:sessionId" element={<CompetitiveProtectedRoute><TestReview /></CompetitiveProtectedRoute>} />

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
              <Route path="tests" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><TestBuilder /></ProtectedRoute>} />
              <Route path="questions" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><QuestionBank /></ProtectedRoute>} />
              <Route path="approvals" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Approvals /></ProtectedRoute>} />
              <Route path="featured" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Featured /></ProtectedRoute>} />
              <Route path="scheduled" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Scheduled /></ProtectedRoute>} />
              <Route path="subjects" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Subjects /></ProtectedRoute>} />
              <Route path="bulk-upload" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><BulkUpload /></ProtectedRoute>} />
              <Route path="payments" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Payments /></ProtectedRoute>} />
              <Route path="broadcast" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><NotificationManager /></ProtectedRoute>} />
              
              {/* SUPER ADMIN RESTRICTED ROUTES (System Configuration) */}
              <Route path="users" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><UserManagement /></ProtectedRoute>} />
              <Route path="plans" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SubscriptionPlans /></ProtectedRoute>} />
              <Route path="coupons" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Coupons /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Settings /></ProtectedRoute>} />
            </Route>
          </Routes>
        </ConfirmationProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
