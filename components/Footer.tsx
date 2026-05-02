import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Shield, FileText, Download, Smartphone } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { SiteSettings } from '../types';

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await mockBackend.getSettings();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-stone-900 text-stone-300 py-12 px-6 mt-auto">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-4">Agrigence</h3>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Where Agri-Intelligence Meets Agricultural Generation. Connecting researchers, students, and farmers through high-quality publications and tools.
            </p>
            <div className="flex flex-wrap gap-3">
              {settings?.apkUrl && (
                <a href={settings.apkUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-agri-secondary/20 hover:bg-agri-secondary text-agri-secondary hover:text-white rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest border border-agri-secondary/30">
                  <Smartphone size={14} />
                  <span>Get APK</span>
                  <Download size={12} />
                </a>
              )}
              {settings?.playStoreUrl && (
                <a href={settings.playStoreUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-[#4285F4]/20 hover:bg-[#4285F4] text-[#4285F4] hover:text-white rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest border border-[#4285F4]/30">
                  <Smartphone size={14} />
                  <span>Play Store</span>
                  <Download size={12} />
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about-contact" className="hover:text-agri-secondary transition-colors">About Us</Link></li>
              <li><Link to="/journals" className="hover:text-agri-secondary transition-colors">Journals</Link></li>
              <li><Link to="/news" className="hover:text-agri-secondary transition-colors">News</Link></li>
              <li><Link to="/products" className="hover:text-agri-secondary transition-colors">Store</Link></li>
              <li><Link to="/sitemap" className="hover:text-agri-secondary transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="flex items-center gap-2 hover:text-agri-secondary transition-colors">
                  <Shield size={14} /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="flex items-center gap-2 hover:text-agri-secondary transition-colors">
                  <FileText size={14} /> Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/author-guidelines" className="flex items-center gap-2 hover:text-agri-secondary transition-colors">
                  <FileText size={14} /> Author Guidelines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-agri-secondary shrink-0 mt-0.5" />
                <span>H.N.130, JUDAHARADHAN BHAG-1, Chandauli, UP, India, 221115</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-agri-secondary shrink-0" />
                <span>+91 9452571317</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-agri-secondary shrink-0" />
                <a href="mailto:info@agrigence.in" className="hover:text-agri-secondary transition-colors">info@agrigence.in</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} Agrigence. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
