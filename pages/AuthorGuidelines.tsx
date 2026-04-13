
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, CheckCircle, AlertTriangle, Scale, Mail, Globe, Anchor, ChevronRight, Hash, Clock, ShieldCheck } from 'lucide-react';

const AuthorGuidelines: React.FC = () => {
  
  useEffect(() => {
    document.title = "Author Guidelines | Agrigence";
    // Basic SEO meta tag injection for SPA context
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Comprehensive submission standards, formatting rules, ethics policy, and peer-review workflows for authors publishing with Agrigence.');
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const sections = [
    { id: 'intro', title: '1. Introduction' },
    { id: 'scope', title: '2. Scope of Journal' },
    { id: 'types', title: '3. Types of Manuscripts' },
    { id: 'prep', title: '4. Manuscript Preparation' },
    { id: 'formatting', title: '5. Formatting Requirements' },
    { id: 'abstract', title: '6. Abstract & Keywords' },
    { id: 'referencing', title: '7. Referencing Style' },
    { id: 'ethics', title: '8. Ethics & Integrity' },
    { id: 'ai-policy', title: '9. AI & Plagiarism Policy' },
    { id: 'review', title: '10. Peer Review Process' },
    { id: 'revision', title: '11. Revision Guidelines' },
    { id: 'copyright', title: '12. Copyright & Licensing' },
    { id: 'contact', title: '13. Contact Information' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Hero Header */}
      <div className="bg-[#3D2B1F] text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
           <img 
             src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=2000" 
             className="w-full h-full object-cover opacity-20"
             alt="Academic Writing"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-[#3D2B1F] to-[#3D2B1F]/80"></div>
        </div>
        <div className="container mx-auto relative z-10 max-w-6xl">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
             <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
                 <BookOpen size={16} className="text-[#C29263]" />
                 <span className="text-xs font-bold tracking-widest uppercase">Submission Protocols</span>
             </div>
             <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Author Guidelines</h1>
             <p className="text-xl text-stone-300 font-light max-w-2xl leading-relaxed">
               Essential standards for preparing and submitting your research to Agrigence. Please review these protocols carefully to ensure a smooth publication process.
             </p>
           </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Main Content Area */}
          <div className="flex-1 space-y-16">
            
            {/* 1. Introduction */}
            <section id="intro" className="scroll-mt-32">
              <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans">01</span>
                Introduction
              </h2>
              <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                <p>
                  Agrigence is an international platform dedicated to advancing agricultural knowledge, innovation, and interdisciplinary research. We welcome high-quality submissions that contribute to scientific understanding, practical application, and sustainable agricultural development worldwide.
                </p>
                <p className="mt-4">
                  These Author Guidelines are designed to help contributors prepare manuscripts that meet the academic, ethical, and technical standards required for publication in our journals and magazines.
                </p>
              </div>
            </section>

            {/* 2. Scope */}
            <section id="scope" className="scroll-mt-32">
              <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans">02</span>
                Scope of the Journal
              </h2>
              <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                <p className="text-stone-600 mb-6">Agrigence publishes original and impactful work in areas including, but not limited to:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Sustainable Agriculture',
                    'Soil Science & Nutrient Management',
                    'Crop Production & Protection',
                    'Agricultural Engineering & Technology',
                    'Agri-Tech & Precision Farming',
                    'Water Resource Management',
                    'Agribusiness & Rural Development',
                    'Environmental Sustainability',
                    'Policy & Extension Education',
                    'Horticulture & Forestry'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
                      <CheckCircle size={16} className="text-[#C29263] mt-1 shrink-0" />
                      <span className="text-sm font-bold text-stone-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. Types */}
            <section id="types" className="scroll-mt-32">
              <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans">03</span>
                Types of Manuscripts
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Original Research', desc: 'Comprehensive studies presenting novel data, analysis, and findings.' },
                  { title: 'Review Articles', desc: 'Critical evaluations of existing research identifying trends, gaps, and future directions.' },
                  { title: 'Short Communications', desc: 'Concise reports of significant preliminary findings.' },
                  { title: 'Case Studies', desc: 'Applied agricultural solutions with measurable outcomes.' },
                  { title: 'Technical Notes', desc: 'Innovations in tools, processes, or methodologies.' },
                  { title: 'Perspectives / Commentary', desc: 'Scholarly insights addressing emerging issues or future challenges.' }
                ].map((type, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-[#C29263]/30 transition-colors shadow-sm">
                    <h3 className="font-bold text-[#3D2B1F] mb-2">{type.title}</h3>
                    <p className="text-sm text-stone-500">{type.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Manuscript Preparation */}
            <section id="prep" className="scroll-mt-32">
              <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans">04</span>
                Manuscript Preparation
              </h2>
              <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
                <div>
                  <h4 className="font-bold text-[#3D2B1F] mb-2 flex items-center gap-2"><Globe size={16}/> Language</h4>
                  <p className="text-stone-600 text-sm">All manuscripts must be written in clear, professional English.</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#3D2B1F] mb-2 flex items-center gap-2"><FileText size={16}/> File Format</h4>
                  <p className="text-stone-600 text-sm">Submit manuscripts in Microsoft Word (.doc/.docx) format.</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#3D2B1F] mb-2 flex items-center gap-2"><Anchor size={16}/> Structure</h4>
                  <p className="text-stone-600 text-sm mb-3">Manuscripts should strictly follow this order:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Title Page', 'Abstract', 'Keywords', 'Introduction', 'Materials & Methods', 'Results', 'Discussion', 'Conclusion', 'References'].map((part, i) => (
                      <span key={i} className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-lg border border-stone-200">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Formatting Requirements */}
            <section id="formatting" className="scroll-mt-32">
              <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans">05</span>
                Formatting Requirements
              </h2>
              <div className="overflow-hidden bg-white rounded-3xl border border-stone-100 shadow-sm">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-[#3D2B1F] font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="p-4 border-b border-stone-100">Element</th>
                      <th className="p-4 border-b border-stone-100">Requirement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    <tr><td className="p-4 font-bold">Font</td><td className="p-4">Times New Roman, 12 pt</td></tr>
                    <tr><td className="p-4 font-bold">Spacing</td><td className="p-4">1.5 Line Spacing</td></tr>
                    <tr><td className="p-4 font-bold">Margins</td><td className="p-4">1 inch (2.54 cm) on all sides</td></tr>
                    <tr><td className="p-4 font-bold">Units</td><td className="p-4">SI Units</td></tr>
                    <tr><td className="p-4 font-bold">Visuals</td><td className="p-4">Figures ≥300 dpi; Tables must be editable (not images).</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 6. Abstract & Keywords */}
            <section id="abstract" className="scroll-mt-32">
              <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans">06</span>
                Abstract & Keywords
              </h2>
              <div className="bg-[#3D2B1F]/5 p-8 rounded-3xl border border-[#3D2B1F]/10">
                <div className="mb-6">
                  <h4 className="font-bold text-[#3D2B1F] mb-2">Abstract</h4>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    Must be 150–250 words. Clearly state the objective, methodology, key findings, and implications. Do not include citations in the abstract.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-[#3D2B1F] mb-2 flex items-center gap-2"><Hash size={16}/> Keywords</h4>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    Provide 4–6 keywords for indexing and discoverability. Avoid general terms; be specific to your research domain.
                  </p>
                </div>
              </div>
            </section>

            {/* 7. Referencing Style */}
            <section id="referencing" className="scroll-mt-32">
              <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans">07</span>
                Referencing Style
              </h2>
              <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                <p className="text-stone-600 mb-4">Use a consistent Author–Year format. Ensure all citations are verifiable.</p>
                <div className="bg-stone-50 p-6 rounded-xl border-l-4 border-[#C29263]">
                  <p className="font-mono text-xs text-stone-500 mb-2 uppercase font-bold tracking-widest">Example Citation</p>
                  <p className="text-stone-800 italic font-serif">
                    Smith, J. (2023). Sustainable irrigation practices. Journal of Agricultural Science, 15(2), 45-60.
                  </p>
                </div>
              </div>
            </section>

            {/* 8 & 9. Ethics & AI Policy */}
            <section id="ethics" className="scroll-mt-32">
              <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans">08</span>
                Ethics, Integrity & AI Policy
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                  <h3 className="font-bold text-[#3D2B1F] mb-4 flex items-center gap-2"><Scale size={18}/> Ethical Standards</h3>
                  <ul className="space-y-3 text-sm text-stone-600 list-disc pl-4">
                    <li>Original, unpublished work only.</li>
                    <li>Strict no-plagiarism & duplicate submission policy.</li>
                    <li>Proper attribution required.</li>
                    <li>Compliance with research ethics.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 10. Peer Review Process */}
            <section id="review" className="scroll-mt-32">
              <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans">10</span>
                Peer Review Process
              </h2>
              <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -z-10 hidden md:block"></div>
                <div className="grid md:grid-cols-5 gap-4">
                  {[
                    { title: 'Editorial Screening', desc: 'Scope Check' },
                    { title: 'Reviewer Evaluation', desc: 'Expert Analysis' },
                    { title: 'Decision', desc: 'Accept/Revise/Reject' },
                    { title: 'Revision', desc: 'If Needed' },
                    { title: 'Final Approval', desc: 'Publication' }
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
                      <div className="w-8 h-8 rounded-full bg-[#C29263] text-white flex items-center justify-center font-bold text-xs mx-auto mb-3 border-2 border-white shadow-md">
                        {i + 1}
                      </div>
                      <h4 className="font-bold text-[#3D2B1F] text-xs mb-1">{s.title}</h4>
                      <p className="text-[10px] text-stone-500">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 11 & 12. Revision & Copyright */}
            <div className="grid md:grid-cols-2 gap-8">
              <section id="revision" className="bg-stone-100 p-8 rounded-3xl border border-stone-200">
                <h3 className="font-bold text-lg mb-4 text-[#3D2B1F] flex items-center gap-2"><Clock size={18}/> 11. Revision Guidelines</h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-4">
                  Authors must respond point-by-point to reviewer comments and resubmit within the timeline.
                </p>
              </section>

              <section id="copyright" className="bg-stone-900 text-white p-8 rounded-3xl">
                <h3 className="font-bold text-lg mb-4 text-[#C29263] flex items-center gap-2"><ShieldCheck size={18}/> 12. Copyright & Licensing</h3>
                <p className="text-sm text-stone-300 leading-relaxed">
                  Authors retain ownership; Agrigence receives publishing rights with required citation on reuse.
                </p>
              </section>
            </div>

            {/* 13. Contact */}
            <section id="contact" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="bg-[#C29263]/10 p-8 rounded-3xl text-center">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4">13. Contact Information</h2>
                <p className="text-stone-600 mb-6 max-w-lg mx-auto">
                  Our editorial office is available to assist with formatting queries and submission technicalities.
                </p>
                <div className="flex justify-center gap-6">
                  <a href="mailto:info@agrigence.in" className="inline-flex items-center gap-2 bg-[#3D2B1F] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2a1e16] transition-colors">
                    <Mail size={18}/> Contact Editorial Office
                  </a>
                  <a href="https://agrigence.com" className="inline-flex items-center gap-2 bg-white text-[#3D2B1F] border border-[#3D2B1F]/20 px-6 py-3 rounded-xl font-bold hover:bg-stone-50 transition-colors">
                    Visit Website
                  </a>
                </div>
              </div>
            </section>

          </div>

          {/* Sticky Sidebar Navigation */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28">
              <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6 px-4">Contents</h3>
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="flex w-full items-center gap-3 text-left px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-[#C29263]/10 hover:text-[#3D2B1F] transition-all group"
                  >
                    <ChevronRight size={14} className="text-stone-300 group-hover:text-[#C29263] transition-colors" />
                    <span className="truncate">{section.title}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-8 p-6 bg-[#3D2B1F] rounded-2xl text-white text-center">
                <p className="text-xs font-bold opacity-80 mb-4 uppercase tracking-widest">Ready to publish?</p>
                <a href="#/submission" className="block w-full py-3 bg-white text-[#3D2B1F] rounded-xl font-bold text-xs hover:bg-[#C29263] hover:text-white transition-colors">
                  Submit Manuscript
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthorGuidelines;
