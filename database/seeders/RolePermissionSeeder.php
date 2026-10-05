<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //create roles
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $roleSuperAdmin = Role::updateOrCreate(
            [
                'name' => 'superadmin',
                'guard_name' => 'web',
            ],
            [
                'status' => 'default',
            ],
        );

        //permission roles
        $permissions = [
            [
                'group_name' => 'Dashboards',
                'permissions' => [
                    'default.dashboard',
                    'accounts.dashboard',
                    'sales.dashboard',
                    'crm.dashboard',
                    'hr.dashboard',
                ],
            ],
            [
                'group_name' => 'Roles',
                'permissions' => [
                    'role.list',
                    'role.create',
                    'role.view',
                    'role.edit',
                    'role.delete'
                ],
            ],
            [
                'group_name' => 'Users',
                'permissions' => [
                    'user.list',
                    'user.create',
                    'user.view',
                    'user.edit',
                    'user.delete',
                    'user.status'
                ],
            ],
            [
                'group_name' => 'Salary_and_increment',
                'permissions' => [
                    'salary.overview',
                    'increment.list',
                    'increment.create',
                    'increment.view',
                    'increment.edit',
                    'increment.delete',
                    'increment.status'
                ],
            ],
            [
                'group_name' => 'Default',
                'permissions' => [
                    'user.my_profile',
                    'user.edit_profile',
                    'user.attendace',
                    'user.leave',
                    'user.notice',
                    'user.WFH',
                    'user.loan',
                    'user.salary_report',
                ],
            ],
            [
                'group_name' => 'Attendance',
                'permissions' => [
                    'attendance.list',
                    'attendance.manual',
                    'attendance.report'
                ],
            ],
            [
                'group_name' => 'Leaves',
                'permissions' => [
                    'leave.global',
                    'leave.list',
                    'leave.create',
                    'leave.view',
                    'leave.edit',
                    'leave.delete',
                    'leave.status',
                    'leave.assign'
                ],
            ],
            [
                'group_name' => 'Notice',
                'permissions' => [
                    'notice.list',
                    'notice.create',
                    'notice.edit',
                    'notice.delete'
                ],
            ],
            [
                'group_name' => 'Loan',
                'permissions' => [
                    'loan.list',
                    'loan.view',
                    'loan.edit',
                    'loan.delete',
                    'loan.status'
                ],
            ],
            [
                'group_name' => 'WFH',
                'permissions' => [
                    'WFH.list',
                    'WFH.view',
                    'WFH.edit',
                    'WFH.delete',
                    'WFH.status'
                ],
            ],
            [
                'group_name' => 'Payroll',
                'permissions' => [
                    'salary.advance',
                    'salary.generate',
                    'salary.Payslip'
                ],
            ],
            [
                'group_name' => 'CRM Setup',
                'permissions' => [
                    // CRM Setup permission
                    'crm.sources',
                    'crm.stages',
                    'crm.sectors',
                    'crm.areas',
                    'crm.professions',
                    'crm.designations',
                    'crm.team_management',
                ],
            ],
            [
                'group_name' => 'Leads',
                'permissions' => [
                    'lead.global',
                    'lead.list',
                    'lead.assigned',
                    'lead.create',
                    'lead.view',
                    'lead.edit',
                    'lead.delete',
                    'lead.status',
                    'lead.lost',
                    'lead.follow-up',
                    'lead.untouch',
                    'lead.follow-up-due',
                    'lead.conversation',
                    'lead.bulk-import',
                    'lead.export',
                ],
            ],
            [
                'group_name' => 'Sales',
                'permissions' => [
                    'sales.global',
                    'sales.customer',
                    'sales.invoice',
                    'sales.return',
                    'sales.revenue',
                    'sales.commission',
                    'sales.payment_schedule',
                    'sales.report'
                ],
            ],
            [
                'group_name' => 'Customers',
                'permissions' => [
                    'customer.global',
                    'customer.list',
                    'customer.create',
                    'customer.view',
                    'customer.edit',
                    'customer.delete'
                ],
            ],
            [
                'group_name' => 'Invoices',
                'permissions' => [
                    'invoice.list',
                    'invoice.create',
                    'invoice.view',
                    'invoice.edit',
                    'invoice.delete',
                    'invoice.payment',
                    'invoice.return',
                ],
            ],
            [
                'group_name' => 'Vendors',
                'permissions' => [
                    'vendor.list',
                    'vendor.create',
                    'vendor.view',
                    'vendor.edit',
                    'vendor.delete',
                    'vendor.credit',
                    'vendor.refund'
                ],
            ],
            [
                'group_name' => 'Requisition',
                'permissions' => [
                    'requisition.list',
                    'requisition.create',
                    'requisition.view',
                    'requisition.edit',
                    'requisition.status',
                    'requisition.delete'
                ],
            ],
            [
                'group_name' => 'Purchase Order',
                'permissions' => [
                    'purchase_order.list',
                    'purchase_order.create',
                    'purchase_order.view',
                    'purchase_order.edit',
                    'purchase_order.status',
                    'purchase_order.delete',
                    'purchase_order.report',
                ],
            ],
            [
                'group_name' => 'Purchase Return',
                'permissions' => [
                    'purchase_return.list',
                    'purchase_return.create',
                    'purchase_return.view',
                    'purchase_return.edit',
                    'purchase_return.status',
                    'purchase_return.delete'
                ],
            ],
            [
                'group_name' => 'GRN',
                'permissions' => [
                    'grn.list',
                    'grn.create',
                    'grn.view',
                    'grn.edit',
                    'grn.status',
                    'grn.delete'
                ],
            ],
            [
                'group_name' => 'Bills',
                'permissions' => [
                    // Vendor bills permission
                    'bill.list',
                    'bill.create',
                    'bill.view',
                    'bill.edit',
                    'bill.delete',
                    'bill.status',
                ],
            ],
            [
                'group_name' => 'Bill Payments',
                'permissions' => [
                    'bill_payment.list',
                    'bill_payment.create',
                    'bill_payment.view',
                    'bill_payment.edit',
                    'bill_payment.delete',
                ],
            ],
            [
                'group_name' => 'Accounting',
                'permissions' => [
                    // Accounting permission
                    'accounting.chart_of_account',
                    'accounting.journal',
                    'accounting.ledger',
                    'accounting.financial_statement',
                    'accounting.income_statement',
                    'accounting.trial_balance',
                    'accounting.cash_flow_statement',
                    'accounting.equity_statement'
                ],
            ],
            [
                'group_name' => 'Finance',
                'permissions' => [
                    'finance.payable.list',
                    'finance.payable.view',
                    'finance.payable.pay',
                    'finance.receivable.list',
                    'finance.receivable.view',
                    'finance.receivable.collect',
                    'finance.transaction.list',
                    'finance.profit_loss.view',
                ],
            ],
            [
                'group_name' => 'Products',
                'permissions' => [
                    // Products permission
                    'product.list',
                    'product.create',
                    'product.view',
                    'product.edit',
                    'product.delete',
                    'product.type',
                    'product.project',
                    'product.category',
                    'product.brand',
                ],
            ],
            [
                'group_name' => 'Stocks',
                'permissions' => [
                    'stock.list',
                    'stock.view',
                    'stock.reorder',
                    'stock.transfer',
                    'stock.adjustment',
                    'stock.ledger',
                    'stock.report',
                ],
            ],
            [
                'group_name' => 'Warehouse',
                'permissions' => [
                    'warehouse.list',
                    'warehouse.view',
                    'warehouse.edit',
                    'warehouse.delete',
                    'warehouse.create',
                ],
            ],
            [
                'group_name' => 'Settings',
                'permissions' => [
                    //Settings permission
                    'settings.department',
                    'settings.designation',
                    'settings.commission',
                    'settings.interest',
                    'settings.units',
                    'settings.currency',
                    'settings.taxes',
                    'settings.wifi_ip',
                    'settings.shift',
                    'settings.leave',
                    'settings.holiday',
                    'settings.timezone',
                    'settings.configuration',
                    'settings.ai_config',
                ],
            ],
            [
                'group_name' => 'Machine Categories',
                'permissions' => [
                    'machine_category.list',
                    'machine_category.create',
                    'machine_category.view',
                    'machine_category.edit',
                    'machine_category.delete',
                ],
            ],
            [
                'group_name' => 'Machine Models',
                'permissions' => [
                    'machine_model.list',
                    'machine_model.create',
                    'machine_model.view',
                    'machine_model.edit',
                    'machine_model.delete',
                ],
            ],
            [
                'group_name' => 'Buildings',
                'permissions' => [
                    'building.list',
                    'building.create',
                    'building.view',
                    'building.edit',
                    'building.delete',
                ],
            ],
            [
                'group_name' => 'Floors',
                'permissions' => [
                    'floor.list',
                    'floor.create',
                    'floor.view',
                    'floor.edit',
                    'floor.delete',
                ],
            ],
            [
                'group_name' => 'Machines',
                'permissions' => [
                    'machine.list',
                    'machine.create',
                    'machine.view',
                    'machine.edit',
                    'machine.delete',
                    'machine.movement',
                ],
            ],
            [
                'group_name' => 'Brands',
                'permissions' => [
                    'brand.list',
                    'brand.create',
                    'brand.view',
                    'brand.edit',
                    'brand.delete',
                ],
            ],


        ];

        $permissionNames = [];

        foreach ($permissions as $permissionData) {
            $permissionGroup = $permissionData['group_name'];

            foreach ($permissionData['permissions'] as $permissionName) {
                $permission = Permission::updateOrCreate(
                    [
                        'name' => $permissionName,
                        'guard_name' => 'web',
                    ],
                    [
                        'group_name' => $permissionGroup,
                    ],
                );

                $permissionNames[] = $permission->name;
            }
        }

        $roleSuperAdmin->syncPermissions($permissionNames);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
