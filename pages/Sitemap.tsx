import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { mockBackend } from '../services/mockBackend';
import { Article, NewsItem, Magazine, Product } from '../types';

const Sitemap: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
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
    
    const unsubNews = mockBackend.subscribeToNews(setNews);
    const unsubMagazines = mockBackend.subscribeToMagazines(setMagazines);
    const unsubProducts = mockBackend.subscribeToProducts(setProducts);
    
    return () => {
        unsubNews();
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
              <li><Link to="/tools" className="text-stone-600 hover:text-agri-secondary">Agri-Intelligence Tools</Link></li>
              <li><Link to="/blogs" className="text-stone-600 hover:text-agri-secondary">Research & Knowledge (Blogs)</Link></li>
              <li><Link to="/journals" className="text-stone-600 hover:text-agri-secondary">Journals</Link></li>
              <li><Link to="/products" className="text-stone-600 hover:text-agri-secondary">Agri-Store</Link></li>
              <li><Link to="/submission" className="text-stone-600 hover:text-agri-secondary">Submit Content</Link></li>
              <li><Link to="/subscription" className="text-stone-600 hover:text-agri-secondary">Subscription Plans</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-agri-primary mb-4 border-b border-stone-200 pb-2">Dynamic Content</h2>
            <ul className="space-y-3">
              {articles.map(a => <li key={a.id}><Link to={`/article/${a.slug}`} className="text-stone-600 hover:text-agri-secondary">{a.title}</Link></li>)}
              {news.map(n => <li key={n.id}><Link to={`/news/${n.id}`} className="text-stone-600 hover:text-agri-secondary">{n.title}</Link></li>)}
              {magazines.map(m => <li key={m.id}><Link to={`/journals/${m.id}`} className="text-stone-600 hover:text-agri-secondary">{m.title}</Link></li>)}
              {products.map(p => <li key={p.id}><Link to={`/products/${p.id}`} className="text-stone-600 hover:text-agri-secondary">{p.name}</Link></li>)}
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
