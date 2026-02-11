
import React from 'react';
import { motion } from 'framer-motion';
import { mockBackend } from '../services/mockBackend';
import { Mail, MapPin, Award, Quote, BookOpen } from 'lucide-react';

const EditorialBoard: React.FC = () => {
  const members = mockBackend.getMembers().sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-agri-bg pb-20">
      
      {/* Header / Hero Section */}
      <div className="relative h-[60vh] bg-agri-primary text-white overflow-hidden flex items-center justify-center">
         {/* Background Image: Boardroom / Conference / Academic Setting */}
         <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop" 
              alt="Editorial Board Conference" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-agri-primary/80 via-agri-primary/60 to-agri-bg"></div>
         </div>
         
         <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
                 <BookOpen size={16} className="text-agri-secondary" />
                 <span className="text-xs font-bold tracking-widest uppercase">Academic Leadership</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Editorial Board</h1>
              <p className="text-xl text-stone-200 max-w-2xl mx-auto font-light leading-relaxed">
                Our distinguished panel of experts ensures the scientific integrity, quality, and relevance of every published work.
              </p>
            </motion.div>
         </div>
      </div>

      <div className="container mx-auto px-6 -mt-24 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden group border border-stone-100 flex flex-col h-full"
            >
              <div className="p-8 text-center bg-stone-50 border-b border-stone-100 relative">
                 <div className="absolute top-4 right-4 text-stone-200">
                    <Quote size={40} />
                 </div>
                 <div className="w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-br from-agri-secondary to-agri-primary mb-6 shadow-lg group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={member.imageUrl} 
                      alt={member.name} 
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                    />
                 </div>
                 <h3 className="text-xl font-serif font-bold text-agri-primary mb-2">{member.name}</h3>
                 <span className="inline-block bg-agri-primary/5 text-agri-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                    {member.designation}
                 </span>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                 <div className="space-y-4 mb-6 flex-1">
                    <div className="flex items-start gap-3">
                       <Award size={18} className="text-agri-secondary mt-0.5 shrink-0" />
                       <div>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-0.5">Qualification</p>
                          <p className="text-sm text-stone-700 font-medium">{member.qualification}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3">
                       <MapPin size={18} className="text-agri-secondary mt-0.5 shrink-0" />
                       <div>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-0.5">Institution</p>
                          <p className="text-sm text-stone-700 font-medium">{member.institution}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="mt-auto pt-6 border-t border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase mb-3">Expertise</p>
                    <div className="flex flex-wrap gap-2">
                       {member.expertise.split(',').map((exp, i) => (
                          <span key={i} className="px-2 py-1 bg-stone-100 rounded text-xs text-stone-600 font-medium hover:bg-agri-secondary hover:text-white transition-colors cursor-default">
                            {exp.trim()}
                          </span>
                       ))}
                    </div>
                    
                    {member.email && (
                       <a href={`mailto:${member.email}`} className="mt-6 flex items-center justify-center gap-2 text-agri-primary font-bold text-sm hover:text-agri-secondary transition-colors w-full py-2 bg-stone-50 rounded-lg group-hover:bg-agri-primary group-hover:text-white">
                          <Mail size={16} /> Contact Member
                       </a>
                    )}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorialBoard;
