
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';
import { Article, EditorialMember, NewsItem, Product } from '../types';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'articles' | 'news' | 'journals' | 'members' | 'products'>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [members, setMembers] = useState<EditorialMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setArticles(await mockBackend.getArticles());
      setNews(await mockBackend.getNews());
      setMembers(await mockBackend.getMembers());
      setProducts(await mockBackend.getProducts());
    };
    fetchData();
  }, []);

  // Article Management
  const handleArticleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await mockBackend.updateArticleStatus(id, status);
    setArticles(await mockBackend.getArticles());
  };

  // News Management
  const [newNews, setNewNews] = useState({ title: '', desc: '', content: '' });
  const handleAddNews = async () => {
    if (!newNews.title) return;
    await mockBackend.addNews({ 
      title: newNews.title, 
      description: newNews.desc, 
      content: newNews.content, 
      date: new Date().toISOString().split('T')[0] 
    });
    setNews(await mockBackend.getNews());
    setNewNews({ title: '', desc: '', content: '' });
  };
  const handleDeleteNews = async (id: string) => {
    await mockBackend.deleteNews(id);
    setNews(await mockBackend.getNews());
  };

  // Member Management (Simplified)
  const [newMember, setNewMember] = useState({ name: '', designation: '', expertise: '' });
  const handleAddMember = async () => {
     if(!newMember.name) return;
     await mockBackend.addMember({
        ...newMember,
        qualification: 'PhD',
        institution: 'Zura Haradhan, Chandauli, Uttar Pradesh, 221115',
        imageUrl: `https://picsum.photos/200/200?random=${Math.random()}`
     });
     setMembers(await mockBackend.getMembers());
     setNewMember({ name: '', designation: '', expertise: '' });
  };

  // Product Management
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Book', price: '', description: '', buyLink: '' });
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    await mockBackend.addProduct({
      name: newProduct.name,
      category: newProduct.category as 'Book' | 'Store',
      price: newProduct.price,
      description: newProduct.description,
      buyLink: newProduct.buyLink || '#',
      imageUrl: `https://picsum.photos/200/300?random=${Math.random()}`,
      stockStatus: 'IN_STOCK'
    });
    setProducts(await mockBackend.getProducts());
    setNewProduct({ name: '', category: 'Book', price: '', description: '', buyLink: '' });
  };
  const handleDeleteProduct = async (id: string) => {
    await mockBackend.deleteProduct(id);
    setProducts(await mockBackend.getProducts());
  };

  const tabs = [
    { id: 'articles', label: 'Review Articles' },
    { id: 'news', label: 'Manage News' },
    { id: 'members', label: 'Editorial Board' },
    { id: 'products', label: 'Manage Store' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Admin Administration</h1>

      <div className="flex gap-2 border-b border-stone-200 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-agri-green text-agri-green' : 'text-stone-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ARTICLES TAB */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {articles.map(article => (
            <div key={article.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-stone-800">{article.title}</h3>
                <p className="text-xs text-stone-500">By {article.authorName} • {article.status}</p>
                <div className="flex gap-2 mt-2">
                   <a href={article.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">View PDF</a>
                </div>
              </div>
              {article.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => handleArticleAction(article.id, 'APPROVED')} className="p-2 text-green-600 hover:bg-green-50 rounded-full"><CheckCircle /></button>
                  <button onClick={() => handleArticleAction(article.id, 'REJECTED')} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><XCircle /></button>
                </div>
              )}
            </div>
          ))}
          {articles.length === 0 && <p className="text-stone-400 text-center">No articles found.</p>}
        </div>
      )}

      {/* NEWS TAB */}
      {activeTab === 'news' && (
        <div>
          <div className="bg-stone-50 p-4 rounded-lg mb-6 border border-stone-200">
            <h3 className="font-bold mb-3">Add Announcement</h3>
            <input className="w-full mb-2 p-2 rounded border" placeholder="Title" value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} />
            <textarea className="w-full mb-2 p-2 rounded border" placeholder="Description" value={newNews.desc} onChange={e => setNewNews({...newNews, desc: e.target.value})} />
            <button onClick={handleAddNews} className="bg-agri-green text-white px-4 py-2 rounded text-sm"><Plus size={16} className="inline" /> Add News</button>
          </div>
          <div className="space-y-3">
            {news.map(item => (
              <div key={item.id} className="bg-white p-4 rounded border flex justify-between items-start">
                 <div>
                   <h4 className="font-bold">{item.title}</h4>
                   <p className="text-xs text-stone-500">{item.date}</p>
                   <p className="text-sm mt-1">{item.description}</p>
                 </div>
                 <button onClick={() => handleDeleteNews(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === 'members' && (
        <div>
           <div className="bg-stone-50 p-4 rounded-lg mb-6 border border-stone-200">
            <h3 className="font-bold mb-3">Add Board Member</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input className="p-2 rounded border" placeholder="Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
              <input className="p-2 rounded border" placeholder="Designation" value={newMember.designation} onChange={e => setNewMember({...newMember, designation: e.target.value})} />
              <input className="p-2 rounded border" placeholder="Expertise" value={newMember.expertise} onChange={e => setNewMember({...newMember, expertise: e.target.value})} />
            </div>
            <button onClick={handleAddMember} className="bg-agri-green text-white px-4 py-2 rounded text-sm">Add Member</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
             {members.map(m => (
               <div key={m.id} className="bg-white p-4 border rounded flex items-center gap-3">
                  <img src={m.imageUrl} className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="font-bold">{m.name}</p>
                    <p className="text-xs text-stone-500">{m.designation}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div>
           <div className="bg-stone-50 p-4 rounded-lg mb-6 border border-stone-200">
            <h3 className="font-bold mb-3">Add Product</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input className="p-2 rounded border" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <select className="p-2 rounded border" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                <option value="Book">Book</option>
                <option value="Store">Store Item</option>
              </select>
              <input className="p-2 rounded border" placeholder="Price (e.g. ₹499)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <input className="p-2 rounded border" placeholder="Buy Link" value={newProduct.buyLink} onChange={e => setNewProduct({...newProduct, buyLink: e.target.value})} />
            </div>
            <textarea className="w-full mb-2 p-2 rounded border" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
            <button onClick={handleAddProduct} className="bg-agri-green text-white px-4 py-2 rounded text-sm"><Plus size={16} className="inline" /> Add Product</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
             {products.map(p => (
               <div key={p.id} className="bg-white p-4 border rounded flex items-start gap-3">
                  <img src={p.imageUrl} className="w-16 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-xs text-agri-green font-bold">{p.category} • {p.price}</p>
                    <p className="text-xs text-stone-500 line-clamp-2">{p.description}</p>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
               </div>
             ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
    