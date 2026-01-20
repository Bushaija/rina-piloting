/**
 * VAT-to-Section-D Mapping Utility
 * 
 * This utility maps VAT categories to their corresponding Section D line item codes.
 * These line items represent VAT receivables (assets) that will be refunded by RRA through MICOFEN.
 * 
 * UPDATED: VAT receivables are now classified in Section D (Financial Assets) instead of Section E,
 * as they represent amounts owed TO the facility by RRA, making them assets rather than liabilities.
 * 
 * VAT-based expenses:
 * - HIV (4 categories): Communication - All, Maintenance, Fuel, Office Supplies
 * - Malaria (6 categories): HIV's 4 + Car Hiring, Consumables
 * - TB (4 categories): Same as HIV
 */

import { VAT_APPLICABLE_CATEGORIES, type VATApplicableCategory } from './vat-applicable-expenses';

/**
 * Maps VAT categories to their corresponding Section D line item codes
 * These line items represent VAT receivables (assets) in the execution schema
 * 
 * @param projectType - The project type (HIV, MAL, TB)
 * @param facilityType - The facility type (hospital, health_center)
 * @param vatCategory - The VAT category
 * @returns The Section D line item code for the VAT receivable
 * 
 * @example
 * ```typescript
 * getVATReceivableCode('HIV', 'hospital', 'communication_all')
 * // Returns: "HIV_EXEC_HOSPITAL_D_VAT_COMMUNICATION_ALL"
 * 
 * getVATReceivableCode('MAL', 'health_center', 'car_hiring')
 * // Returns: "MAL_EXEC_HEALTH_CENTER_D_VAT_CAR_HIRING"
 * ```
 */
export function getVATReceivableCode(
  projectType: 'HIV' | 'MAL' | 'TB',
  facilityType: 'hospital' | 'health_center',
  vatCategory: VATApplicableCategory
): string {
  const prefix = `${projectType}_EXEC_${facilityType.toUpperCase()}`;
  
  // Map VAT categories to Section D codes (Financial Assets)
  // These codes match the seed data in execution-categories-activities.ts
  const vatCodeMap: Record<VATApplicableCategory, string> = {
    [VAT_APPLICABLE_CATEGORIES.COMMUNICATION_ALL]: `${prefix}_D_VAT_COMMUNICATION_ALL`,
    [VAT_APPLICABLE_CATEGORIES.MAINTENANCE]: `${prefix}_D_VAT_MAINTENANCE`,
    [VAT_APPLICABLE_CATEGORIES.FUEL]: `${prefix}_D_VAT_FUEL`,
    [VAT_APPLICABLE_CATEGORIES.OFFICE_SUPPLIES]: `${prefix}_D_VAT_SUPPLIES`,
    [VAT_APPLICABLE_CATEGORIES.CAR_HIRING]: `${prefix}_D_VAT_CAR_HIRING`,
    [VAT_APPLICABLE_CATEGORIES.CONSUMABLES]: `${prefix}_D_VAT_CONSUMABLES`,
  };
  
  return vatCodeMap[vatCategory];
}

/**
 * Gets the display label for a VAT receivable line item
 * 
 * @param vatCategory - The VAT category
 * @returns The human-readable label for the VAT receivable
 * 
 * @example
 * ```typescript
 * getVATReceivableLabel('communication_all')
 * // Returns: "VAT Receivable 1: Communication - All"
 * 
 * getVATReceivableLabel('car_hiring')
 * // Returns: "VAT Receivable 5: Car hiring"
 * ```
 */
export function getVATReceivableLabel(vatCategory: VATApplicableCategory): string {
  const labelMap: Record<VATApplicableCategory, string> = {
    [VAT_APPLICABLE_CATEGORIES.COMMUNICATION_ALL]: 'VAT Receivable 1: Communication - All',
    [VAT_APPLICABLE_CATEGORIES.MAINTENANCE]: 'VAT Receivable 2: Maintenance',
    [VAT_APPLICABLE_CATEGORIES.FUEL]: 'VAT Receivable 3: Fuel',
    [VAT_APPLICABLE_CATEGORIES.OFFICE_SUPPLIES]: 'VAT Receivable 4: Office supplies',
    [VAT_APPLICABLE_CATEGORIES.CAR_HIRING]: 'VAT Receivable 5: Car hiring',
    [VAT_APPLICABLE_CATEGORIES.CONSUMABLES]: 'VAT Receivable 6: Consumables',
  };
  
  return labelMap[vatCategory];
}

/**
 * Gets all VAT receivable codes for a given project and facility type
 * 
 * @param projectType - The project type (HIV, MAL, TB)
 * @param facilityType - The facility type (hospital, health_center)
 * @returns Array of all VAT receivable codes for this project/facility combination
 * 
 * @example
 * ```typescript
 * getAllVATReceivableCodes('HIV', 'hospital')
 * // Returns: [
 * //   "HIV_EXEC_HOSPITAL_D_VAT_COMMUNICATION_ALL",
 * //   "HIV_EXEC_HOSPITAL_D_VAT_MAINTENANCE",
 * //   "HIV_EXEC_HOSPITAL_D_VAT_FUEL",
 * //   "HIV_EXEC_HOSPITAL_D_VAT_SUPPLIES"
 * // ]
 * 
 * getAllVATReceivableCodes('MAL', 'hospital')
 * // Returns: HIV's 4 + CAR_HIRING + CONSUMABLES (6 total)
 * ```
 */
export function getAllVATReceivableCodes(
  projectType: 'HIV' | 'MAL' | 'TB',
  facilityType: 'hospital' | 'health_center'
): string[] {
  return Object.values(VAT_APPLICABLE_CATEGORIES).map(category =>
    getVATReceivableCode(projectType, facilityType, category)
  );
}

/**
 * Checks if a given code is a VAT receivable code
 * 
 * @param code - The activity code to check
 * @returns true if the code represents a VAT receivable
 * 
 * @example
 * ```typescript
 * isVATReceivableCode("HIV_EXEC_HOSPITAL_D_VAT_COMMUNICATION_ALL") // true
 * isVATReceivableCode("MAL_EXEC_HOSPITAL_D_VAT_CAR_HIRING") // true
 * isVATReceivableCode("HIV_EXEC_HOSPITAL_D_1") // false
 * ```
 */
export function isVATReceivableCode(code: string): boolean {
  return code.includes('_D_VAT_') || code.includes('_E_VAT_'); // Support both old and new codes for backward compatibility
}

/**
 * Extracts the VAT category from a VAT receivable code
 * 
 * @param code - The VAT receivable code
 * @returns The VAT category or null if not a valid VAT receivable code
 * 
 * @example
 * ```typescript
 * getVATCategoryFromCode("HIV_EXEC_HOSPITAL_D_VAT_COMMUNICATION_ALL") // "communication_all"
 * getVATCategoryFromCode("MAL_EXEC_HOSPITAL_D_VAT_CAR_HIRING") // "car_hiring"
 * getVATCategoryFromCode("HIV_EXEC_HOSPITAL_D_1") // null
 * ```
 */
export function getVATCategoryFromCode(code: string): VATApplicableCategory | null {
  if (!isVATReceivableCode(code)) {
    return null;
  }
  
  const codeLower = code.toLowerCase();
  
  // New category names
  if (codeLower.includes('_vat_communication_all')) return VAT_APPLICABLE_CATEGORIES.COMMUNICATION_ALL;
  if (codeLower.includes('_vat_maintenance')) return VAT_APPLICABLE_CATEGORIES.MAINTENANCE;
  if (codeLower.includes('_vat_fuel')) return VAT_APPLICABLE_CATEGORIES.FUEL;
  if (codeLower.includes('_vat_supplies')) return VAT_APPLICABLE_CATEGORIES.OFFICE_SUPPLIES;
  if (codeLower.includes('_vat_car_hiring')) return VAT_APPLICABLE_CATEGORIES.CAR_HIRING;
  if (codeLower.includes('_vat_consumables')) return VAT_APPLICABLE_CATEGORIES.CONSUMABLES;
  
  // Legacy category names (for backward compatibility)
  if (codeLower.includes('_vat_airtime')) return VAT_APPLICABLE_CATEGORIES.COMMUNICATION_ALL;
  if (codeLower.includes('_vat_internet')) return VAT_APPLICABLE_CATEGORIES.COMMUNICATION_ALL;
  if (codeLower.includes('_vat_infrastructure')) return VAT_APPLICABLE_CATEGORIES.MAINTENANCE;
  
  return null;
}
