import React from 'react';
import { AnovaOutput, AnovaInput } from './anova';
import { COLORS } from './constants';

interface OutputSheetsProps {
  input: AnovaInput;
  output: AnovaOutput;
}

const OutputSheets: React.FC<OutputSheetsProps> = ({ input, output }) => {
  const { treatments, replications, matrix } = input;
  const { summary, ss, df, ms, f_calculated, t_value, results, treatment_means, treatment_totals, significance, cv_classification, steps, treatment_comparison } = output;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mt-12 space-y-12 print:mt-0 print:space-y-8" id="printable-area">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-serif font-bold text-[#1a6b3c]">Analysis Results</h2>
        <button 
          onClick={handlePrint}
          className="bg-[#1a6b3c] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#2d8a54] transition-colors flex items-center gap-2"
        >
          🖨 Print / Export PDF
        </button>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 border-b border-[#d4cfc6] pb-4">
        <h1 className="text-2xl font-serif font-bold text-[#1a6b3c]">Fivearth Farms | Research Data Lab</h1>
        <h2 className="text-xl font-serif mt-2">{input.title || 'Untitled Experiment'}</h2>
        <div className="text-sm text-[#8a8a8a] mt-2 flex gap-4">
          <span>Treatments: {summary.t}</span>
          <span>Replications: {summary.r}</span>
          <span>Generated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Sheet 1: Raw Data Sheet */}
      <div className="bg-white border border-[#d4cfc6] rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none">
        <div className="bg-[#1a6b3c] text-white px-4 py-3 border-b border-[#d4cfc6]">
          <h3 className="font-serif font-bold">SHEET 1 — RAW DATA SHEET</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a6b3c] text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3 border border-[#d4cfc6]">Treatment</th>
                {replications.map((rep, i) => (
                  <th key={i} className="p-3 border border-[#d4cfc6]">{rep}</th>
                ))}
                <th className="p-3 border border-[#d4cfc6] bg-[#2d8a54]">Total (Ti)</th>
                <th className="p-3 border border-[#d4cfc6] bg-[#2d8a54]">Mean (x̄i)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {matrix.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafaf8]'}>
                  <td className="p-3 border border-[#d4cfc6] bg-[#e8f4ee] text-[#1a6b3c] font-bold">{treatments[i]}</td>
                  {row.map((val, j) => (
                    <td key={j} className="p-3 border border-[#d4cfc6] text-right">{val.toFixed(4)}</td>
                  ))}
                  <td className="p-3 border border-[#d4cfc6] text-right font-bold text-[#b5860d]">{treatment_totals[i].toFixed(4)}</td>
                  <td className="p-3 border border-[#d4cfc6] text-right font-bold text-[#b5860d]">{treatment_means[i].toFixed(4)}</td>
                </tr>
              ))}
              <tr className="bg-[#fdf8ec]">
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#b5860d]">Column Total</td>
                {replications.map((_, j) => {
                  let colTotal = 0;
                  for (let i = 0; i < summary.t; i++) colTotal += matrix[i][j];
                  return <td key={j} className="p-3 border border-[#d4cfc6] text-right font-bold text-[#b5860d]">{colTotal.toFixed(4)}</td>;
                })}
                <td className="p-3 border border-[#d4cfc6] bg-[#1a6b3c] text-white text-right font-bold" colSpan={2}>
                  G = {summary.G.toFixed(4)} | x̄ = {summary.grand_mean.toFixed(4)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sheet 2: Calculation Sheet */}
      <div className="bg-white border border-[#d4cfc6] rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none print:break-inside-avoid">
        <div className="bg-[#1a6b3c] text-white px-4 py-3 border-b border-[#d4cfc6]">
          <h3 className="font-serif font-bold">SHEET 2 — CALCULATION SHEET</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a6b3c] text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3 border border-[#d4cfc6]">Step</th>
                <th className="p-3 border border-[#d4cfc6]">Parameter</th>
                <th className="p-3 border border-[#d4cfc6]">Formula</th>
                <th className="p-3 border border-[#d4cfc6]">Substitution & Working</th>
                <th className="p-3 border border-[#d4cfc6]">Result</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {steps.map((step, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafaf8]'}>
                  <td className="p-3 border border-[#d4cfc6] bg-[#e8f4ee] text-[#1a6b3c] font-bold text-center">{step.step}</td>
                  <td className="p-3 border border-[#d4cfc6]">{step.name}</td>
                  <td className="p-3 border border-[#d4cfc6] text-[#1e4080]">{step.formula}</td>
                  <td className="p-3 border border-[#d4cfc6] text-[#8a8a8a]">{step.substitution}</td>
                  <td className="p-3 border border-[#d4cfc6] font-bold text-right">{step.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sheet 3: ANOVA Table */}
      <div className="bg-white border border-[#d4cfc6] rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none print:break-inside-avoid">
        <div className="bg-[#1a6b3c] text-white px-4 py-3 border-b border-[#d4cfc6]">
          <h3 className="font-serif font-bold">SHEET 3 — ANOVA TABLE</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a6b3c] text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3 border border-[#d4cfc6]">Source</th>
                <th className="p-3 border border-[#d4cfc6] text-right">df</th>
                <th className="p-3 border border-[#d4cfc6] text-right">SS</th>
                <th className="p-3 border border-[#d4cfc6] text-right">MS</th>
                <th className="p-3 border border-[#d4cfc6] text-right">F-Calculated</th>
                <th className="p-3 border border-[#d4cfc6] text-center">Significance</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              <tr className="bg-white">
                <td className="p-3 border border-[#d4cfc6] font-bold">Treatment</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{df.treatment}</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{ss.SS_treatment.toFixed(4)}</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{ms.treatment.toFixed(4)}</td>
                <td className="p-3 border border-[#d4cfc6] text-right font-bold">{f_calculated.toFixed(4)}</td>
                <td className="p-3 border border-[#d4cfc6] text-center" rowSpan={2}>
                  {significance === "Significant" ? (
                    <span className="text-[#b91c1c] font-bold">★ Significant</span>
                  ) : (
                    <span className="text-[#8a8a8a]">NS</span>
                  )}
                </td>
              </tr>
              <tr className="bg-[#fafaf8]">
                <td className="p-3 border border-[#d4cfc6] font-bold">Error (Residual)</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{df.error}</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{ss.SS_error.toFixed(4)}</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{ms.error.toFixed(4)}</td>
                <td className="p-3 border border-[#d4cfc6] text-right">—</td>
              </tr>
              <tr className="bg-[#1a6b3c] text-white">
                <td className="p-3 border border-[#d4cfc6] font-bold">Total</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{df.total}</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{ss.TSS.toFixed(4)}</td>
                <td className="p-3 border border-[#d4cfc6] text-right">—</td>
                <td className="p-3 border border-[#d4cfc6] text-right">—</td>
                <td className="p-3 border border-[#d4cfc6] text-center">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 text-xs text-[#8a8a8a] italic border-t border-[#d4cfc6]">
          Note: Tabulated F should be verified at df₁={df.treatment}, df₂={df.error}
        </div>
      </div>

      {/* Sheet 4: Summary Statistics Sheet */}
      <div className="bg-white border border-[#d4cfc6] rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none print:break-inside-avoid">
        <div className="bg-[#1a6b3c] text-white px-4 py-3 border-b border-[#d4cfc6]">
          <h3 className="font-serif font-bold">SHEET 4 — SUMMARY STATISTICS SHEET</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a6b3c] text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3 border border-[#d4cfc6]">Parameter</th>
                <th className="p-3 border border-[#d4cfc6]">Symbol</th>
                <th className="p-3 border border-[#d4cfc6]">Formula</th>
                <th className="p-3 border border-[#d4cfc6] text-right">Value</th>
                <th className="p-3 border border-[#d4cfc6]">Interpretation</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              <tr className="bg-white">
                <td className="p-3 border border-[#d4cfc6]">Grand Mean</td>
                <td className="p-3 border border-[#d4cfc6] font-bold">x̄</td>
                <td className="p-3 border border-[#d4cfc6] text-[#1e4080]">G ÷ (t × r)</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{summary.grand_mean.toFixed(4)}</td>
                <td className="p-3 border border-[#d4cfc6] text-[#8a8a8a]">Overall average</td>
              </tr>
              <tr className="bg-[#fafaf8]">
                <td className="p-3 border border-[#d4cfc6]">Mean Square Error</td>
                <td className="p-3 border border-[#d4cfc6] font-bold">MSE</td>
                <td className="p-3 border border-[#d4cfc6] text-[#1e4080]">SS(E) ÷ df(E)</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{ms.error.toFixed(4)}</td>
                <td className="p-3 border border-[#d4cfc6] text-[#8a8a8a]">df = {df.error}</td>
              </tr>
              <tr className="bg-white">
                <td className="p-3 border border-[#d4cfc6]">Standard Error of Mean</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#1a6b3c]">SEm</td>
                <td className="p-3 border border-[#d4cfc6] text-[#1e4080]">√(MSE ÷ r)</td>
                <td className="p-3 border border-[#d4cfc6] text-right text-[#1a6b3c] font-bold">±{results.SEm.toFixed(4)}</td>
                <td className="p-3 border border-[#d4cfc6] text-[#8a8a8a]">Precision of treatment mean</td>
              </tr>
              <tr className="bg-[#fafaf8]">
                <td className="p-3 border border-[#d4cfc6]">Standard Error of Difference</td>
                <td className="p-3 border border-[#d4cfc6] font-bold">SEd</td>
                <td className="p-3 border border-[#d4cfc6] text-[#1e4080]">√(2×MSE ÷ r)</td>
                <td className="p-3 border border-[#d4cfc6] text-right">{results.SEd.toFixed(4)}</td>
                <td className="p-3 border border-[#d4cfc6] text-[#8a8a8a]">Used for CD calculation</td>
              </tr>
              <tr className="bg-white">
                <td className="p-3 border border-[#d4cfc6]">Critical Difference (5%)</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#b91c1c]">CD</td>
                <td className="p-3 border border-[#d4cfc6] text-[#1e4080]">SEd × t(0.05, df_e)</td>
                <td className="p-3 border border-[#d4cfc6] text-right text-[#b91c1c] font-bold">
                  {typeof results.CD_5pct === 'number' ? results.CD_5pct.toFixed(4) : results.CD_5pct}
                </td>
                <td className="p-3 border border-[#d4cfc6] text-[#8a8a8a]">t={t_value.toFixed(3)} at df={df.error}</td>
              </tr>
              <tr className="bg-[#fafaf8]">
                <td className="p-3 border border-[#d4cfc6]">Coefficient of Variation</td>
                <td className="p-3 border border-[#d4cfc6] font-bold">CV%</td>
                <td className="p-3 border border-[#d4cfc6] text-[#1e4080]">(√MSE ÷ x̄) × 100</td>
                <td className="p-3 border border-[#d4cfc6] text-right font-bold">{results.CV_pct.toFixed(2)} %</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#1a6b3c]">{cv_classification}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sheet 5: Treatment Comparison Sheet */}
      <div className="bg-white border border-[#d4cfc6] rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none print:break-inside-avoid">
        <div className="bg-[#1a6b3c] text-white px-4 py-3 border-b border-[#d4cfc6]">
          <h3 className="font-serif font-bold">SHEET 5 — TREATMENT COMPARISON SHEET</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-[#1a6b3c] text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3 border border-[#d4cfc6]">Treatment</th>
                {treatments.map((t, i) => (
                  <th key={i} className="p-3 border border-[#d4cfc6]" title={t}>
                    {t.length > 14 ? t.substring(0, 14) + '…' : t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {treatments.map((t_row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafaf8]'}>
                  <td className="p-3 border border-[#d4cfc6] bg-[#e8f4ee] text-[#1a6b3c] font-bold text-left">{t_row}</td>
                  {treatments.map((t_col, j) => {
                    if (i === j) return <td key={j} className="p-3 border border-[#d4cfc6] text-[#8a8a8a]">—</td>;
                    
                    const comp = treatment_comparison.find(
                      c => (c.treatment_i === t_row && c.treatment_j === t_col) || 
                           (c.treatment_i === t_col && c.treatment_j === t_row)
                    );
                    
                    if (!comp) return <td key={j} className="p-3 border border-[#d4cfc6]">—</td>;
                    
                    if (comp.significant) {
                      return (
                        <td key={j} className="p-3 border border-[#d4cfc6] bg-[#fef2f2] text-[#b91c1c] font-bold border-l-4 border-l-[#b91c1c]">
                          {comp.difference.toFixed(4)} ★
                        </td>
                      );
                    } else {
                      return (
                        <td key={j} className="p-3 border border-[#d4cfc6] text-[#8a8a8a]">
                          {comp.difference.toFixed(4)}
                        </td>
                      );
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 text-xs text-[#8a8a8a] italic border-t border-[#d4cfc6]">
          Note: ★ = Significant (diff &gt; CD {typeof results.CD_5pct === 'number' ? results.CD_5pct.toFixed(4) : 'NS'})
        </div>
      </div>

      {/* Sheet 6: Experimental Precision Table */}
      <div className="bg-white border border-[#d4cfc6] rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none print:break-inside-avoid">
        <div className="bg-[#1a6b3c] text-white px-4 py-3 border-b border-[#d4cfc6]">
          <h3 className="font-serif font-bold">SHEET 6 — EXPERIMENTAL PRECISION TABLE</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a6b3c] text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3 border border-[#d4cfc6]">CV% Range</th>
                <th className="p-3 border border-[#d4cfc6]">Classification</th>
                <th className="p-3 border border-[#d4cfc6]">Implication</th>
                <th className="p-3 border border-[#d4cfc6]">Status</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              <tr className={cv_classification === 'Excellent' ? 'bg-[#e8f4ee] border-2 border-[#1a6b3c]' : 'bg-white'}>
                <td className="p-3 border border-[#d4cfc6]">&lt; 10 %</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#1a6b3c]">Excellent</td>
                <td className="p-3 border border-[#d4cfc6]">Very high precision, highly reliable results</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#1a6b3c]">{cv_classification === 'Excellent' ? '◄ YOUR DATA' : ''}</td>
              </tr>
              <tr className={cv_classification === 'Good' ? 'bg-[#e8f4ee] border-2 border-[#1a6b3c]' : 'bg-[#fafaf8]'}>
                <td className="p-3 border border-[#d4cfc6]">10–20 %</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#1a6b3c]">Good</td>
                <td className="p-3 border border-[#d4cfc6]">Acceptable precision, standard for field trials</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#1a6b3c]">{cv_classification === 'Good' ? '◄ YOUR DATA' : ''}</td>
              </tr>
              <tr className={cv_classification === 'Moderate' ? 'bg-[#fef2f2] border-2 border-[#b91c1c]' : 'bg-white'}>
                <td className="p-3 border border-[#d4cfc6]">20–30 %</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#b5860d]">Moderate</td>
                <td className="p-3 border border-[#d4cfc6]">Moderate variation, interpret with caution</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#b91c1c]">{cv_classification === 'Moderate' ? '◄ YOUR DATA' : ''}</td>
              </tr>
              <tr className={cv_classification === 'Poor' ? 'bg-[#fef2f2] border-2 border-[#b91c1c]' : 'bg-[#fafaf8]'}>
                <td className="p-3 border border-[#d4cfc6]">&gt; 30 %</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#b91c1c]">Poor</td>
                <td className="p-3 border border-[#d4cfc6]">High variation, results may be unreliable</td>
                <td className="p-3 border border-[#d4cfc6] font-bold text-[#b91c1c]">{cv_classification === 'Poor' ? '◄ YOUR DATA' : ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-[#1a6b3c] text-white p-4 flex justify-between items-center font-serif">
          <span className="font-bold text-lg">Your CV% = {results.CV_pct.toFixed(2)} %</span>
          <span className="font-bold text-lg">Verdict: {cv_classification} ✔</span>
        </div>
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-[#d4cfc6] text-center text-sm text-[#8a8a8a] font-serif">
        Fivearth Farms Pvt. Ltd. · Alwar, Rajasthan
      </div>
    </div>
  );
};

export default OutputSheets;
