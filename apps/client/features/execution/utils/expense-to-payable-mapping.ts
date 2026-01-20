/**
 * Expense-to-Payable Mapping Utility
 * 
 * This utility generates mappings between Section B expense activities and Section E payable activities
 * based on the seeded activities data structure. Each expense item maps to a specific payable category.
 * 
 * HIV Mapping Rules:
 * - B-01 (Human Resources) → E_1 (Payable 1: Salaries)
 * - B-02 (M&E):
 *   - Support group meetings → E_2 (Payable 2: Support group meetings)
 *   - Census training → E_3 (Payable 3: Conduct census training)
 *   - Clinical mentorship → E_4 (Payable 4: Clinical mentorship)
 *   - Annual coordination meeting → E_5 (Payable 5: Annual coordination meeting)
 *   - MDT meetings → E_6 (Payable 6: MDT meeting)
 *   - Supervision and DQA → E_7 (Payable 7: Supervision DQA)
 * - B-03 (Living Support):
 *   - Sample transportation → E_8 (Payable 8: Sample transportation)
 *   - Home visits → E_9 (Payable 9: Home visit)
 *   - Outreach HIV testing → E_10 (Payable 10: Outreach for HIV testing)
 *   - WAD celebration → E_11 (Payable 11: WAD celebration)
 * - B-04 (Overheads - VAT-based):
 *   - Communication - All → E_12 (Payable 12: Communication - All)
 *   - Maintenance → E_13 (Payable 13: Maintenance)
 *   - Fuel → E_14 (Payable 14: Fuel)
 *   - Office supplies → E_15 (Payable 15: Office supplies)
 * - B-05 (Transfers) → null (always paid, no payable)
 */

export interface ExpenseToPayableMapping {
  [expenseCode: string]: string | null;
}

export interface PayableInfo {
  code: string;
  name: string;
  categoryCode: string;
}

export interface ExpenseInfo {
  code: string;
  name: string;
  subCategoryCode: string;
  payableCode: string | null;
}

/**
 * Generate expense-to-payable mapping from activities data
 * 
 * ENHANCED: Now uses database-driven approach via metadata.payableActivityId
 * Falls back to pattern matching for backward compatibility
 * 
 * @param activities - Hierarchical activities data from useExecutionActivities
 * @returns Mapping object where keys are expense codes and values are payable codes
 */
export function generateExpenseToPayableMapping(
  activities: any
): ExpenseToPayableMapping {
  const mapping: ExpenseToPayableMapping = {};

  if (!activities) {
    return mapping;
  }

  // Get Section B (Expenditures) activities
  const sectionB = activities.B;
  if (!sectionB?.subCategories) {
    return mapping;
  }

  // Get Section E (Financial Liabilities) activities
  const sectionE = activities.E;
  if (!sectionE?.items) {
    return mapping;
  }

  // Extract payable items (excluding total row)
  const payableItems = sectionE.items.filter(
    (item: any) => !item.isTotalRow && !item.isComputed
  );

  // Create lookups for payables
  const payablesByName: Record<string, string> = {};
  const payablesById: Record<number, string> = {};
  
  payableItems.forEach((item: any) => {
    const nameLower = item.name.toLowerCase();
    payablesByName[nameLower] = item.code;
    if (item.id) {
      payablesById[item.id] = item.code;
    }
  });

  // Map each expense to its corresponding payable
  Object.entries(sectionB.subCategories).forEach(([subCatCode, subCatData]: [string, any]) => {
    const items = subCatData.items || [];

    items.forEach((item: any) => {
      if (item.isTotalRow || item.isComputed) {
        return;
      }

      const expenseCode = item.code;
      let payableCode: string | null = null;

      // PRIORITY 1: Use database-driven mapping from metadata.payableActivityId
      if (item.metadata?.payableActivityId) {
        payableCode = payablesById[item.metadata.payableActivityId] || null;
        
        if (payableCode) {
          console.log(`✅ [DB-Driven] ${item.name} → ${payableCode}`);
          mapping[expenseCode] = payableCode;
          return;
        }
      }

      // PRIORITY 2: Use metadata.payableName to find payable by name
      if (item.metadata?.payableName) {
        const payableNameLower = item.metadata.payableName.toLowerCase();
        payableCode = payablesByName[payableNameLower] || null;
        
        if (payableCode) {
          console.log(`✅ [Name-Based] ${item.name} → ${payableCode}`);
          mapping[expenseCode] = payableCode;
          return;
        }
        
        // Try partial match
        for (const [name, code] of Object.entries(payablesByName)) {
          if (name.includes(payableNameLower) || payableNameLower.includes(name)) {
            payableCode = code;
            console.log(`✅ [Partial Match] ${item.name} → ${payableCode}`);
            mapping[expenseCode] = payableCode;
            return;
          }
        }
      }

      // PRIORITY 3: Fall back to pattern matching (legacy approach)
      const expenseNameLower = item.name.toLowerCase();

      switch (subCatCode) {
        case 'B-01': // Human Resources + Bonus
          payableCode = findPayableByPattern(payablesByName, ['salaries']);
          break;

        case 'B-02': // Monitoring & Evaluation
          if (expenseNameLower.includes('support group')) {
            payableCode = findPayableByPattern(payablesByName, ['support group']);
          } else if (expenseNameLower.includes('census') || expenseNameLower.includes('training')) {
            payableCode = findPayableByPattern(payablesByName, ['census', 'training']);
          } else if (expenseNameLower.includes('mentorship')) {
            payableCode = findPayableByPattern(payablesByName, ['mentorship']);
          } else if (expenseNameLower.includes('annual') && expenseNameLower.includes('meeting')) {
            payableCode = findPayableByPattern(payablesByName, ['annual', 'cordination', 'coordination']);
          } else if (expenseNameLower.includes('mdt') || expenseNameLower.includes('quarterly')) {
            payableCode = findPayableByPattern(payablesByName, ['mdt']);
          } else if (expenseNameLower.includes('supervision') && expenseNameLower.includes('dqa')) {
            payableCode = findPayableByPattern(payablesByName, ['supervision dqa', 'dqa']);
          } else if (expenseNameLower.includes('supervision')) {
            payableCode = findPayableByPattern(payablesByName, ['supervision']);
          } else if (expenseNameLower.includes('cordination') || expenseNameLower.includes('coordination')) {
            payableCode = findPayableByPattern(payablesByName, ['cordination', 'coordination', 'meeting']);
          } else if (expenseNameLower.includes('mission')) {
            payableCode = findPayableByPattern(payablesByName, ['mission']);
          } else if (expenseNameLower.includes('transport') || expenseNameLower.includes('travel')) {
            payableCode = findPayableByPattern(payablesByName, ['transport', 'travel']);
          }
          break;

        case 'B-03': // Living Support to Clients
          if (expenseNameLower.includes('sample') && expenseNameLower.includes('transport')) {
            payableCode = findPayableByPattern(payablesByName, ['sample']);
          } else if (expenseNameLower.includes('home') && expenseNameLower.includes('visit')) {
            payableCode = findPayableByPattern(payablesByName, ['home', 'visit']);
          } else if (expenseNameLower.includes('outreach')) {
            payableCode = findPayableByPattern(payablesByName, ['outreach']);
          } else if (expenseNameLower.includes('wad') || expenseNameLower.includes('celebration')) {
            payableCode = findPayableByPattern(payablesByName, ['wad', 'celebration']);
          }
          break;

        case 'B-04': // Overheads
          if (expenseNameLower.includes('communication')) {
            payableCode = findPayableByPattern(payablesByName, ['communication']);
          } else if (expenseNameLower.includes('maintenance')) {
            payableCode = findPayableByPattern(payablesByName, ['maintenance']);
          } else if (expenseNameLower.includes('fuel')) {
            payableCode = findPayableByPattern(payablesByName, ['fuel']);
          } else if (expenseNameLower.includes('consumable')) {
            // Check for consumable BEFORE supplies (consumable name contains "supplies")
            payableCode = findPayableByPattern(payablesByName, ['consumable']);
          } else if (expenseNameLower.includes('supplies')) {
            // Check for supplies AFTER consumable to avoid false matches
            payableCode = findPayableByPattern(payablesByName, ['supplies']);
          } else if (expenseNameLower.includes('car') && expenseNameLower.includes('hiring')) {
            payableCode = findPayableByPattern(payablesByName, ['car', 'hiring']);
          } else if (expenseNameLower.includes('transport') || expenseNameLower.includes('travel')) {
            payableCode = findPayableByPattern(payablesByName, ['transport', 'travel']);
          } else if (expenseNameLower.includes('bank')) {
            // Bank charges - no payable (paid immediately)
            payableCode = null;
          }
          break;

        case 'B-05': // Transfer to other entities
          // Transfers are always paid immediately, no payable
          payableCode = null;
          break;

        default:
          payableCode = null;
      }

      if (!payableCode && subCatCode !== 'B-05' && !expenseNameLower.includes('bank')) {
        console.warn(`⚠️ [Pattern Match Failed] No payable found for: ${item.name} (${subCatCode})`);
      }

      mapping[expenseCode] = payableCode;
    });
  });

  return mapping;
}

/**
 * Find a payable code by matching name patterns
 * Searches for patterns within payable names (partial match)
 */
function findPayableByPattern(
  payablesByName: Record<string, string>,
  patterns: string[]
): string | null {
  for (const pattern of patterns) {
    // First try exact match
    if (payablesByName[pattern]) {
      return payablesByName[pattern];
    }

    // Then try partial match (pattern contained in payable name)
    for (const [payableName, code] of Object.entries(payablesByName)) {
      if (payableName.includes(pattern)) {
        return code;
      }
    }
  }

  console.log(`⚠️ [findPayableByPattern] No match found for patterns:`, patterns);
  return null;
}

/**
 * Get the payable code for a given expense code
 * 
 * @param expenseCode - The expense activity code (e.g., "HIV_EXEC_HOSPITAL_B_B-01_1")
 * @param mapping - The expense-to-payable mapping
 * @returns The corresponding payable code or null if no mapping exists
 */
export function getPayableCodeForExpense(
  expenseCode: string,
  mapping: ExpenseToPayableMapping
): string | null {
  return mapping[expenseCode] ?? null;
}

/**
 * Get all expense codes that map to a specific payable code
 * 
 * @param payableCode - The payable activity code
 * @param mapping - The expense-to-payable mapping
 * @returns Array of expense codes that map to this payable
 */
export function getExpensesForPayable(
  payableCode: string,
  mapping: ExpenseToPayableMapping
): string[] {
  return Object.entries(mapping)
    .filter(([_, payable]) => payable === payableCode)
    .map(([expense, _]) => expense);
}

/**
 * Validate that all expenses have valid payable mappings (except B-05)
 * 
 * @param mapping - The expense-to-payable mapping
 * @param activities - The activities data
 * @returns Object with validation results
 */
export function validateMapping(
  mapping: ExpenseToPayableMapping,
  activities: any
): {
  isValid: boolean;
  unmappedExpenses: string[];
  warnings: string[];
} {
  const unmappedExpenses: string[] = [];
  const warnings: string[] = [];

  if (!activities?.B?.subCategories) {
    return {
      isValid: false,
      unmappedExpenses: [],
      warnings: ['Section B data not available'],
    };
  }

  Object.entries(activities.B.subCategories).forEach(([subCatCode, subCatData]: [string, any]) => {
    const items = subCatData.items || [];

    items.forEach((item: any) => {
      if (item.isTotalRow || item.isComputed) {
        return;
      }

      const expenseCode = item.code;
      const payableCode = mapping[expenseCode];

      // B-05 (Transfers) should have null mapping
      if (subCatCode === 'B-05') {
        if (payableCode !== null) {
          warnings.push(`${expenseCode} (Transfer) should not have a payable mapping`);
        }
      } else {
        // All other expenses should have a payable mapping
        if (!payableCode) {
          unmappedExpenses.push(expenseCode);
        }
      }
    });
  });

  return {
    isValid: unmappedExpenses.length === 0,
    unmappedExpenses,
    warnings,
  };
}

/**
 * Get a human-readable description of the mapping
 * 
 * @param mapping - The expense-to-payable mapping
 * @param activities - The activities data
 * @returns Array of mapping descriptions
 */
export function getMappingDescription(
  mapping: ExpenseToPayableMapping,
  activities: any
): Array<{
  expenseCode: string;
  expenseName: string;
  payableCode: string | null;
  payableName: string | null;
}> {
  const descriptions: Array<{
    expenseCode: string;
    expenseName: string;
    payableCode: string | null;
    payableName: string | null;
  }> = [];

  if (!activities?.B?.subCategories || !activities?.E?.items) {
    return descriptions;
  }

  // Create payable lookup
  const payableLookup: Record<string, string> = {};
  activities.E.items.forEach((item: any) => {
    payableLookup[item.code] = item.name;
  });

  // Build descriptions
  Object.entries(activities.B.subCategories).forEach(([subCatCode, subCatData]: [string, any]) => {
    const items = subCatData.items || [];

    items.forEach((item: any) => {
      if (item.isTotalRow || item.isComputed) {
        return;
      }

      const expenseCode = item.code;
      const payableCode = mapping[expenseCode];

      descriptions.push({
        expenseCode,
        expenseName: item.name,
        payableCode,
        payableName: payableCode ? payableLookup[payableCode] || 'Unknown' : null,
      });
    });
  });

  return descriptions;
}
