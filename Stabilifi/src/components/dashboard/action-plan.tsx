'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, ShieldCheck, TrendingDown } from "lucide-react";
import { useMemo } from "react";

interface ActionPlanProps {
  recommendations: string[];
}

export default function ActionPlan({ recommendations }: ActionPlanProps) {

  const { immediateActions, fraudProtection } = useMemo(() => {
    const immediate: string[] = [];
    const fraud: string[] = [];

    recommendations.forEach(rec => {
      const lowerRec = rec.toLowerCase();
      if (lowerRec.includes('fraud') || lowerRec.includes('alert') || lowerRec.includes('monitor') || lowerRec.includes('suspicious')) {
        fraud.push(rec);
      } else {
        immediate.push(rec);
      }
    });

    return { immediateActions: immediate, fraudProtection: fraud };
  }, [recommendations]);


  if (!recommendations || recommendations.length === 0) {
      return <p className="text-muted-foreground">No specific actions recommended at this time.</p>;
  }

  return (
    <div className="w-full space-y-6">
      {immediateActions.length > 0 && (
        <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-amber-500" />
                Immediate Actions
            </h3>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {immediateActions.map((rec, index) => (
                    <AccordionItem value={`item-${index}`} key={`immediate-${index}`}>
                    <AccordionTrigger>{rec}</AccordionTrigger>
                    <AccordionContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                            <p>Detailed guidance on how to effectively implement this recommendation will be provided here. This includes breaking down the step, explaining its importance, and offering resources.</p>
                        </div>
                    </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      )}

      {fraudProtection.length > 0 && (
        <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-rose-500" />
                Fraud Protection
            </h3>
            <ul className="space-y-2">
                {fraudProtection.map((rec, index) => (
                    <li key={`fraud-${index}`} className="flex items-start gap-3">
                        <ShieldCheck size={18} className="text-emerald-500 mt-1 flex-shrink-0" />
                        <span>{rec}</span>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
}
