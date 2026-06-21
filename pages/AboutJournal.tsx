import React from 'react';
import { BookOpen, Info, FileText, Globe, Calendar, Languages } from 'lucide-react';
import SEO from '../components/SEO';

const AboutJournal: React.FC = () => {
    return (
        <div className="min-h-screen py-20 bg-stone-50">
            <SEO 
                title="About the Journal | Agrigence"
                description="Learn about Agrigence Publication, its mission, frequency, and scope."
            />
            
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-200">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 rounded-full bg-agri-secondary/10 flex items-center justify-center text-agri-secondary">
                          <BookOpen size={32} />
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-agri-primary">About the Journal</h1>
                    </div>

                    <div className="prose prose-lg text-stone-600 leading-relaxed space-y-6 mb-12">
                        <p>
                            <strong>Agrigence Publication</strong> is an international peer-reviewed monthly online journal dedicated to promoting scientific research, innovation, and knowledge dissemination in the fields of agriculture and allied sciences. The journal serves as an academic platform for researchers, scientists, academicians, students, industry professionals, and policymakers to publish high-quality original research articles, review papers, technical notes, short communications, and case studies.
                        </p>

                        <p>
                            The journal focuses on advancing research and sustainable development in various disciplines including agriculture, agronomy, horticulture, forestry, soil science, environmental science, agricultural engineering, agribusiness, biotechnology, rural development, and emerging agricultural technologies. Agrigence aims to encourage interdisciplinary collaboration, scientific exchange, and research-driven solutions that contribute to agricultural growth, food security, environmental sustainability, and rural empowerment.
                        </p>

                        <p>
                            Agrigence Publication follows a structured academic publication framework emphasizing originality, ethical publishing practices, peer review standards, and professional scholarly communication. The journal is committed to providing accessible, credible, and research-oriented content for the academic and scientific community at both national and international levels.
                        </p>

                        <p>
                            The journal publishes scholarly content in online format and continuously works towards strengthening scientific awareness, digital research accessibility, and academic collaboration through its publication activities and digital knowledge initiatives.
                        </p>
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-agri-primary mb-8 border-t border-stone-200 pt-10">Journal Details</h2>
                    
                    <div className="grid md:grid-cols-2 gap-y-6 gap-x-12">
                        {[
                            { label: 'Journal Name', value: 'Agrigence Publication' },
                            { label: 'Starting Year', value: '2026' },
                            { label: 'Frequency', value: 'Monthly' },
                            { label: 'Format', value: 'Online' },
                            { label: 'Language', value: 'English' },
                            { label: 'Publication Type', value: 'Peer-Reviewed Academic Journal' },
                            { label: 'Subject Area', value: 'Agriculture & Allied Sciences' },
                            { label: 'ISSN Status', value: 'Applied For' },
                            { label: 'Publisher', value: 'Agrigence Teams' },
                            { label: 'Country', value: 'India' }
                        ].map((detail, i) => (
                            <div key={i} className="flex flex-col border-b border-stone-100 pb-4">
                                <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">{detail.label}</span>
                                <span className="text-sm font-semibold text-agri-primary">{detail.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutJournal;
