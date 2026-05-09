import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Shield, FileText, Download, Smartphone, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Send } from 'lucide-react';
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-1">Agrigence</h3>
            <p className="text-agri-secondary text-[10px] font-medium italic mb-4">Where Agri-Intelligence Meets Agricultural Generations</p>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Agrigence Journal of Agriculture and Allied Science. is a peer-reviewed monthly online journal dedicated to building a trusted digital ecosystem for agricultural research in India.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com/agrigence" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <Facebook size={16} />
              </a>
              <a href="https://twitter.com/agrigence" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                <Twitter size={16} />
              </a>
              <a href="https://instagram.com/agrigence.in" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-pink-600 hover:text-white transition-all shadow-sm">
                <Instagram size={16} />
              </a>
              <a href="https://linkedin.com/company/agrigence" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-blue-700 hover:text-white transition-all shadow-sm">
                <Linkedin size={16} />
              </a>
              <a href="https://youtube.com/@agrigence" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                <Youtube size={16} />
              </a>
              <a href="https://wa.me/919452571317" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-green-500 hover:text-white transition-all shadow-sm">
                <MessageCircle size={16} />
              </a>
              <a href="https://t.me/agrigence" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-sky-600 hover:text-white transition-all shadow-sm">
                <Send size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Journal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about-journal" className="hover:text-agri-secondary transition-colors">About Journal</Link></li>
              <li><Link to="/aim-scope" className="hover:text-agri-secondary transition-colors">Aim & Scope</Link></li>
              <li><Link to="/editorial-board" className="hover:text-agri-secondary transition-colors">Editorial Board</Link></li>
              <li><Link to="/submission" className="hover:text-agri-secondary transition-colors font-semibold text-agri-secondary">Manuscript Submission</Link></li>
              <li><Link to="/subscription" className="hover:text-agri-secondary transition-colors">Journal Subscription</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Policies</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/author-guidelines" className="hover:text-agri-secondary transition-colors">Author Guidelines</Link></li>
              <li><Link to="/publication-ethics" className="hover:text-agri-secondary transition-colors">Publication Ethics</Link></li>
              <li><Link to="/privacy" className="hover:text-agri-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-agri-secondary transition-colors">Terms of Service</Link></li>
              <li><Link to="/copyright" className="hover:text-agri-secondary transition-colors">Copyright Notice</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-widest">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tools" className="hover:text-agri-secondary transition-colors">Agri Intelligence Tools</Link></li>
              <li><a href="https://icar.org.in/" target="_blank" rel="noopener noreferrer" className="hover:text-agri-secondary transition-colors">ICAR</a></li>
              <li><a href="https://agricoop.nic.in/" target="_blank" rel="noopener noreferrer" className="hover:text-agri-secondary transition-colors">Agriculture Dept. India</a></li>
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
                <a href="mailto:agrigence@gmail.com" className="hover:text-agri-secondary transition-colors">agrigence@gmail.com</a>
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
