import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { calculateANOVA, AnovaInput, AnovaOutput } from './anova';
import OutputSheets from './OutputSheets';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../App';

const StudentPortal: React.FC = () => {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<{ input: AnovaInput; result: AnovaOutput } | null>(null);
  const [reportId, setReportId] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-[#1e4080]', 'bg-[#1e4080]/5');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-[#1e4080]', 'bg-[#1e4080]/5');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-[#1e4080]', 'bg-[#1e4080]/5');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setOutput(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Strip empty rows
        const cleanData = json.filter(row => row.some(cell => cell !== undefined && cell !== null && cell !== ''));
        
        if (cleanData.length < 2) {
          throw new Error("File does not contain enough data.");
        }

        // Auto-detect logic
        let hasHeader = false;
        let hasTreatmentLabels = false;

        // a) Check if Row 1, Cell 2 is non-numeric -> header row exists
        if (cleanData[0].length > 1 && isNaN(Number(cleanData[0][1]))) {
          hasHeader = true;
        }

        // b) Check if Row 2 (or Row 1 if no header), Cell 1 is non-numeric -> treatment label column exists
        const firstDataRowIndex = hasHeader ? 1 : 0;
        if (cleanData[firstDataRowIndex] && cleanData[firstDataRowIndex].length > 0 && isNaN(Number(cleanData[firstDataRowIndex][0]))) {
          hasTreatmentLabels = true;
        }

        const treatments: string[] = [];
        const replications: string[] = [];
        const matrix: number[][] = [];

        // Extract Replications (Headers)
        const startCol = hasTreatmentLabels ? 1 : 0;
        const numCols = cleanData[firstDataRowIndex].length;
        
        if (hasHeader) {
          for (let j = startCol; j < numCols; j++) {
            replications.push(cleanData[0][j] ? String(cleanData[0][j]) : `Rep ${j - startCol + 1}`);
          }
        } else {
          for (let j = startCol; j < numCols; j++) {
            replications.push(`Rep ${j - startCol + 1}`);
          }
        }

        // Extract Treatments and Matrix
        for (let i = firstDataRowIndex; i < cleanData.length; i++) {
          const row = cleanData[i];
          if (hasTreatmentLabels) {
            treatments.push(row[0] ? String(row[0]) : `T${i - firstDataRowIndex + 1}`);
          } else {
            treatments.push(`T${i - firstDataRowIndex + 1}`);
          }

          const numRow: number[] = [];
          for (let j = startCol; j < numCols; j++) {
            const val = Number(row[j]);
            if (isNaN(val)) {
              throw new Error(`Non-numeric data found at row ${i + 1}, column ${j + 1}.`);
            }
            numRow.push(val);
          }
          matrix.push(numRow);
        }

        // Validate equal column counts
        const rCount = matrix[0].length;
        if (matrix.some(row => row.length !== rCount)) {
          throw new Error("Unequal replications per treatment. Check your file.");
        }

        const input: AnovaInput = {
          title: title || 'Untitled Experiment',
          treatments,
          replications,
          matrix
        };

        const result = calculateANOVA(input);
        if (result.error) {
          if (user) {
            mockBackend.saveToolHistory({
              userId: user.id,
              toolName: 'Research Data Lab (Upload)',
              status: 'FAILED',
              timestamp: new Date().toISOString(),
              inputData: input,
              outputData: { error: result.message }
            }).catch(console.error);
          }
          throw new Error(result.message);
        }

        setOutput({ input, result });
        setReportId(`REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
        
        if (user) {
          mockBackend.saveToolHistory({
            userId: user.id,
            toolName: 'Research Data Lab (Upload)',
            status: 'SUCCESS',
            timestamp: new Date().toISOString(),
            inputData: input,
            outputData: result
          }).catch(console.error);
        }
        
      } catch (err: any) {
        setError(err.message || "Could not parse file. Ensure it is .xlsx, .xls, or .csv.");
        setFile(null);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleReset = () => {
    setFile(null);
    setOutput(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Student Info & Guide */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d4cfc6] space-y-4">
            <h3 className="font-serif font-bold text-[#1e4080] text-lg border-b border-[#d4cfc6] pb-2">Student Information</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Student Name</label>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name..."
                className="w-full p-3 border border-[#d4cfc6] rounded-xl focus:outline-none focus:border-[#1e4080] focus:ring-1 focus:ring-[#1e4080] font-serif"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Experiment Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter experiment title..."
                className="w-full p-3 border border-[#d4cfc6] rounded-xl focus:outline-none focus:border-[#1e4080] focus:ring-1 focus:ring-[#1e4080] font-serif"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Date of Analysis</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-[#d4cfc6] rounded-xl focus:outline-none focus:border-[#1e4080] focus:ring-1 focus:ring-[#1e4080] font-serif"
              />
            </div>
          </div>

          <div className="bg-[#f7f5f0] p-6 rounded-2xl border border-[#d4cfc6]">
            <h4 className="font-serif font-bold text-[#1a1a1a] mb-4">Excel/CSV Format Guide</h4>
            <div className="bg-white border border-[#d4cfc6] rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm font-mono text-center">
                <thead className="bg-[#1e4080] text-white">
                  <tr>
                    <th className="p-2 border-r border-[#1e4080]/20">Treatment</th>
                    <th className="p-2 border-r border-[#1e4080]/20">Rep I</th>
                    <th className="p-2 border-r border-[#1e4080]/20">Rep II</th>
                    <th className="p-2">Rep III</th>
                  </tr>
                </thead>
                <tbody className="text-[#1a1a1a]">
                  <tr className="border-b border-[#d4cfc6]">
                    <td className="p-2 border-r border-[#d4cfc6] bg-[#e8f4ee] font-bold text-[#1a6b3c]">T1</td>
                    <td className="p-2 border-r border-[#d4cfc6]">12.5</td>
                    <td className="p-2 border-r border-[#d4cfc6]">13.2</td>
                    <td className="p-2">11.8</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-[#d4cfc6] bg-[#e8f4ee] font-bold text-[#1a6b3c]">T2</td>
                    <td className="p-2 border-r border-[#d4cfc6]">15.3</td>
                    <td className="p-2 border-r border-[#d4cfc6]">14.8</td>
                    <td className="p-2">16.1</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="text-sm text-[#8a8a8a] space-y-2 list-disc pl-5">
              <li>Row 1 = Headers (optional — auto-detected)</li>
              <li>Column A = Treatment names (optional — auto-detected)</li>
              <li>Data cells = Numeric only</li>
              <li>Minimum: 2 treatments × 2 replications</li>
              <li>Pure numeric grids (no labels) also work</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Upload Zone */}
        <div className="space-y-6">
          <div 
            className="border-2 border-dashed border-[#d4cfc6] rounded-3xl p-12 text-center transition-colors hover:border-[#1e4080] hover:bg-[#1e4080]/5 cursor-pointer flex flex-col items-center justify-center min-h-[300px] bg-white"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
            />
            <div className="w-16 h-16 bg-[#1e4080]/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📤</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-[#1a1a1a] mb-2">Upload Data File</h3>
            <p className="text-[#8a8a8a] text-sm mb-6">Drag and drop your Excel or CSV file here, or click to browse.</p>
            
            {file && (
              <div className="bg-[#e8f4ee] text-[#1a6b3c] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                📄 {file.name}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-[#fef2f2] border-l-4 border-[#b91c1c] p-4 rounded-r-xl text-[#b91c1c] font-serif">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      {/* Output Section */}
      {output && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-r from-[#1a6b3c] to-[#1e4080] rounded-2xl p-6 text-white flex justify-between items-center shadow-md mb-8">
            <div>
              <h2 className="font-serif font-bold text-2xl mb-1">Analysis Complete</h2>
              <div className="flex gap-4 text-sm opacity-90">
                <span>👤 {studentName || 'Anonymous Student'}</span>
                <span>📄 {file?.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest opacity-70 font-bold mb-1">Report ID</div>
              <div className="font-mono font-bold text-xl">{reportId}</div>
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <button 
              onClick={handleReset}
              className="bg-white border border-[#d4cfc6] text-[#1a1a1a] px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#f7f5f0] transition-colors flex items-center gap-2"
            >
              ↩ Upload New File
            </button>
          </div>

          <OutputSheets input={output.input} output={output.result} />
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
