import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { mockBackend } from '../services/mockBackend';
import { Code, BookOpen, Search, Cpu, Settings, CheckCircle, ArrowRight, Upload, Loader2, FileText, Globe, Award, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OnDemandWebServices: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    category: 'Website Development',
    description: '',
    deadline: '',
    budgetRange: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const services = [
    {
      icon: <Globe size={32} className="text-agri-secondary" />,
      title: "Website Development",
      description: "Custom, responsive, and high-performance websites tailored for agricultural businesses, research institutions, and startups."
    },
    {
      icon: <BookOpen size={32} className="text-agri-secondary" />,
      title: "Research Publication Systems",
      description: "End-to-end academic publishing platforms with peer-review workflows, DOI integration, and indexing support."
    },
    {
      icon: <Search size={32} className="text-agri-secondary" />,
      title: "SEO Optimization",
      description: "Advanced SEO strategies including Google Scholar indexing, structured data, and Core Web Vitals optimization."
    },
    {
      icon: <Cpu size={32} className="text-agri-secondary" />,
      title: "AI Tools Integration",
      description: "Integrate custom AI solutions like abstract generators, keyword suggestions, and automated data analysis."
    },
    {
      icon: <Settings size={32} className="text-agri-secondary" />,
      title: "Custom Digital Solutions",
      description: "Bespoke web applications, dashboards, and data visualization tools designed specifically for your unique requirements."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let fileUrl = '';
      if (file) {
        fileUrl = await mockBackend.uploadFile(file, `web_services/${Date.now()}_${file.name}`);
      }

      await mockBackend.addWebServiceRequest({
        ...formData,
        fileUrl
      });

      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        category: 'Website Development',
        description: '',
        deadline: '',
        budgetRange: ''
      });
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#0F392B] text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F392B] to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight"
            >
              On-Demand Web Services
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-stone-300 font-light mb-10 leading-relaxed"
            >
              Custom digital, academic, and agricultural solutions tailored to your needs.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#request-form" className="bg-agri-secondary text-white px-8 py-4 rounded-xl font-bold hover:bg-agri-primary transition-colors flex items-center gap-2 shadow-lg shadow-agri-secondary/20">
                Request Service <ArrowRight size={18} />
              </a>
              <a href="#features" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors">
                Explore Features
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. WHAT ARE ON-DEMAND WEB SERVICES */}
      <section className="py-20 bg-white border-b border-stone-100">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-serif font-bold text-[#0F392B] mb-6">What Are On-Demand Web Services?</h2>
          <p className="text-lg text-stone-600 leading-relaxed">
            On-Demand Web Services are customized digital solutions provided as per user requirements, including website development, academic publishing systems, SEO optimization, AI integration, and agriculture-specific digital tools. These services are scalable, flexible, and tailored for researchers, institutions, startups, and agribusinesses.
          </p>
        </div>
      </section>

      {/* 3. SERVICES LIST (CARD GRID) */}
      <section id="features" className="py-24 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold text-[#0F392B] mb-4">Our Core Services</h2>
            <p className="text-stone-500">Comprehensive digital solutions engineered for performance, scalability, and academic rigor.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {services.map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-xl hover:border-agri-secondary/30 transition-all group"
              >
                <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-agri-secondary/10 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0F392B] mb-4">{service.title}</h3>
                <p className="text-stone-600 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold text-[#0F392B] mb-4">Advanced Feature Modules</h2>
            <p className="text-stone-500">Enhance your digital presence with our specialized academic and SEO modules.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex gap-6">
              <div className="w-12 h-12 bg-agri-secondary/10 rounded-xl flex items-center justify-center text-agri-secondary shrink-0">
                <Search size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F392B] mb-2">SEO & Discoverability</h3>
                <p className="text-stone-600">SSR/Dynamic Rendering, Google Scholar Meta Tags, Automated XML Sitemaps, and Schema.org Markup for maximum visibility.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex gap-6">
              <div className="w-12 h-12 bg-agri-secondary/10 rounded-xl flex items-center justify-center text-agri-secondary shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F392B] mb-2">Article Page System</h3>
                <p className="text-stone-600">Full HTML rendering, PDF downloads, citation exports (BibTeX, RIS, APA, MLA), and integrated article metrics.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex gap-6">
              <div className="w-12 h-12 bg-agri-secondary/10 rounded-xl flex items-center justify-center text-agri-secondary shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F392B] mb-2">Credibility Signals</h3>
                <p className="text-stone-600">ISSN display, indexing badges, Impact Factor tracking, and dedicated policy pages (Ethics, Plagiarism, Copyright).</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex gap-6">
              <div className="w-12 h-12 bg-agri-secondary/10 rounded-xl flex items-center justify-center text-agri-secondary shrink-0">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F392B] mb-2">AI-Powered Tools</h3>
                <p className="text-stone-600">Abstract generators, keyword suggestion tools, automated reviewer matching, and citation/reference generators.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INPUT FORM */}
      <section id="request-form" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-[#0F392B] mb-4">Tell Us What You Need</h2>
            <p className="text-stone-500 text-lg">Describe your requirement and get a customized solution tailored for your academic, agricultural, or digital needs.</p>
          </div>

          <div className="bg-stone-50 p-8 md:p-12 rounded-3xl border border-stone-100 shadow-sm">
            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-[#0F392B] mb-4">Request Received Successfully!</h3>
                <p className="text-stone-600 mb-8">Thank you for reaching out. Our team will review your requirements and get back to you shortly with a customized proposal.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="bg-[#0F392B] text-white px-8 py-3 rounded-xl font-bold hover:bg-agri-primary transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Full Name *</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-white border border-stone-200 rounded-xl p-4 text-stone-800 outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary transition-all"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Email Address *</label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-white border border-stone-200 rounded-xl p-4 text-stone-800 outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary transition-all"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Phone Number *</label>
                    <input 
                      required
                      type="tel"
                      className="w-full bg-white border border-stone-200 rounded-xl p-4 text-stone-800 outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary transition-all"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Service Category *</label>
                    <select 
                      required
                      className="w-full bg-white border border-stone-200 rounded-xl p-4 text-stone-800 outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary transition-all appearance-none"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Website Development">Website Development</option>
                      <option value="Research Publication">Research Publication</option>
                      <option value="SEO Optimization">SEO Optimization</option>
                      <option value="AI Tools">AI Tools</option>
                      <option value="Custom Requirement">Custom Requirement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Requirement Description *</label>
                  <textarea 
                    required
                    className="w-full bg-white border border-stone-200 rounded-xl p-4 text-stone-800 outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary transition-all min-h-[150px] resize-y"
                    placeholder="Please describe your project, goals, and any specific features you need..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Deadline (Optional)</label>
                    <input 
                      type="date"
                      className="w-full bg-white border border-stone-200 rounded-xl p-4 text-stone-800 outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary transition-all"
                      value={formData.deadline}
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Budget Range (Optional)</label>
                    <select 
                      className="w-full bg-white border border-stone-200 rounded-xl p-4 text-stone-800 outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary transition-all appearance-none"
                      value={formData.budgetRange}
                      onChange={e => setFormData({...formData, budgetRange: e.target.value})}
                    >
                      <option value="">Select a range</option>
                      <option value="< $1,000">Less than $1,000</option>
                      <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                      <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                      <option value="$10,000+">$10,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Upload File (Optional)</label>
                  <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center bg-white hover:bg-stone-50 transition-colors relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                    />
                    <Upload size={24} className="mx-auto text-stone-400 mb-2" />
                    <p className="text-sm text-stone-600 font-medium">
                      {file ? file.name : "Click or drag file to upload"}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">PDF, DOCX, or ZIP (Max 10MB)</p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-agri-secondary text-white py-4 rounded-xl font-bold hover:bg-agri-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnDemandWebServices;
