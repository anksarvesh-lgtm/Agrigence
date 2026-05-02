import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { jsPDF } from 'jspdf';
import { formatCurrency } from '../../lib/kisanUtils';
import { Plus, Download, FileText, IndianRupee, TrendingUp, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '../../App';
import { useLanguage } from '../../lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Khatabook: React.FC = () => {
  const { user } = useAuth();
  const { t: translate } = useLanguage();
  const [activeCycleId, setActiveCycleId] = useState<number | null>(null);
  const [newCycleName, setNewCycleName] = useState('');
  const [expectedSalePrice, setExpectedSalePrice] = useState<string>('');
  const [newExpense, setNewExpense] = useState({ category: 'Seeds', amount: '', date: new Date().toISOString().split('T')[0] });
  const [showHelp, setShowHelp] = useState(false);

  const cycles = useLiveQuery(() => user ? db.cropCycles.where('userId').equals(user.id).toArray() : [], [user?.id]);
  const expenses = useLiveQuery(
    () => (activeCycleId && user) ? db.expenses.where('cycleId').equals(activeCycleId).and(e => e.userId === user.id).toArray() : [],
    [activeCycleId, user?.id]
  );

  const addCycle = async () => {
    if (!newCycleName || !user) return;
    const id = await db.cropCycles.add({ userId: user.id, name: newCycleName, area: 1, sowingDate: new Date().toISOString() });
    setActiveCycleId(id);
    setNewCycleName('');
  };

  const addExpense = async () => {
    if (!activeCycleId || !newExpense.amount || !user) return;
    await db.expenses.add({
      userId: user.id,
      cycleId: activeCycleId,
      category: newExpense.category as any,
      amount: Number(newExpense.amount),
      date: newExpense.date
    });
    setNewExpense({ ...newExpense, amount: '' });
  };

  const totalInvestment = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  
  // Calculate ROI: ROI = (Sale_Price - Total_Investment) / Total_Investment * 100
  const salePriceVal = Number(expectedSalePrice) || 0;
  const roi = totalInvestment > 0 ? ((salePriceVal - totalInvestment) / totalInvestment) * 100 : 0;

  const exportPDF = () => {
     if(!activeCycleId || !cycles || !expenses) return;
     const cycle = cycles.find(c => c.id === activeCycleId);
     const doc = new jsPDF();
     doc.setFontSize(22);
     doc.text(`Agri-Ledger Report`, 20, 20);
     doc.setFontSize(14);
     doc.text(`Crop Cycle: ${cycle?.name}`, 20, 30);
     doc.text(`Total Investment: Rs. ${totalInvestment}`, 20, 40);
     doc.text(`Final Sale Price: Rs. ${salePriceVal}`, 20, 50);
     doc.text(`Calculated ROI: ${roi.toFixed(2)}%`, 20, 60);
     
     doc.setFontSize(12);
     let y = 80;
     doc.text("Date", 20, y);
     doc.text("Category", 60, y);
     doc.text("Amount (Rs)", 120, y);
     y += 10;
     
     expenses.forEach(e => {
        doc.text(e.date, 20, y);
        doc.text(e.category, 60, y);
        doc.text(e.amount.toString(), 120, y);
        y += 10;
     });

     doc.save(`Khatabook_${cycle?.name}.pdf`);
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto h-full bg-[#fdfbf7] min-h-screen font-serif" style={{ backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "100% 2.5rem" }}>
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[5px_5px_15px_rgba(0,0,0,0.05),-5px_-5px_15px_rgba(255,255,255,0.8)] border-l-4 border-l-[#d97706] border border-y-white border-r-white gap-4 relative overflow-hidden">
         <div className="absolute right-0 top-0 w-32 h-32 bg-[#d97706]/10 rounded-full blur-3xl"></div>
         <div>
            <h1 className="text-3xl font-bold text-[#453c30] tracking-tight">{translate("khata.title")} <span className="text-[#2d5a27]/60 font-light italic text-xl">{translate("khata.subtitle")}</span></h1>
            <p className="text-sm text-stone-500 font-sans mt-1 tracking-wide">{translate("khata.desc")}</p>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={() => setShowHelp(!showHelp)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-sans transition-all border ${showHelp ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
               <HelpCircle size={18} /> {showHelp ? translate("khata.hideGuide") : translate("khata.howToUse")}
            </button>
            {activeCycleId && (
                <button onClick={exportPDF} className="flex items-center gap-2 bg-gradient-to-br from-[#d97706] to-[#b45309] text-white px-5 py-2.5 rounded-xl font-bold font-sans hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md border border-orange-500/20">
                   <Download size={18} /> {translate("khata.exportPdf")}
                </button>
            )}
         </div>
      </div>

      {/* Intro / How to Use Panel */}
      <AnimatePresence>
      {showHelp && (
          <motion.div 
             initial={{ opacity: 0, height: 0, scale: 0.98 }}
             animate={{ opacity: 1, height: 'auto', scale: 1 }}
             exit={{ opacity: 0, height: 0, scale: 0.98 }}
             className="bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 rounded-3xl overflow-hidden shadow-sm font-sans"
          >
             <div className="p-6 flex items-start gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
                     <Info size={24} />
                 </div>
                 <div className="space-y-4 text-indigo-900 w-full">
                     <h3 className="text-lg font-bold">What is this ledger?</h3>
                     <p className="text-sm leading-relaxed">This digital ledger replaces your physical Khatabook. It is designed specifically for farmers to track input costs (seeds, labor, fuel) over a crop's entire lifespan to accurately calculate <strong>Return on Investment (ROI)</strong>.</p>
                     
                     <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-indigo-200/50">
                         <div className="bg-white/60 p-4 rounded-xl border border-indigo-50/50 hover:shadow-md transition-shadow">
                             <p className="font-bold mb-1 text-indigo-800">1. Add a Crop Cycle</p>
                             <p className="text-xs opacity-80">Start by creating a new cycle like "Kharif Paddy 2024" to isolate expenses for that specific harvest.</p>
                         </div>
                         <div className="bg-white/60 p-4 rounded-xl border border-indigo-50/50 hover:shadow-md transition-shadow">
                             <p className="font-bold mb-1 text-indigo-800">2. Log Daily Expenses</p>
                             <p className="text-xs opacity-80">Every time you buy fertilizer, pay for labor, or fill diesel, record it immediately under that cycle.</p>
                         </div>
                         <div className="bg-white/60 p-4 rounded-xl border border-indigo-50/50 hover:shadow-md transition-shadow">
                             <p className="font-bold mb-1 text-indigo-800">3. Generate Bank Report</p>
                             <p className="text-xs opacity-80">Enter your expected or actual sale price to see your profit. Export to PDF to show to KCC banks as proof of investment.</p>
                         </div>
                     </div>
                     <div className="bg-white/50 p-3 rounded-xl border border-indigo-100/80 text-xs mt-4">
                         <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded mr-2">Purpose Note</span> <span className="italic">This data remains strictly private to your device/account. You can use this organized data to negotiate better loan terms or crop insurance.</span>
                     </div>
                 </div>
             </div>
          </motion.div>
      )}
      </AnimatePresence>

      <div className="grid md:grid-cols-3 gap-8 flex-1 items-start mt-2">
         {/* Sidebar: Crop Cycles (Notebook Style binding) */}
         <div className="bg-[#f0ece1] rounded-l-3xl rounded-r-xl shadow-[10px_10px_20px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,0.8)] border border-stone-300 relative p-6 pt-8 font-sans">
            {/* Binding details */}
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-stone-300 shadow-inner rounded-full opacity-50"></div>
            
            <h2 className="font-bold text-xl mb-6 text-[#453c30] uppercase tracking-widest pl-4">{translate("khata.myCrops")}</h2>
            <div className="flex flex-col gap-3 mb-8 pl-4">
               <input 
                  type="text" 
                  placeholder={translate("khata.addCyclePlaceholder")} 
                  className="w-full bg-white/80 border border-stone-300 rounded-xl px-4 py-3 text-sm focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] outline-none shadow-inner"
                  value={newCycleName}
                  onChange={e => setNewCycleName(e.target.value)}
               />
               <button onClick={addCycle} className="bg-gradient-to-r from-[#2d5a27] to-[#1f3f1b] text-white p-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold shadow-[0_4px_10px_rgba(45,90,39,0.3)]">
                  <Plus size={18} /> {translate("khata.addCycle")}
               </button>
            </div>
            
            <div className="space-y-3 pl-4">
               {cycles?.map(c => (
                  <button 
                     key={c.id} 
                     onClick={() => setActiveCycleId(c.id!)}
                     className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all group relative overflow-hidden ${activeCycleId === c.id ? 'bg-white border-[#d97706] shadow-md' : 'bg-transparent border-transparent hover:bg-white/50'}`}
                  >
                     {activeCycleId === c.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#d97706]"></div>}
                     <span className={`font-serif text-lg ${activeCycleId === c.id ? 'text-[#d97706] font-bold' : 'text-stone-600 font-medium group-hover:text-stone-800'}`}>{c.name}</span>
                  </button>
               ))}
               {cycles?.length === 0 && <p className="text-sm text-stone-400 italic text-center py-4 bg-white/30 rounded-xl">{translate("khata.noCrops")}</p>}
            </div>
         </div>

         {/* Main: Expenses (Lined Paper Style) */}
         <div className="md:col-span-2 space-y-8 font-sans">
            {!activeCycleId ? (
               <div className="bg-[#fcfbf9] rounded-3xl shadow-[5px_5px_20px_rgba(0,0,0,0.05),-5px_-5px_20px_rgba(255,255,255,0.8)] border border-stone-200 p-12 text-center text-stone-400 flex flex-col items-center justify-center min-h-[400px] font-sans border-l-8 border-l-stone-300">
                  <FileText size={48} className="mb-4 opacity-30 text-stone-600" />
                  <p className="text-lg">{translate("khata.selectCycle")}</p>
               </div>
            ) : (
               <div className="bg-[#fcfbf9] rounded-3xl shadow-[5px_5px_20px_rgba(0,0,0,0.05),-5px_-5px_20px_rgba(255,255,255,0.8)] border border-stone-200 overflow-hidden border-l-8 border-l-stone-300 relative">
                  {/* Notebook header lines */}
                  <div className="absolute left-0 right-0 top-[80px] h-[1px] bg-red-300/40"></div>
                  <div className="absolute left-0 right-0 top-[84px] h-[1px] bg-red-300/40"></div>
                  <div className="absolute left-16 top-0 bottom-0 w-[1px] bg-red-300/40 z-0"></div>
                  <div className="absolute left-17 top-0 bottom-0 w-[1px] bg-red-300/40 z-0"></div>

                  <div className="relative z-10 px-8 py-10 pl-24">
                      {/* ROI Header Card */}
                      <div className="bg-[#1f3f1b] text-white p-6 rounded-2xl shadow-xl flex justify-between items-center relative overflow-hidden mb-10 border border-[#2d5a27] bg-texture">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                         <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
                         
                         <div className="relative z-10 w-full">
                            <div className="flex flex-col md:flex-row justify-between w-full md:items-end gap-6 border-b border-white/10 pb-5 mb-5">
                               <div>
                                  <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">{translate("khata.totalInputCost")}</p>
                                  <h2 className="text-5xl font-bold font-serif tabular-nums drop-shadow-md">{formatCurrency(totalInvestment)}</h2>
                               </div>
                               
                               <div className="flex flex-col">
                                  <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">{translate("khata.salePrice")}</p>
                                  <div className="flex gap-2 items-center bg-black/20 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                                     <span className="text-xl text-emerald-400 font-bold">₹</span>
                                     <input 
                                        className="bg-transparent text-white placeholder-white/20 outline-none text-2xl font-bold font-serif w-32 focus:border-white tabular-nums"
                                        type="number"
                                        placeholder="0"
                                        value={expectedSalePrice}
                                        onChange={(e) => setExpectedSalePrice(e.target.value)}
                                     />
                                  </div>
                               </div>
                            </div>

                            <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-md">
                               <p className="text-white/80 font-bold uppercase tracking-widest text-xs">{translate("khata.roi")}</p>
                               <h3 className={`text-3xl font-bold font-serif flex items-center gap-2 drop-shadow-md ${roi >= 0 ? 'text-[#a3e635]' : 'text-red-400'}`}>
                                  {roi.toFixed(1)}%
                                  <TrendingUp size={24} className={roi >= 0 ? '' : 'rotate-180 text-red-400'} />
                               </h3>
                            </div>
                         </div>
                         <IndianRupee size={160} className="absolute right-[-30px] top-[-30px] text-white/5 pointer-events-none" />
                      </div>

                      {/* Add Expense Form */}
                      <div className="bg-white/50 backdrop-blur rounded-2xl p-6 border border-stone-200/60 shadow-sm mb-10 relative z-10">
                         <h3 className="font-bold text-lg mb-4 text-[#453c30] flex items-center gap-2"><Plus size={18} className="text-[#d97706]" /> {translate("khata.newEntry")}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <select 
                               className="bg-white border text-sm font-medium border-stone-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 shadow-sm"
                               value={newExpense.category}
                               onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                            >
                               <option value="Seeds">Seeds</option>
                               <option value="Labor">Labor</option>
                               <option value="Fuel">Fuel (Tractor)</option>
                               <option value="Pesticides">Fertilizer/Pesticides</option>
                               <option value="Equipment">Equipment Rent</option>
                               <option value="Irrigation">Irrigation/Water</option>
                               <option value="Other">Other</option>
                            </select>
                            <input 
                               type="number" 
                               placeholder={translate("khata.amount")} 
                               className="bg-white border text-sm font-medium border-stone-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 shadow-sm tabular-nums"
                               value={newExpense.amount}
                               onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                            />
                            <input 
                               type="date" 
                               className="bg-white border text-sm font-medium border-stone-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 shadow-sm"
                               value={newExpense.date}
                               onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                            />
                            <button onClick={addExpense} className="bg-stone-800 text-white px-4 py-3.5 rounded-xl font-bold hover:bg-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                               <Plus size={18} /> {translate("khata.add")}
                            </button>
                         </div>
                      </div>

                      {/* Ledger Lines */}
                      <div className="relative z-10 w-full overflow-hidden">
                         <h3 className="font-serif text-2xl mb-6 text-[#453c30] italic font-semibold border-b-2 border-stone-200 inline-block pr-6">{translate("khata.logs")}</h3>
                         <table className="w-full text-left text-sm font-sans">
                            <thead className="border-b-2 border-stone-300 text-stone-500 uppercase tracking-widest text-[10px] font-bold">
                               <tr>
                                  <th className="px-2 py-4">{translate("khata.date")}</th>
                                  <th className="px-2 py-4">{translate("khata.category")}</th>
                                  <th className="px-2 py-4 text-right">{translate("khata.amountDebit")}</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-200/50">
                               {expenses?.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => (
                                  <tr key={e.id} className="hover:bg-amber-50/50 transition-colors group">
                                     <td className="px-2 py-5 text-stone-500 font-medium font-mono text-xs">{new Date(e.date).toLocaleDateString('en-GB')}</td>
                                     <td className="px-2 py-5 font-bold text-stone-700">{e.category}</td>
                                     <td className="px-2 py-5 font-black text-rose-600/90 text-right tabular-nums text-base group-hover:text-rose-700 transition-colors">- {formatCurrency(e.amount)}</td>
                                  </tr>
                               ))}
                               {(!expenses || expenses.length === 0) && (
                                  <tr><td colSpan={3} className="px-6 py-12 text-center text-stone-400 italic text-base">{translate("khata.emptyLog")}</td></tr>
                               )}
                            </tbody>
                         </table>
                      </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Khatabook;
