'use server';

/**
 * @fileOverview Flujo de sugerencia de categoría de gastos.
 *
 * Este archivo define un flujo de Genkit que sugiere categorías de gastos relevantes
 * basado en la descripción de la transacción. Exporta:
 *
 * - `suggestExpenseCategory`: Una función asíncrona que toma una descripción de
 *   transacción y devuelve una categoría de gasto sugerida.
 * - `SuggestExpenseCategoryInput`: El tipo de entrada para la función
 *   `suggestExpenseCategory`.
 * - `SuggestExpenseCategoryOutput`: El tipo de salida para la función
 *   `suggestExpenseCategory`.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExpenseCategoryInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('Una descripción de la transacción para la cual sugerir una categoría.'),
  categories: z.array(z.string()).describe('La lista de categorías disponibles.')
});
export type SuggestExpenseCategoryInput = z.infer<
  typeof SuggestExpenseCategoryInputSchema
>;

const SuggestExpenseCategoryOutputSchema = z.object({
  suggestedCategory: z
    .string()
    .describe('La categoría de gasto sugerida para la transacción.'),
});
export type SuggestExpenseCategoryOutput = z.infer<
  typeof SuggestExpenseCategoryOutputSchema
>;

export async function suggestExpenseCategory(
  input: SuggestExpenseCategoryInput
): Promise<SuggestExpenseCategoryOutput> {
  return suggestExpenseCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExpenseCategoryPrompt',
  input: {schema: SuggestExpenseCategoryInputSchema},
  output: {schema: SuggestExpenseCategoryOutputSchema},
  prompt: `Dada la siguiente descripción de la transacción, sugiere una categoría de gasto relevante en español de esta lista: {{#each categories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.\n\nDescripción de la transacción: {{{transactionDescription}}}\n\nCategoría Sugerida:`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const suggestExpenseCategoryFlow = ai.defineFlow(
  {
    name: 'suggestExpenseCategoryFlow',
    inputSchema: SuggestExpenseCategoryInputSchema,
    outputSchema: SuggestExpenseCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    