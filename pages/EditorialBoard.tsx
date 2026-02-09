import React from 'react';
import { motion } from 'framer-motion';
import { mockBackend } from '../services/mockBackend';
import { Mail, MapPin, Award, Quote } from 'lucide-react';

const EditorialBoard: React.FC = () => {
  const members = mockBackend.getMembers();

  return (
    <div className="min-h-screen bg-agri-bg pb-20">
      
      {/* Header */}
      <div className="bg-agri-primary text-white pt-20 pb-24 px-6 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="container mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Editorial Board</h1>
            <p className="text-xl text-stone-200 max-w-2xl mx-auto font-light">
              Distinguished experts ensuring scientific integrity and excellence in every publication.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-6 -mt-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl shadow-premium overflow-hidden group hover:-translate-y-2 transition-transform duration-300 border border-stone-100"
            >
              <div className="p-8 text-center border-b border-stone-100 relative">
                 <div className="absolute top-4 left-4 text-agri-gold opacity-20">
                    <Quote size={40} />
                 </div>
                 <div className="w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-br from-agri-gold to-agri-primary mb-4 shadow-lg">
                    <img 
                      src={member.imageUrl} 
                      alt={member.name} 
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                    />
                 </div>
                 <h3 className="text-xl font-serif font-bold text-agri-primary mb-1">{member.name}</h3>
                 <p className="text-sm font-bold text-agri-gold uppercase tracking-wider">{member.designation}</p>
              </div>
              
              <div className="p-6 bg-stone-50/50">
                 <div className="space-y-4">
                    <div className="flex items-start gap-3">
                       <Award size={18} className="text-agri-primary mt-1 shrink-0" />
                       <p className="text-sm text-stone-600">{member.qualification}</p>
                    </div>
                    <div className="flex items-start gap-3">
                       <MapPin size={18} className="text-agri-primary mt-1 shrink-0" />
                       <p className="text-sm text-stone-600">{member.institution}</p>
                    </div>
                    {member.email && (
                       <div className="flex items-center gap-3">
                          <Mail size={18} className="text-agri-primary shrink-0" />
                          <a href={`mailto:${member.email}`} className="text-sm text-stone-500 hover:text-agri-primary transition-colors truncate">{member.email}</a>
                       </div>
                    )}
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-stone-200">
                    <p className="text-xs font-bold text-stone-400 uppercase mb-2">Area of Expertise</p>
                    <div className="flex flex-wrap gap-2">
                       {member.expertise.split(',').map((exp, i) => (
                          <span key={i} className="px-2 py-1 bg-white border border-stone-200 rounded text-xs text-stone-600 font-medium">
                            {exp.trim()}
                          </span>
                       ))}
                    </div>
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