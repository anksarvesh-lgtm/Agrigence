
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
import { AuthProvider, useAuth, ProtectedRoute, KisanProtectedRoute } from './src/authContext';
import AdminLayout from './layouts/AdminLayout';
import { ReviewerLayout } from './components/ReviewerLayout'; 
import PopupAnnouncement from './components/PopupAnnouncement';
import Preloader from './components/Preloader';
import GlobalUploadIndicator from './components/GlobalUploadIndicator';
import { ConfirmationProvider } from './components/ContextualConfirm';
import { CheckPlan } from './middleware/checkPlan';
import VisitorTracker from './components/VisitorTracker';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import EditorialBoard from './pages/EditorialBoard';
import AboutJournal from './pages/AboutJournal';
import AimScope from './pages/AimScope';
import AuthorGuidelines from './pages/AuthorGuidelines';
import Journals from './pages/Journals';
import AboutContact from './pages/AboutContact';
import Products from './pages/Products';
import Consultation from './pages/Consultation';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Copyright from './pages/Copyright';
import Dashboard from './pages/Dashboard';
import DashboardTools from './pages/DashboardTools';
import ResearchDataLab from './pages/ResearchDataLab';
import AdvancedResearchSuite from './pages/AdvancedResearchSuite/AdvancedResearchSuite';
import AdvancedStatsSuite from './pages/AdvancedStatsSuite';
import ViewDocument from './pages/ViewDocument';
import PublicationEthics from './pages/PublicationEthics';
import ImageTools from './pages/ImageTools';
import Submission from './pages/Submission';
import Subscription from './pages/Subscription';
import MySubscription from './pages/MySubscription';
import ToolHistoryDetail from './pages/ToolHistoryDetail';
import ToolsPage from './pages/ToolsPage';
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

import SoilAnalyzer from './pages/KisanHub/SoilAnalyzer';

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
        if (!data) return;
        
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

        if (data.faviconUrl) {
            updateFavicon(data.faviconUrl);
        } else if (data.logoUrl) {
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
            } else {
                updateFavicon(data.logoUrl);
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
            {/* Secure Document Viewer Route (No Layout) */}
            <Route path="/view-document/:id" element={<ViewDocument />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              {/* Redirect legacy path to new board route */}
              <Route path="editorial-board" element={<EditorialBoard />} />
              <Route path="board" element={<Navigate to="/editorial-board" replace />} />
              {/* Updated Author Guidelines Route */}
              <Route path="author-guidelines" element={<AuthorGuidelines />} />
              {/* Redirect legacy paths */}
              <Route path="pages/publication-ethics" element={<Navigate to="/publication-ethics" replace />} />
              <Route path="pages/author-guidelines" element={<Navigate to="/author-guidelines" replace />} />
              <Route path="guidelines" element={<Navigate to="/author-guidelines" replace />} />
              

              <Route path="journals" element={<Journals />} />
              <Route path="about-journal" element={<AboutJournal />} />
              <Route path="aim-scope" element={<AimScope />} />
              <Route path="about-contact" element={<AboutContact />} />
              <Route path="products" element={<Products />} />
              <Route path="consultation" element={<Consultation />} />
              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="copyright" element={<Copyright />} />
              <Route path="publication-ethics" element={<PublicationEthics />} />
              <Route path="tools" element={<ToolsPage />} />
              <Route path="img" element={<ImageTools />} />
              <Route path="image-tools" element={<Navigate to="/img" replace />} />
              <Route path="tools/image-resizer-compressor" element={<Navigate to="/img" replace />} />
              <Route path="tools/seed-rate" element={<SeedRatePage />} />
              <Route path="tools/nutrient-req" element={<NutrientPage />} />
              <Route path="tools/inm-planner" element={<INMPage />} />
              <Route path="tools/water-req" element={<WaterPage />} />
              <Route path="tools/economics" element={<EconomicsPage />} />
              <Route path="tools/land-converter" element={<LandPage />} />
              <Route path="tools/spray-calculator" element={<SprayPage />} />
              <Route path="tools/yield-estimator" element={<YieldPage />} />
              <Route path="tools/kpi-dashboard" element={<KPIPage />} />
              <Route path="tools/experiment-builder" element={<ExperimentPage />} />
              <Route path="tools/plot-dose" element={<PlotDosePage />} />
              <Route path="tools/factorial-generator" element={<FactorialPage />} />
              <Route path="tools/climate-analyzer" element={<ClimatePage />} />
              <Route path="tools/anova" element={<ANOVAPage />} />
              <Route path="tools/statistical-analysis" element={<StatisticalAnalysisPage />} />
              <Route path="tools/auto-graph" element={<GraphPage />} />
              
              <Route path="farmer-connect" element={<Navigate to="/kisan/farmer-connect" replace />} />
              <Route path="govt-schemes" element={<Navigate to="/kisan/schemes" replace />} />
              <Route path="mobile-app" element={<Navigate to="/kisan/mobile-app" replace />} />
              
              {/* Programmatic SEO Pages */}
              <Route path="mandi-bhav/:city" element={<Navigate to="/kisan/mandi-bhav/:city" replace />} />
              <Route path="scheme/:slug" element={<Navigate to="/kisan/scheme/:slug" replace />} />
              <Route path="crop/:slug" element={<Navigate to="/kisan/crop/:slug" replace />} />

              {/* USER DASHBOARD */}
              <Route path="dashboard" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><Dashboard /></ProtectedRoute>} />
              <Route path="dashboard/subscription" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><MySubscription /></ProtectedRoute>} />
              <Route path="dashboard/tools" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><DashboardTools /></ProtectedRoute>} />
              <Route path="dashboard/research-lab" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><ResearchDataLab /></ProtectedRoute>} />
              <Route path="dashboard/advanced-research" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><AdvancedResearchSuite /></ProtectedRoute>} />
              <Route path="dashboard/advanced-stats" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><AdvancedStatsSuite /></ProtectedRoute>} />
              <Route path="dashboard/tool-history/:id" element={<ProtectedRoute allowedRoles={['USER', 'EDITOR', 'SUPER_ADMIN']}><ToolHistoryDetail /></ProtectedRoute>} />
              <Route path="submission" element={<Submission />} />
              <Route path="subscription" element={<Subscription />} />
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

            {/* KISAN HUB ROUTES */}
            <Route path="/kisan" element={<KisanLayout />}>
              <Route index element={<HubDashboard />} />
              <Route path="login" element={<KisanLogin />} />
              <Route path="dashboard" element={<KisanProtectedRoute><KisanDashboard /></KisanProtectedRoute>} />
              <Route path="mandi" element={<MandiBhav />} />
              <Route path="mandi-bhav/:city" element={<MandiCityPage />} />
              <Route path="ledger" element={<Khatabook />} />
              <Route path="sop" element={<SOPChecklist />} />
              <Route path="weather" element={<KisanWeather />} />
              <Route path="equipment" element={<EquipmentRental />} />
              <Route path="marketplace" element={<FarmerMarketplace />} />
              <Route path="marketplace/post" element={<KisanProtectedRoute><PostRequirement /></KisanProtectedRoute>} />
              <Route path="marketplace/requirements" element={<KisanProtectedRoute><MyRequirements /></KisanProtectedRoute>} />
              <Route path="marketplace/listings" element={<KisanProtectedRoute><MyListings /></KisanProtectedRoute>} />
              <Route path="marketplace/list" element={<KisanProtectedRoute><ListYourItem /></KisanProtectedRoute>} />
              <Route path="land" element={<LandListing />} />
              <Route path="schemes" element={<GovSchemes />} />
              <Route path="scheme/:slug" element={<SchemeDetailPage />} />
              <Route path="crop-planner" element={<CropPlanner />} />
              <Route path="crop/:slug" element={<CropAdvisoryPage />} />
              <Route path="soil-analyzer" element={<SoilAnalyzer />} />
              <Route path="farmer-connect" element={<FarmerConnect />} />
              <Route path="mobile-app" element={<MobileAppView />} />
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
