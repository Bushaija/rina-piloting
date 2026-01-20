/**
 * Update Payable Mappings Script
 * 
 * This script updates the payable_activity_id field in dynamic_activities
 * to establish database-driven expense-to-payable mappings.
 * 
 * It reads the payableName from expense metadata and links to the corresponding payable.
 * 
 * Run this after seeding activities to establish the mappings.
 */

import type { Database } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function updatePayableMappings(db: Database) {
  console.log('\n🔗 Updating expense-to-payable mappings from metadata...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  
  const projectTypes = ['HIV', 'Malaria', 'TB'] as const;
  const facilityTypes = ['hospital', 'health_center'] as const;
  
  for (const projectType of projectTypes) {
    for (const facilityType of facilityTypes) {
      console.log(`\n📋 Processing ${projectType} - ${facilityType}...`);
      
      // Get all expense activities with payableName in metadata
      const expenseActivities = await db
        .select()
        .from(schema.dynamicActivities)
        .where(
          and(
            eq(schema.dynamicActivities.projectType, projectType as any),
            eq(schema.dynamicActivities.facilityType, facilityType),
            eq(schema.dynamicActivities.moduleType, 'execution'),
            eq(schema.dynamicActivities.activityType, 'EXPENSE'),
            eq(schema.dynamicActivities.isTotalRow, false)
          )
        );
      
      console.log(`   Found ${expenseActivities.length} expense activities`);
      
      // Get all payable activities for this project/facility
      const payableActivities = await db
        .select()
        .from(schema.dynamicActivities)
        .where(
          and(
            eq(schema.dynamicActivities.projectType, projectType as any),
            eq(schema.dynamicActivities.facilityType, facilityType),
            eq(schema.dynamicActivities.moduleType, 'execution'),
            eq(schema.dynamicActivities.activityType, 'LIABILITY'),
            eq(schema.dynamicActivities.isTotalRow, false)
          )
        );
      
      console.log(`   Found ${payableActivities.length} payable activities`);
      
      // Process each expense
      for (const expense of expenseActivities) {
        const metadata = expense.metadata as any;
        const payableName = metadata?.payableName;
        
        if (!payableName) {
          // Skip expenses without payable mapping (e.g., Bank charges, Transfer to RBC)
          continue;
        }
        
        // Find matching payable by name
        const matchingPayable = payableActivities.find(p => p.name === payableName);
        
        if (!matchingPayable) {
          errors.push(
            `⚠️  No matching payable found for expense: ${expense.name} → ${payableName} ` +
            `(${projectType}, ${facilityType})`
          );
          errorCount++;
          continue;
        }
        
        // Update the expense with the payable reference in metadata
        const currentMetadata = (expense.metadata as any) || {};
        await db
          .update(schema.dynamicActivities)
          .set({ 
            metadata: {
              ...currentMetadata,
              payableActivityId: matchingPayable.id,
              payableActivityCode: matchingPayable.code,
              payableActivityName: matchingPayable.name
            },
            updatedAt: new Date()
          })
          .where(eq(schema.dynamicActivities.id, expense.id));
        
        console.log(
          `   ✅ ${expense.name} → ${matchingPayable.name}`
        );
        successCount++;
      }
    }
  }
  
  console.log('\n📊 Mapping Summary:');
  console.log(`   ✅ Successful mappings: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    errors.forEach(error => console.log(`   ${error}`));
  }
  
  // Verification: Check for expenses without payable mappings
  console.log('\n🔍 Verification: Checking for unmapped expenses...');
  
  const unmappedExpenses = await db.execute(sql`
    SELECT 
      project_type,
      facility_type,
      name,
      metadata->>'payableName' as expected_payable
    FROM dynamic_activities
    WHERE module_type = 'execution'
      AND activity_type = 'EXPENSE'
      AND is_total_row = false
      AND metadata->>'payableActivityId' IS NULL
      AND metadata->>'payableName' IS NOT NULL
    ORDER BY project_type, facility_type, name
  `);
  
  if ((unmappedExpenses as any[]).length > 0) {
    console.log(`\n⚠️  Found ${(unmappedExpenses as any[]).length} unmapped expenses:`);
    (unmappedExpenses as any[]).forEach((row: any) => {
      console.log(`   - ${row.project_type} ${row.facility_type}: ${row.name} → ${row.expected_payable}`);
    });
  } else {
    console.log('   ✅ All expenses with payableName are properly mapped!');
  }
  
  console.log('\n✨ Payable mapping update complete!\n');
}

// Export for use in main seed script
export default updatePayableMappings;