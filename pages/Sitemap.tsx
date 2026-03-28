import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Sitemap: React.FC = () => {
  return (
    <div className="bg-agri-bg min-h-screen py-24">
      <SEO 
        title="Sitemap | Agrigence"
        description="Navigate through Agrigence's agricultural intelligence platform, tools, and research."
      />
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-serif font-bold text-agri-primary mb-12">HTML Sitemap</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-bold text-agri-primary mb-4 border-b border-stone-200 pb-2">Main Pages</h2>
            <ul className="space-y-3">
              <li><Link to="/" className="text-stone-600 hover:text-agri-secondary">Home</Link></li>
              <li><Link to="/about-contact" className="text-stone-600 hover:text-agri-secondary">About & Contact</Link></li>
              <li><Link to="/tools" className="text-stone-600 hover:text-agri-secondary">Agri-Intelligence Tools</Link></li>
              <li><Link to="/blogs" className="text-stone-600 hover:text-agri-secondary">Research & Knowledge (Blogs)</Link></li>
              <li><Link to="/journals" className="text-stone-600 hover:text-agri-secondary">Journals</Link></li>
              <li><Link to="/products" className="text-stone-600 hover:text-agri-secondary">Agri-Store</Link></li>
              <li><Link to="/submission" className="text-stone-600 hover:text-agri-secondary">Submit Content</Link></li>
              <li><Link to="/subscription" className="text-stone-600 hover:text-agri-secondary">Subscription Plans</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-agri-primary mb-4 border-b border-stone-200 pb-2">Legal & Support</h2>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-stone-600 hover:text-agri-secondary">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-stone-600 hover:text-agri-secondary">Privacy Policy</Link></li>
              <li><Link to="/author-guidelines" className="text-stone-600 hover:text-agri-secondary">Author Guidelines</Link></li>
              <li><Link to="/sitemap" className="text-stone-600 hover:text-agri-secondary">Sitemap</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
