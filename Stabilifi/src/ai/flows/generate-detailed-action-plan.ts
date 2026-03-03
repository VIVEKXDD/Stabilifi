'use server';
/**
 * @fileOverview A Genkit flow for generating a detailed financial action plan based on a user's financial stress profile.
 *
 * - generateDetailedActionPlan - A function that handles the generation of a detailed action plan.
 * - GenerateDetailedActionPlanInput - The input type for the generateDetailedActionPlan function.
 * - GenerateDetailedActionPlanOutput - The return type for the generateDetailedActionPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDetailedActionPlanInputSchema = z.object({
  stressCategory: z.string().describe('The financial stress category (e.g., Healthy, Early Stress, High Stress).'),
  finalStressScore: z.number().describe('The overall financial stress score.'),
  topLiquidityFactor: z.string().describe('The primary factor contributing to liquidity stress.'),
  topCreditFactor: z.string().describe('The primary factor contributing to credit stress.'),
  suggestions: z.array(z.string()).describe('An array of basic financial suggestions provided by the initial analysis.'),
});
export type GenerateDetailedActionPlanInput = z.infer<typeof GenerateDetailedActionPlanInputSchema>;

const ActionStepSchema = z.object({
  title: z.string().describe('A short, actionable title for the step. This should be a single sentence.'),
  content: z.string().describe('A detailed explanation of the step, including why it is important and how to execute it. This should be one or two paragraphs and can contain line breaks for formatting.'),
});

const GenerateDetailedActionPlanOutputSchema = z.object({
  detailedActionPlan: z.array(ActionStepSchema).describe('A detailed, personalized financial action plan with at least 3 and at most 5 elaborated steps.'),
});
export type GenerateDetailedActionPlanOutput = z.infer<typeof GenerateDetailedActionPlanOutputSchema>;

export async function generateDetailedActionPlan(input: GenerateDetailedActionPlanInput): Promise<GenerateDetailedActionPlanOutput> {
  return generateDetailedActionPlanFlow(input);
}

const generateDetailedActionPlanPrompt = ai.definePrompt({
  name: 'generateDetailedActionPlanPrompt',
  input: { schema: GenerateDetailedActionPlanInputSchema },
  output: { schema: GenerateDetailedActionPlanOutputSchema },
  prompt: `You are an expert financial advisor specializing in personalized action plans.

Based on the following financial stress profile, generate a detailed, personalized financial action plan consisting of a series of actionable steps.
For each step, provide a short title and detailed content. Elaborate on the provided basic suggestions to give clear, actionable, and comprehensive steps for the user to improve their financial situation.
The response should be structured as an array of action steps.

--- Financial Stress Profile ---
Stress Category: {{{stressCategory}}}
Stress Score: {{{finalStressScore}}}
Top Liquidity Factor: {{{topLiquidityFactor}}}
Top Credit Factor: {{{topCreditFactor}}}
Basic Suggestions: {{#each suggestions}}- {{{this}}}
{{/each}}

--- Detailed Action Plan ---
`,
});

const generateDetailedActionPlanFlow = ai.defineFlow(
  {
    name: 'generateDetailedActionPlanFlow',
    inputSchema: GenerateDetailedActionPlanInputSchema,
    outputSchema: GenerateDetailedActionPlanOutputSchema,
  },
  async (input) => {
    const { output } = await generateDetailedActionPlanPrompt(input);
    return output!;
  }
);
