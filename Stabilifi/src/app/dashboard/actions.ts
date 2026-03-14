'use server';

import { askFinancialCoach, FinancialCoachInput, FinancialCoachOutput } from '@/ai/flows/financial-coach-flow';

export async function getCoachResponse(input: FinancialCoachInput): Promise<FinancialCoachOutput> {
    try {
        const result = await askFinancialCoach(input);
        return result;
    } catch (error) {
        console.error("Error getting coach response:", error);
        return {
            response: "I'm sorry, I couldn't process your request at this time. Please try again later."
        };
    }
}
