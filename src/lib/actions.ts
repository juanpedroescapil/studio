"use server";
import { suggestExpenseCategory } from "@/ai/flows/suggest-expense-category";

export async function getCategorySuggestion(transactionDescription: string, categories: string[]) {
  if (!transactionDescription || transactionDescription.trim().length < 3) {
    return { suggestedCategory: "" };
  }
  try {
    const result = await suggestExpenseCategory({ transactionDescription, categories });
    return result;
  } catch (error) {
    console.error("Error getting category suggestion:", error);
    // Return a failed but handled state
    return { suggestedCategory: "" };
  }
}

    