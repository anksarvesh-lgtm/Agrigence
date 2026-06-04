import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, ExternalLink, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { GovtScheme } from '../../types';

export const GovSchemes: React.FC<{ hideBack?: boolean }> = ({ hideBack }) => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedScheme, setExpandedScheme] = useState<string | number | null>(null);
    const [dbSchemes, setDbSchemes] = useState<any[]>([]);

    useEffect(() => {
        const fetchDbSchemes = async () => {
            const data = await mockBackend.getGovtSchemes();
            const mappedDbSchemes = data.map((scheme: GovtScheme) => ({
                id: scheme.id,
                title: scheme.title,
                desc: scheme.description,
                detailedDesc: scheme.detailedDesc || scheme.description,
                status: scheme.isActive ? "Active" : "Inactive",
                tags: scheme.tags?.length ? scheme.tags : [scheme.category, scheme.state || 'National'],
                category: scheme.category === 'SUBSIDY' ? 'Subsidy' : scheme.category === 'LOAN' ? 'Credit & Loan' : scheme.category === 'DEADLINE' ? 'Deadline' : 'Other',
                subsidy: scheme.subsidyAmount || scheme.category,
                eligibility: scheme.eligibility || "Refer to official guidelines.",
                documents: scheme.documents?.length ? scheme.documents : ["Aadhaar Card", "Bank passbook"],
                applyLink: scheme.link || "#"
            }));
            const validSchemes = mappedDbSchemes.filter(s => s.status === 'Active');
            setDbSchemes(validSchemes);
        };
        fetchDbSchemes();
    }, []);

    const categories = ['All', 'Income Support', 'Crop Insurance', 'Subsidy', 'Credit & Loan', 'Infrastructure', 'Digital & Tech', 'Other'];

    const filteredSchemes = dbSchemes.filter(scheme => {
        const categoryMatch = selectedCategory === 'All' || scheme.category === selectedCategory;
        const searchMatch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) || scheme.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && searchMatch;
    });

    return (
        <div className="min-h-full p-6 md:p-12 bg-stone-50 font-sans pb-32">
            <header className="max-w-5xl mx-auto mb-10">
                {!hideBack && (
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-stone-500 font-bold text-sm uppercase tracking-widest hover:text-[#2d5a27] transition-colors mb-4"
                >
                   ← Back
                </button>
                )}
                <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-2">Government Schemes & Subsidies</h1>
                <p className="text-stone-500 text-lg font-medium">Verified repository of Central and State agricultural support programs.</p>
            </header>

            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 mb-10">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search for schemes, subsidies, keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-2xl pl-12 pr-6 py-4 text-stone-800 font-bold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/20 focus:border-[#2d5a27] transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="max-w-5xl mx-auto flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-none snap-x">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all snap-start ${selectedCategory === cat ? 'bg-[#2d5a27] text-white shadow-md' : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
                {filteredSchemes.map((scheme, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={scheme.id} 
                        className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:border-[#2d5a27]/30 transition-all duration-300"
                    >
                        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer" onClick={() => setExpandedScheme(expandedScheme === scheme.id ? null : scheme.id)}>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <h3 className="font-bold text-xl md:text-2xl text-stone-800 tracking-tight">{scheme.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${scheme.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {scheme.status}
                                    </span>
                                </div>
                                <p className="text-stone-500 font-medium max-w-3xl leading-relaxed">{scheme.desc}</p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {scheme.tags.map((tag: string) => (
                                        <span key={tag} className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-600">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-end md:w-auto w-full pt-4 md:pt-0 border-t md:border-t-0 border-stone-100">
                                <button className="p-3 bg-stone-50 text-stone-600 rounded-full hover:bg-stone-100 transition-colors">
                                    {expandedScheme === scheme.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedScheme === scheme.id && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-stone-100 bg-stone-50/50 overflow-hidden"
                                >
                                    <div className="p-6 md:p-8 space-y-8">
                                        <div>
                                            <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Overview</h4>
                                            <div 
                                                className="prose prose-stone prose-sm max-w-none text-stone-700 font-medium leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: scheme.detailedDesc }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-white p-6 rounded-2xl border border-stone-200">
                                                <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-3">Core Benefit / Subsidy</h4>
                                                <p className="text-[#2d5a27] font-bold text-lg">{scheme.subsidy}</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-2xl border border-stone-200">
                                                <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-3">Eligibility Criteria</h4>
                                                <p className="text-stone-700 font-medium leading-relaxed">{scheme.eligibility}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-3">Required Documents</h4>
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {scheme.documents.map((doc: string, idx: number) => (
                                                    <li key={idx} className="flex items-center gap-2 text-stone-700 font-medium text-sm">
                                                        <CheckCircle size={16} className="text-emerald-500 shrink-0" /> {doc}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row gap-4 border-t border-stone-200">
                                            <a 
                                                href={scheme.applyLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 bg-[#2d5a27] text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/20"
                                            >
                                                Apply on Official Portal <ExternalLink size={18} />
                                            </a>
                                            <button className="flex-1 flex items-center justify-center gap-2 bg-white text-stone-700 border border-stone-200 px-6 py-4 rounded-xl font-bold hover:bg-stone-50 transition-colors">
                                                <FileText size={18} /> Download Guidelines
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}

                {filteredSchemes.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
                        <FileText size={48} className="mx-auto text-stone-300 mb-4" />
                        <h3 className="text-2xl font-bold text-stone-800 mb-2">No schemes found</h3>
                        <p className="text-stone-500 font-medium">Try adjusting your search or category filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

