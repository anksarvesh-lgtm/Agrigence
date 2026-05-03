
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
import AdminLayout from './layouts/AdminLayout';
import { ReviewerLayout } from './components/ReviewerLayout'; // New Layout
import PopupAnnouncement from './components/PopupAnnouncement';
import Preloader from './components/Preloader';
import GlobalUploadIndicator from './components/GlobalUploadIndicator';
import { ConfirmationProvider } from './components/ContextualConfirm';
import { CheckPlan } from './middleware/checkPlan';
import VisitorTracker from './components/VisitorTracker';
import ScrollToTop from './components/ScrollToTop';

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
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Dashboard from './pages/Dashboard';
import DashboardTools from './pages/DashboardTools';
import ResearchDataLab from './pages/ResearchDataLab';
import AdvancedResearchSuite from './pages/AdvancedResearchSuite/AdvancedResearchSuite';
import AdvancedStatsSuite from './pages/AdvancedStatsSuite';
import ViewDocument from './pages/ViewDocument';
import Submission from './pages/Submission';
import Subscription from './pages/Subscription';
import MySubscription from './pages/MySubscription';
import ToolHistoryDetail from './pages/ToolHistoryDetail';
import ToolsPage from './pages/ToolsPage';
import Sitemap from './pages/Sitemap';
import FarmerConnect from './pages/FarmerConnect';
import { GovSchemes } from './pages/KisanHub/GovSchemes';
import MobileAppView from './pages/MobileAppView';
import MandiCityPage from './pages/MandiCityPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import CropAdvisoryPage from './pages/CropAdvisoryPage';

// Lazy loaded tools
const SeedRatePage = React.lazy(() => import('./tools/Tool01SeedRate/SeedRatePage'));
const NutrientPage = React.lazy(() => import('./tools/Tool02Nutrient/NutrientPage'));
const INMPage = React.lazy(() => import('./tools/Tool03INM/INMPage'));
const WaterPage = React.lazy(() => import('./tools/Tool04Water/WaterPage'));
const EconomicsPage = React.lazy(() => import('./tools/Tool05Economics/EconomicsPage'));
const LandPage = React.lazy(() => import('./tools/Tool06Land/LandPage'));
const SprayPage = React.lazy(() => import('./tools/Tool07Spray/SprayPage'));
const YieldPage = React.lazy(() => import('./tools/Tool08Yield/YieldPage'));
const KPIPage = React.lazy(() => import('./tools/Tool09KPI/KPIPage'));
const ExperimentPage = React.lazy(() => import('./tools/Tool10Experiment/ExperimentPage'));
const PlotDosePage = React.lazy(() => import('./tools/Tool11PlotDose/PlotDosePage'));
const FactorialPage = React.lazy(() => import('./tools/Tool12Factorial/FactorialPage'));
const ClimatePage = React.lazy(() => import('./tools/Tool13Climate/ClimatePage'));
const ANOVAPage = React.lazy(() => import('./tools/Tool14ANOVA/ANOVAPage'));
const StatisticalAnalysisPage = React.lazy(() => import('./tools/Tool18Statistics/StatisticalAnalysisPage'));
const GraphPage = React.lazy(() => import('./tools/Tool15Graphs/GraphPage'));

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
import WebIntelligence from './pages/admin/WebIntelligence';
import VisitorAnalytics from './pages/admin/VisitorAnalytics';
import AIContentGenerator from './pages/admin/AIContentGenerator';
import AdminManager from './extensions/submission-tracking/AdminManager';
import SubmissionAdminPanel from './extensions/submission-admin/SubmissionAdminPanel';
import ReviewerDashboard from './pages/ReviewerDashboard'; // New Page
import AdsTxtManager from './pages/admin/AdsTxtManager';
import CookieManager from './pages/admin/CookieManager';
import SchemesManagement from './pages/admin/SchemesManagement';
import WhapiDashboard from './pages/admin/WhapiDashboard';
import FarmerConnectManagement from './pages/admin/FarmerConnectManagement';
import CookieConsentManager from './components/CookieConsentManager';
import AddDobModal from './components/AddDobModal';

import DashboardHome from './pages/DashboardHome';
import PipelineBuilder from './pages/PipelineBuilder';
import AnovaEngine from './pages/AnovaEngine';

import KisanLayout from './pages/KisanHub/KisanLayout';
import HubDashboard from './pages/KisanHub/HubDashboard';
import MandiBhav from './pages/KisanHub/MandiBhav';
import Khatabook from './pages/KisanHub/Khatabook';
import SOPChecklist from './pages/KisanHub/SOPChecklist';
import { KisanWeather } from './pages/KisanHub/KisanWeather';
import { EquipmentRental } from './pages/KisanHub/EquipmentRental';
import { FarmerMarketplace } from './pages/KisanHub/FarmerMarketplace';
import { LandListing } from './pages/KisanHub/LandListing';
import { KisanDashboard } from './pages/KisanHub/KisanDashboard';
import { PostRequirement } from './pages/KisanHub/PostRequirement';
import { MyRequirements } from './pages/KisanHub/MyRequirements';
import { MyListings } from './pages/KisanHub/MyListings';
import { ListYourItem } from './pages/KisanHub/ListYourItem';
import CropPlanner from './pages/KisanHub/CropPlanner';



import KisanLogin from './pages/KisanHub/KisanLogin';

// Auth Context
interface AuthContextType {
  user: User | null;
  planDetails: SubscriptionPlan | null;
  login: (u: User) => void;
  logout: () => void;
  isLoading: boolean;
  showDobModal: boolean;
  setShowDobModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, planDetails: null, login: () => {}, logout: () => {}, isLoading: true, showDobModal: false, setShowDobModal: () => {} });
export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [planDetails, setPlanDetails] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDobModal, setShowDobModal] = useState(false);

  useEffect(() => {
    // Listen for Auth state changes from Firebase
    let userUnsub: (() => void) | null = null;
    let cleanupInterval: NodeJS.Timeout | null = null;

    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Ensure user record exists (Create if first time login)
          await mockBackend.syncUser(firebaseUser);
          
          // 2. Subscribe to the real-time record to get plan updates instantly
          if (userUnsub) userUnsub(); // cleanup previous if any
          
          userUnsub = mockBackend.subscribeToUser(firebaseUser.uid, async (userData) => {
             if (userData) {
               setUser(userData);
               
               // Fetch plan details
               if (userData.subscriptionTier) {
                 const plans = await mockBackend.getPlans();
                 const plan = plans.find(p => p.name === userData.subscriptionTier);
                 setPlanDetails(plan || null);
               } else {
                 setPlanDetails(null);
               }
               
               // 3. If user is admin, start cleanup tasks
               if (userData.role === 'SUPER_ADMIN' || userData.role === 'ADMIN') {
                 if (!cleanupInterval) {
                   mockBackend.cleanupTemporaryData().catch(() => {}); // Silent fail
                   cleanupInterval = setInterval(() => {
                     mockBackend.cleanupTemporaryData().catch(() => {});
                   }, 30 * 60 * 1000);
                 }
               } else if (cleanupInterval) {
                 clearInterval(cleanupInterval);
                 cleanupInterval = null;
               }

               // 4. Check for DOB
               if (!userData.dob) {
                 setShowDobModal(true);
               } else {
                 setShowDobModal(false);
               }
             }
          });

        } catch (error: any) {
          console.error("Failed to sync user profile", error instanceof Error ? error.message : String(error));
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

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const KisanProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) return <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center font-serif text-[#92745B]">Validating Farm Credentials...</div>;
  if (!user) return <Navigate to="/kisan/login" state={{ from: location }} replace />;

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
      <HelmetProvider>
        <AppContent />
      </HelmetProvider>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { showDobModal, setShowDobModal } = useAuth();
  return (
    <>
      <GlobalUploadIndicator />
      <CookieConsentManager />
      {showDobModal && <AddDobModal onClose={() => setShowDobModal(false)} />}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <VisitorTracker />
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
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="sitemap" element={<Sitemap />} />
              <Route path="tools" element={<ToolsPage />} />
              <Route path="tools/seed-rate" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><SeedRatePage /></React.Suspense>} />
              <Route path="tools/nutrient-req" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><NutrientPage /></React.Suspense>} />
              <Route path="tools/inm-planner" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><INMPage /></React.Suspense>} />
              <Route path="tools/water-req" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><WaterPage /></React.Suspense>} />
              <Route path="tools/economics" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><EconomicsPage /></React.Suspense>} />
              <Route path="tools/land-converter" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><LandPage /></React.Suspense>} />
              <Route path="tools/spray-calculator" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><SprayPage /></React.Suspense>} />
              <Route path="tools/yield-estimator" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><YieldPage /></React.Suspense>} />
              <Route path="tools/kpi-dashboard" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><KPIPage /></React.Suspense>} />
              <Route path="tools/experiment-builder" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><ExperimentPage /></React.Suspense>} />
              <Route path="tools/plot-dose" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><PlotDosePage /></React.Suspense>} />
              <Route path="tools/factorial-generator" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><FactorialPage /></React.Suspense>} />
              <Route path="tools/climate-analyzer" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><ClimatePage /></React.Suspense>} />
              <Route path="tools/anova" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><ANOVAPage /></React.Suspense>} />
              <Route path="tools/statistical-analysis" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><StatisticalAnalysisPage /></React.Suspense>} />
              <Route path="tools/auto-graph" element={<React.Suspense fallback={<div className="min-h-screen bg-agri-bg flex items-center justify-center font-serif text-agri-primary">Loading Tool...</div>}><GraphPage /></React.Suspense>} />
              
              <Route path="farmer-connect" element={<FarmerConnect />} />
              <Route path="govt-schemes" element={<GovSchemes hideBack={true} />} />
              <Route path="mobile-app" element={<MobileAppView />} />
              
              {/* Programmatic SEO Pages */}
              <Route path="mandi-bhav/:city" element={<MandiCityPage />} />
              <Route path="scheme/:slug" element={<SchemeDetailPage />} />
              <Route path="crop/:slug" element={<CropAdvisoryPage />} />

              {/* USER DASHBOARD */}
              <Route path="dashboard" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><Dashboard /></ProtectedRoute>} />
              <Route path="dashboard/subscription" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><MySubscription /></ProtectedRoute>} />
              <Route path="dashboard/tools" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><DashboardTools /></ProtectedRoute>} />
              <Route path="dashboard/research-lab" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><ResearchDataLab /></ProtectedRoute>} />
              <Route path="dashboard/advanced-research" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><AdvancedResearchSuite /></ProtectedRoute>} />
              <Route path="dashboard/advanced-stats" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><AdvancedStatsSuite /></ProtectedRoute>} />
              <Route path="dashboard/tool-history/:id" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><ToolHistoryDetail /></ProtectedRoute>} />
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

            <Route path="/kisan" element={<KisanLayout />}>
              <Route path="login" element={<KisanLogin />} />
              <Route index element={<HubDashboard />} />
              <Route path="mandi" element={<MandiBhav />} />
              <Route path="ledger" element={<KisanProtectedRoute><Khatabook /></KisanProtectedRoute>} />
              <Route path="sop" element={<KisanProtectedRoute><SOPChecklist /></KisanProtectedRoute>} />
              <Route path="weather" element={<KisanWeather />} />
              <Route path="equipment" element={<EquipmentRental />} />
              <Route path="marketplace" element={<FarmerMarketplace />} />
              <Route path="land" element={<LandListing />} />
              <Route path="dashboard" element={<KisanProtectedRoute><KisanDashboard /></KisanProtectedRoute>} />
              <Route path="schemes" element={<GovSchemes />} />
              <Route path="post-requirement" element={<KisanProtectedRoute><PostRequirement /></KisanProtectedRoute>} />
              <Route path="my-requirements" element={<KisanProtectedRoute><MyRequirements /></KisanProtectedRoute>} />
              <Route path="my-listings" element={<KisanProtectedRoute><MyListings /></KisanProtectedRoute>} />
              <Route path="list-item" element={<KisanProtectedRoute><ListYourItem /></KisanProtectedRoute>} />
              <Route path="crop-planner" element={<CropPlanner />} />
            </Route>

            <Route path="/analytics" element={<DashboardHome />} />
            <Route path="/analytics/pipeline" element={<PipelineBuilder />} />
            <Route path="/analytics/anova" element={<AnovaEngine />} />

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
              <Route path="web-intelligence" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><WebIntelligence /></ProtectedRoute>} />
              <Route path="visitors" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><VisitorAnalytics /></ProtectedRoute>} />
              <Route path="ai-content" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><AIContentGenerator /></ProtectedRoute>} />
              <Route path="whatsapp" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><WhapiDashboard /></ProtectedRoute>} />
              
              {/* SUPER ADMIN RESTRICTED ROUTES (System Configuration) */}
              <Route path="users" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><UserManagement /></ProtectedRoute>} />
              <Route path="plans" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SubscriptionPlans /></ProtectedRoute>} />
              <Route path="coupons" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Coupons /></ProtectedRoute>} />
              <Route path="templates" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><TemplateManager /></ProtectedRoute>} />
              <Route path="seo" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><SEOSettings /></ProtectedRoute>} />
              <Route path="articles" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ContentManagement /></ProtectedRoute>} />
              <Route path="magazines" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ContentManagement /></ProtectedRoute>} />
              <Route path="products" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ProductManagement /></ProtectedRoute>} />
              <Route path="board" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><EditorialBoardManagement /></ProtectedRoute>} />
              <Route path="leadership" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><LeadershipManagement /></ProtectedRoute>} />
              <Route path="popup" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><PopupManager /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Settings /></ProtectedRoute>} />
              <Route path="media" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><MediaLibrary /></ProtectedRoute>} />
              <Route path="trash" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><TrashManager /></ProtectedRoute>} />
              <Route path="navigation" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><NavigationManager /></ProtectedRoute>} />
              <Route path="layout" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><LayoutManager /></ProtectedRoute>} />
              <Route path="pages" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><StaticPagesEditor /></ProtectedRoute>} />
              <Route path="tracker" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminManager /></ProtectedRoute>} />
              <Route path="cookies" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><CookieManager /></ProtectedRoute>} />
              <Route path="ads-txt" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdsTxtManager /></ProtectedRoute>} />
              <Route path="schemes" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><SchemesManagement /></ProtectedRoute>} />
              <Route path="farmer-connect" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><FarmerConnectManagement /></ProtectedRoute>} />
            </Route>
          </Routes>
        </ConfirmationProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
