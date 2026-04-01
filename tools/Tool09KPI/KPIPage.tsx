import { useLocation } from 'react-router-dom';

import React, { useState, useEffect } from 'react';
import { evaluateKPIs, overallIndex, KPIInputs, KPIResult } from './KPI_FRAMEWORK';
import { CategorySection } from './KPICategory';
import { OverallScore } from './KPICard';
import './KPIStyles.css';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

// Mock Data Generator (Simulating Tool Outputs)
function generateMockInputs(): KPIInputs {
  return {
    cultivatedArea: 4.5,
    totalLandArea: 5.0,
    grossCroppedArea: 8.0,
    netSownArea: 5.0,
    irrigatedArea: 4.0,
    
    yieldKg: 18000,
    totalWaterM3: 12000,
    netIrrigation: 8000,
    grossIrrigation: 10000,
    etcDeficit: 500,
    etcRequired: 8500,
    
    operationalStructureArea: 0.8,
    totalStructureArea: 1.0,
    infrastructureInvestment: 100000,
    
    actualYield: 42,
    targetYield: 45,
    npkDeviationPercent: 5,
    onTimeOperations: 18,
    totalOperations: 20,
    
    grossIncome: 250000,
    costC3: 140000,
    netIncome: 110000,
    breakEvenYield: 25,
    
    marketableYield: 40,
    correctDoseApplications: 4,
    totalApplications: 5,
    
    completedTasks: 45,
    plannedTasks: 50,
    ppeFollowed: 4,
    totalSprayEvents: 5,
    
    organicN: 40,
    totalN: 120,
    projectedSOC: 0.9,
    currentSOC: 0.8,
    previousChemical: 50000,
    currentChemical: 40000,
    
    chemicalInput: 30000,
    totalInput: 80000,
    waterDeficit: 500,
    totalWaterRequirement: 8500,
    profitSensitivityPercent: 15
  };
}

export default function KPIPage() {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [inputs, setInputs] = useState<KPIInputs | null>(null);
  const [results, setResults] = useState<KPIResult[]>([]);
  const [overall, setOverall] = useState(0);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.restoreData) {
      const data = location.state.restoreData;
      if (data.inputs !== undefined) setInputs(data.inputs);
      if (data.overall !== undefined) setOverall(data.overall);
    }
  }, [location.state]);

  useEffect(() => {
    // In a real app, this would fetch from a global store or context
    const data = generateMockInputs();
    setInputs(data);
    
    const res = evaluateKPIs(data);
    setResults(res);
    const score = overallIndex(res);
    setOverall(score);

    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: 'Farm KPI Dashboard',
          inputData: data,
          outputData: { overallScore: score },
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  }, [user, isPlanActive]);

  if (!inputs) return <div className="p-8 text-center">Loading Farm Data...</div>;

  return (
    <div className="kpiContainer">
      <div className="kpiHeader">
        <h2>Farm Performance Dashboard</h2>
        <p>Real-time evaluation of farm efficiency, sustainability, and profitability.</p>
      </div>

      <OverallScore score={overall} />

      <h3 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wider">Category Performance</h3>
      <CategorySection results={results} />

      <h3 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wider mt-8">Detailed KPI Report</h3>
      <KPITable results={results} />
    </div>
  );
}

function KPITable({ results }: { results: KPIResult[] }) {
  return (
    <div className="tableContainer">
      <table>
        <thead>
          <tr>
            <th>KPI Name</th>
            <th>Value</th>
            <th>Benchmark</th>
            <th>Score</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {results.map(r => (
            <tr key={r.id}>
              <td style={{ fontWeight: 600 }}>{r.name}</td>
              <td>{r.value.toFixed(2)} <span style={{ fontSize: '0.8em', color: '#95a5a6' }}>{r.unit}</span></td>
              <td>{r.benchmark}</td>
              <td>
                <span className={`score-badge ${r.score >= 80 ? 'score-high' : r.score >= 50 ? 'score-mid' : 'score-low'}`}>
                  {r.score.toFixed(0)}/100
                </span>
              </td>
              <td style={{ fontSize: '0.8em', color: '#7f8c8d' }}>{r.sourceTool}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
