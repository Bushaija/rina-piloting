"use client";

import React from 'react';
import { useGetFacilityById } from "@/hooks/queries";
import { authClient } from '@/lib/auth';
import { APIExportButton } from '@/components/reports/api-export-button';

type StatementCode = 'REV_EXP' | 'ASSETS_LIAB' | 'CASH_FLOW' | 'NET_ASSETS_CHANGES' | 'BUDGET_VS_ACTUAL';
type ProjectType = 'HIV' | 'Malaria' | 'TB';

type ReportHeaderProps = {
  program: string;
  reportName: string;
  period: number;
  contentRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  statementCode: StatementCode;
  projectType: ProjectType;
  reportingPeriodId: number;
  facilityId?: number;
};

export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (text: string) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

/**
 * Get the current quarter's end date based on fiscal year (July 1 - June 30)
 * 
 * Fiscal Year Quarters:
 * - Q1: July 1 - September 30
 * - Q2: October 1 - December 31
 * - Q3: January 1 - March 31
 * - Q4: April 1 - June 30
 * 
 * @returns Object with month name, day, and year for the current quarter's end date
 */
function getCurrentQuarterEndDate(): { month: string; day: number; year: number } {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January)
  const currentYear = now.getFullYear();

  // Determine fiscal year (fiscal year 2026 runs from July 2025 to June 2026)
  // If we're in July-December, fiscal year is currentYear + 1
  // If we're in January-June, fiscal year is currentYear
  const fiscalYear = currentMonth >= 6 ? currentYear + 1 : currentYear;

  // Determine quarter end date based on current month
  if (currentMonth >= 0 && currentMonth <= 2) {
    // January, February, March → Q3 ends March 31
    return { month: 'March', day: 31, year: fiscalYear };
  } else if (currentMonth >= 3 && currentMonth <= 5) {
    // April, May, June → Q4 ends June 30
    return { month: 'June', day: 30, year: fiscalYear };
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    // July, August, September → Q1 ends September 30
    return { month: 'September', day: 30, year: fiscalYear };
  } else {
    // October, November, December → Q2 ends December 31
    return { month: 'December', day: 31, year: fiscalYear };
  }
}

export function ReportHeader({
  program,
  reportName,
  period,
  contentRef,
  fileName,
  statementCode,
  projectType,
  reportingPeriodId,
  facilityId: propFacilityId
}: ReportHeaderProps) {
  const { data: session } = authClient.useSession();

  const sessionFacilityId = session?.user?.facilityId;
  const facilityId = propFacilityId ?? sessionFacilityId;
  const { data: facility } = useGetFacilityById(facilityId ?? 0, !!facilityId);
  const facilityName: string | undefined = (facility as { name?: string } | undefined)?.name;

  // Get current quarter's end date dynamically
  const quarterEnd = getCurrentQuarterEndDate();
  const periodEndDateText = `${quarterEnd.month} ${quarterEnd.day} ${quarterEnd.year}`;

  return (
    <div className="flex items-center ml-[200px] text-left mb-8">
      <div className="flex flex-col justify-center items-center">
        <h3 className="scroll-m-20 border-b-3 border-double border-gray-500 pb-2 text-2xl font-semibold tracking-tight first:mt-0">{reportName}</h3>
        <h2 className="text-md text-gray-600 mt-2">
          {program}
          {facilityName ? `${toTitleCase(facilityName)} Hospital` : "loading..."}
        </h2>
        <p className="text-gray-600 text-md">{`Annual Financial Statement for the year ended ${periodEndDateText}`}</p>
      </div>
      {/* <APIExportButton
        statementCode={statementCode}
        projectType={projectType}
        reportingPeriodId={reportingPeriodId}
        facilityId={facilityId}
        fileName={fileName}
        format="pdf"
      /> */}
    </div>
  );
}
