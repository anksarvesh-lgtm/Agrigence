
// ======================================================
// MICROFARM KPI FRAMEWORK
// Derived from: Alwar_MicroFarm_KPI_Framework.xlsx
// Deterministic • Offline • Audit Ready
// ======================================================

export enum KPICategory {
 LAND = "Land",
 WATER = "Water",
 STRUCTURE = "Structure",
 CROP = "Crop Planning",
 FINANCIAL = "Financial",
 QUALITY = "Quality",
 SOP = "Operational SOP",
 SUSTAINABILITY = "Sustainability",
 RISK = "Risk"
}

export interface KPIInputs {
  // Land
  cultivatedArea: number;
  totalLandArea: number;
  grossCroppedArea: number;
  netSownArea: number;
  irrigatedArea: number;

  // Water
  yieldKg: number;
  totalWaterM3: number;
  netIrrigation: number;
  grossIrrigation: number;
  etcDeficit: number;
  etcRequired: number;

  // Structure
  operationalStructureArea: number;
  totalStructureArea: number;
  infrastructureInvestment: number;

  // Crop Planning
  actualYield: number;
  targetYield: number;
  npkDeviationPercent: number;
  onTimeOperations: number;
  totalOperations: number;

  // Financial
  grossIncome: number;
  costC3: number;
  netIncome: number;
  breakEvenYield: number;

  // Quality
  marketableYield: number;
  correctDoseApplications: number;
  totalApplications: number;

  // SOP
  completedTasks: number;
  plannedTasks: number;
  ppeFollowed: number;
  totalSprayEvents: number;

  // Sustainability
  organicN: number;
  totalN: number;
  projectedSOC: number;
  currentSOC: number;
  previousChemical: number;
  currentChemical: number;

  // Risk
  chemicalInput: number;
  totalInput: number;
  waterDeficit: number;
  totalWaterRequirement: number;
  profitSensitivityPercent: number;
}

export interface KPIItem {
 id: string;
 name: string;
 category: KPICategory;
 unit: string;
 benchmark: number;
 weight: number;
 sourceTool: string;
 compute: (i: KPIInputs) => number;
}

// ======================================================
// KPI MASTER LIST
// ======================================================

export const KPI_FRAMEWORK: KPIItem[] = [

/* ============================
   LAND KPIs
============================ */

{
 id:"LAND_01",
 name:"Land Use Efficiency",
 category:KPICategory.LAND,
 unit:"%",
 benchmark:90,
 weight:8,
 sourceTool:"Tool06",
 compute:(i)=> i.totalLandArea > 0 ? (i.cultivatedArea/i.totalLandArea)*100 : 0
},

{
 id:"LAND_02",
 name:"Cropping Intensity",
 category:KPICategory.LAND,
 unit:"%",
 benchmark:150,
 weight:6,
 sourceTool:"Tool01",
 compute:(i)=> i.netSownArea > 0 ? (i.grossCroppedArea/i.netSownArea)*100 : 0
},

{
 id:"LAND_03",
 name:"Irrigated Area Coverage",
 category:KPICategory.LAND,
 unit:"%",
 benchmark:80,
 weight:6,
 sourceTool:"Tool04",
 compute:(i)=> i.totalLandArea > 0 ? (i.irrigatedArea/i.totalLandArea)*100 : 0
},

/* ============================
   WATER KPIs
============================ */

{
 id:"WATER_01",
 name:"Water Productivity",
 category:KPICategory.WATER,
 unit:"kg/m³",
 benchmark:1.5,
 weight:10,
 sourceTool:"Tool04",
 compute:(i)=> i.totalWaterM3 > 0 ? i.yieldKg/i.totalWaterM3 : 0
},

{
 id:"WATER_02",
 name:"Irrigation Efficiency",
 category:KPICategory.WATER,
 unit:"%",
 benchmark:85,
 weight:8,
 sourceTool:"Tool04",
 compute:(i)=> i.grossIrrigation > 0 ? (i.netIrrigation/i.grossIrrigation)*100 : 0
},

{
 id:"WATER_03",
 name:"Water Stress Index",
 category:KPICategory.WATER,
 unit:"%",
 benchmark:10,
 weight:7,
 sourceTool:"Tool04",
 compute:(i)=> i.etcRequired > 0 ? (i.etcDeficit/i.etcRequired)*100 : 0
},

/* ============================
   STRUCTURE KPIs
============================ */

{
 id:"STRUCT_01",
 name:"Structure Utilization",
 category:KPICategory.STRUCTURE,
 unit:"%",
 benchmark:85,
 weight:6,
 sourceTool:"Manual + Tool05",
 compute:(i)=> i.totalStructureArea > 0 ? (i.operationalStructureArea/i.totalStructureArea)*100 : 0
},

{
 id:"STRUCT_02",
 name:"Asset Productivity",
 category:KPICategory.STRUCTURE,
 unit:"ratio",
 benchmark:2,
 weight:6,
 sourceTool:"Tool05",
 compute:(i)=> i.infrastructureInvestment > 0 ? i.grossIncome/i.infrastructureInvestment : 0
},

/* ============================
   CROP PLANNING KPIs
============================ */

{
 id:"CROP_01",
 name:"Yield Achievement",
 category:KPICategory.CROP,
 unit:"%",
 benchmark:100,
 weight:12,
 sourceTool:"Tool08",
 compute:(i)=> i.targetYield > 0 ? (i.actualYield/i.targetYield)*100 : 0
},

{
 id:"CROP_02",
 name:"Nutrient Balance Index",
 category:KPICategory.CROP,
 unit:"%",
 benchmark:100,
 weight:8,
 sourceTool:"Tool02",
 compute:(i)=>{
   return 100 - Math.abs(i.npkDeviationPercent);
 }
},

{
 id:"CROP_03",
 name:"Timeliness Index",
 category:KPICategory.CROP,
 unit:"%",
 benchmark:95,
 weight:6,
 sourceTool:"Manual",
 compute:(i)=> i.totalOperations > 0 ? (i.onTimeOperations/i.totalOperations)*100 : 0
},

/* ============================
   FINANCIAL KPIs
============================ */

{
 id:"FIN_01",
 name:"Benefit Cost Ratio",
 category:KPICategory.FINANCIAL,
 unit:"ratio",
 benchmark:2,
 weight:12,
 sourceTool:"Tool05",
 compute:(i)=> i.costC3 > 0 ? i.grossIncome/i.costC3 : 0
},

{
 id:"FIN_02",
 name:"Net Return per Hectare",
 category:KPICategory.FINANCIAL,
 unit:"₹/ha",
 benchmark:50000,
 weight:10,
 sourceTool:"Tool05",
 compute:(i)=> i.totalLandArea > 0 ? i.netIncome/i.totalLandArea : 0
},

{
 id:"FIN_03",
 name:"Break-even Safety Margin",
 category:KPICategory.FINANCIAL,
 unit:"%",
 benchmark:30,
 weight:8,
 sourceTool:"Tool05",
 compute:(i)=> i.actualYield > 0 ? ((i.actualYield-i.breakEvenYield)/i.actualYield)*100 : 0
},

/* ============================
   QUALITY KPIs
============================ */

{
 id:"QUAL_01",
 name:"Marketable Yield %",
 category:KPICategory.QUALITY,
 unit:"%",
 benchmark:95,
 weight:7,
 sourceTool:"Tool08",
 compute:(i)=> i.actualYield > 0 ? (i.marketableYield/i.actualYield)*100 : 0
},

{
 id:"QUAL_02",
 name:"Spray Accuracy",
 category:KPICategory.QUALITY,
 unit:"%",
 benchmark:100,
 weight:6,
 sourceTool:"Tool07",
 compute:(i)=> i.totalApplications > 0 ? (i.correctDoseApplications/i.totalApplications)*100 : 0
},

/* ============================
   SOP KPIs
============================ */

{
 id:"SOP_01",
 name:"Operational Compliance",
 category:KPICategory.SOP,
 unit:"%",
 benchmark:95,
 weight:7,
 sourceTool:"Manual Logs",
 compute:(i)=> i.plannedTasks > 0 ? (i.completedTasks/i.plannedTasks)*100 : 0
},

{
 id:"SOP_02",
 name:"Safety Compliance",
 category:KPICategory.SOP,
 unit:"%",
 benchmark:100,
 weight:6,
 sourceTool:"Tool07",
 compute:(i)=> i.totalSprayEvents > 0 ? (i.ppeFollowed/i.totalSprayEvents)*100 : 0
},

/* ============================
   SUSTAINABILITY KPIs
============================ */

{
 id:"SUS_01",
 name:"Organic Nutrient Share",
 category:KPICategory.SUSTAINABILITY,
 unit:"%",
 benchmark:40,
 weight:9,
 sourceTool:"Tool03",
 compute:(i)=> i.totalN > 0 ? (i.organicN/i.totalN)*100 : 0
},

{
 id:"SUS_02",
 name:"SOC Improvement",
 category:KPICategory.SUSTAINABILITY,
 unit:"%",
 benchmark:0.1,
 weight:8,
 sourceTool:"Tool03",
 compute:(i)=> i.projectedSOC - i.currentSOC
},

{
 id:"SUS_03",
 name:"Chemical Reduction",
 category:KPICategory.SUSTAINABILITY,
 unit:"%",
 benchmark:20,
 weight:7,
 sourceTool:"Tool02",
 compute:(i)=> i.previousChemical > 0 ? ((i.previousChemical-i.currentChemical)/i.previousChemical)*100 : 0
},

/* ============================
   RISK KPIs
============================ */

{
 id:"RISK_01",
 name:"Input Dependency Ratio",
 category:KPICategory.RISK,
 unit:"%",
 benchmark:50,
 weight:7,
 sourceTool:"Tool02",
 compute:(i)=> i.totalInput > 0 ? (i.chemicalInput/i.totalInput)*100 : 0
},

{
 id:"RISK_02",
 name:"Water Risk Index",
 category:KPICategory.RISK,
 unit:"%",
 benchmark:15,
 weight:6,
 sourceTool:"Tool04",
 compute:(i)=> i.totalWaterRequirement > 0 ? (i.waterDeficit/i.totalWaterRequirement)*100 : 0
},

{
 id:"RISK_03",
 name:"Profit Volatility Index",
 category:KPICategory.RISK,
 unit:"%",
 benchmark:20,
 weight:6,
 sourceTool:"Tool05",
 compute:(i)=> i.profitSensitivityPercent
}

];

export interface KPIResult extends KPIItem {
  value: number;
  score: number;
}

export function evaluateKPIs(inputs: KPIInputs): KPIResult[] {
  return KPI_FRAMEWORK.map(kpi => {
    const value = kpi.compute(inputs);
    
    let score = 0;
    
    // For Risk KPIs, lower is usually better, but we need to check the specific KPI
    // Let's use a standard scoring mechanism: (Value / Benchmark) * 100
    // If it's a risk or deficit where lower is better, the logic might need to be inverted.
    // Based on the prompt: score = Math.min((value/kpi.benchmark)*100,100);
    // Let's stick to the prompt's logic for now, but handle division by zero.
    if (kpi.benchmark > 0) {
      if (kpi.category === KPICategory.RISK || kpi.id === 'WATER_03') {
        // For risk, lower is better. If value <= benchmark, score is 100.
        // If value > benchmark, score decreases.
        score = Math.max(0, 100 - ((value - kpi.benchmark) / kpi.benchmark) * 100);
        score = Math.min(score, 100);
      } else {
        score = Math.min((value / kpi.benchmark) * 100, 100);
      }
    } else if (kpi.benchmark === 0) {
      score = value >= 0 ? 100 : 0;
    }
    
    return { ...kpi, value, score };
  });
}

export function categoryScore(results: KPIResult[], category: KPICategory): number {
  const filtered = results.filter(r => r.category === category);
  if (filtered.length === 0) return 0;
  
  const totalWeight = filtered.reduce((s, r) => s + r.weight, 0);
  if (totalWeight === 0) return 0;

  return filtered.reduce((s, r) => s + (r.score * r.weight), 0) / totalWeight;
}

export function overallIndex(results: KPIResult[]): number {
  const totalWeight = results.reduce((s, r) => s + r.weight, 0);
  if (totalWeight === 0) return 0;
  
  return results.reduce((s, r) => s + (r.score * r.weight), 0) / totalWeight;
}
