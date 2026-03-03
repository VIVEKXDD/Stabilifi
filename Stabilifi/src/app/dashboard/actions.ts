'use server';

import { generateDetailedActionPlan, GenerateDetailedActionPlanInput, GenerateDetailedActionPlanOutput } from '@/ai/flows/generate-detailed-action-plan';

export async function getDetailedActionPlan(input: GenerateDetailedActionPlanInput): Promise<GenerateDetailedActionPlanOutput['detailedActionPlan']> {
    try {
        const result = await generateDetailedActionPlan(input);
        return result.detailedActionPlan;
    } catch (error) {
        console.error("Error generating detailed action plan:", error);
        return [{ 
            title: "Error Generating Plan", 
            content: "We couldn't generate a detailed plan at this time. Please focus on the basic suggestions provided." 
        }];
    }
}
