/**
 * Excel import utility for research datasets.
 */

import * as XLSX from 'xlsx';
import { calculateRowMean } from './statistics';
import { FieldRow } from './anova';

export const importExcelData = async (file: File): Promise<FieldRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const mappedRows: FieldRow[] = jsonData.map((r: any) => {
          // Map common headers or fallback to column indices
          const plotNo = String(r.Plot || r.plot || r['Plot No'] || '');
          const replication = String(r.Rep || r.rep || r.Replication || '');
          const treatment = String(r.Treat || r.treat || r.Treatment || '');
          const control = r.Control === "Yes" || r.control === "Yes" || r.Control === true;
          
          // Extract observations (columns starting with Y or Obs)
          const observations: number[] = [];
          Object.keys(r).forEach(key => {
            if (key.startsWith('Y') || key.startsWith('Obs') || key.match(/^V\d+$/)) {
              const val = parseFloat(r[key]);
              if (!isNaN(val)) {
                observations.push(val);
              }
            }
          });

          return {
            plotNo,
            replication,
            treatment,
            control,
            observations,
            mean: calculateRowMean(observations)
          };
        });

        resolve(mappedRows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
