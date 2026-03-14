'use server';
/**
 * @fileOverview A Genkit flow for an AI financial coach.
 *
 * - askFinancialCoach - A function that handles providing financial advice based on user's profile and question.
 * - FinancialCoachInput - The input type for the askFinancialCoach function.
 * - FinancialCoachOutput - The return type for the askFinancialCoach function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FinancialCoachInputSchema = z.object({
  question: z.string().describe("The user's financial question."),
  stressCategory: z.string().describe('The financial stress category (e.g., Healthy, Early Stress, High Stress).'),
  finalStressScore: z.number().describe('The overall financial stress score.'),
  topLiquidityFactor: z.string().describe('The primary factor contributing to liquidity stress.'),
  topCreditFactor: z.string().describe('The primary factor contributing to credit stress.'),
});
export type FinancialCoachInput = z.infer<typeof FinancialCoachInputSchema>;

const FinancialCoachOutputSchema = z.object({
  response: z.string().describe('A comprehensive, markdown-formatted response that answers the user\'s question and provides actionable advice.'),
});
export type FinancialCoachOutput = z.infer<typeof FinancialCoachOutputSchema>;

export async function askFinancialCoach(input: FinancialCoachInput): Promise<FinancialCoachOutput> {
  return financialCoachFlow(input);
}

const financialCoachPrompt = ai.definePrompt({
  name: 'financialCoachPrompt',
  input: { schema: FinancialCoachInputSchema },
  output: { schema: FinancialCoachOutputSchema },
  prompt: `You are a helpful and responsible AI financial coach. Your name is Stabilifi Coach. A user has provided their financial stress profile and is asking a question. Your goal is to provide a safe, encouraging, and actionable response. Do not give definitive financial advice, but rather helpful guidance and things to consider.

--- User's Financial Profile ---
- Stress Score: {{{finalStressScore}}} (out of 100, a higher score indicates greater financial stress)
- Stress Category: {{{stressCategory}}}
- Top Liquidity Concern: {{{topLiquidityFactor}}}
- Top Credit Concern: {{{topCreditFactor}}}

--- User's Question ---
"{{{question}}}"

--- Your Task ---
1.  **Analyze the situation:** Based on their stress score and category, assess their current financial standing.
    - If the score is high (e.g., > 60) or the category is 'High Stress', be very cautious. Your primary goal is to guide them towards improving their financial stability, not making large purchases.
    - If the score is moderate (e.g., 30-60) or 'Early Stress', acknowledge their goal but emphasize the importance of strengthening their financial position first.
    - If the score is low (e.g., < 30) or 'Healthy', you can be more encouraging about their goal, but still advise them to plan carefully and consider all aspects.
2.  **Answer the question directly but responsibly.** Do not give a simple "yes" or "no". Frame your answer in the context of their financial health. For example, instead of "Yes, you can buy a car," say something like, "With a healthy financial score like yours, planning for a car purchase is a realistic goal. Here's what you should consider to do it wisely..."
3.  **Provide actionable suggestions.** Give 2-3 concrete, personalized steps they can take. These suggestions should relate directly to their question and their specific financial weak points (liquidity and credit factors).
4.  **Maintain a positive and empowering tone.** You are a coach, not a critic. Your response should be a single block of text. Use markdown for formatting, like using '**' for bold text and '-' for bullet points. Start your response by addressing the user directly.
`,
});

const financialCoachFlow = ai.defineFlow(
  {
    name: 'financialCoachFlow',
    inputSchema: FinancialCoachInputSchema,
    outputSchema: FinancialCoachOutputSchema,
  },
  async (input) => {
    const { output } = await financialCoachPrompt(input);
    return output!;
  }
);
