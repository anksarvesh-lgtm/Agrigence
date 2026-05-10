import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

interface ResultData {
  Design: string;
  Treatments: number;
  Replications: number;
  "C.D. (5%)": string;
  "SE(m)": string;
  "SE(d)": string;
  "C.V. (%)": string;
  "Error Mean Square": string;
  "Error DF": number;
}

interface ChartDataPoint {
  source: string;
  fValue: number;
}

export default function AgriStatisticsCalculator() {
  const [step, setStep] = useState<number>(1);

  const [design, setDesign] = useState<string>("RBD");
  const [treatments, setTreatments] = useState<string>("");
  const [replications, setReplications] = useState<string>("");
  const [data, setData] = useState<string>("");

  const [results, setResults] = useState<ResultData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [error, setError] = useState<string>("");

  const parseData = () => {
    const rows = data
      .trim()
      .split("\n")
      .map((row) => row.trim().split(/\s+/).map(Number));

    return rows;
  };

  const validateData = (rows: number[][], t: number, r: number) => {
    if (rows.length !== t) {
      return `Expected ${t} treatment rows but found ${rows.length}`;
    }

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].length !== r) {
        return `Row ${i + 1} must contain ${r} replication values`;
      }

      for (let j = 0; j < rows[i].length; j++) {
        if (isNaN(rows[i][j])) {
          return `Invalid numeric value detected in row ${i + 1}`;
        }
      }
    }

    return null;
  };

  const calculate = () => {
    setError("");

    const t = parseInt(treatments);
    const r = parseInt(replications);

    if (!t || !r) {
      setError("Please enter treatments and replications.");
      return;
    }

    const rows = parseData();

    const validationError = validateData(rows, t, r);

    if (validationError) {
      setError(validationError);
      return;
    }

    let grandTotal = 0;

    rows.forEach((row) => {
      row.forEach((value) => {
        grandTotal += value;
      });
    });

    const totalObservations = t * r;

    const correctionFactor =
      (grandTotal * grandTotal) / totalObservations;

    let totalSS = 0;

    rows.forEach((row) => {
      row.forEach((value) => {
        totalSS += value * value;
      });
    });

    totalSS -= correctionFactor;

    let treatmentSS = 0;

    rows.forEach((row) => {
      const rowSum = row.reduce((a, b) => a + b, 0);
      treatmentSS += (rowSum * rowSum) / r;
    });

    treatmentSS -= correctionFactor;

    let replicationSS = 0;

    for (let j = 0; j < r; j++) {
      let colSum = 0;

      for (let i = 0; i < t; i++) {
        colSum += rows[i][j];
      }

      replicationSS += (colSum * colSum) / t;
    }

    replicationSS -= correctionFactor;

    const errorSS = totalSS - treatmentSS - replicationSS;

    const errorDF = (t - 1) * (r - 1);

    const mse = errorSS / errorDF;

    const tMS = treatmentSS / (t - 1);
    const rMS = replicationSS / (r - 1);
    
    // F-Calculated values
    const fCalTreatment = tMS / mse;
    const fCalReplication = rMS / mse;
    
    setChartData([
      { source: "Treatments", fValue: Number(fCalTreatment.toFixed(2)) },
      { source: "Replications", fValue: Number(fCalReplication.toFixed(2)) },
      { source: "Error", fValue: 1.0 }, // Base reference for Error M.S.
    ]);

    const sem = Math.sqrt(mse / r);

    const sed = Math.sqrt((2 * mse) / r);

    const tValue = 2.179;

    const cd = sed * tValue;

    const mean = grandTotal / totalObservations;

    const cv = (Math.sqrt(mse) / mean) * 100;

    const finalResults: ResultData = {
      Design: design,
      Treatments: t,
      Replications: r,
      "C.D. (5%)": cd.toFixed(2),
      "SE(m)": sem.toFixed(2),
      "SE(d)": sed.toFixed(2),
      "C.V. (%)": cv.toFixed(2),
      "Error Mean Square": mse.toFixed(4),
      "Error DF": errorDF,
    };

    setResults(finalResults);
    setStep(2);
  };

  const downloadExcel = () => {
    if (!results) return;

    const worksheet = XLSX.utils.json_to_sheet([results]);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Statistics Result"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, "Agricultural_Statistics_Result.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
        <h1 className="text-4xl font-black text-center mb-10 text-slate-800 tracking-tight">
          Agricultural Statistics Calculator
        </h1>

        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-10"
          >
            {/* Visual Column */}
            <div className="lg:col-span-2 flex flex-col justify-center items-center bg-gradient-to-tr from-green-100 to-emerald-50 rounded-3xl p-8 border border-green-200 shadow-inner perspective-1000 hidden md:flex">
               <motion.div 
                 animate={{ rotateY: [0, 10, -10, 0], rotateX: [0, -5, 5, 0] }}
                 transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                 className="relative w-full aspect-square flex items-center justify-center"
               >
                 {/* 3D-like Box Graphic */}
                 <div className="absolute w-48 h-48 bg-emerald-500/20 rounded-xl transform rotate-45 scale-y-50 -scale-x-100 blur-xl"></div>
                 <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-2xl">
                   <g transform="translate(100, 100) rotate(-30) skewX(30)">
                     <rect x="-50" y="-50" width="100" height="100" fill="#10B981" opacity="0.9" rx="10"/>
                     <rect x="-40" y="-40" width="40" height="40" fill="#34D399" opacity="0.9" rx="5"/>
                     <rect x="0" y="-40" width="40" height="40" fill="#059669" opacity="0.9" rx="5"/>
                     <rect x="-40" y="0" width="40" height="40" fill="#059669" opacity="0.9" rx="5"/>
                     <rect x="0" y="0" width="40" height="40" fill="#065F46" opacity="0.9" rx="5"/>
                     
                     <g transform="translate(0, -60)">
                        <rect x="-30" y="-30" width="60" height="60" fill="#6EE7B7" opacity="0.7" rx="5"/>
                     </g>
                     
                     <g transform="translate(0, -120)">
                        <rect x="-20" y="-20" width="40" height="40" fill="#A7F3D0" opacity="0.6" rx="5"/>
                     </g>
                   </g>
                 </svg>
                 <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-emerald-800 font-bold uppercase tracking-widest text-sm opacity-60">ANOVA Engine</p>
                 </div>
               </motion.div>
            </div>

            {/* Input Column */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div whileHover={{ scale: 1.01 }} className="group">
                <label className="block font-semibold mb-2 text-slate-700 group-hover:text-emerald-700 transition-colors">
                  Experimental Design
                </label>
                <select
                  value={design}
                  onChange={(e) => setDesign(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none appearance-none"
                >
                  <option value="RBD">Randomized Block Design (RBD)</option>
                  <option value="CRD">Completely Randomized Design (CRD)</option>
                  <option value="Factorial RBD">Factorial RBD</option>
                  <option value="Split Plot">Split Plot Design</option>
                </select>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div whileHover={{ scale: 1.01 }} className="group">
                  <label className="block font-semibold mb-2 text-slate-700 group-hover:text-emerald-700 transition-colors">
                    Number of Treatments
                  </label>
                  <input
                    type="number"
                    value={treatments}
                    onChange={(e) => setTreatments(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none"
                    placeholder="E.g., 5"
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }} className="group">
                  <label className="block font-semibold mb-2 text-slate-700 group-hover:text-emerald-700 transition-colors">
                    Number of Replications
                  </label>
                  <input
                    type="number"
                    value={replications}
                    onChange={(e) => setReplications(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none"
                    placeholder="E.g., 3"
                  />
                </motion.div>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} className="group">
                <label className="block font-semibold mb-2 text-slate-700 group-hover:text-emerald-700 transition-colors">
                  Paste Experimental Data
                </label>
                <textarea
                  rows={8}
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none font-mono text-sm resize-none"
                  placeholder={"10.90 11.04 10.90\n9.32 10.64 10.70\n10.46 9.80 10.24"}
                />
              </motion.div>

              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-2xl shadow-sm font-medium">
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculate}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-emerald-200 transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                Calculate Statistics
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && results && (
          <motion.div 
            initial={{ opacity: 0, rotateX: -15, y: 50 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="perspective-1000"
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">
              Statistical Analysis
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(results).map(([key, value], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all hover:rotate-2 hover:scale-105"
                >
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {key}
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>

            {chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-10 bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">F-Calculated Values</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="fValue" name="F-Calculated Value" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
              <button
                onClick={() => setStep(1)}
                className="bg-slate-700 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-2xl transition-all"
              >
                Back to Input
              </button>

              <button
                onClick={downloadExcel}
                className="bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-green-200 transition-all hover:scale-105"
              >
                Download Excel Result
              </button>
            </div>
          </motion.div>
        )}

        
      </div>
    </div>
  );
}
