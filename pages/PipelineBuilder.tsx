import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap,
  Connection,
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Save, Database, Filter, GitMerge, Calculator, X, Upload } from 'lucide-react';
import { executePipeline } from '../services/pipelineEngine';
import ToolsNavigation from '../components/ToolsNavigation';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const initialSampleDataset = [
  { id: 1, region: 'North', crop: 'Wheat', yield: 120, rainfall: 400 },
  { id: 2, region: 'South', crop: 'Corn', yield: 85, rainfall: 600 },
  { id: 3, region: 'North', crop: 'Corn', yield: 90, rainfall: 450 },
  { id: 4, region: 'East', crop: 'Wheat', yield: 110, rainfall: 500 },
  { id: 5, region: 'West', crop: 'Soy', yield: 60, rainfall: 300 },
];

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Dataset: Crop Yield', type: 'input' }, position: { x: 50, y: 200 }, style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', minWidth: '150px', textAlign: 'center', fontWeight: '500' } },
  { id: '2', data: { label: 'Filter: Region == North', type: 'filter', config: { column: 'region', operator: '==', value: 'North' } }, position: { x: 350, y: 100 }, style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', minWidth: '150px', textAlign: 'center', fontWeight: '500' } },
  { id: '3', data: { label: 'Aggregate: Sum(yield)', type: 'aggregate', config: { column: 'yield', type: 'sum' } }, position: { x: 650, y: 200 }, style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', minWidth: '150px', textAlign: 'center', fontWeight: '500' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

const PipelineBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [result, setResult] = useState<any[] | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [dataset, setDataset] = useState<any[]>(initialSampleDataset);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), []);

  const addNode = (type: string, label: string, configType: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      data: { label, type: configType, config: {} },
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', minWidth: '150px', textAlign: 'center', fontWeight: '500' }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setDataset(results.data);
            alert('CSV file loaded successfully.');
          }
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setDataset(json);
        alert('Excel file loaded successfully.');
      } else {
        alert('Unsupported file format. Please upload CSV or Excel.');
      }
    } catch (err) {
      console.error("Error parsing file:", err);
      alert('Failed to parse file.');
    }
  };

  const handleRun = () => {
    try {
      const output = executePipeline(nodes, edges, dataset);
      setResult(output);
      setIsPanelOpen(true);
    } catch (error) {
      console.error("Pipeline execution failed:", error);
      alert("Pipeline execution failed. Check console for details.");
    }
  };

  return (
    <div className="flex h-screen w-full bg-stone-50">
      <ToolsNavigation />
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 shrink-0">
          <div className="font-semibold text-lg flex items-center gap-2 text-stone-800">
            <GitMerge className="text-agri-primary" /> Pipeline Builder
          </div>
          <button onClick={handleRun} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-agri-primary text-white rounded-lg hover:bg-agri-secondary transition-colors shadow-sm">
            <Play size={16} /> Run Pipeline
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden relative">
          <div className="w-72 bg-white border-r border-stone-200 p-6 flex flex-col gap-6 overflow-y-auto z-10">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Data Sources</h2>
            <div onClick={() => addNode('input', 'New Dataset', 'input')} className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Database size={18} className="text-blue-600" /> Add Dataset Node
            </div>
            <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <Upload size={18} className="text-purple-600" /> Upload Data (CSV/Excel)
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.xls,.xlsx" className="hidden" />
            
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Transformations</h2>
            <div onClick={() => addNode('default', 'Filter', 'filter')} className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <Filter size={18} className="text-orange-600" /> Filter
            </div>
            <div onClick={() => addNode('default', 'Aggregate', 'aggregate')} className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
              <Calculator size={18} className="text-green-600" /> Aggregate
            </div>
          </div>
          <div className="flex-1 h-full relative bg-stone-50/50">
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
              <Background color="#d6d3d1" gap={16} size={1.5} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineBuilder;
