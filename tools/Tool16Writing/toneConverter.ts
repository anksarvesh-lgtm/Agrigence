export function toPassive(sentence: string): string {
  return sentence
    .replace(/\bWe measured\b/gi, "Measurements were taken")
    .replace(/\bWe observed\b/gi, "It was observed")
    .replace(/\bWe applied\b/gi, "Applications were made")
    .replace(/\bWe recorded\b/gi, "Data were recorded")
    .replace(/\bWe analyzed\b/gi, "Analysis was performed")
    .replace(/\bWe found\b/gi, "It was found")
    .replace(/\bI measured\b/gi, "Measurements were taken")
    .replace(/\bI observed\b/gi, "It was observed")
    .replace(/\bI applied\b/gi, "Applications were made")
    .replace(/\bI recorded\b/gi, "Data were recorded")
    .replace(/\bI analyzed\b/gi, "Analysis was performed")
    .replace(/\bI found\b/gi, "It was found");
}
