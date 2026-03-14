'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { getCoachResponse } from '@/app/dashboard/actions';
import { type PredictionResponse } from '../StabilifiDashboard';

interface FinancialCoachProps {
  prediction: PredictionResponse;
}

const formSchema = z.object({
  question: z.string().min(10, { message: 'Please ask a more detailed question.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinancialCoach({ prediction }: FinancialCoachProps) {
  const [loading, setLoading] = useState(false);
  const [coachResponse, setCoachResponse] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setCoachResponse(null);

    const result = await getCoachResponse({
      ...data,
      stressCategory: prediction.category,
      finalStressScore: prediction.financial_health_score,
      topLiquidityFactor: prediction.risk_drivers[0] || 'Not available',
      topCreditFactor: prediction.risk_drivers[1] || 'Not available',
    });

    setCoachResponse(result.response);
    setLoading(false);
  };

  return (
    <Card className="rounded-2xl shadow-md border-primary/5">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Ask Your Financial Coach</CardTitle>
        <CardDescription>Have a question about your score or a financial goal? Ask Stabilifi's AI coach.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="e.g., 'Can I afford to buy a new car right now?' or 'How can I improve my credit score?'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ask Coach
            </Button>
          </form>
        </Form>

        {(loading || coachResponse) && (
          <div className="mt-6 border-t pt-6">
            {loading && (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </div>
            )}
            {coachResponse && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                {coachResponse.split('\n').filter(p => p.trim() !== '').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-2 last:mb-0">{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
