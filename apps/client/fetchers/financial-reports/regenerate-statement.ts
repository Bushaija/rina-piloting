import { honoClient as client } from "@/api-client/index";
import type { InferRequestType, InferResponseType } from "hono/client";

// Type inference for request body
export type RegenerateStatementRequest = InferRequestType<
  (typeof client)["financial-reports"]["regenerate"]["$post"]
>["json"];

// Type inference for response data
export type RegenerateStatementResponse = InferResponseType<
  (typeof client)["financial-reports"]["regenerate"]["$post"]
>;

/**
 * Regenerate financial statement by deleting old reports and checking for execution data
 * 
 * Use this to fix reports that became empty after execution data was deleted and re-entered.
 * After calling this, use generateStatement to view the fresh data.
 */
export async function regenerateFinancialStatement(json: RegenerateStatementRequest) {
  try {
    const response = await (client as any)["financial-reports"]["regenerate"].$post({
      json,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // Keep the default error message
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data as RegenerateStatementResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to regenerate financial statement');
  }
}
