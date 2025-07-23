"use server";
import { suggestExpenseCategory } from "@/ai/flows/suggest-expense-category";

export async function getCategorySuggestion(transactionDescription: string) {
  if (!transactionDescription || transactionDescription.trim().length < 3) {
    return { suggestedCategory: "" };
  }
  try {
    const result = await suggestExpenseCategory({ transactionDescription });
    return result;
  } catch (error) {
    console.error("Error getting category suggestion:", error);
    // Return a failed but handled state
    return { suggestedCategory: "" };
  }
}
