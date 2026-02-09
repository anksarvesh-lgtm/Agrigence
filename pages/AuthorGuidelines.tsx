import React from 'react';
import { FileText, CheckCircle, MessageCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthorGuidelines: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-premium border border-stone-100 overflow-hidden"
      >
        <div className="h-64 md:h-80 relative overflow-hidden">
           <img 
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover" 
            alt="Scientific Writing" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-agri-primary via-agri-primary/40 to-transparent"></div>
           <div className="absolute bottom-10 left-10 right-10">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">Author Guidelines</h1>
              <p className="text-white/80 text-sm md:text-base uppercase tracking-widest font-bold">Standardized Publication Requirements</p>
           </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-12">
              <section>
                <h2 className="text-xl font-bold text-agri-primary mb-6 flex items-center gap-3 border-b border-agri-border pb-3">
                  <FileText className="text-agri-secondary" /> Manuscript Formatting
                </h2>
                <ul className="space-y-4 text-stone-600">
                  <li className="flex gap-4">
                    <span className="w-1.5 h-1.5 bg-agri-secondary rounded-full mt-2 shrink-0"></span>
                    <span><strong>Font:</strong> Times New Roman, 12pt size for standard body text.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-1.5 h-1.5 bg-agri-secondary rounded-full mt-2 shrink-0"></span>
                    <span><strong>Line Spacing:</strong> 1.5 spacing throughout the document for readability.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-1.5 h-1.5 bg-agri-secondary rounded-full mt-2 shrink-0"></span>
                    <span><strong>Margins:</strong> Standard 1 inch (2.54 cm) on all sides.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-1.5 h-1.5 bg-agri-secondary rounded-full mt-2 shrink-0"></span>
                    <span><strong>File Format:</strong> Submissions must be in <strong>.PDF</strong> or <strong>.DOC / .DOCX</strong> format only.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-1.5 h-1.5 bg-agri-secondary rounded-full mt-2 shrink-0"></span>
                    <span><strong>Citation Style:</strong> APA or IEEE standard referencing must be strictly followed.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-agri-primary mb-6 flex items-center gap-3 border-b border-agri-border pb-3">
                  <CheckCircle className="text-agri-secondary" /> Required Sections
                </h2>
                <div className="grid gap-3">
                  {[
                    'Title Page (Title, Author Details, Affiliation)',
                    'Abstract (Max 250 words)',
                    'Introduction',
                    'Methodology / Materials & Methods',
                    'Results',
                    'Discussion',
                    'Conclusion',
                    'References'
                  ].map((section, i) => (
                    <div key={i} className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm text-stone-700 flex items-center gap-4 hover:bg-white hover:border-agri-secondary/30 transition-colors">
                      <span className="w-6 h-6 rounded-full bg-agri-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                      {section}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <div className="bg-agri-primary text-white p-8 rounded-3xl shadow-xl">
                <Info size={32} className="text-agri-secondary mb-4" />
                <h3 className="text-xl font-serif font-bold mb-4 leading-tight">Important Submission Rule</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Articles must be original and not submitted elsewhere concurrently. Plagiarism check is mandatory before review.
                </p>
                <div className="h-px bg-white/10 mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-agri-secondary">Submission Deadline</p>
                <p className="text-lg font-bold">25th of every month</p>
              </div>

              <div className="bg-stone-100 rounded-3xl p-8 border border-stone-200">
                <h3 className="text-lg font-bold text-agri-primary mb-2 flex items-center gap-2">
                  <MessageCircle size={20} className="text-agri-secondary" /> Assistance
                </h3>
                <p className="text-stone-500 text-xs mb-6">
                  Facing issues with formatting? Our support team is available 24/7.
                </p>
                <a 
                  href="https://wa.me/919452571317" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-4 rounded-xl hover:bg-[#20bd5a] transition-all font-bold text-sm shadow-lg shadow-green-100"
                >
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthorGuidelines;