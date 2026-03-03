'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as FormDescriptionComponent } from '@/components/ui/form';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import RiskGauge from '@/components/dashboard/risk-gauge';
import HistoricalChart from '@/components/dashboard/historical-chart';
import ActionPlan from '@/components/dashboard/action-plan';
import Navbar from '@/components/navigation/navbar';
import { addPredictionToHistory } from '@/lib/history';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// 1. Define the streamlined schema matching the NEW 6-field API requirement
const formSchema = z.object({
  total_cash_in_obs: z.coerce.number().min(0, "Income cannot be negative"),
  total_cash_out_obs: z.coerce.number().min(0, "Expenses cannot be negative"),
  balance_depletion_obs: z.coerce.number().int("Must be a whole number"),
  Total_Revolving_Bal_Normalized: z.coerce.number().min(0, "Balance cannot be negative").max(1, "Must be between 0 and 1"),
  Avg_Utilization_Ratio_Normalized: z.coerce.number().min(0, "Ratio cannot be negative").max(1, "Must be between 0 and 1"),
  transaction_amount_intensity: z.coerce.number().min(0, "Intensity cannot be negative"),
});

type FormValues = z.infer<typeof formSchema>;

// Define types for the API response
interface PredictionResponse {
  category: string;
  final_stress_score: number;
  top_liquidity_factor: string;
  top_credit_factor: string;
  suggestions: string[];
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
      total_cash_out_obs: 4000,
      balance_depletion_obs: 0,
      Total_Revolving_Bal_Normalized: 0.3,
      Avg_Utilization_Ratio_Normalized: 0.4,
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
        score: result.final_stress_score,
        category: result.category,
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

  // Helper for status colors
  const getStatusColor = (category: string) => {
      if (category.toLowerCase().includes('healthy')) return 'text-emerald-500';
      if (category.toLowerCase().includes('early')) return 'text-amber-500';
      return 'text-rose-500';
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          
          {!prediction ? (
            <Card className="mx-auto max-w-3xl rounded-2xl shadow-lg border-primary/10">
              <CardHeader className="text-center pb-8">
                <CardTitle className="font-headline text-3xl text-primary mb-2">Financial Risk Analyzer</CardTitle>
                <CardDescription className="text-base">Enter a few key metrics to instantly generate your financial stress profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    {/* Section 1: Cash Flow */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b pb-2 flex items-center"><AlertCircle className="w-5 h-5 mr-2 text-primary/60"/> Cash Flow Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="total_cash_in_obs" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Monthly Income ($)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g. 5000" {...field} /></FormControl>
                                <FormDescriptionComponent>Total inflows this period</FormDescriptionComponent>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="total_cash_out_obs" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Monthly Expenses ($)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g. 3500" {...field} /></FormControl>
                                <FormDescriptionComponent>Total outflows this period</FormDescriptionComponent>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="balance_depletion_obs" render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                <FormLabel>Times Account Reached Zero</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g. 0" {...field} /></FormControl>
                                <FormDescriptionComponent>Number of times balance hit $0 in the last 30 days</FormDescriptionComponent>
                                <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    </div>

                    {/* Section 2: Credit Activity */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-medium border-b pb-2 flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-primary/60"/> Credit Activity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="Avg_Utilization_Ratio_Normalized" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Credit Utilization Ratio</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="e.g. 0.35" {...field} /></FormControl>
                                <FormDescriptionComponent>Percentage of limit used (0.00 to 1.00)</FormDescriptionComponent>
                                <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="Total_Revolving_Bal_Normalized" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Revolving Balance Ratio</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="e.g. 0.20" {...field} /></FormControl>
                                <FormDescriptionComponent>Portion of limit carried over monthly (0.00 to 1.00)</FormDescriptionComponent>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="transaction_amount_intensity" render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                <FormLabel>Transaction Intensity</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g. 1500" {...field} /></FormControl>
                                <FormDescriptionComponent>Total volume of credit transactions this period</FormDescriptionComponent>
                                <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
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
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl shadow-sm border">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">Your Analysis is Ready</h1>
                    <p className="text-muted-foreground mt-1">Status: <span className={`font-semibold ${getStatusColor(prediction.category)}`}>{prediction.category}</span></p>
                 </div>
                 <Button onClick={handleReset} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" /> Start New Scan
                 </Button>
               </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Gauges and Factors */}
                <div className="lg:col-span-1 space-y-6">
                  <Card className="rounded-2xl shadow-md border-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-headline text-lg text-center">Stabilifi Stress Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <RiskGauge score={prediction.final_stress_score} />
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-md border-primary/5 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="font-headline text-lg">Primary Drivers</CardTitle>
                      <CardDescription>What influenced your score the most?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-background p-4 rounded-xl border">
                        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Liquidity Driver</p>
                        <p className="font-medium">{prediction.top_liquidity_factor.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="bg-background p-4 rounded-xl border">
                        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Credit Driver</p>
                        <p className="font-medium">{prediction.top_credit_factor.replace(/_/g, ' ')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Action Plan and Chart */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="rounded-2xl shadow-md border-primary/5">
                    <CardHeader>
                      <CardTitle className="font-headline text-xl">Prescriptive Action Plan</CardTitle>
                       <CardDescription>Steps to improve your financial stability.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Assuming ActionPlan accepts 'suggestions' or full 'prediction' object */}
                        <ActionPlan prediction={prediction} /> 
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-md border-primary/5">
                    <CardHeader>
                      <CardTitle className="font-headline text-xl">Historical Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <HistoricalChart key={historyKey} />
                    </CardContent>
                  </Card>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
