import { useQuery } from "@tanstack/react-query";
import { honoClient as client } from "@/api-client/index";
import { getFinancialReports } from "@/fetchers/financial-reports/get-financial-reports";
import type { ReportStatus } from "@/types/financial-reports-approval";

interface UseGetReportStatusParams {
  reportingPeriodId: number;
  projectType: "HIV" | "Malaria" | "TB";
  statementType: "revenue-expenditure" | "assets-liabilities" | "cash-flow" | "net-assets-changes" | "budget-vs-actual";
  enabled?: boolean;
}

interface ReportStatusResult {
  reportId: number | null;
  status: ReportStatus | null;
  canRegenerate: boolean;
}

// Statuses that are safe to regenerate
const SAFE_TO_REGENERATE_STATUSES: ReportStatus[] = [
  "draft",
  "rejected_by_daf",
  "rejected_by_dg",
  "rejected", // legacy status
];

/**
 * Hook to fetch the financial report ID and status
 * Also determines if it's safe to regenerate the report
 * 
 * Regeneration is SAFE when:
 * - No report exists (Preview Mode)
 * - Report is in draft status
 * - Report was rejected
 * 
 * Regeneration is NOT SAFE when:
 * - Report is pending approval
 * - Report is approved (would lose approval history)
 */
function useGetReportStatus({ 
  reportingPeriodId, 
  projectType, 
  statementType,
  enabled = true 
}: UseGetReportStatusParams) {
  // Map statement type to report type enum
  const reportTypeMap = {
    "revenue-expenditure": "revenue_expenditure",
    "assets-liabilities": "balance_sheet",
    "cash-flow": "cash_flow",
    "net-assets-changes": "net_assets_changes",
    "budget-vs-actual": "budget_vs_actual",
  } as const;

  return useQuery<ReportStatusResult>({
    queryKey: [
      "financial-report-status",
      reportingPeriodId,
      projectType,
      statementType,
    ],
    queryFn: async (): Promise<ReportStatusResult> => {
      try {
        // First, get the project ID from project type
        const projectsResponse = await (client as any).projects.$get({
          query: {},
        });

        if (!projectsResponse.ok) {
          return { reportId: null, status: null, canRegenerate: true };
        }

        const projectsData = await projectsResponse.json();
        const projects = Array.isArray(projectsData) ? projectsData : [];
        const project = projects.find(
          (p: any) => p.projectType === projectType
        );

        if (!project) {
          return { reportId: null, status: null, canRegenerate: true };
        }

        // Query financial reports
        const queryParams = {
          projectId: project.id,
          reportType: reportTypeMap[statementType],
          limit: 50,
          page: 1,
        };

        const reportsData = await getFinancialReports(queryParams);
        
        // Find matching report
        const matchingReport = reportsData.reports?.find(
          (report: any) => report.reportingPeriodId === reportingPeriodId
        );
        
        if (!matchingReport) {
          // No report exists - safe to regenerate (Preview Mode)
          return { reportId: null, status: null, canRegenerate: true };
        }

        const status = matchingReport.status as ReportStatus;
        const canRegenerate = SAFE_TO_REGENERATE_STATUSES.includes(status);

        return {
          reportId: matchingReport.id,
          status,
          canRegenerate,
        };
      } catch (error) {
        // On error, default to allowing regeneration
        return { reportId: null, status: null, canRegenerate: true };
      }
    },
    enabled: enabled && !!reportingPeriodId && !!projectType,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}

export default useGetReportStatus;
