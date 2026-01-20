/**
 * VAT-Applicable Expense Identification Utility
 * 
 * This utility identifies which expenses generate VAT receivables.
 * Expense categories that generate VAT receivables because their VAT is recoverable
 * from RRA (Rwanda Revenue Authority) through MICOFEN:
 * 
 * HIV (4 categories):
 * - Communication - All
 * - Maintenance for vehicles, ICT, and medical equipments
 * - Fuel
 * - Office Supplies
 * 
 * Malaria (6 categories - includes HIV's 4 plus):
 * - Car Hiring on entomological surviellance
 * - Consumable (supplies, stationaries, & human landing)
 * 
 * TB (4 categories - same as HIV):
 * - Communication - All
 * - Maintenance
 * - Fuel
 * - Office Supplies
 */

export const VAT_APPLICABLE_CATEGORIES = {
  COMMUNICATION_ALL: 'communication_all',
  MAINTENANCE: 'maintenance',
  FUEL: 'fuel',
  OFFICE_SUPPLIES: 'office_supplies',
  CAR_HIRING: 'car_hiring',           // Malaria only
  CONSUMABLES: 'consumables',         // Malaria only
} as const;

export type VATApplicableCategory = typeof VAT_APPLICABLE_CATEGORIES[keyof typeof VAT_APPLICABLE_CATEGORIES];

/**
 * Determines if an expense code represents a VAT-applicable expense
 * 
 * @param expenseCode - The activity code (e.g., "HIV_EXEC_HOSPITAL_B_B-04_1")
 * @param activityName - The activity name (e.g., "Communication - All")
 * @returns true if the expense generates VAT receivables
 * 
 * @example
 * ```typescript
 * isVATApplicable("HIV_EXEC_HOSPITAL_B_B-04_1", "Communication - All") // true
 * isVATApplicable("MAL_EXEC_HOSPITAL_B_B-04_5", "Car Hiring on entomological surviellance") // true
 * isVATApplicable("MAL_EXEC_HOSPITAL_B_B-04_6", "Consumable (supplies, stationaries, & human landing)") // true
 * isVATApplicable("HIV_EXEC_HOSPITAL_B_B-01_1", "Salaries") // false
 * ```
 */
export function isVATApplicable(expenseCode: string, activityName: string): boolean {
  const nameLower = activityName.toLowerCase().trim();
  
  // Check for the VAT-applicable expense types
  const isCommunicationAll = nameLower.includes('communication') && nameLower.includes('all');
  const isMaintenance = nameLower.includes('maintenance');
  const isFuel = nameLower === 'fuel' || (nameLower.includes('fuel') && !nameLower.includes('refund'));
  const isOfficeSupplies = nameLower.includes('office supplies') || nameLower.includes('office supply');
  const isCarHiring = nameLower.includes('car') && nameLower.includes('hiring');
  const isConsumable = nameLower.includes('consumable');
  
  return isCommunicationAll || isMaintenance || isFuel || isOfficeSupplies || isCarHiring || isConsumable;
}

/**
 * Gets the VAT category for a VAT-applicable expense
 * 
 * @param activityName - The activity name
 * @returns The VAT category identifier or null if not VAT-applicable
 * 
 * @example
 * ```typescript
 * getVATCategory("Communication - All") // "communication_all"
 * getVATCategory("Maintenance for vehicles, ICT, and medical equipments") // "maintenance"
 * getVATCategory("Fuel") // "fuel"
 * getVATCategory("Office supplies") // "office_supplies"
 * getVATCategory("Car Hiring on entomological surviellance") // "car_hiring"
 * getVATCategory("Consumable (supplies, stationaries, & human landing)") // "consumables"
 * getVATCategory("Salaries") // null
 * ```
 */
export function getVATCategory(activityName: string): VATApplicableCategory | null {
  const nameLower = activityName.toLowerCase().trim();
  
  // Order matters - check more specific patterns first
  if (nameLower.includes('communication') && nameLower.includes('all')) return VAT_APPLICABLE_CATEGORIES.COMMUNICATION_ALL;
  if (nameLower.includes('maintenance')) return VAT_APPLICABLE_CATEGORIES.MAINTENANCE;
  if (nameLower === 'fuel' || (nameLower.includes('fuel') && !nameLower.includes('refund'))) return VAT_APPLICABLE_CATEGORIES.FUEL;
  if (nameLower.includes('consumable')) return VAT_APPLICABLE_CATEGORIES.CONSUMABLES;
  if (nameLower.includes('office supplies') || nameLower.includes('office supply')) return VAT_APPLICABLE_CATEGORIES.OFFICE_SUPPLIES;
  if (nameLower.includes('car') && nameLower.includes('hiring')) return VAT_APPLICABLE_CATEGORIES.CAR_HIRING;
  
  return null;
}
