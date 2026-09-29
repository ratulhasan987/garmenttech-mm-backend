<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChartOfAccount;

class ChartOfAccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            // ===== Assets =====
            ['code' => '1000', 'name' => 'Assets', 'type' => 'Asset', 'parent' => null, 'is_posting' => false],
            ['code' => '1100', 'name' => 'Current Assets', 'type' => 'Asset', 'parent' => '1000', 'is_posting' => false],
            ['code' => '1110', 'name' => 'Cash and Cash Equivalents', 'type' => 'Asset', 'parent' => '1100', 'is_posting' => false],
            ['code' => '1111', 'name' => 'Cash on Hand', 'type' => 'Asset', 'parent' => '1110', 'is_posting' => true],
            ['code' => '1112', 'name' => 'Cash at Bank - Main Account', 'type' => 'Asset', 'parent' => '1110', 'is_posting' => true],
            ['code' => '1113', 'name' => 'Petty Cash', 'type' => 'Asset', 'parent' => '1110', 'is_posting' => true],
            ['code' => '1120', 'name' => 'Accounts Receivable', 'type' => 'Asset', 'parent' => '1100', 'is_posting' => false],
            ['code' => '1121', 'name' => 'Trade Debtors', 'type' => 'Asset', 'parent' => '1120', 'is_posting' => true],
            ['code' => '1122', 'name' => 'Employee Receivables', 'type' => 'Asset', 'parent' => '1120', 'is_posting' => true],
            ['code' => '1130', 'name' => 'Inventory', 'type' => 'Asset', 'parent' => '1100', 'is_posting' => true],
            ['code' => '1140', 'name' => 'Prepaid Expenses', 'type' => 'Asset', 'parent' => '1100', 'is_posting' => true],
            ['code' => '1200', 'name' => 'Non-current Assets', 'type' => 'Asset', 'parent' => '1000', 'is_posting' => false],
            ['code' => '1210', 'name' => 'Property, Plant and Equipment', 'type' => 'Asset', 'parent' => '1200', 'is_posting' => false],
            ['code' => '1211', 'name' => 'Land and Buildings', 'type' => 'Asset', 'parent' => '1210', 'is_posting' => true],
            ['code' => '1212', 'name' => 'Office Equipment', 'type' => 'Asset', 'parent' => '1210', 'is_posting' => true],
            ['code' => '1213', 'name' => 'Vehicles', 'type' => 'Asset', 'parent' => '1210', 'is_posting' => true],
            ['code' => '1220', 'name' => 'Intangible Assets', 'type' => 'Asset', 'parent' => '1200', 'is_posting' => true],
            ['code' => '1230', 'name' => 'Right-of-Use Assets', 'type' => 'Asset', 'parent' => '1200', 'is_posting' => true],

            // ===== Liabilities =====
            ['code' => '2000', 'name' => 'Liabilities', 'type' => 'Liability', 'parent' => null, 'is_posting' => false],
            ['code' => '2100', 'name' => 'Current Liabilities', 'type' => 'Liability', 'parent' => '2000', 'is_posting' => false],
            ['code' => '2110', 'name' => 'Accounts Payable', 'type' => 'Liability', 'parent' => '2100', 'is_posting' => true],
            ['code' => '2120', 'name' => 'Short-term Borrowings', 'type' => 'Liability', 'parent' => '2100', 'is_posting' => true],
            ['code' => '2130', 'name' => 'Accrued Expenses', 'type' => 'Liability', 'parent' => '2100', 'is_posting' => true],
            ['code' => '2200', 'name' => 'Non-current Liabilities', 'type' => 'Liability', 'parent' => '2000', 'is_posting' => false],
            ['code' => '2210', 'name' => 'Long-term Loans', 'type' => 'Liability', 'parent' => '2200', 'is_posting' => true],
            ['code' => '2220', 'name' => 'Lease Liabilities', 'type' => 'Liability', 'parent' => '2200', 'is_posting' => true],
            ['code' => '2230', 'name' => 'Deferred Tax Liabilities', 'type' => 'Liability', 'parent' => '2200', 'is_posting' => true],

            // ===== Equity =====
            ['code' => '3000', 'name' => 'Equity', 'type' => 'Equity', 'parent' => null, 'is_posting' => false],
            ['code' => '3100', 'name' => 'Share Capital', 'type' => 'Equity', 'parent' => '3000', 'is_posting' => true],
            ['code' => '3110', 'name' => 'Share Premium', 'type' => 'Equity', 'parent' => '3000', 'is_posting' => true],
            ['code' => '3120', 'name' => 'Retained Earnings', 'type' => 'Equity', 'parent' => '3000', 'is_posting' => true],
            ['code' => '3130', 'name' => 'Other Reserves', 'type' => 'Equity', 'parent' => '3000', 'is_posting' => true],

            // ===== Revenue =====
            ['code' => '4000', 'name' => 'Revenue', 'type' => 'Revenue', 'parent' => null, 'is_posting' => false],
            ['code' => '4100', 'name' => 'Sales Revenue', 'type' => 'Revenue', 'parent' => '4000', 'is_posting' => false],
            ['code' => '4110', 'name' => 'Product Sales', 'type' => 'Revenue', 'parent' => '4100', 'is_posting' => true],
            ['code' => '4120', 'name' => 'Service Revenue', 'type' => 'Revenue', 'parent' => '4100', 'is_posting' => true],
            ['code' => '4200', 'name' => 'Other Income', 'type' => 'Revenue', 'parent' => '4000', 'is_posting' => false],
            ['code' => '4210', 'name' => 'Interest Income', 'type' => 'Revenue', 'parent' => '4200', 'is_posting' => true],
            ['code' => '4220', 'name' => 'Gain on Disposal of Assets', 'type' => 'Revenue', 'parent' => '4200', 'is_posting' => true],

            // ===== Expenses =====
            ['code' => '5000', 'name' => 'Expenses', 'type' => 'Expense', 'parent' => null, 'is_posting' => false],
            ['code' => '5100', 'name' => 'Cost of Goods Sold', 'type' => 'Expense', 'parent' => '5000', 'is_posting' => true],
            ['code' => '5200', 'name' => 'Operating Expenses', 'type' => 'Expense', 'parent' => '5000', 'is_posting' => false],
            ['code' => '5210', 'name' => 'Administrative Expenses', 'type' => 'Expense', 'parent' => '5200', 'is_posting' => false],
            ['code' => '5211', 'name' => 'Salaries and Wages', 'type' => 'Expense', 'parent' => '5210', 'is_posting' => true],
            ['code' => '5212', 'name' => 'Office Rent', 'type' => 'Expense', 'parent' => '5210', 'is_posting' => true],
            ['code' => '5213', 'name' => 'Utilities', 'type' => 'Expense', 'parent' => '5210', 'is_posting' => true],
            ['code' => '5214', 'name' => 'Office Supplies', 'type' => 'Expense', 'parent' => '5210', 'is_posting' => true],
            ['code' => '5300', 'name' => 'Selling and Marketing', 'type' => 'Expense', 'parent' => '5200', 'is_posting' => false],
            ['code' => '5310', 'name' => 'Advertising and Promotion', 'type' => 'Expense', 'parent' => '5300', 'is_posting' => true],
            ['code' => '5320', 'name' => 'Travel and Entertainment', 'type' => 'Expense', 'parent' => '5300', 'is_posting' => true],
            ['code' => '5400', 'name' => 'Finance Costs', 'type' => 'Expense', 'parent' => '5000', 'is_posting' => true],
            ['code' => '5500', 'name' => 'Depreciation and Amortization', 'type' => 'Expense', 'parent' => '5000', 'is_posting' => true],
            ['code' => '5600', 'name' => 'Tax Expense', 'type' => 'Expense', 'parent' => '5000', 'is_posting' => true],
        ];

        // Step 1: Create all accounts
        $created = [];
        foreach ($accounts as $data) {
            $parentId = null;
            if (!empty($data['parent']) && isset($created[$data['parent']])) {
                $parentId = $created[$data['parent']];
            }

            $account = ChartOfAccount::create([
                'account_code' => $data['code'],
                'account_name' => $data['name'],
                'account_type' => $data['type'],
                'parent_id' => $parentId,
                'level' => $parentId ? (ChartOfAccount::find($parentId)->level + 1) : 1,
                'description' => $data['name'],
                'is_posting' => $data['is_posting'],
                'status' => true,
            ]);

            $created[$data['code']] = $account->id;
        }
    }
}
