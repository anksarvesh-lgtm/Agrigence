export function downloadCSVTemplate() {
  const headers = [
    'text', 'option_a', 'option_b', 'option_c', 'option_d',
    'correct', 'explanation', 'subject', 'topic',
    'difficulty', 'marks', 'negative_marks', 'prev_year_ref'
  ];

  const sampleRows = [
    [
      'Which soil order has a spodic horizon?',
      'Ultisols', 'Spodosols', 'Alfisols', 'Inceptisols',
      'B',
      'Spodosols are defined by illuvial accumulation of organic matter.',
      'Soil Science', 'Soil Taxonomy', 'hard', '1', '0.25', 'IBPS-AFO 2022'
    ],
    [
      'Optimum pH for rice cultivation?',
      '5.0-5.5', '5.5-6.5', '7.0-7.5', '8.0-8.5',
      'B',
      'Rice grows best in slightly acidic to neutral pH range.',
      'Agronomy', 'Crop Production', 'medium', '1', '0.25', 'ICAR NET 2021'
    ]
  ];

  const csvContent = [headers, ...sampleRows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'agritest_questions_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}
