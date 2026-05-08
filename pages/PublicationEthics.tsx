
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Scale, FileText, AlertTriangle, CheckCircle, Mail, Globe, ChevronRight, Hash, Clock, ShieldCheck, PenTool, UserCheck } from 'lucide-react';
import SEO from '../components/SEO';

const PublicationEthics: React.FC = () => {
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
    { id: 'originality', title: '1. Originality' },
    { id: 'plagiarism', title: '2. Plagiarism' },
    { id: 'multiple', title: '3. Duplicate Submission' },
    { id: 'authorship', title: '4. Authorship' },
    { id: 'integrity', title: '5. Data Integrity' },
    { id: 'conflict', title: '6. Conflict of Interest' },
    { id: 'review', title: '7. Peer Review' },
    { id: 'editorial', title: '8. Editorial Duties' },
    { id: 'reviewer', title: '9. Reviewer Duties' },
    { id: 'citation', title: '10. Citation Ethics' },
    { id: 'copyright', title: '11. Copyright' },
    { id: 'research', title: '12. Ethical Research' },
    { id: 'corrections', title: '13. Corrections' },
    { id: 'responsibility', title: '14. Academic Responsibility' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <SEO 
        title="Publication Ethics & Academic Integrity | Agrigence"
        description="Our commitment to maintaining the highest standards of publication ethics, academic integrity, and scholarly transparency in agricultural research."
      />
      
      {/* Hero Header */}
      <div className="bg-[#3D2B1F] text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
           <img 
             src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=2000" 
             className="w-full h-full object-cover opacity-20"
             alt="Journal Ethics"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-[#3D2B1F] to-[#3D2B1F]/80"></div>
        </div>
        <div className="container mx-auto relative z-10 max-w-6xl">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
             <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
                 <Shield size={16} className="text-[#C29263]" />
                 <span className="text-xs font-bold tracking-widest uppercase">Ethical Standards</span>
             </div>
             <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Publication Ethics</h1>
             <p className="text-xl text-stone-300 font-light max-w-2xl leading-relaxed">
               Agrigence Journal of Agriculture & Allied Sciences is committed to maintaining the highest standards of transparency, integrity, and professional scholarly practices.
             </p>
           </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Main Content Area */}
          <div className="flex-1 space-y-12">
            
            <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed bg-white p-8 rounded-3xl border border-stone-100 shadow-sm mb-12">
              <p className="text-lg font-medium text-stone-800">
                The journal follows ethical publishing principles to ensure the quality, originality, credibility, and integrity of all published research work.
              </p>
              <p className="mt-4">
                The journal expects authors, editors, reviewers, and contributors to follow ethical standards during manuscript submission, peer review, editorial handling, and publication processes.
              </p>
            </div>

            {/* Sections mapped from content */}
            <div className="grid grid-cols-1 gap-8">
              
              <section id="originality" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">01</span>
                  Originality of Manuscripts
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-stone-600">
                  Authors must ensure that submitted manuscripts are original, unpublished, and not under consideration by any other journal or publication platform. All research work should be authentic and properly referenced.
                </div>
              </section>

              <section id="plagiarism" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">02</span>
                  Plagiarism Policy
                </h2>
                <div className="bg-red-50/30 p-6 rounded-2xl border border-red-100/50 shadow-sm text-stone-600">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="text-red-600 mt-1 shrink-0" size={20} />
                    <p>The journal strictly prohibits plagiarism in any form. Manuscripts found containing copied content, manipulated material, or unethical reproduction of published work may be rejected immediately. Proper citation and acknowledgment of all sources are mandatory.</p>
                  </div>
                </div>
              </section>

              <section id="multiple" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">03</span>
                  Multiple or Duplicate Submission
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-stone-600">
                  Simultaneous submission of the same manuscript to multiple journals is considered unethical publishing behavior and is not permitted.
                </div>
              </section>

              <section id="authorship" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">04</span>
                  Authorship Criteria
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-stone-600">
                  All listed authors should have made significant academic or scientific contributions to the submitted research work. The corresponding author is responsible for ensuring approval from all co-authors before submission.
                </div>
              </section>

              <section id="integrity" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">05</span>
                  Data Integrity and Research Accuracy
                </h2>
                <div className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100/50 shadow-sm text-stone-600">
                  Authors must present accurate data and truthful findings. Fabrication, falsification, manipulation, or misrepresentation of research data is strictly prohibited.
                </div>
              </section>

              <section id="conflict" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">06</span>
                  Conflict of Interest
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-stone-600">
                  Authors, editors, and reviewers should disclose any financial, institutional, professional, or personal conflicts of interest that could influence the publication process.
                </div>
              </section>

              <section id="review" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">07</span>
                  Peer Review Process
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-stone-600">
                  The journal follows a peer review and editorial evaluation process to maintain academic quality and research standards. Editorial decisions are based on originality, scientific quality, relevance, clarity, and ethical compliance.
                </div>
              </section>

              <section id="editorial" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">08</span>
                  Editorial Responsibilities
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-stone-600">
                  Editors are responsible for maintaining confidentiality, fairness, transparency, and academic integrity throughout the review and publication process.
                </div>
              </section>

              <section id="reviewer" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">09</span>
                  Reviewer Responsibilities
                </h2>
                <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100 space-y-4">
                  <p className="font-bold text-[#3D2B1F]">Reviewers are expected to:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: ShieldCheck, text: 'Maintain manuscript confidentiality' },
                      { icon: PenTool, text: 'Provide objective and constructive feedback' },
                      { icon: Scale, text: 'Avoid conflicts of interest' },
                      { icon: UserCheck, text: 'Support ethical academic evaluation' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200/50">
                        <item.icon size={16} className="text-[#C29263]" />
                        <span className="text-sm font-medium text-stone-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="citation" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">10</span>
                  Citation and Referencing Ethics
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-stone-600">
                  Authors must properly cite all referenced research, data, figures, tables, and previously published materials. Inappropriate citation practices, citation manipulation, or misleading references are considered unethical.
                </div>
              </section>

              <section id="copyright" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">11</span>
                  Copyright and Permissions
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-stone-600">
                  Authors are responsible for obtaining necessary permissions for copyrighted content, images, figures, tables, or third-party materials used in manuscripts.
                </div>
              </section>

              <section id="research" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">12</span>
                  Ethical Research Practices
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-stone-600">
                  Research involving humans, animals, biological materials, or sensitive information should comply with institutional, national, and international ethical guidelines and regulations.
                </div>
              </section>

              <section id="corrections" className="scroll-mt-32">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">13</span>
                  Corrections and Retractions
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-stone-600">
                  The journal reserves the right to publish corrections, clarifications, or retractions in cases involving significant errors, ethical violations, or academic misconduct.
                </div>
              </section>

              <section id="responsibility" className="scroll-mt-32 pb-8">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-white flex items-center justify-center text-sm font-sans shrink-0">14</span>
                  Open Academic Responsibility
                </h2>
                <div className="bg-[#3D2B1F] text-white p-8 rounded-3xl shadow-xl">
                  <p className="leading-relaxed opacity-90">
                    Agrigence Journal of Agriculture & Allied Sciences promotes responsible scientific communication, ethical publishing standards, interdisciplinary collaboration, and credible knowledge dissemination for the advancement of agriculture and allied sciences.
                  </p>
                </div>
              </section>

            </div>

            {/* Footer / Contact */}
            <div className="bg-[#C29263]/10 p-10 rounded-3xl text-center">
                <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-4">Ethics-Related Concerns</h2>
                <p className="text-stone-600 mb-8 max-w-lg mx-auto">
                  If you have concerns regarding publication ethics or research misconduct, please contact our editorial team.
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="bg-white p-6 rounded-2xl border border-[#C29263]/20">
                    <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Email</p>
                    <a href="mailto:agrigence@gmail.com" className="font-bold text-[#3D2B1F] hover:text-[#C29263]">agrigence@gmail.com</a>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#C29263]/20">
                    <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Publisher</p>
                    <p className="font-bold text-[#3D2B1F]">Agrigence Teams</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#C29263]/20">
                    <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Country</p>
                    <p className="font-bold text-[#3D2B1F]">India</p>
                  </div>
                </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28">
              <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6 px-4">Ethics Index</h3>
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
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PublicationEthics;
