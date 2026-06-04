import React, { useState } from 'react';
import { Mail, MessageCircle, FileText, CheckCircle, UploadCloud } from 'lucide-react';
import SEO from '../components/SEO';

const Submission: React.FC = () => {
    
    return (
        <div className="min-h-screen py-20 bg-stone-50">
            <SEO 
                title="Manuscript Submission | Agrigence"
                description="Submit your agricultural research manuscripts and articles to Agrigence Journal."
            />
            
            <div className="container mx-auto px-6 max-w-4xl">
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-200">
                <h1 className="text-4xl font-serif font-bold text-agri-primary mb-10">Manuscript Submission Policy</h1>
                
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-10">
                    <p className="text-sm font-bold text-amber-900">
                        IMPORTANT: No account registration or login is required to submit a manuscript.
                    </p>
                </div>

                <div className="space-y-8 mb-12">
                    <h3 className="text-xl font-bold text-agri-primary">How to Submit</h3>
                    <p className="text-stone-600">Authors can directly submit their manuscripts using either of the following methods:</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <a href="mailto:agrigence@gmail.com" className="bg-stone-100 p-6 rounded-2xl flex items-center gap-4 hover:bg-stone-200 transition-all">
                            <Mail className="text-agri-secondary" />
                            <div>
                                <h4 className="font-bold text-agri-primary">Email Submission</h4>
                                <span className="text-xs text-agri-secondary underline">agrigence@gmail.com</span>
                            </div>
                        </a>
                        <a href="#" className="bg-stone-100 p-6 rounded-2xl flex items-center gap-4 hover:bg-stone-200 transition-all">
                            <MessageCircle className="text-agri-secondary" />
                            <div>
                                <h4 className="font-bold text-agri-primary">WhatsApp Submission</h4>
                                <span className="text-xs text-agri-secondary">+919452571317</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                     <div>
                        <h4 className="font-bold text-agri-primary mb-4">Accepted Formats</h4>
                        <ul className="space-y-2 text-sm text-stone-600">
                            <li>• DOC</li>
                            <li>• DOCX</li>
                            <li>• PDF</li>
                        </ul>
                     </div>
                     <div>
                        <h4 className="font-bold text-agri-primary mb-4">Required Author Details</h4>
                        <ul className="space-y-2 text-sm text-stone-600">
                            <li>• Full Name</li>
                            <li>• Affiliation</li>
                            <li>• Email Address</li>
                            <li>• Contact Number</li>
                            <li>• Article Title</li>
                        </ul>
                     </div>
                </div>

                <div className="border-t border-stone-200 pt-10">
                    <h3 className="text-xl font-bold text-agri-primary mb-8">Simple Submission Process</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: '1', title: 'Prepare', desc: 'As per author guidelines.' },
                            { step: '2', title: 'Submit', desc: 'Via Email or WhatsApp.' },
                            { step: '3', title: 'Review', desc: 'Editorial team reviews.' },
                            { step: '4', title: 'Communicate', desc: 'Receive status update.' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="w-12 h-12 bg-agri-secondary text-agri-primary rounded-full flex items-center justify-center mx-auto mb-4 font-black text-lg">{s.step}</div>
                                <h4 className="font-bold text-agri-primary text-sm mb-1">{s.title}</h4>
                                <p className="text-xs text-stone-500">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
        </div>
    );
};

export default Submission;
