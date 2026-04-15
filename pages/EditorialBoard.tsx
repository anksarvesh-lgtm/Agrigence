
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { mockBackend } from '../services/mockBackend';
import { Mail, MapPin, Award, Quote, BookOpen, AlertCircle, Leaf } from 'lucide-react';
import { EditorialMember } from '../types';

const GrassRunner: React.FC<{ start: { x: number, y: number }, end: { x: number, y: number }, delay?: number }> = ({ start, end, delay = 0 }) => {
  // Create an organic curve between start and end
  const midY = (start.y + end.y) / 2;
  const path = `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '1000px' }}>
      <motion.path
        d={path}
        fill="none"
        stroke="#2D5A27"
        strokeWidth="2"
        strokeDasharray="4 2"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.4 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay, ease: "easeInOut" }}
      />
      {/* Small leaf accents on the runner */}
      <motion.circle
        cx={end.x}
        cy={end.y - 10}
        r="3"
        fill="#4ade80"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 1.2 }}
      />
    </svg>
  );
};

const MemberCard: React.FC<{ member: EditorialMember, index: number }> = ({ member, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="glossy glossy-card rounded-3xl p-6 flex flex-col items-center text-center relative z-10 hover:shadow-2xl transition-all group"
    >
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:scale-110 transition-transform duration-500">
          <img 
            src={member.imageUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
            alt={member.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <motion.div 
          initial={{ rotate: -20, opacity: 0 }}
          whileInView={{ rotate: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.5 }}
          className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg"
        >
          <Leaf size={14} />
        </motion.div>
      </div>

      <h3 className="text-lg font-serif font-bold text-agri-primary mb-1">{member.name}</h3>
      <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-3">{member.designation}</p>
      
      <div className="space-y-2 w-full text-left border-t border-green-50 pt-4 mt-2">
        <div className="flex items-start gap-2">
          <Award size={14} className="text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Profession</p>
            <p className="text-xs text-stone-700 font-medium line-clamp-1">{member.profession}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Institution</p>
            <p className="text-xs text-stone-700 font-medium line-clamp-1">{member.institution}</p>
          </div>
        </div>
        {member.expertise && (
          <div className="flex items-start gap-2">
            <BookOpen size={14} className="text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Expertise</p>
              <p className="text-xs text-stone-700 font-medium line-clamp-1">{member.expertise}</p>
            </div>
          </div>
        )}
      </div>

      {member.email && (
        <a 
          href={`mailto:${member.email}`} 
          className="mt-6 p-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-600 hover:text-white transition-all w-full flex items-center justify-center gap-2 text-xs font-bold"
        >
          <Mail size={14} /> Contact
        </a>
      )}
    </motion.div>
  );
};

const EditorialBoard: React.FC = () => {
  const [members, setMembers] = useState<EditorialMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const load = async () => {
      try {
        const m = await mockBackend.getMembers();
        const activeMembers = m.filter(member => member.isEnabled !== false).sort((a, b) => a.order - b.order);
        setMembers(activeMembers);
      } catch (err) {
        console.error("Error loading editorial board", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Grouping logic
  const editorInChief = members.find(m => m.designation === 'Editor-in-Chief');
  const otherMembers = members.filter(m => m.designation !== 'Editor-in-Chief');
  
  // Group others by designation
  const sections = otherMembers.reduce((acc, member) => {
    if (!acc[member.designation]) acc[member.designation] = [];
    acc[member.designation].push(member);
    return acc;
  }, {} as Record<string, EditorialMember[]>);

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-32 overflow-hidden relative" ref={containerRef}>
      {/* Hero Section */}
      <div className="relative h-[50vh] flex items-center justify-center bg-agri-primary overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover"
            alt="Nature background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8FAF8]"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">Editorial Board</h1>
            <p className="text-green-100 max-w-2xl mx-auto font-light text-lg">
              A natural network of scholarly excellence, rooted in integrity and growing through collaboration.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-stone-100">
            <AlertCircle className="mx-auto text-stone-300 mb-4" size={48} />
            <h3 className="text-xl font-serif font-bold text-agri-primary">No members found</h3>
          </div>
        ) : (
          <div className="relative">
            {/* The Main Root: Editor-in-Chief */}
            {editorInChief && (
              <div className="flex flex-col items-center mb-32 relative">
                {/* Vertical Root Line */}
                <div className="w-1 bg-green-800/10 absolute top-full h-32 left-1/2 -translate-x-1/2 z-0">
                  <motion.div 
                    style={{ scaleY }} 
                    className="w-full h-full bg-green-600/40 origin-top"
                  />
                </div>
                
                <div className="w-full max-w-sm">
                  <MemberCard member={editorInChief} index={0} />
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="mt-8 text-green-800 font-serif italic text-sm flex items-center gap-2"
                >
                  <Leaf size={14} className="text-green-600" />
                  Root of Excellence
                </motion.div>
              </div>
            )}

            {/* Branches: Sections */}
            <div className="space-y-40 relative">
              {Object.entries(sections).map(([designation, sectionMembers], sIdx) => (
                <div key={designation} className="relative">
                  {/* Section Title as a Branch Node */}
                  <div className="flex justify-center mb-16 relative z-10">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="bg-green-800 text-white px-8 py-3 rounded-full shadow-xl font-serif font-bold text-lg flex items-center gap-3 relative"
                    >
                      <Leaf size={20} className="text-green-400" />
                      {designation}
                      
                      {/* Branch Runner (Vertical) */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-16 bg-green-600/20">
                         <motion.div 
                           initial={{ height: 0 }}
                           whileInView={{ height: '100%' }}
                           viewport={{ once: true }}
                           transition={{ duration: 1, delay: 0.5 }}
                           className="w-full bg-green-600/40 relative"
                         >
                            <Leaf size={8} className="absolute top-1/2 -left-1 text-green-600/40 -rotate-45" />
                         </motion.div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Members of this section as Leaves */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
                    {sectionMembers.map((member, mIdx) => (
                      <div key={member.id} className="relative">
                        {/* Horizontal Runner to Card (Visual only) */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-green-600/20 md:hidden">
                           <motion.div 
                             initial={{ height: 0 }}
                             whileInView={{ height: '100%' }}
                             viewport={{ once: true }}
                             transition={{ duration: 0.5, delay: mIdx * 0.1 + 0.5 }}
                             className="w-full bg-green-600/40"
                           />
                        </div>
                        <MemberCard member={member} index={mIdx} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Organic Background Elements */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
              <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-900 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-green-900 rounded-full blur-[100px]"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Scroll Progress Indicator (The Growing Vine) */}
      <motion.div 
        className="fixed right-8 top-1/2 -translate-y-1/2 w-1 h-64 bg-green-100 rounded-full overflow-hidden hidden lg:block"
      >
        <motion.div 
          style={{ scaleY }}
          className="w-full h-full bg-green-600 origin-top"
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600">
           <Leaf size={12} />
        </div>
      </motion.div>
    </div>
  );
};

export default EditorialBoard;
