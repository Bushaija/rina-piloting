import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  regenerateFinancialStatement,
  type RegenerateStatementRequest,
  type RegenerateStatementResponse
} from "@/fetchers/financial-reports/regenerate-statement";

interface UseRegenerateStatementOptions {
  onSuccess?: (data: RegenerateStatementResponse) => void;
  onError?: (error: Error) => void;
  /** Whether to invalidate financial reports queries after regeneration */
  invalidateOnSuccess?: boolean;
}

/**
 * Hook for regenerating financial statements
 * 
 * Use this to fix reports that became empty after execution data was deleted and re-entered.
 * This hook will:
 * 1. Delete existing financial report records for the specified parameters
 * 2. Check if execution data exists
 * 3. Return status so you can then call generateStatement to view fresh data
 * 
 * @example
 * ```tsx
 * const { mutate: regenerate, isPending } = useRegenerateStatement({
 *   onSuccess: (data) => {
 *     if (data.executionDataFound) {
 *       toast.success('Report regenerated! Refreshing data...');
 *       // Now call generateStatement to view fresh data
 *     } else {
 *       toast.warning('No execution data found. Please add execution data first.');
 *     }
 *   },
 *   onError: (error) => {
 *     toast.error(`Failed to regenerate: ${error.message}`);
 *   }
 * });
 * 
 * regenerate({
 *   statementCode: 'REV_EXP',
 *   reportingPeriodId: 1,
 *   projectType: 'HIV',
 *   facilityId: 338,
 *   deleteExisting: true
 * });
 * ```
 */
function useRegenerateStatement(options?: UseRegenerateStatementOptions) {
  const queryClient = useQueryClient();
  const { invalidateOnSuccess = true, ...restOptions } = options || {};

  return useMutation<RegenerateStatementResponse, Error, RegenerateStatementRequest>({
    mutationFn: regenerateFinancialStatement,
    onSuccess: (data) => {
      // Invalidate related queries to refresh the UI
      if (invalidateOnSuccess) {
        queryClient.invalidateQueries({ queryKey: ['financial-reports'] });
        queryClient.invalidateQueries({ queryKey: ['financial-statement'] });
      }
      restOptions?.onSuccess?.(data);
    },
    onError: restOptions?.onError,
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error.message.includes('400') || 
          error.message.includes('403') || 
          error.message.includes('404')) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export default useRegenerateStatement;
