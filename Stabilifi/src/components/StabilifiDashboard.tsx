'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, RefreshCw, AlertTriangle, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import HistoricalChart from '@/components/dashboard/historical-chart';
import ActionPlan from '@/components/dashboard/action-plan';
import FinancialCoach from '@/components/dashboard/financial-coach';
import Navbar from '@/components/navigation/navbar';
import { addPredictionToHistory } from '@/lib/history';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import FinancialHealthGauge from '@/components/dashboard/risk-gauge';

const formSchema = z.object({
    total_cash_in_obs: z.coerce.number().min(0, "Cannot be negative"),
    total_cash_out_obs: z.coerce.number().min(0, "Cannot be negative"),
    balance_depletion_obs: z.coerce.number().min(0, "Cannot be negative"),
    Total_Revolving_Bal_Normalized: z.coerce.number().min(0, "Must be between 0 and 1").max(1, "Must be between 0 and 1"),
    Avg_Utilization_Ratio_Normalized: z.coerce.number().min(0, "Must be between 0 and 1").max(1, "Must be between 0 and 1"),
    transaction_amount_intensity: z.coerce.number().min(0, "Cannot be negative"),
});

type FormValues = z.infer<typeof formSchema>;

export interface PredictionResponse {
  financial_health_score: number;
  category: string;
  components: {
    liquidity_stress: number;
    credit_stress: number;
    fraud_vulnerability: 'Low' | 'Medium' | 'High';
  };
  risk_drivers: string[];
  recommendations: string[];
}

export default function StabilifiDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [historyKey, setHistoryKey] = useState(0); 

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        total_cash_in_obs: 5000,
        total_cash_out_obs: 4500,
        balance_depletion_obs: 3,
        Total_Revolving_Bal_Normalized: 0.2,
        Avg_Utilization_Ratio_Normalized: 0.2,
        transaction_amount_intensity: 1500,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setPrediction(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not configured.');
      }
      
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown API error occurred.' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const result: PredictionResponse = await response.json();
      setPrediction(result);
      
      addPredictionToHistory({
        score: result.financial_health_score,
        category: result.category,
        components: result.components,
      });
      setHistoryKey(prev => prev + 1); 

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setPrediction(null);
    form.reset();
  }

  const getStatusColor = (category: string) => {
    if (category.toLowerCase().includes('healthy')) return 'text-emerald-500';
    if (category.toLowerCase().includes('moderate')) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getFraudBadgeVariant = (level: 'Low' | 'Medium' | 'High') => {
    if (level === 'Low') return 'success';
    if (level === 'Medium') return 'warning';
    return 'destructive';
  };
  
  const getFraudTextColor = (level: 'Low' | 'Medium' | 'High') => {
    if (level === 'Low') return 'text-emerald-500';
    if (level === 'Medium') return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          
          {!prediction ? (
            <Card className="mx-auto max-w-4xl rounded-2xl shadow-lg border-primary/10">
              <CardHeader className="text-center pb-8">
                <CardTitle className="font-headline text-3xl text-primary mb-2">Financial Risk Analyzer</CardTitle>
                <CardDescription className="text-base">Enter your financial metrics to instantly generate an AI-powered risk profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FormField control={form.control} name="total_cash_in_obs" render={({ field }) => (
                          <FormItem>
                          <FormLabel>Total Cash In ($)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 5000" {...field} /></FormControl>
                          <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="total_cash_out_obs" render={({ field }) => (
                          <FormItem>
                          <FormLabel>Total Cash Out ($)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 4500" {...field} /></FormControl>
                          <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="balance_depletion_obs" render={({ field }) => (
                          <FormItem>
                          <FormLabel>Balance Depletion Rate</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 3" {...field} /></FormControl>
                          <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="transaction_amount_intensity" render={({ field }) => (
                          <FormItem>
                          <FormLabel>Transaction Intensity ($)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 1500" {...field} /></FormControl>
                          <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="Total_Revolving_Bal_Normalized" render={({ field }) => (
                          <FormItem>
                          <FormLabel>Revolving Balance (Normalized)</FormLabel>
                          <FormControl><Input type="number" step="0.01" placeholder="e.g. 0.2" {...field} /></FormControl>
                          <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="Avg_Utilization_Ratio_Normalized" render={({ field }) => (
                          <FormItem>
                          <FormLabel>Avg. Utilization (Normalized)</FormLabel>
                          <FormControl><Input type="number" step="0.01" placeholder="e.g. 0.2" {...field} /></FormControl>
                          <FormMessage />
                          </FormItem>
                      )}/>
                    </div>

                    <Button type="submit" className="w-full mt-8" disabled={loading} size="lg">
                      {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      {loading ? 'Analyzing Profile...' : 'Analyze Financial Health'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            // Result View
            <div className="animate-in fade-in-50 duration-500 space-y-6">
              {/* 7. Health Status Banner */}
              <Card className={`rounded-2xl shadow-md border-0 bg-opacity-20 ${getFraudTextColor(prediction.components.fraud_vulnerability).replace('text-', 'bg-')}`}>
                <CardContent className="p-6 flex items-start gap-4">
                  <AlertTriangle className={`h-8 w-8 mt-1 ${getStatusColor(prediction.category)}`} />
                  <div>
                    <CardTitle className="font-headline text-xl">Financial Health: {prediction.category}</CardTitle>
                    <CardDescription className="text-foreground/80">
                      Fraud Vulnerability: <span className="font-semibold">{prediction.components.fraud_vulnerability}</span>. Immediate action may be recommended to improve your financial stability.
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
              
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">Your Analysis is Ready</h1>
                 </div>
                 <Button onClick={handleReset} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" /> Start New Scan
                 </Button>
               </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* 1. Financial Health Score Card */}
                    <Card className="rounded-2xl shadow-md border-primary/5">
                        <CardHeader className="text-center pb-2">
                        <CardTitle className="font-headline text-lg">Financial Health Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FinancialHealthGauge score={prediction.financial_health_score} />
                            <div className="mt-4 space-y-3 px-2">
                                <h3 className="text-center font-semibold text-muted-foreground text-sm mb-2">Risk Breakdown</h3>
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="font-medium">Liquidity Stress</span>
                                        <span className="font-bold">{prediction.components.liquidity_stress}</span>
                                    </div>
                                    <Progress value={prediction.components.liquidity_stress} />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="font-medium">Credit Stress</span>
                                        <span className="font-bold">{prediction.components.credit_stress}</span>
                                    </div>
                                    <Progress value={prediction.components.credit_stress} />
                                </div>
                                 <div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium">Fraud Vulnerability</span>
                                        <Badge variant={getFraudBadgeVariant(prediction.components.fraud_vulnerability)} className="capitalize">{prediction.components.fraud_vulnerability}</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Top Risk Drivers */}
                    <Card className="rounded-2xl shadow-md border-primary/5">
                        <CardHeader>
                        <CardTitle className="font-headline text-lg">Top Risk Drivers</CardTitle>
                        <CardDescription>What influenced your score the most?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {prediction.risk_drivers.map((driver, index) => (
                                <div key={index} className="flex items-center gap-3 bg-background p-3 rounded-lg border">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">{index + 1}</span>
                                    <p className="font-medium flex-1">{driver}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                    {/* 5. Prescriptive Action Plan */}
                    <Card className="rounded-2xl shadow-md border-primary/5">
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Prescriptive Action Plan</CardTitle>
                            <CardDescription>AI-generated steps to improve your financial stability.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActionPlan recommendations={prediction.recommendations} /> 
                        </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 2. Fraud Vulnerability Card */}
                        <Card className="rounded-2xl shadow-md border-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary"/>
                                Fraud Vulnerability
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Fraud Risk Level</p>
                                    <p className={`text-2xl font-bold ${getFraudTextColor(prediction.components.fraud_vulnerability)}`}>
                                        {prediction.components.fraud_vulnerability}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Contributing Factors:</p>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                                        <li>Severe liquidity stress</li>
                                        <li>High outgoing transaction ratio</li>
                                        <li>Balance depletion patterns</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* 8. AI Insights Card */}
                        <Card className="rounded-2xl shadow-md border-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary"/>
                                AI Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <div>
                                    <p className="text-sm font-semibold">Risk Projection:</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Financial stress is likely to increase further without intervention based on current patterns.
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Primary Cause:</p>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                                      <li>Increasing outgoing transactions</li>
                                      <li>Declining account balance stability</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <FinancialCoach prediction={prediction} />
                </div>
              </div>
              
              {/* 3. Historical Trends */}
              <Card className="rounded-2xl shadow-md border-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5"/>
                    Historical Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HistoricalChart key={historyKey} />
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
