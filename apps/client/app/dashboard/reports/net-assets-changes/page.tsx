"use client";

import React, { useRef, useState, useEffect } from "react";
import { FinancialStatementHeader } from '@/components/reports/financial-statement-header';
import { ChangesInNetAssetsStatement } from '@/features/reports/changes-in-net-assets';
import { ReportSkeleton } from '@/components/skeletons';
import { type FilterTab } from '@/components/ui/filter-tabs';
import useGenerateStatement from '@/hooks/mutations/financial-reports/use-generate-statement';
import { useRegenerateStatement } from '@/hooks/mutations/financial-reports';
import { useToast } from '@/hooks/use-toast';
import { transformNetAssetsData } from '../_utils/transform-statement-data';
import { FinancialReportStatusCard } from '@/components/reports/financial-report-status-card';
import { useGetReportId, useGetReportStatus } from '@/hooks/queries/financial-reports';
import { useHierarchyContext } from '@/hooks/use-hierarchy-context';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Project configuration
const projectTabs: FilterTab[] = [
  {
    value: 'hiv',
    label: 'HIV',
    content: null // Will be populated with the report component
  },
  {
    value: 'malaria', 
    label: 'Malaria',
    content: null
  },
  {
    value: 'tb',
    label: 'TB',
    content: null
  }
]

// Tab Content Component that handles loading state
const TabContent = ({ tabValue, periodId }: { tabValue: string; periodId: number }) => {
  const [statementData, setStatementData] = useState<any>(null);
  const { mutate: generateStatement, isPending, isError } = useGenerateStatement();
  const { toast } = useToast();

  const projectTypeMapping: Record<string, 'HIV' | 'Malaria' | 'TB'> = {
    'hiv': 'HIV',
    'malaria': 'Malaria',
    'tb': 'TB'
  };

  // Fetch the report ID for this project and period
  const { data: reportId, refetch: refetchReportId } = useGetReportId({
    reportingPeriodId: periodId,
    projectType: projectTypeMapping[tabValue],
    statementType: "net-assets-changes",
    enabled: !!periodId,
  });

  // Handle report creation - refetch the report ID
  const handleReportCreated = () => {
    refetchReportId();
  };

  // Handle regeneration - refetch statement data
  const handleRegenerate = () => {
    if (periodId) {
      generateStatement(
        {
          statementCode: "NET_ASSETS_CHANGES",
          reportingPeriodId: periodId,
          projectType: projectTypeMapping[tabValue],
          includeComparatives: true,
        },
        {
          onSuccess: (data) => {
            setStatementData(data.statement);
            toast({
              title: "Statement refreshed",
              description: "Financial statement data has been refreshed.",
            });
          },
          onError: (error) => {
            toast({
              title: "Failed to refresh statement",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  useEffect(() => {
    if (periodId) {
      generateStatement(
        {
          statementCode: "NET_ASSETS_CHANGES",
          reportingPeriodId: periodId,
          projectType: projectTypeMapping[tabValue],
          includeComparatives: true,
        },
        {
          onSuccess: (data) => {
            setStatementData(data.statement);
          },
          onError: (error) => {
            toast({
              title: "Failed to generate statement",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    }
  }, [periodId, tabValue]);

  if (isPending || !statementData) {
    return <ReportSkeleton />
  }

  if (isError) {
    return <div className="bg-white p-6 rounded-lg border">Failed to load changes in net assets statement for {tabValue.toUpperCase()}</div>
  }

  // Transform API data to component format
  const transformedData = transformNetAssetsData(statementData.lines ?? []);

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <ChangesInNetAssetsStatement initialData={transformedData} />
      </div>
      <div className="w-80">
        <FinancialReportStatusCard
          reportId={reportId ?? null}
          projectType={projectTypeMapping[tabValue]}
          statementType="net-assets-changes"
          reportingPeriodId={periodId}
          onReportCreated={handleReportCreated}
          onRegenerate={handleRegenerate}
        />
      </div>
    </div>
  );
}

export default function ChangesInNetAssetsPage() {
  const [selectedTab, setSelectedTab] = useState('hiv')
  const reportContentRef = useRef<HTMLDivElement>(null!)
  const { toast } = useToast();
  const { userFacilityId } = useHierarchyContext();
  
  // For now, use a hardcoded period ID
  // TODO: Implement proper reporting period selection
  const periodId = 2;

  const projectTypeMapping: Record<string, 'HIV' | 'Malaria' | 'TB'> = {
    'hiv': 'HIV',
    'malaria': 'Malaria',
    'tb': 'TB'
  };

  // Check if regeneration is safe for the current report
  const { data: reportStatus } = useGetReportStatus({
    reportingPeriodId: periodId,
    projectType: projectTypeMapping[selectedTab],
    statementType: "net-assets-changes",
    enabled: !!periodId,
  });

  const canRegenerate = reportStatus?.canRegenerate ?? true;
  const currentStatus = reportStatus?.status;

  // Regenerate statement mutation
  const { mutate: regenerate, isPending: isRegenerating } = useRegenerateStatement({
    onSuccess: (data) => {
      if (data.executionDataFound) {
        toast({
          title: "Success",
          description: data.message,
        });
        window.location.reload();
      } else {
        toast({
          title: "No Data Found",
          description: "No execution data found for this period. Please add execution data first.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate statement",
        variant: "destructive",
      });
    },
  });

  const handleRegenerate = () => {
    if (!userFacilityId) {
      toast({
        title: "Error",
        description: "Unable to determine your facility. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!canRegenerate) {
      toast({
        title: "Cannot Regenerate",
        description: "This report is pending approval or already approved. Regenerating would delete the approval history.",
        variant: "destructive",
      });
      return;
    }

    regenerate({
      statementCode: "NET_ASSETS_CHANGES",
      reportingPeriodId: periodId,
      projectType: projectTypeMapping[selectedTab],
      facilityId: userFacilityId,
      deleteExisting: true,
    });
  };

  // Get tooltip message for disabled state
  const getRegenerateTooltip = () => {
    if (!userFacilityId) return "Unable to determine your facility";
    if (!canRegenerate) {
      if (currentStatus === "pending_daf_approval") return "Report is pending DAF approval";
      if (currentStatus === "approved_by_daf") return "Report is approved by DAF";
      if (currentStatus === "submitted") return "Report is submitted for approval";
      if (currentStatus === "approved") return "Report is approved";
      if (currentStatus === "fully_approved") return "Report is fully approved";
      return "Report cannot be regenerated in current state";
    }
    return "Regenerate statement from execution data";
  };

  return (
    <main className="max-w-6xl mx-auto">
      <div className="">
        {/* 1. Financial Statement Header - Always visible */}
        <div ref={reportContentRef} className="bg-white">
          <FinancialStatementHeader
            statementType="net-assets-changes"
            selectedProject={selectedTab as 'hiv' | 'malaria' | 'tb'}
            contentRef={reportContentRef}
            reportingPeriodId={periodId}
          />
        
          {/* 2. Filter Tabs with Regenerate Button */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
              {projectTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedTab(tab.value)}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    selectedTab === tab.value
                      ? 'bg-background text-foreground shadow'
                      : 'hover:bg-background/50 hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      onClick={handleRegenerate}
                      disabled={isRegenerating || !userFacilityId || !canRegenerate}
                      variant={canRegenerate ? "outline" : "ghost"}
                      size="sm"
                      className={!canRegenerate ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {isRegenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : !canRegenerate ? (
                        <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Regenerate Statement
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getRegenerateTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Tab Content */}
          <TabContent tabValue={selectedTab} periodId={periodId} />
        </div>
      </div>
    </main>
  )
} 
