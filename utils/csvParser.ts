import Papa from 'papaparse';

interface QuestionOption {
  key: string;
  text: string;
}

export interface QuestionItem {
  qId?: string;
  text: string;
  options: QuestionOption[];
  correct: string;
  explanation: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  marks?: number;
  negativeMarks?: number;
  prevYearRef?: string;
  source?: string;
}

export interface CSVValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  questions: QuestionItem[];
  totalRows: number;
  validRows: number;
  skippedRows: number;
}

const REQUIRED_COLUMNS = ['text', 'option_a', 'option_b', 'correct', 'explanation', 'subject'];

export function parseCSV(file: File): Promise<Papa.ParseResult<any>> {
  return new Promise((resolve, reject) => {
    Papa.parse(file as any, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: (results) => resolve(results),
      error: (err) => reject(err),
    });
  });
}

export function validateAndConvertCSV(parseResults: Papa.ParseResult<any>): CSVValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // check required columns exist
  const headers = parseResults.meta.fields || [];
  const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    return {
      valid: false,
      errors,
      warnings,
      questions: [],
      totalRows: 0,
      validRows: 0,
      skippedRows: 0,
    };
  }

  const questions: QuestionItem[] = [];

  parseResults.data.forEach((row: any, index: number) => {
    const rowNum = index + 2; // +2 because row 1 is header
    const rowErrors: string[] = [];

    // required field checks
    if (!row.text?.trim()) rowErrors.push(`Row ${rowNum}: question text is empty`);
    if (!row.option_a?.trim()) rowErrors.push(`Row ${rowNum}: option_a is empty`);
    if (!row.option_b?.trim()) rowErrors.push(`Row ${rowNum}: option_b is empty`);
    if (!row.correct?.trim()) rowErrors.push(`Row ${rowNum}: correct answer is empty`);
    if (!row.explanation?.trim()) rowErrors.push(`Row ${rowNum}: explanation is empty`);
    if (!row.subject?.trim()) rowErrors.push(`Row ${rowNum}: subject is empty`);

    // correct key validation
    const validKeys = ['A', 'B', 'C', 'D'];
    const correctKey = row.correct?.toUpperCase().trim();
    if (!validKeys.includes(correctKey)) {
      rowErrors.push(`Row ${rowNum}: correct must be A, B, C, or D — got "${row.correct}"`);
    }

    // check correct option has text
    const correctOptionMap: Record<string, string | undefined> = {
      'A': row.option_a,
      'B': row.option_b,
      'C': row.option_c,
      'D': row.option_d
    };
    if (correctKey && !correctOptionMap[correctKey]?.trim()) {
      rowErrors.push(`Row ${rowNum}: correct answer is "${correctKey}" but that option is empty`);
    }

    // difficulty validation
    const difficulty = row.difficulty?.toLowerCase().trim() || 'medium';
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      warnings.push(`Row ${rowNum}: invalid difficulty "${row.difficulty}", defaulting to medium`);
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      return; // skip this row
    }

    // build options array — only include non-empty options
    const options: QuestionOption[] = [
      { key: 'A', text: row.option_a.trim() },
      { key: 'B', text: row.option_b.trim() },
    ];
    if (row.option_c?.trim()) options.push({ key: 'C', text: row.option_c.trim() });
    if (row.option_d?.trim()) options.push({ key: 'D', text: row.option_d.trim() });

    // convert to standard question format
    questions.push({
      text: row.text.trim(),
      options,
      correct: correctKey,
      explanation: row.explanation.trim(),
      subject: row.subject.trim(),
      topic: row.topic?.trim() || '',
      difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
      marks: parseFloat(row.marks) || 1,
      negativeMarks: parseFloat(row.negative_marks) || 0.25,
      prevYearRef: row.prev_year_ref?.trim() || '',
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    questions,
    totalRows: parseResults.data.length,
    validRows: questions.length,
    skippedRows: parseResults.data.length - questions.length,
  };
}
