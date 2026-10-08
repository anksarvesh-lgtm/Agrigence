
import React from 'react';
import { KPICategory, KPIResult, categoryScore } from './KPI_FRAMEWORK';

interface CategorySectionProps {
  results: KPIResult[];
}

export function CategorySection({ results }: CategorySectionProps) {
  const categories = Object.values(KPICategory);

  return (
    <div className="categoryGrid">
      {categories.map(cat => {
        const score = categoryScore(results, cat);
        return <CategoryCard key={cat} name={cat} score={score} />;
      })}
    </div>
  );
}

interface CategoryCardProps {
  name: string;
  score: number;
}

function CategoryCard({ name, score }: CategoryCardProps) {
  const getColor = (s: number) => {
    if (s >= 80) return '#27ae60';
    if (s >= 60) return '#f39c12';
    return '#c0392b';
  };

  return (
    <div className="categoryCard">
      <h4>
        {name}
        <span style={{ color: getColor(score), fontSize: '0.8rem' }}>{score.toFixed(0)}%</span>
      </h4>
      <div className="progress">
        <div style={{ width: `${score}%`, backgroundColor: getColor(score) }} />
      </div>
    </div>
  );
}
