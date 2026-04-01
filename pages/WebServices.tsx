import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, FileText, CheckCircle, ShieldCheck, 
  Globe, Smartphone, BarChart, BookOpen, 
  Share2, Mail, Users, Award, Layout, FileCode
} from 'lucide-react';
import SEO from '../components/SEO';

const WebServices: React.FC = () => {
  const services = [
    {
      title: 'SEO & Discoverability',
      icon: <Search size={32} className="text-agri-secondary" />,
      items: [
        'Fix JavaScript rendering so Google can index all pages',
        'Google Scholar indexing (meta tags: citation_title, citation_author, etc.)',
        'XML Sitemap auto-generation per article'
      ]
    },
    {
      title: 'Author & Submission System',
      icon: <Users size={32} className="text-agri-secondary" />,
      items: [
        'Online manuscript submission portal',
        'Author dashboard (submission tracking)',
        'Reviewer assignment and reviewer portal',
        'Plagiarism check integration (iThenticate / Turnitin)',
        'Automated email notifications (submission received, revision required, accepted)'
      ]
    },
    {
      title: 'Article Pages',
      icon: <FileText size={32} className="text-agri-secondary" />,
      items: [
        'Full-text HTML rendering (not just PDF)',
        'Citation export (BibTeX, RIS, APA, MLA)',
        'Article-level metrics (views, downloads, citations)',
        'Social sharing buttons per article',
        'Related articles / "Cite this article" widget'
      ]
    },
    {
      title: 'Credibility Signals',
      icon: <Award size={32} className="text-agri-secondary" />,
      items: [
        'ISSN display (Print + Online)',
        'Indexing badges (Google Scholar, DOAJ, Crossref, etc.)',
        'Impact factor / indexing status page',
        'Ethics & plagiarism policy page',
        'Copyright & licensing page (e.g., Creative Commons CC BY 4.0)'
      ]
    },
    {
      title: 'User Experience',
      icon: <Layout size={32} className="text-agri-secondary" />,
      items: [
        'Mobile-responsive design (fully)',
        'Advanced search (by author, keyword, year, volume)',
        'Issue-wise browsing with cover page',
        'Newsletter subscription',
        'Hindi language support (for Indian author outreach)'
      ]
    },
    {
      title: 'Analytics & Trust',
      icon: <BarChart size={32} className="text-agri-secondary" />,
      items: [
        'Google Analytics / Search Console integration',
        'Backlink-building via academic listings (ResearchGate, Academia.edu)',
        'Social proof: testimonials from published authors'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-agri-bg">
      <SEO 
        title="On-Demand Web Services | Agrigence"
        description="Explore our comprehensive on-demand web services tailored for modern agricultural research publishing, including SEO, submission systems, and analytics."
      />
      
      {/* Header */}
      <div className="bg-[#0F392B] text-white py-20 px-6 relative overflow-hidden">
         <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
              alt="Web Services Background" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F392B] to-[#0F392B]/80"></div>
         </div>

         <div className="container mx-auto relative z-10 text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">On-Demand Web Services</h1>
            <p className="text-xl text-stone-300 font-light leading-relaxed">
              make full details prompt to add in my website with Ai Studio
            </p>
         </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2rem] p-8 shadow-premium border border-stone-100 hover:border-agri-gold/50 transition-all group"
            >
              <div className="w-16 h-16 bg-agri-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-2xl font-serif font-bold text-agri-primary mb-6">{service.title}</h3>
              <ul className="space-y-4">
                {service.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-agri-secondary mt-1 flex-shrink-0" />
                    <span className="text-stone-700 font-medium leading-relaxed text-sm">
                      {item.includes('✅') ? item.replace('✅ ', '') : item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-6 pb-24">
        <div className="bg-agri-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Ready to Upgrade Your Publishing Platform?</h2>
            <p className="text-white/80 text-lg mb-10 font-light">
              Integrate our on-demand web services to enhance your journal's credibility, streamline submissions, and maximize global reach.
            </p>
            <button className="bg-agri-secondary text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-agri-primary transition-colors shadow-lg">
              Contact Us Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebServices;
