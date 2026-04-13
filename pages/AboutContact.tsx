
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, CheckCircle, Globe, Users, BookOpen, Mic, ArrowRight, Quote } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { motion } from 'framer-motion';
import { LeadershipMember } from '../types';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

const AboutContact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);

  useEffect(() => {
    const load = async () => {
        // Load leadership directly from main backend (Firestore) to ensure admin updates are reflected
        const l = await mockBackend.getLeadership();
        // Filter enabled profiles and sort
        const activeLeaders = l.filter(m => m.isEnabled !== false).sort((a,b) => a.order - b.order);
        setLeadership(activeLeaders);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mockBackend.sendMessage(formData);
    alert("Message sent successfully!");
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-agri-bg min-h-screen">
      <SEO 
        title="About Us & Contact | Agrigence"
        description="Learn about Agrigence, our mission, leadership, and how to get in touch with our team."
      />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center bg-agri-primary text-white overflow-hidden mb-16">
        <div className="absolute inset-0">
           <OptimizedImage 
             src="https://images.unsplash.com/photo-1625246333195-58197bdc0700?auto=format&fit=crop&q=80" 
             alt="Agrigence team and agricultural fields" 
             title="About Agrigence"
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
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-agri-secondary">Our Story</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-[1.1] text-white">
              About Agrigence
            </h1>
            <p className="text-lg text-white/80 font-light leading-relaxed max-w-xl">
              Bridging the gap between agricultural research, innovation, and practical field application to foster a sustainable future for India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission / What We Do */}
      <section className="py-20 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
           <div>
              <h2 className="text-sm font-bold text-agri-gold uppercase tracking-widest mb-3">Our Mission</h2>
              <h3 className="text-4xl font-serif font-bold text-agri-primary mb-8">Empowering Agriculture Through Knowledge</h3>
              <p className="text-stone-600 mb-6 text-lg leading-relaxed">
                Agrigence serves as a vital ecosystem connecting farmers, students, researchers, startups, and agribusiness companies. We believe that the future of farming lies in the seamless integration of scientific research with traditional wisdom.
              </p>
              
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-agri-gold/10 flex items-center justify-center text-agri-gold shrink-0">
                       <BookOpen size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-agri-primary text-lg">Knowledge Dissemination</h4>
                       <p className="text-stone-600">Publishing high-impact magazines and newsletters that simplify complex research.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-agri-gold/10 flex items-center justify-center text-agri-gold shrink-0">
                       <Users size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-agri-primary text-lg">Community Building</h4>
                       <p className="text-stone-600">Creating direct interaction channels between rural youth, industry experts, and institutions.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-agri-gold/10 flex items-center justify-center text-agri-gold shrink-0">
                       <Mic size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-agri-primary text-lg">Events & Training</h4>
                       <p className="text-stone-600">Organizing on-ground seminars and workshops to enhance skills in agri-entrepreneurship.</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="relative">
              <div className="absolute -inset-4 border-2 border-agri-gold/30 rounded-3xl transform rotate-3"></div>
              <img 
                src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=1200" 
                alt="Field work and collaboration" 
                className="rounded-3xl shadow-2xl relative z-10 w-full"
              />
              <div className="absolute bottom-10 -left-10 bg-white p-6 rounded-xl shadow-premium z-20 max-w-xs border-l-4 border-agri-gold hidden md:block">
                 <Quote className="text-agri-gold mb-2" size={32} />
                 <p className="text-agri-primary font-serif font-bold text-lg">"Transforming learning into livelihood."</p>
              </div>
           </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 container mx-auto px-6">
         <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-agri-primary mb-4">Our Leadership</h2>
            <p className="text-stone-500">The visionaries behind the revolution.</p>
         </div>

         <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {leadership.map((lead) => (
            <div key={lead.id} className="group relative overflow-hidden rounded-[2.5rem] shadow-xl aspect-[4/5]">
                <img 
                    src={lead.imageUrl || 'https://via.placeholder.com/400x500?text=No+Image'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt={lead.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1510] via-[#1C1510]/40 to-transparent opacity-90"></div>
                <div className="absolute bottom-0 left-0 p-10 text-white w-full">
                    <div className="flex flex-col mb-4">
                        <h3 className="text-3xl font-serif font-bold mb-1">{lead.name}</h3>
                        <span className="text-agri-gold font-bold text-xs uppercase tracking-widest">{lead.role}</span>
                        {lead.email && (
                            <a href={`mailto:${lead.email}`} className="text-white/70 text-xs mt-2 hover:text-agri-gold transition-colors font-mono">
                                {lead.email}
                            </a>
                        )}
                    </div>
                    <div className="h-px bg-white/20 w-12 mb-4"></div>
                    <p className="text-white/80 text-sm leading-relaxed font-light">
                        {lead.bio}
                    </p>
                </div>
            </div>
            ))}
            {leadership.length === 0 && (
                <div className="col-span-2 text-center py-20 text-stone-400 italic">
                    Leadership information is being updated.
                </div>
            )}
         </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-stone-100">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-4xl font-serif font-bold text-agri-primary mb-4">Why Choose Agrigence?</h2>
               <div className="h-1 w-20 bg-agri-gold mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 hover:shadow-premium hover:-translate-y-2 transition-all">
                  <CheckCircle className="text-agri-gold mb-6" size={40} />
                  <h3 className="text-xl font-bold text-agri-primary mb-3">Practical Focus</h3>
                  <p className="text-stone-600">We emphasize practical agriculture, maintaining a strong ground-level connection with farmers and KVKs to ensure field relevance.</p>
               </div>
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 hover:shadow-premium hover:-translate-y-2 transition-all">
                  <Globe className="text-agri-gold mb-6" size={40} />
                  <h3 className="text-xl font-bold text-agri-primary mb-3">Integrated Ecosystem</h3>
                  <p className="text-stone-600">A unique blend of digital magazines, physical seminars, and networking opportunities for holistic growth.</p>
               </div>
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 hover:shadow-premium hover:-translate-y-2 transition-all">
                  <Users className="text-agri-gold mb-6" size={40} />
                  <h3 className="text-xl font-bold text-agri-primary mb-3">Youth Empowerment</h3>
                  <p className="text-stone-600">Dedicated to supporting the next generation of agri-entrepreneur by bridging traditional wisdom with modern tech.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-agri-primary text-white">
         <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16">
               <div>
                  <h2 className="text-4xl font-serif font-bold mb-6">Get in Touch</h2>
                  <p className="text-white/70 mb-12 text-lg">Have questions about submissions, subscriptions, or partnerships? We're here to help.</p>
                  
                  <div className="space-y-8">
                     <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-agri-gold shrink-0">
                           <Phone size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-xl mb-1">Phone / WhatsApp</h4>
                           <p className="text-white/60">+91 9452571317</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-agri-gold shrink-0">
                           <Mail size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-xl mb-1">Email</h4>
                           <p className="text-white/60">info@agrigence.in</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-agri-gold shrink-0">
                           <MapPin size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-xl mb-1">Office</h4>
                           <p className="text-white/60">H.N.130, JUDAHARADHAN BHAG-1, Juda haradhan, P.S.-Baluwa, Tahshil-Sakaldiha, Dist.- Chandauli, Uttar Pradesh, India , 221115</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-3xl p-8 text-stone-800 shadow-2xl">
                  <h3 className="text-2xl font-bold text-agri-primary mb-6">Send us a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Your Name</label>
                        <input 
                           className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-2 focus:ring-agri-primary outline-none"
                           required
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email Address</label>
                        <input 
                           type="email"
                           className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-2 focus:ring-agri-primary outline-none"
                           required
                           value={formData.email}
                           onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Message</label>
                        <textarea 
                           className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-2 focus:ring-agri-primary outline-none h-32"
                           required
                           value={formData.message}
                           onChange={e => setFormData({...formData, message: e.target.value})}
                        ></textarea>
                     </div>
                     <button className="w-full bg-agri-gold text-agri-primary font-bold py-4 rounded-xl hover:bg-[#c29263] transition-colors flex items-center justify-center gap-2">
                        Send Message <ArrowRight size={20} />
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};

export default AboutContact;
