import React, { useState } from 'react';
import { Files, UploadCloud, CheckCircle, AlertTriangle, FileText, Check } from 'lucide-react';

export default function BulkUpload() {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-black">Bulk Ingestion Engine</h1>
          <p className="text-sm text-stone-500 mt-1">Upload CSV, XLSX, DOCX, JSON, or PDF files to automatically parse and extract MCQs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upload Zone */}
        <div className="flex flex-col gap-4">
           <div 
             className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors
               ${dragActive ? 'border-agri-secondary bg-agri-secondary/5' : 'border-admin-border bg-white hover:bg-stone-50'}`}
             onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
             onDragLeave={() => setDragActive(false)}
             onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
           >
              <div className="w-16 h-16 rounded-full bg-agri-secondary/10 flex items-center justify-center mb-4 text-agri-secondary">
                 <UploadCloud size={32} />
              </div>
              <h3 className="font-bold text-lg text-black mb-1">Drag and drop your file here</h3>
              <p className="text-sm text-stone-500 mb-6">Supports .csv, .xlsx, .docx, .json</p>
              
              <button className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-stone-800 transition-colors">
                Browse Files
              </button>
           </div>
           
           <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
             <AlertTriangle size={18} className="shrink-0 mt-0.5" />
             <p>Our ingestion engine automatically maps Column A to questions, B-E to options, and F to the correct answer. Please refer to the <a href="#" className="font-bold underline">template</a>.</p>
           </div>
        </div>

        {/* Upload History / Pipeline */}
        <div className="dashboard-card bg-white p-6 rounded-2xl border border-admin-border flex flex-col">
          <h3 className="font-bold text-lg mb-4">Ingestion Pipeline</h3>
          
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
             
             {/* Stage: Complete */}
             <div className="border border-admin-border rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden bg-stone-50">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
               <div className="flex items-start justify-between">
                 <div className="flex items-center gap-2">
                   <FileText size={16} className="text-stone-500"/>
                   <span className="font-bold text-sm">agriculture_pyq_2023.csv</span>
                 </div>
                 <span className="text-[10px] bg-green-100 text-green-700 font-bold uppercase py-0.5 px-2 rounded">Complete</span>
               </div>
               <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
                  <span className="flex items-center gap-1"><Check size={12} className="text-green-500"/> 124 Questions Parsed</span>
               </div>
             </div>
             
             {/* Stage: Review Required */}
             <div className="border border-admin-border rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden bg-white">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
               <div className="flex items-start justify-between">
                 <div className="flex items-center gap-2">
                   <FileText size={16} className="text-stone-500"/>
                   <span className="font-bold text-sm">soil_science_chapter_4.docx</span>
                 </div>
                 <span className="text-[10px] bg-orange-100 text-orange-700 font-bold uppercase py-0.5 px-2 rounded">Review Required</span>
               </div>
               <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
                  <span>80 Parsed</span>
                  <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> 3 Validation Errors</span>
               </div>
               <button className="mt-2 text-[10px] uppercase font-bold tracking-widest bg-black text-white py-1.5 rounded w-full">Review Errors</button>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
}
