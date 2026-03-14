'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface FinancialHealthGaugeProps {
  score: number;
}

export default function FinancialHealthGauge({ score }: FinancialHealthGaugeProps) {
  const getColor = (value: number) => {
    if (value >= 66) return '#32B36D'; // Healthy - Green
    if (value >= 33) return '#F2A300'; // Moderate - Amber
    return '#E55B77'; // Critical - Rose
  };
  
  // Invert score for gauge display (higher score is better)
  const displayScore = Math.round(100 - score);
  const color = getColor(displayScore);
  const data = [{ name: 'score', value: displayScore, fill: color }];

  return (
    <div className="relative h-48 w-full -mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
          cx="50%"
          cy="70%"
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            angleAxisId={0}
            className='transition-all duration-500'
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center top-8">
        <span className="text-5xl font-bold" style={{ color }}>
          {displayScore}
        </span>
        <span className="text-sm text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
}
