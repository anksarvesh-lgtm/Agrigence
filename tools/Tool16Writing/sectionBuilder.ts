import { AnovaData, ClimateData, ReportData, GeneratedSection } from './writingTypes';
import { buildMethodology, buildObjectives } from './templateEngine';
import { normalize } from './grammarRules';
import { toPassive } from './toneConverter';

export function buildResults(anova?: AnovaData): string {
  if (!anova) return "Results data is not available. Please complete ANOVA analysis first.";
  
  let text = `Analysis of variance revealed ${anova.isSignificant ? 'significant' : 'non-significant'} differences among treatments (F = ${anova.fValue.toFixed(2)}). `;
  
  if (anova.bestTreatment && anova.bestYield) {
    text += `Treatment ${anova.bestTreatment} recorded the highest yield (${anova.bestYield.toFixed(2)} units). `;
  }
  
  text += `The coefficient of variation was ${anova.cv.toFixed(2)}%, indicating acceptable experimental precision.`;
  
  return text;
}

export function buildDiscussion(anova?: AnovaData, climate?: ClimateData): string {
  if (!anova) return "Discussion requires ANOVA results.";
  
  let text = `The observed variations in yield can be attributed to the differential responses of the crop to the applied treatments. `;
  
  if (climate && climate.heatStressDays > 0) {
    text += `Furthermore, the occurrence of ${climate.heatStressDays} heat stress days during the growing season may have influenced the overall performance. `;
  }
  
  if (anova.isSignificant) {
    text += `The significant differences highlight the importance of selecting the optimal treatment combination for maximizing productivity under these specific agro-climatic conditions.`;
  } else {
    text += `The lack of significant differences suggests that the treatments performed similarly under the given experimental conditions.`;
  }
  
  return text;
}

export function buildConclusion(anova?: AnovaData): string {
  if (!anova) return "Conclusion cannot be drawn without results.";
  
  let text = `Based on the experimental findings, it is concluded that `;
  if (anova.isSignificant && anova.bestTreatment) {
    text += `treatment ${anova.bestTreatment} is the most effective approach for achieving higher yields. `;
  } else {
    text += `no single treatment demonstrated clear superiority over the others. `;
  }
  text += `Further multi-location trials are recommended to validate these results across diverse environments.`;
  
  return text;
}

export function generateFullReport(data: ReportData, customNotes: string = ""): GeneratedSection[] {
  const sections: GeneratedSection[] = [];
  
  sections.push({ title: "1. Objectives", content: buildObjectives() });
  
  if (data.experiment) {
    sections.push({ title: "2. Materials & Methods", content: buildMethodology(data.experiment) });
  }
  
  if (data.anova) {
    sections.push({ title: "3. Results", content: buildResults(data.anova) });
    sections.push({ title: "4. Discussion", content: buildDiscussion(data.anova, data.climate) });
    sections.push({ title: "5. Conclusion", content: buildConclusion(data.anova) });
  }
  
  if (customNotes.trim()) {
    const processedNotes = toPassive(normalize(customNotes));
    sections.push({ title: "Additional Notes", content: processedNotes });
  }
  
  return sections;
}
