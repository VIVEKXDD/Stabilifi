'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getPredictionHistory, type PredictionRecord } from '@/lib/history';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChartData {
  timestamp: string;
  score: number;
  category: string;
}

interface PieChartData {
    name: string;
    value: number;
}

const COLORS = {
    'Healthy': '#32B36D',
    'Early Stress': '#F2A300',
    'High Stress': '#E55B77',
    'default': '#8884d8'
};

export default function HistoricalChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [pieData, setPieData] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      const history = getPredictionHistory();
      
      const formattedHistory = history.map((item: PredictionRecord) => ({
        score: item.score,
        timestamp: new Date(item.timestamp).toLocaleDateString(),
        category: item.category,
      }));
      setData(formattedHistory);

      const categoryCounts = history.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const formattedPieData = Object.keys(categoryCounts).map(key => ({
        name: key,
        value: categoryCounts[key]
      }));
      setPieData(formattedPieData);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading History...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-muted-foreground">
        <p>No historical data yet. Complete an analysis to start tracking your progress.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="trend" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trend">Trend</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>
        <TabsContent value="trend">
            <div className="h-72 w-full pt-4">
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]}/>
                <Tooltip
                    contentStyle={{
                    background: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem'
                    }}
                />
                <Line type="monotone" dataKey="score" name="Stress Score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
            </div>
        </TabsContent>
        <TabsContent value="scores">
            <div className="h-72 w-full pt-4">
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '0.5rem'
                            }}
                        />
                        <Bar dataKey="score" name="Stress Score" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.category as keyof typeof COLORS] || COLORS.default} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </TabsContent>
        <TabsContent value="distribution">
            <div className="h-72 w-full">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                if (percent === 0) return null;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.default} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '0.5rem'
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </TabsContent>
    </Tabs>
  );
}
