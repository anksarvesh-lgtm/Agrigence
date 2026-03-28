import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';
import { CookieSettings, CookiePreferences } from '../types';
import { X, ShieldCheck, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CookieConsentManager: React.FC = () => {
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false,
    consentVersion: 1,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await mockBackend.getCookieSettings();
      setSettings(data);
      checkConsent(data);
    } catch (error) {
      console.error("Failed to load cookie settings", error);
    }
  };

  const checkConsent = (currentSettings: CookieSettings) => {
    const stored = localStorage.getItem('agri_cookie_consent_v3');
    if (stored) {
      const parsed: CookiePreferences = JSON.parse(stored);
      // Check expiry and version
      const daysSince = (new Date().getTime() - new Date(parsed.timestamp).getTime()) / (1000 * 3600 * 24);
      if (daysSince > currentSettings.expiryDays || parsed.consentVersion !== currentSettings.consentVersion) {
        setShowBanner(true);
      } else {
        setPreferences(parsed);
        injectScripts(parsed, currentSettings);
      }
    } else {
      setShowBanner(true);
    }
  };

  const handleAcceptAll = () => {
    if (!settings) return;
    const newPrefs: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
      consentVersion: settings.consentVersion,
      timestamp: new Date().toISOString()
    };
    saveConsent(newPrefs);
  };

  const handleRejectAll = () => {
    if (!settings) return;
    const newPrefs: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
      consentVersion: settings.consentVersion,
      timestamp: new Date().toISOString()
    };
    saveConsent(newPrefs);
  };

  const handleSavePreferences = () => {
    if (!settings) return;
    const newPrefs = {
      ...preferences,
      consentVersion: settings.consentVersion,
      timestamp: new Date().toISOString()
    };
    saveConsent(newPrefs);
  };

  const saveConsent = async (prefs: CookiePreferences) => {
    localStorage.setItem('agri_cookie_consent_v3', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowModal(false);
    
    if (settings) {
      injectScripts(prefs, settings);
    }

    // Save to backend for audit
    try {
      await mockBackend.saveCookiePreferences(prefs);
    } catch (e) {
      console.error("Failed to log consent", e);
    }
  };

  const injectScripts = (prefs: CookiePreferences, currentSettings: CookieSettings) => {
    // Google Consent Mode V2
    window.gtag = window.gtag || function() { (window.dataLayer = window.dataLayer || []).push(arguments); };
    window.gtag('consent', 'update', {
      'ad_storage': prefs.marketing ? 'granted' : 'denied',
      'analytics_storage': prefs.analytics ? 'granted' : 'denied',
      'personalization_storage': prefs.preferences ? 'granted' : 'denied'
    });

    // Inject scripts based on categories
    currentSettings.scripts.forEach((script: any) => {
      const category = currentSettings.categories.find((c: any) => c.id === script.categoryId);
      if (!category || !category.isEnabled) return;

      const isAllowed = 
        (script.categoryId === 'essential') ||
        (script.categoryId === 'analytics' && prefs.analytics) ||
        (script.categoryId === 'marketing' && prefs.marketing) ||
        (script.categoryId === 'preferences' && prefs.preferences);

      if (isAllowed) {
        // Check if already injected
        if (!document.getElementById(`cookie-script-${script.id}`)) {
          const el = document.createElement('script');
          el.id = `cookie-script-${script.id}`;
          if (script.isSrc) {
            el.src = script.scriptContent;
            el.async = true;
          } else {
            el.innerHTML = script.scriptContent;
          }
          document.head.appendChild(el);
        }
      } else {
        // Remove if previously injected but now denied
        const existing = document.getElementById(`cookie-script-${script.id}`);
        if (existing) existing.remove();
      }
    });
  };

  // Listen for custom event to open settings
  useEffect(() => {
    const handleOpenSettings = () => setShowModal(true);
    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenSettings);
  }, []);

  if (!settings) return null;

  return (
    <>
      {/* Banner */}
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[9998] bg-white shadow-[0_-4px_20px_rgb(0,0,0,0.08)] border-t border-gray-100 p-4"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-full shrink-0 hidden md:block">
                  <ShieldCheck className="h-5 w-5 text-agri-green" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    We value your privacy
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    We use cookies to enhance your experience. You can choose to accept or customize them.
                    <a href={settings.cookiePolicyUrl} className="text-agri-green hover:underline ml-1">Read Policy</a>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={() => setShowModal(true)}
                  className="flex-1 md:flex-none px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Customize
                </button>
                <button 
                  onClick={handleRejectAll}
                  className="flex-1 md:flex-none px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  Reject All
                </button>
                <button 
                  onClick={handleAcceptAll}
                  className="flex-1 md:flex-none px-6 py-2 text-xs font-semibold text-white bg-agri-green hover:bg-agri-dark rounded-lg transition-colors whitespace-nowrap"
                >
                  Accept All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="h-6 w-6 text-agri-green" />
                  Cookie Preferences
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <p className="text-sm text-gray-600">
                  When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your preferences or your device and is mostly used to make the site work as you expect it to.
                </p>

                {settings.categories.filter((c: any) => c.isEnabled).map((category: any) => (
                  <div key={category.id} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    </div>
                    <div className="flex items-center h-6">
                      {category.isEssential ? (
                        <span className="text-xs font-bold text-agri-green uppercase tracking-wider">Always Active</span>
                      ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={preferences[category.id as keyof CookiePreferences] as boolean}
                            onChange={(e) => setPreferences({...preferences, [category.id]: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-agri-green"></div>
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleRejectAll}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Reject All
                  </button>
                  <button 
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Accept All
                  </button>
                </div>
                <button 
                  onClick={handleSavePreferences}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-agri-green hover:bg-agri-dark rounded-lg transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Footer Button */}
      {!showBanner && !showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-4 left-4 z-[9998] bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-full p-3 text-gray-600 hover:text-agri-green transition-all group"
          title="Cookie Settings"
        >
          <ShieldCheck className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

// Add gtag to window object
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default CookieConsentManager;
