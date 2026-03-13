'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface EloChartProps {
  data: { date: string; elo: number }[];
}

export default function EloChart({ data }: EloChartProps) {
  return (
    <ResponsiveContainer width='100%' height={200}>
      <LineChart data={data}>
        <XAxis
          dataKey='date'
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            background: '#1f2937',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <ReferenceLine
          y={1000}
          stroke='rgba(255,255,255,0.1)'
          strokeDasharray='4 4'
        />
        <Line
          type='monotone'
          dataKey='elo'
          stroke='#eab308'
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#eab308' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
