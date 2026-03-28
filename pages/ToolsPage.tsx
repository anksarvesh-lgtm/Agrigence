
import React, { useState, Suspense } from 'react';
import { Wrench, ChevronLeft, Tractor, Microscope, Sprout, LineChart, Calculator, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TOOL_SECTIONS } from '../config/toolsConfig';
import ToolSkeleton from '../components/ToolSkeleton';
import { useAuth } from '../App';
import { canAccessResearch } from '../utils/planAccess';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

const iconMap: Record<string, React.ReactNode> = {
  Tractor: <Tractor className="w-8 h-8" />,
  Microscope: <Microscope className="w-8 h-8" />,
  Sprout: <Sprout className="w-8 h-8" />,
  LineChart: <LineChart className="w-8 h-8" />,
  Calculator: <Calculator className="w-8 h-8" />,
  Wrench: <Wrench className="w-8 h-8" />
};

const categoryComponents: Record<string, React.LazyExoticComponent<React.ComponentType<{ onBack: () => void }>>> = {
  agri_intelligence: React.lazy(() => import('./toolCategories/agri_intelligence/index')),
  finance: React.lazy(() => import('./toolCategories/finance/index')),
  general: React.lazy(() => import('./toolCategories/general/index')),
  research: React.lazy(() => import('./toolCategories/research/index')),
  soil: React.lazy(() => import('./toolCategories/soil/index')),
  statistics: React.lazy(() => import('./toolCategories/statistics/index')),
};

import DataStorageNotice from '../components/DataStorageNotice';

const ToolsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const renderCategoryView = () => {
    if (!activeCategory) return null;

    const CategoryComponent = categoryComponents[activeCategory];

    if (!CategoryComponent) {
      return <div>Category not found.</div>;
    }

    return (
      <div className="mt-8">
        <DataStorageNotice />
        <Suspense fallback={<ToolSkeleton />}>
          <CategoryComponent onBack={() => setActiveCategory(null)} />
        </Suspense>
      </div>
    );
  };

  return (
    <div className="bg-agri-bg min-h-screen">
      <SEO 
        title="Agricultural Tools & Calculators | Agrigence"
        description="Explore our suite of specialized agricultural tools, calculators, and utilities designed for farmers and researchers to optimize agricultural outcomes."
      />

      {/* HERO SECTION */}
      <section className="relative h-[50vh] flex items-center bg-agri-primary text-white overflow-hidden mb-16">
        <div className="absolute inset-0">
           <OptimizedImage 
             src="https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?q=80&w=2070&auto=format&fit=crop" 
             alt="Agricultural tools and precision farming equipment" 
             title="Precision Agriculture Tools"
             className="w-full h-full object-cover"
             priority={true}
           />
           <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent z-10"></div>
        </div>

        <div className="container mx-auto px-6 relative z-30">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-agri-secondary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-agri-secondary">Agrigence Tools</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-[1.1] text-white">
              Agricultural Intelligence Tools
            </h1>
            <p className="text-lg text-white/80 font-light leading-relaxed max-w-xl">
              Explore our suite of specialized tools designed for farmers and researchers to optimize agricultural outcomes.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-24">
        <DataStorageNotice />
        {!activeCategory ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOL_SECTIONS.map((section) => (
            <motion.div
              key={section.id}
              whileHover={{ y: -5 }}
              onClick={() => handleCategoryClick(section.id)}
              className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-agri-primary/5 rounded-2xl flex items-center justify-center text-agri-primary mb-6 group-hover:bg-agri-primary group-hover:text-white transition-colors">
                {iconMap[section.icon]}
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">{section.label}</h3>
              <p className="text-stone-500 text-sm">
                Explore tools and utilities for {section.label.toLowerCase()}.
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        renderCategoryView()
      )}
      </div>
    </div>
  );
};

export default ToolsPage;
