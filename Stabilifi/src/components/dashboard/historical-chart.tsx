'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getPredictionHistory, type PredictionRecord } from '@/lib/history';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChartData {
  timestamp: string;
  score: number;
  category: string;
  liquidity_stress: number;
  credit_stress: number;
  fraud_vulnerability: number;
}

const fraudVulnerabilityToNumber = (level: 'Low' | 'Medium' | 'High'): number => {
  if (level === 'Low') return 1;
  if (level === 'Medium') return 2;
  return 3;
};

export default function HistoricalChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      const history = getPredictionHistory();
      
      const formattedHistory = history
        .filter(item => item.components) // Filter out records without a 'components' object
        .map((item: PredictionRecord) => ({
          score: item.score,
          timestamp: new Date(item.timestamp).toLocaleDateString(),
          category: item.category,
          liquidity_stress: item.components.liquidity_stress,
          credit_stress: item.components.credit_stress,
          fraud_vulnerability: fraudVulnerabilityToNumber(item.components.fraud_vulnerability),
        }));
      setData(formattedHistory);
      
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
    <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="health">Financial Health</TabsTrigger>
            <TabsTrigger value="breakdown">Stress Breakdown</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Risk</TabsTrigger>
        </TabsList>

        {/* Financial Health Score Chart */}
        <TabsContent value="health">
            <div className="h-72 w-full pt-4">
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                    <Legend />
                    <Line type="monotone" dataKey="score" name="Financial Health Score" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
            </div>
        </TabsContent>

        {/* Stress Components Chart */}
        <TabsContent value="breakdown">
            <div className="h-72 w-full pt-4">
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                        <Legend />
                        <Line type="monotone" dataKey="liquidity_stress" name="Liquidity Stress" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                        <Line type="monotone" dataKey="credit_stress" name="Credit Stress" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </TabsContent>

        {/* Fraud Risk Chart */}
        <TabsContent value="fraud">
            <div className="h-72 w-full pt-4">
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            domain={[0, 4]} 
                            ticks={[1, 2, 3]}
                            tickFormatter={(value) => ['','Low', 'Medium', 'High'][value]}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '0.5rem'
                            }}
                            formatter={(value) => ['Low', 'Medium', 'High'][Number(value) - 1]}
                        />
                         <Legend />
                        <Line type="monotone" dataKey="fraud_vulnerability" name="Fraud Vulnerability" stroke="hsl(var(--chart-5))" strokeWidth={2} step="step" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </TabsContent>
    </Tabs>
  );
}
