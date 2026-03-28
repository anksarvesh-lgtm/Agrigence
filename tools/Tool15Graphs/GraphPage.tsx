import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Download,
  Settings2,
  Table as TableIcon,
  ClipboardPaste,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { scale, generateYAxisTicks } from './axisEngine';
import { createBarPositions } from './barPlot';
import { errorBar } from './errorBars';
import { interactionLines } from './interactionPlot';
import { drawRect, drawLine, drawText, drawCircle, drawPath } from './svgRenderer';
import { exportSVG, exportPNG } from './exportGraph';

type GraphType = 'bar' | 'interaction' | 'timeseries';

interface DataRow {
  id: string;
  label: string;
  value: number;
  lsd?: number;
  grouping?: string;
  factorA?: string;
  factorB?: string;
}

import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

export default function GraphPage() {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [graphType, setGraphType] = useState<GraphType>('bar');
  const [data, setData] = useState<DataRow[]>([
    { id: '1', label: 'T1', value: 45, lsd: 2.5, grouping: 'b' },
    { id: '2', label: 'T2', value: 52, lsd: 2.5, grouping: 'a' },
    { id: '3', label: 'T3', value: 48, lsd: 2.5, grouping: 'ab' },
  ]);
  const [yAxisLabel, setYAxisLabel] = useState('Mean Yield (kg/ha)');
  const [xAxisLabel, setXAxisLabel] = useState('Treatments');
  const [svgContent, setSvgContent] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  
  const svgRef = useRef<SVGSVGElement>(null);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const rows = text.trim().split('\n');
    const newData: DataRow[] = [];
    
    rows.forEach((row, i) => {
      const cols = row.split('\t').map(c => c.trim());
      if (graphType === 'bar' && cols.length >= 2) {
        newData.push({
          id: `row-${Date.now()}-${i}`,
          label: cols[0],
          value: parseFloat(cols[1]) || 0,
          lsd: cols[2] ? parseFloat(cols[2]) : undefined,
          grouping: cols[3] || undefined
        });
      } else if (graphType === 'interaction' && cols.length >= 3) {
        newData.push({
          id: `row-${Date.now()}-${i}`,
          label: `${cols[0]}-${cols[1]}`,
          factorA: cols[0],
          factorB: cols[1],
          value: parseFloat(cols[2]) || 0
        });
      } else if (graphType === 'timeseries' && cols.length >= 2) {
        newData.push({
          id: `row-${Date.now()}-${i}`,
          label: cols[0],
          value: parseFloat(cols[1]) || 0
        });
      }
    });
    
    if (newData.length > 0) {
      setData(newData);
    }
  };

  const generateGraph = () => {
    const newWarnings: string[] = [];
    if (data.length < 2) {
      newWarnings.push("Error: Minimum 2 data points required.");
      setWarnings(newWarnings);
      setSvgContent('');
      return;
    }
    
    if (graphType === 'bar' && data.some(d => d.lsd === undefined)) {
      newWarnings.push("Warning: LSD values missing. Error bars will not be drawn.");
    }
    
    setWarnings(newWarnings);

    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    let maxValue = Math.max(...data.map(d => {
      if (d.lsd) return d.value + d.lsd / 2;
      return d.value;
    }));
    
    // Add 10% padding to top
    maxValue = maxValue * 1.1;
    if (maxValue === 0) maxValue = 10;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color: white;">`;
    
    // Draw Axes
    svg += drawLine(margin.left, margin.top, margin.left, height - margin.bottom, '#333', 2);
    svg += drawLine(margin.left, height - margin.bottom, width - margin.right, height - margin.bottom, '#333', 2);
    
    // Y-Axis Ticks & Labels
    const yTicks = generateYAxisTicks(maxValue, 5);
    yTicks.forEach(tick => {
      const y = height - margin.bottom - scale(tick, maxValue, innerHeight);
      svg += drawLine(margin.left - 5, y, margin.left, y, '#333', 1);
      svg += drawText(margin.left - 10, y + 4, tick.toFixed(1), 'end', 12);
      // Grid line
      svg += drawLine(margin.left, y, width - margin.right, y, '#e5e7eb', 1);
    });
    
    // Axis Titles
    svg += `<text x="${margin.left / 3}" y="${height / 2}" transform="rotate(-90 ${margin.left / 3} ${height / 2})" text-anchor="middle" font-family="sans-serif" font-size="14px" font-weight="bold" fill="#333">${yAxisLabel}</text>`;
    svg += drawText(margin.left + innerWidth / 2, height - margin.bottom / 4, xAxisLabel, 'middle', 14, '#333');

    if (graphType === 'bar') {
      const bars = createBarPositions(data, innerWidth, 0.3);
      
      bars.forEach(bar => {
        const x = margin.left + bar.x;
        const barH = scale(bar.height, maxValue, innerHeight);
        const y = height - margin.bottom - barH;
        
        // Bar
        svg += drawRect(x, y, bar.width, barH, '#cbd5e1', '#475569');
        
        // X Label
        svg += drawText(x + bar.width / 2, height - margin.bottom + 20, bar.label, 'middle', 12);
        
        // Error Bar
        if (bar.lsd) {
          const err = errorBar(bar.height, bar.lsd);
          const yUpper = height - margin.bottom - scale(err.upper, maxValue, innerHeight);
          const yLower = height - margin.bottom - scale(err.lower, maxValue, innerHeight);
          const midX = x + bar.width / 2;
          
          svg += drawLine(midX, yUpper, midX, yLower, '#000', 1.5);
          svg += drawLine(midX - 5, yUpper, midX + 5, yUpper, '#000', 1.5);
          svg += drawLine(midX - 5, yLower, midX + 5, yLower, '#000', 1.5);
        }
        
        // Grouping Label
        if (bar.grouping) {
          const groupY = bar.lsd 
            ? height - margin.bottom - scale(bar.height + bar.lsd/2, maxValue, innerHeight) - 10
            : y - 10;
          svg += drawText(x + bar.width / 2, groupY, bar.grouping, 'middle', 12, '#4f46e5');
        }
      });
    } else if (graphType === 'interaction') {
      const linesData = interactionLines(data);
      const factorALevels = Array.from(new Set(data.map(d => d.factorA || '')));
      const step = innerWidth / (factorALevels.length || 1);
      const offset = step / 2;
      
      // X Labels
      factorALevels.forEach((level, i) => {
        const x = margin.left + i * step + offset;
        svg += drawText(x, height - margin.bottom + 20, level, 'middle', 12);
      });
      
      const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];
      let colorIdx = 0;
      
      // Draw Lines
      Object.entries(linesData).forEach(([factorB, points]) => {
        const color = colors[colorIdx % colors.length];
        colorIdx++;
        
        // Sort points to match factorALevels order
        points.sort((a, b) => factorALevels.indexOf(a.xLabel) - factorALevels.indexOf(b.xLabel));
        
        let dPath = '';
        points.forEach((p, i) => {
          const x = margin.left + factorALevels.indexOf(p.xLabel) * step + offset;
          const y = height - margin.bottom - scale(p.value, maxValue, innerHeight);
          
          if (i === 0) dPath += `M ${x} ${y} `;
          else dPath += `L ${x} ${y} `;
          
          svg += drawCircle(x, y, 4, color);
        });
        
        svg += drawPath(dPath, color, 2, 'none');
        
        // Legend
        const legendX = width - margin.right - 80;
        const legendY = margin.top + colorIdx * 20;
        svg += drawLine(legendX, legendY, legendX + 20, legendY, color, 2);
        svg += drawText(legendX + 25, legendY + 4, factorB, 'start', 12, color);
      });
    } else if (graphType === 'timeseries') {
      const step = innerWidth / (data.length > 1 ? data.length - 1 : 1);
      
      let dPath = '';
      data.forEach((d, i) => {
        const x = margin.left + i * step;
        const y = height - margin.bottom - scale(d.value, maxValue, innerHeight);
        
        if (i === 0) dPath += `M ${x} ${y} `;
        else dPath += `L ${x} ${y} `;
        
        svg += drawCircle(x, y, 3, '#2563eb');
        
        // X Label (every nth to avoid crowding)
        if (data.length <= 10 || i % Math.ceil(data.length / 10) === 0) {
          svg += `<text x="${x}" y="${height - margin.bottom + 15}" transform="rotate(-45 ${x} ${height - margin.bottom + 15})" text-anchor="end" font-family="sans-serif" font-size="10px" fill="#333">${d.label}</text>`;
        }
      });
      
      svg += drawPath(dPath, '#2563eb', 2, 'none');
    }

    svg += `</svg>`;
    setSvgContent(svg);

    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Graph Generator',
          inputData: { graphType, data, xAxisLabel, yAxisLabel },
          outputData: { status: 'Generated' },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  };

  useEffect(() => {
    generateGraph();
  }, [data, graphType, xAxisLabel, yAxisLabel]);

  const handleExportSVG = () => {
    if (svgContent) exportSVG(svgContent, `Graph_${Date.now()}.svg`);
  };

  const handleExportPNG = () => {
    if (svgContent) exportPNG(svgContent, 1200, 800, `Graph_${Date.now()}.png`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-rose-100 p-3 rounded-xl">
          <BarChart className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Auto Graph Generator</h1>
          <p className="text-stone-500 text-sm">Research Visualization Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-stone-500" />
                Graph Settings
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Graph Type</label>
                <select 
                  value={graphType}
                  onChange={(e) => {
                    setGraphType(e.target.value as GraphType);
                    if (e.target.value === 'interaction') {
                      setData([
                        { id: '1', label: 'V1-N0', factorA: 'V1', factorB: 'N0', value: 30 },
                        { id: '2', label: 'V1-N60', factorA: 'V1', factorB: 'N60', value: 45 },
                        { id: '3', label: 'V2-N0', factorA: 'V2', factorB: 'N0', value: 35 },
                        { id: '4', label: 'V2-N60', factorA: 'V2', factorB: 'N60', value: 55 },
                      ]);
                    } else if (e.target.value === 'timeseries') {
                      setData([
                        { id: '1', label: 'Day 1', value: 10 },
                        { id: '2', label: 'Day 2', value: 15 },
                        { id: '3', label: 'Day 3', value: 12 },
                      ]);
                    } else {
                      setData([
                        { id: '1', label: 'T1', value: 45, lsd: 2.5, grouping: 'b' },
                        { id: '2', label: 'T2', value: 52, lsd: 2.5, grouping: 'a' },
                        { id: '3', label: 'T3', value: 48, lsd: 2.5, grouping: 'ab' },
                      ]);
                    }
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                >
                  <option value="bar">Treatment Comparison (Bar + Error)</option>
                  <option value="interaction">Interaction Plot (Lines)</option>
                  <option value="timeseries">Time Series (Trend)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Y-Axis Label</label>
                <input 
                  type="text" 
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">X-Axis Label</label>
                <input 
                  type="text" 
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-stone-500" />
                Data Source
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-stone-500">
                <ClipboardPaste size={12} /> Paste from Excel
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-stone-500 mb-2">
                {graphType === 'bar' && "Format: Treatment | Mean | LSD | Grouping"}
                {graphType === 'interaction' && "Format: FactorA | FactorB | Mean"}
                {graphType === 'timeseries' && "Format: Label | Value"}
              </p>
              <div 
                className="max-h-[250px] overflow-y-auto border border-stone-200 rounded-xl"
                onPaste={handlePaste}
              >
                <table className="w-full text-left border-collapse">
                  <thead className="bg-stone-50 sticky top-0 z-10">
                    <tr>
                      {graphType === 'bar' && (
                        <>
                          <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase border-b border-stone-200">Label</th>
                          <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase border-b border-stone-200">Value</th>
                          <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase border-b border-stone-200">LSD</th>
                          <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase border-b border-stone-200">Grp</th>
                        </>
                      )}
                      {graphType === 'interaction' && (
                        <>
                          <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase border-b border-stone-200">Fact A</th>
                          <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase border-b border-stone-200">Fact B</th>
                          <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase border-b border-stone-200">Value</th>
                        </>
                      )}
                      {graphType === 'timeseries' && (
                        <>
                          <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase border-b border-stone-200">Label</th>
                          <th className="py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase border-b border-stone-200">Value</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {data.map((d, i) => (
                      <tr key={d.id} className="hover:bg-stone-50">
                        {graphType === 'bar' && (
                          <>
                            <td className="p-2 text-xs">{d.label}</td>
                            <td className="p-2 text-xs">{d.value}</td>
                            <td className="p-2 text-xs">{d.lsd || '-'}</td>
                            <td className="p-2 text-xs">{d.grouping || '-'}</td>
                          </>
                        )}
                        {graphType === 'interaction' && (
                          <>
                            <td className="p-2 text-xs">{d.factorA}</td>
                            <td className="p-2 text-xs">{d.factorB}</td>
                            <td className="p-2 text-xs">{d.value}</td>
                          </>
                        )}
                        {graphType === 'timeseries' && (
                          <>
                            <td className="p-2 text-xs">{d.label}</td>
                            <td className="p-2 text-xs">{d.value}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {warnings.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                  <AlertTriangle size={16} />
                  Validation Alerts
                </div>
                <ul className="space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-stone-500" />
                Publication Graph
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExportSVG}
                  disabled={!svgContent}
                  className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
                >
                  <Download size={16} /> SVG
                </button>
                <button 
                  onClick={handleExportPNG}
                  disabled={!svgContent}
                  className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
                >
                  <Download size={16} /> PNG
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 flex items-center justify-center bg-stone-100/50">
              {svgContent ? (
                <div 
                  className="w-full max-w-[800px] aspect-[3/2] bg-white shadow-sm border border-stone-200 rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div className="text-center text-stone-400">
                  <BarChart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No graph generated</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
