
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Product } from '../../types';
import { Search, Plus, Image as ImageIcon, Trash2, Edit, ExternalLink, Link as LinkIcon, Save, X, Upload } from 'lucide-react';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts([...mockBackend.getProducts()]);
  };

  const handleSave = async () => {
    if(!editingProduct.name || !editingProduct.price) return alert("Name and Price are required");
    
    if(editingProduct.id) {
        await mockBackend.updateProduct(editingProduct as Product);
    } else {
        await mockBackend.addProduct({
            ...editingProduct,
            stockStatus: editingProduct.stockStatus || 'IN_STOCK',
            category: editingProduct.category || 'Book',
            buyLink: editingProduct.buyLink || '#',
            imageUrl: editingProduct.imageUrl || `https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400`
        } as Product);
    }
    setIsModalOpen(false);
    setEditingProduct({});
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete product?')) {
        await mockBackend.deleteProduct(id);
        loadProducts();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Agri-Store Products</h1>
        <button 
          onClick={() => { setEditingProduct({ category: 'Book', stockStatus: 'IN_STOCK' }); setIsModalOpen(true); }}
          className="bg-agri-secondary text-agri-primary hover:bg-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-xl shadow-agri-secondary/10 text-sm"
        >
          <Plus size={18} /> ADD PRODUCT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
            <div key={product.id} className="bg-white/5 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden group hover:border-agri-secondary transition-all">
                <div className="h-56 relative bg-black/40">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="bg-black/60 p-2 rounded-lg text-white hover:bg-agri-secondary hover:text-agri-primary"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(product.id)} className="bg-black/60 p-2 rounded-lg text-white hover:bg-red-500"><Trash2 size={16}/></button>
                    </div>
                    {product.stockStatus === 'OUT_OF_STOCK' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-bold border-2 border-white px-4 py-2 uppercase tracking-wider text-xs">Out of Stock</span>
                        </div>
                    )}
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-bold truncate pr-2 text-lg">{product.name}</h3>
                        <span className="text-agri-secondary font-black">₹{product.price}</span>
                    </div>
                    <p className="text-white/40 text-xs mb-6 line-clamp-2 h-8 leading-relaxed">{product.description}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-agri-secondary bg-white/5 px-3 py-1 rounded-full border border-white/5">{product.category}</span>
                        {product.buyLink !== '#' && (
                            <a href={product.buyLink} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                                <ExternalLink size={12}/> LINK
                            </a>
                        )}
                    </div>
                </div>
            </div>
        ))}
        {products.length === 0 && <div className="col-span-full py-20 text-center text-white/20 italic">No products found.</div>}
      </div>

       {/* Comprehensive Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-[#1C2A22] w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <h3 className="text-2xl font-serif font-bold text-white">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="text-white/40 hover:text-white" /></button>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Product Name</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" placeholder="e.g. Rice Cultivation Masterclass" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Price (₹)</label>
                            <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary" placeholder="799" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Category</label>
                            <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary appearance-none" value={editingProduct.category || 'Book'} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                                <option className="bg-agri-primary">Book</option>
                                <option className="bg-agri-primary">Store</option>
                                <option className="bg-agri-primary">Seeds</option>
                                <option className="bg-agri-primary">Fertilizer</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Product Image</label>
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white/20 overflow-hidden shrink-0 relative group">
                                {editingProduct.imageUrl ? <img src={editingProduct.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={24} />}
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl border border-white/10 text-xs font-bold text-white transition-all">
                                    <Upload size={14} /> Upload Image
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white/50 outline-none focus:border-agri-secondary text-[10px] font-mono" placeholder="Or enter image URL..." value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Purchase / Detail Link</label>
                        <div className="relative">
                            <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                            <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-agri-secondary text-xs" placeholder="https://amazon.in/..." value={editingProduct.buyLink || ''} onChange={e => setEditingProduct({...editingProduct, buyLink: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block tracking-widest">Description</label>
                        <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-agri-secondary h-24" placeholder="Brief product overview..." value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}></textarea>
                    </div>
                </div>
                <div className="p-8 border-t border-white/5 flex justify-end gap-4 bg-black/10">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest">Cancel</button>
                    <button onClick={handleSave} className="bg-agri-secondary text-agri-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-agri-secondary/10">
                        <Save size={18} /> {editingProduct.id ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
                    </button>
                </div>
            </div>
        </div>
       )}
    </div>
  );
};

export default ProductManagement;
