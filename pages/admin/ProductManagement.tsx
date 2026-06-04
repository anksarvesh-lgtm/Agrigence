
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Product } from '../../types';
import { Search, Plus, Image as ImageIcon, Trash2, Edit, ExternalLink, Link as LinkIcon, Save, X, Upload, Loader2 } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [isUploading, setIsUploading] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setProducts([...(await mockBackend.getProducts())]);
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    const isConfirmed = await confirm({
        message: 'Delete product?',
        type: 'danger',
        trigger: e.currentTarget
    });

    if(isConfirmed) {
        await mockBackend.deleteProduct(id);
        loadProducts();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await mockBackend.uploadToBlob(file, 'products');
        setEditingProduct({ ...editingProduct, imageUrl: url });
      } catch (error) {
        console.error("Upload failed", error);
        alert("Image upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-admin-text">Agri-Store Products</h1>
        <button 
          onClick={() => { setEditingProduct({ category: 'Book', stockStatus: 'IN_STOCK' }); setIsModalOpen(true); }}
          className="bg-agri-secondary text-white hover:bg-agri-primary px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md text-sm"
        >
          <Plus size={18} /> ADD PRODUCT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
            <div key={product.id} className="bg-white border border-admin-border rounded-3xl overflow-hidden group hover:border-agri-secondary transition-all shadow-sm">
                <div className="h-56 relative bg-admin-hover">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="bg-white/80 p-2 rounded-lg text-admin-text hover:bg-agri-secondary hover:text-white shadow-md"><Edit size={16}/></button>
                        <button onClick={(e) => handleDelete(product.id, e)} className="bg-white/80 p-2 rounded-lg text-admin-text hover:bg-red-500 hover:text-white shadow-md"><Trash2 size={16}/></button>
                    </div>
                    {product.stockStatus === 'OUT_OF_STOCK' && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <span className="text-red-500 font-bold border-2 border-red-500 px-4 py-2 uppercase tracking-wider text-xs">Out of Stock</span>
                        </div>
                    )}
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-admin-text font-bold truncate pr-2 text-lg">{product.name}</h3>
                        <span className="text-agri-secondary font-black">₹{product.price}</span>
                    </div>
                    <div className="text-admin-secondary text-xs mb-6 line-clamp-2 h-8 leading-relaxed overflow-hidden" dangerouslySetInnerHTML={{ __html: product.description }} />
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-agri-secondary bg-agri-secondary/10 px-3 py-1 rounded-full border border-agri-secondary/10">{product.category}</span>
                        {product.buyLink !== '#' && (
                            <a href={product.buyLink} target="_blank" rel="noreferrer" className="text-admin-muted hover:text-agri-primary flex items-center gap-1 transition-colors">
                                <ExternalLink size={12}/> LINK
                            </a>
                        )}
                    </div>
                </div>
            </div>
        ))}
        {products.length === 0 && <div className="col-span-full py-20 text-center text-admin-muted italic">No products found.</div>}
      </div>

       {/* Comprehensive Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xl rounded-3xl border border-admin-border shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-admin-border flex justify-between items-center bg-admin-header">
                    <h3 className="text-2xl font-serif font-bold text-admin-text">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="text-admin-muted hover:text-admin-text" /></button>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar bg-admin-bg">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Product Name</label>
                        <input className="w-full bg-white border border-admin-inputBorder rounded-xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" placeholder="e.g. Rice Cultivation Masterclass" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Price (₹)</label>
                            <input className="w-full bg-white border border-admin-inputBorder rounded-xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus" placeholder="799" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Category</label>
                            <select className="w-full bg-white border border-admin-inputBorder rounded-xl p-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus appearance-none" value={editingProduct.category || 'Book'} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                                <option>Book</option>
                                <option>Store</option>
                                <option>Seeds</option>
                                <option>Fertilizer</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Product Image</label>
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-admin-hover rounded-xl border border-admin-border flex items-center justify-center text-admin-muted overflow-hidden shrink-0 relative group">
                                {isUploading ? (
                                    <Loader2 className="animate-spin text-agri-secondary" size={24} />
                                ) : editingProduct.imageUrl ? (
                                    <img src={editingProduct.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={24} />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className={`flex items-center gap-2 cursor-pointer bg-white hover:bg-admin-hover px-4 py-3 rounded-xl border border-admin-border text-xs font-bold text-admin-text transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
                                    {isUploading ? 'Uploading...' : 'Upload Image'}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                </label>
                                <input className="w-full bg-white border border-admin-inputBorder rounded-xl p-3 text-admin-secondary outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus text-[10px] font-mono" placeholder="Or enter image URL..." value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} disabled={isUploading} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Purchase / Detail Link</label>
                        <div className="relative">
                            <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-muted" />
                            <input className="w-full bg-white border border-admin-inputBorder rounded-xl pl-12 pr-4 py-4 text-admin-text outline-none focus:border-admin-inputFocus focus:ring-1 focus:ring-admin-inputFocus text-xs" placeholder="https://amazon.in/..." value={editingProduct.buyLink || ''} onChange={e => setEditingProduct({...editingProduct, buyLink: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-admin-secondary mb-2 block tracking-widest">Description (HTML Support)</label>
                        <ReactQuill 
                            theme="snow"
                            value={editingProduct.description || ''}
                            onChange={(val) => setEditingProduct({...editingProduct, description: val})}
                            modules={quillModules}
                            className="bg-white rounded-xl overflow-hidden border border-admin-inputBorder"
                        />
                    </div>
                </div>
                <div className="p-8 border-t border-admin-border flex justify-end gap-4 bg-admin-header">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-admin-secondary hover:text-admin-text font-bold text-xs uppercase tracking-widest">Cancel</button>
                    <button onClick={handleSave} className="bg-agri-secondary text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-agri-primary transition-colors">
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
