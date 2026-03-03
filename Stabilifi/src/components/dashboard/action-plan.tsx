'use client';

import { useEffect, useState } from "react";
import { getDetailedActionPlan } from "@/app/dashboard/actions";
import { Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PredictionResponse {
  category: string;
  final_stress_score: number;
  top_liquidity_factor: string;
  top_credit_factor: string;
  suggestions: string[];
}

interface ActionStep {
    title: string;
    content: string;
}

interface ActionPlanProps {
  prediction: PredictionResponse;
}

export default function ActionPlan({ prediction }: ActionPlanProps) {
  const [detailedPlan, setDetailedPlan] = useState<ActionStep[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      const plan = await getDetailedActionPlan({
        stressCategory: prediction.category,
        finalStressScore: prediction.final_stress_score,
        topLiquidityFactor: prediction.top_liquidity_factor,
        topCreditFactor: prediction.top_credit_factor,
        suggestions: prediction.suggestions,
      });
      setDetailedPlan(plan);
      setLoading(false);
    };

    fetchPlan();
  }, [prediction]);

  if (loading) {
    return (
      <div className="flex items-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Generating your detailed plan...
      </div>
    );
  }

  if (!detailedPlan || detailedPlan.length === 0) {
      return <p>Could not load detailed plan.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
      {detailedPlan.map((step, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger>{step.title}</AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                {step.content.split('\n').filter(p => p.trim() !== '').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-2 last:mb-0">{paragraph}</p>
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
