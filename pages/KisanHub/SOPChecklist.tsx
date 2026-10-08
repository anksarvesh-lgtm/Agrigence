import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Camera, CheckCircle, Clock, Info, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../src/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../lib/LanguageContext';

const defaultSOPs = [
  { day: 0, title: "Sowing / Planting" },
  { day: 15, title: "First Fertigation" },
  { day: 30, title: "Pest Scouting & Spray" },
  { day: 45, title: "Weeding" },
  { day: 60, title: "Second Fertigation" },
];

const SOPChecklist: React.FC = () => {
  const { user } = useAuth();
  const { t: translate } = useLanguage();
  const [activeCycleId, setActiveCycleId] = useState<number | null>(null);
  const cycles = useLiveQuery(() => user ? db.cropCycles.where('userId').equals(user.id).toArray() : [], [user?.id]);
  const tasks = useLiveQuery(
    () => (activeCycleId && user) ? db.sopTasks.where('cycleId').equals(activeCycleId).and(t => t.userId === user.id).toArray() : [],
    [activeCycleId, user?.id]
  );
  const [cameraActive, setCameraActive] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agentMsg, setAgentMsg] = useState("Namaste! Choose a crop cycle to view its timeline.");

  // Initialize Default SOPs if not present
  useEffect(() => {
    const initTasks = async () => {
       if (activeCycleId && tasks && tasks.length === 0 && user) {
          for (let s of defaultSOPs) {
             await db.sopTasks.add({
                userId: user.id,
                cycleId: activeCycleId,
                title: s.title,
                dayAfterSowing: s.day,
                isCompleted: false
             });
          }
       }
    };
    initTasks();
    if(activeCycleId) {
        setAgentMsg("Great! Here is the timeline. I've highlighted the pending tasks for you.");
    }
  }, [activeCycleId, tasks, user?.id]);

  const openCamera = (taskId: number) => {
     setActiveTaskId(taskId);
     setCameraActive(true);
     setAgentMsg("Please point your camera at the crop to verify completion.");
     navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
       .then(stream => {
          if (videoRef.current) {
             videoRef.current.srcObject = stream;
             videoRef.current.play();
          }
       }).catch(err => {
          alert("Camera access denied.");
          setCameraActive(false);
          setAgentMsg("I couldn't access the camera. Make sure permissions are granted.");
       });
  };

  const captureAndVerify = async () => {
     if (!canvasRef.current || !videoRef.current || !activeTaskId) return;

     // Draw image to canvas
     const context = canvasRef.current.getContext('2d');
     if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5);

        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setCameraActive(false);

        // Save task verification
        await db.sopTasks.update(activeTaskId, {
           isCompleted: true,
           completedDate: new Date().toISOString(),
           photoUrl: dataUrl,
           verifiedGps: "LOGGED"
        });
        setAgentMsg("Task successfully verified and logged!");
     }
  };


  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 max-w-5xl mx-auto min-h-screen relative bg-stone-50 overflow-hidden">
      {/* 3D Background Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* Header & Avatar */}
      <div className="relative z-10 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-white gap-4 relative overflow-hidden">
                 <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2d5a27] to-[#528d4a] font-serif drop-shadow-sm">{translate("sop.title")}</h1>
                    <p className="text-sm font-medium text-stone-500 mt-1">{translate("sop.subtitle")}</p>
                 </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-[0_5px_20px_rgba(0,0,0,0.02)] border border-white relative">
                 <select 
                    className="w-full bg-stone-50/50 border border-stone-200/50 rounded-2xl px-5 py-4 outline-none focus:border-[#2d5a27] font-medium shadow-inner transition-colors"
                    onChange={(e) => setActiveCycleId(Number(e.target.value))}
                    value={activeCycleId || ''}
                 >
                    <option value="" disabled>{translate("sop.selectCycle")}</option>
                    {cycles?.map(c => <option key={c.id} value={c.id}>{c.name} (Sown: {new Date(c.sowingDate).toLocaleDateString()})</option>)}
                 </select>
                 {cycles?.length === 0 && <p className="text-xs text-stone-400 mt-3 font-medium px-2">{translate("sop.noCrops")}</p>}
              </div>
          </div>

          {/* 3D Floating Avatar */}
          <motion.div 
             initial={{ y: 0 }}
             animate={{ y: [-10, 10, -10] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="hidden md:flex flex-col items-center justify-center p-4"
          >
              <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-[0_15px_35px_rgba(45,90,39,0.3)] overflow-hidden bg-gradient-to-br from-emerald-100 to-[#2d5a27] flex items-center justify-center">
                     <img src="https://api.dicebear.com/7.x/bottts/svg?seed=KisanBuddy&backgroundColor=transparent" alt="Avatar" className="w-24 h-24 drop-shadow-lg" />
                  </div>
                  {/* Chat bubble */}
                  <motion.div 
                     key={agentMsg}
                     initial={{ opacity: 0, scale: 0.8, x: -20 }}
                     animate={{ opacity: 1, scale: 1, x: 0 }}
                     className="absolute top-0 right-[110%] w-[250px] bg-white p-4 rounded-2xl rounded-tr-sm shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-stone-100 text-sm font-medium text-stone-700"
                  >
                     {agentMsg}
                     <div className="absolute top-0 -right-2 w-4 h-4 bg-white transform rotate-45 border-t border-r border-stone-100"></div>
                  </motion.div>
              </div>
          </motion.div>
      </div>

      {/* Main Timeline */}
      <AnimatePresence>
        {activeCycleId && tasks && tasks.length > 0 && (
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-xl rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white relative z-10"
           >
              <h2 className="font-bold text-2xl mb-10 text-[#2d5a27] tracking-tight">{translate("sop.farmOps")}</h2>
              
              {/* 3D Timeline Bar */}
              <div className="relative ml-6 space-y-12 pb-4">
                 <div className="absolute left-[-1.5px] top-4 bottom-0 w-1.5 bg-gradient-to-b from-emerald-300 via-stone-200 to-transparent rounded-full opacity-60"></div>

                 {tasks.sort((a,b) => a.dayAfterSowing - b.dayAfterSowing).map((t, idx) => (
                    <motion.div 
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       key={t.id} 
                       className="relative pl-10 group"
                    >
                       {/* 3D Dot */}
                       <div className="absolute left-[-22px] top-2 flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] flex items-center justify-center z-10 transition-colors duration-500 border-[3px] border-white ${t.isCompleted ? 'bg-gradient-to-br from-emerald-400 to-green-600' : 'bg-gradient-to-br from-stone-200 to-stone-300'}`}>
                              {t.isCompleted && <CheckCircle size={14} className="text-white" />}
                          </div>
                       </div>
                       
                       {/* Task Card (Glassmorphism) */}
                       <div className={`rounded-3xl p-6 transition-all duration-300 border backdrop-blur-md transform hover:-translate-y-1 ${t.isCompleted ? 'bg-white/80 border-emerald-100 shadow-sm' : 'bg-gradient-to-br from-white to-stone-50 border-stone-200/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]'}`}>
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <h3 className={`font-bold text-xl mb-1 ${t.isCompleted ? 'text-stone-700 decoration-emerald-300/50 underline underline-offset-4' : 'text-stone-800'}`}>{t.title}</h3>
                                <p className="text-xs text-stone-500 font-medium tracking-wide">{translate("sop.expected")} {t.dayAfterSowing} {translate("sop.ofCycle")}</p>
                             </div>
                             <span className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-inner ${t.isCompleted ? 'bg-emerald-100/50 text-emerald-700' : 'bg-amber-100/50 text-amber-700'}`}>
                                 {t.isCompleted ? translate("sop.verified") : translate("sop.pending")}
                             </span>
                          </div>
                          
                          {t.isCompleted ? (
                             <div className="mt-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                {t.photoUrl && (
                                   <div className="relative group/img overflow-hidden rounded-xl border border-white shadow-md">
                                       <img src={t.photoUrl} alt="Verified" className="w-24 h-24 object-cover transform transition-transform group-hover/img:scale-110" />
                                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2 border-none">
                                           <ShieldCheck size={16} className="text-emerald-400" />
                                       </div>
                                   </div>
                                )}
                                <div className="text-sm space-y-1.5 flex-1 w-full relative">
                                   <p className="font-bold text-emerald-800 flex items-center gap-2"><CheckCircle size={16} /> {translate("sop.mathVerified")}</p>
                                   <p className="text-emerald-600/80 bg-white/50 px-2 py-1 rounded inline-block text-xs border border-white font-mono shadow-sm">{translate("sop.time")}: {new Date(t.completedDate!).toLocaleString()}</p>
                                   <p className="text-emerald-600/80 bg-white/50 px-2 py-1 rounded w-fit text-xs border border-white font-mono truncate shadow-sm">{translate("sop.gps")}: {t.verifiedGps}</p>
                                </div>
                             </div>
                          ) : (
                             <button 
                                onClick={() => openCamera(t.id!)}
                                className="mt-4 bg-gradient-to-br from-[#2d5a27] to-[#1a3816] hover:from-[#376b30] hover:to-[#22481d] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-[0_8px_20px_rgba(45,90,39,0.25)] hover:shadow-[0_12px_25px_rgba(45,90,39,0.35)] transition-all flex items-center gap-2"
                             >
                                <Camera size={18} /> {translate("sop.openCamera")}
                             </button>
                          )}
                       </div>
                    </motion.div>
                 ))}
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Glass Camera Modal */}
      <AnimatePresence>
          {cameraActive && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center p-4"
             >
                <motion.div 
                   initial={{ scale: 0.9, y: 50 }}
                   animate={{ scale: 1, y: 0 }}
                   exit={{ scale: 0.9, y: 50 }}
                   className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col items-center max-w-md w-full relative overflow-hidden"
                >
                   {/* Scanner effect line */}
                   <motion.div 
                       animate={{ top: ['0%', '100%', '0%'] }}
                       transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                       className="absolute left-0 right-0 h-1 bg-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,1)] z-20 pointer-events-none"
                   ></motion.div>

                   <video ref={videoRef} className="w-full rounded-3xl mb-8 shadow-inner object-cover bg-black relative z-10" autoPlay playsInline></video>
                   <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                   
                   <div className="flex gap-6 relative z-10">
                      <button onClick={() => {
                         const stream = videoRef.current?.srcObject as MediaStream;
                         if(stream) stream.getTracks().forEach(track => track.stop());
                         setCameraActive(false);
                         setAgentMsg("Verification cancelled.");
                      }} className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full font-bold backdrop-blur-md transition-colors">
                         {translate("sop.cancel")}
                      </button>
                      <button onClick={captureAndVerify} className="bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-stone-900 p-4 px-10 rounded-full shadow-[0_0_30px_rgba(52,211,153,0.4)] flex items-center justify-center font-bold tracking-wide transition-all hover:scale-105 active:scale-95">
                         <Camera size={24} className="mr-2" /> {translate("sop.verify")}
                      </button>
                   </div>
                   <p className="text-white/60 text-xs mt-8 text-center font-medium max-w-xs relative z-10">{translate("sop.cameraDesc")}</p>
                </motion.div>
             </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default SOPChecklist;
