import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { mockBackend } from '../services/mockBackend';
import { Article, Magazine, Product } from '../types';

const Sitemap: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allArticles = await mockBackend.getArticles();
      setArticles(allArticles.filter(a => a.status === 'PUBLISHED'));
      
      // Note: mockBackend doesn't have a direct getNews/Magazines/Products without subscription
      // I'll use the subscription methods or check if there are direct get methods.
      // Looking at mockBackend.ts, it has getCollectionData which is private.
      // I'll need to use the subscription methods.
    };
    fetchData();
    
    const unsubMagazines = mockBackend.subscribeToMagazines(setMagazines);
    const unsubProducts = mockBackend.subscribeToProducts(setProducts);
    
    return () => {
        unsubMagazines();
        unsubProducts();
    };
  }, []);

  return (
    <div className="bg-stone-50 min-h-screen py-24">
      <SEO 
        title="Sitemap | Agrigence"
        description="Navigate through Agrigence's agricultural intelligence platform, tools, and research."
      />
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-4xl font-serif font-bold text-agri-primary mb-12">Site Map</h1>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h2 className="text-xl font-bold text-agri-primary mb-4 border-b border-stone-200 pb-2">Main Pages</h2>
            <ul className="space-y-3">
              <li><Link to="/" className="text-stone-600 hover:text-agri-secondary">Home</Link></li>
              <li><Link to="/about-contact" className="text-stone-600 hover:text-agri-secondary">About & Contact</Link></li>
              <li><Link to="/consultation" className="text-stone-600 hover:text-agri-secondary">Consultation</Link></li>
              <li><Link to="/mobile-app" className="text-stone-600 hover:text-agri-secondary">Mobile App</Link></li>
              <li><Link to="/journals" className="text-stone-600 hover:text-agri-secondary">Journals</Link></li>
              <li><Link to="/products" className="text-stone-600 hover:text-agri-secondary">Agri-Store</Link></li>
              <li><Link to="/submission" className="text-stone-600 hover:text-agri-secondary">Submit Content</Link></li>
              <li><Link to="/subscription" className="text-stone-600 hover:text-agri-secondary">Subscription Plans</Link></li>
              <li><Link to="/publication-ethics" className="text-stone-600 hover:text-agri-secondary">Publication Ethics</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-agri-primary mb-4 border-b border-stone-200 pb-2">Research Repository</h2>
            <ul className="space-y-3">
              {articles.map(a => <li key={a.id}><Link to={`/view/${a.id}`} className="text-stone-600 hover:text-agri-secondary">{a.title}</Link></li>)}
              {magazines.map(m => <li key={m.id}><Link to="/journals" className="text-stone-600 hover:text-agri-secondary">{m.title} (Issue {m.issueNumber})</Link></li>)}
              {products.map(p => <li key={p.id}><Link to="/products" className="text-stone-600 hover:text-agri-secondary">{p.name}</Link></li>)}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-agri-primary mb-4 border-b border-stone-200 pb-2">Tools & Utilities</h2>
            <ul className="space-y-3">
              <li><Link to="/image-tools" className="text-stone-600 hover:text-agri-secondary">Image Compressor & Resizer</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-agri-primary mb-4 border-b border-stone-200 pb-2">Legal & Support</h2>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-stone-600 hover:text-agri-secondary">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-stone-600 hover:text-agri-secondary">Privacy Policy</Link></li>
              <li><Link to="/author-guidelines" className="text-stone-600 hover:text-agri-secondary">Author Guidelines</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
