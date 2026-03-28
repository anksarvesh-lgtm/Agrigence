
import React from 'react';

interface OverallScoreProps {
  score: number;
}

export function OverallScore({ score }: OverallScoreProps) {
  const band =
    score >= 85 ? "Excellent" :
    score >= 70 ? "Good" :
    score >= 50 ? "Needs Attention" :
    "Critical";

  const bandClass =
    score >= 85 ? "band-Excellent" :
    score >= 70 ? "band-Good" :
    score >= 50 ? "band-NeedsAttention" :
    "band-Critical";

  return (
    <div className="overallBox">
      <h3>Overall Performance Index</h3>
      <div className="score">{score.toFixed(1)}</div>
      <div className={`band ${bandClass}`}>{band}</div>
    </div>
  );
}
