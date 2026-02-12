
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, CheckCircle, Globe, Users, BookOpen, Mic, ArrowRight, Quote } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { motion } from 'framer-motion';
import { LeadershipMember } from '../types';

const AboutContact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);

  useEffect(() => {
    const load = async () => {
        const l = await mockBackend.getLeadership();
        setLeadership(l.sort((a,b) => a.order - b.order));
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
      
      {/* Hero Section */}
      <section className="relative py-24 bg-agri-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-58197bdc0700?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
             <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">About Agrigence</h1>
             <p className="text-xl text-stone-200 max-w-3xl mx-auto font-light leading-relaxed">
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

      {/* Leadership */}
      <section className="py-20 container mx-auto px-6">
         <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-agri-primary mb-4">Our Leadership</h2>
            <p className="text-stone-500">The visionaries behind the revolution.</p>
         </div>

         <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {leadership.map((lead) => (
              <div key={lead.id} className="group relative overflow-hidden rounded-2xl">
                 <img src={lead.imageUrl} className="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-105" alt={lead.name} />
                 <div className="absolute inset-0 bg-gradient-to-t from-agri-primary to-transparent opacity-90"></div>
                 <div className="absolute bottom-0 left-0 p-8 text-white">
                    <h3 className="text-2xl font-serif font-bold mb-1">{lead.name}</h3>
                    <p className="text-agri-gold font-bold uppercase tracking-wider text-sm mb-4">{lead.role}</p>
                    <p className="text-white/80 text-sm leading-relaxed">
                       {lead.bio}
                    </p>
                 </div>
              </div>
            ))}
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
                           <p className="text-white/60">agrigence@gmail.com</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-agri-gold shrink-0">
                           <MapPin size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-xl mb-1">Office</h4>
                           <p className="text-white/60">Zura Haradhan, Chandauli, Uttar Pradesh, 221115</p>
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
