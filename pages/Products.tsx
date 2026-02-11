
import React from 'react';
import { mockBackend } from '../services/mockBackend';
import { ShoppingBag, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';

const Products: React.FC = () => {
  const products = mockBackend.getProducts();
  const books = products.filter(p => p.category === 'Book');
  const storeItems = products.filter(p => p.category === 'Store');

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-premium transition-all group flex flex-col h-full"
    >
      <div className="h-56 bg-stone-100 overflow-hidden relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-2">
           <span className="text-[10px] font-bold uppercase tracking-widest text-agri-gold border border-agri-gold/30 px-2 py-1 rounded-full">{product.category}</span>
        </div>
        <h3 className="font-serif font-bold text-[#0F392B] text-lg mb-2 leading-tight">{product.name}</h3>
        <p className="text-xl font-bold text-agri-secondary mb-3">₹{product.price}</p>
        <p className="text-sm text-stone-500 line-clamp-2 mb-6 flex-1">{product.description}</p>
        <a 
          href={product.buyLink} 
          target="_blank" 
          rel="noreferrer"
          className="block w-full text-center bg-[#0F392B] text-white py-3 rounded-xl hover:bg-agri-gold hover:text-[#0F392B] transition-all font-bold text-sm shadow-lg shadow-[#0F392B]/10"
        >
          Purchase Now
        </a>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-agri-bg">
      {/* Header */}
      <div className="bg-[#0F392B] text-white py-16 px-6 relative overflow-hidden">
         {/* Background Image */}
         <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1474447976065-67d23accb1e3?q=80&w=2085&auto=format&fit=crop" 
              alt="Harvest Market" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F392B] to-[#0F392B]/80"></div>
         </div>

         <div className="container mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Agri Store</h1>
            <p className="text-xl text-stone-300 font-light">Curated resources, books, and equipment for the modern agriculturist.</p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        
        {/* Books Section */}
        {books.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-10 border-b border-stone-200 pb-4">
              <div className="p-3 bg-agri-gold/10 rounded-full text-agri-gold">
                 <BookOpen size={24} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#0F392B]">Academic Resources & Books</h2>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {books.map(book => <ProductCard key={book.id} product={book} />)}
            </div>
          </section>
        )}

        {/* Store Section */}
        {storeItems.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-10 border-b border-stone-200 pb-4">
              <div className="p-3 bg-agri-gold/10 rounded-full text-agri-gold">
                 <ShoppingBag size={24} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#0F392B]">Equipment & Supplies</h2>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {storeItems.map(item => <ProductCard key={item.id} product={item} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Products;
