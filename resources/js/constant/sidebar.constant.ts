import type { SidebarItem, SidebarSection } from '../types/sidebar';
import { PERMISSIONS } from './permission.constant';

export const SIDEBAR_SECTIONS: SidebarSection[] = [
    {
        id: 'general_section',
        title: 'General',
        items: [
            {
                id: 'dashboard',
                title: 'Dashboard',
                icon: {
                    id: 'stroke-home',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'accounts_dashboard',
                        title: 'Accounts',
                        path: '/dashboard/accounts',
                        permission: PERMISSIONS.DASHBOARDS.ACCOUNTS,
                    },

                    {
                        id: 'hr_dashboard',
                        title: 'HR & Payroll',
                        path: '/dashboard/hr',
                        permission: PERMISSIONS.DASHBOARDS.HR,
                    },

                    {
                        id: 'crm_dashboard',
                        title: 'CRM',
                        path: '/dashboard/crm',
                        permission: PERMISSIONS.DASHBOARDS.CRM,
                    },

                    {
                        id: 'default_dashboard',
                        title: 'Dashboard',
                        path: '/dashboard',
                        permission: PERMISSIONS.DASHBOARDS.DEFAULT,
                    },
                ],
            },
        ],
    },
    {
        id: 'crm',
        title: 'CRM',

        items: [
            {
                id: 'leads_management',
                title: 'Leads',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },

                subItems: [
                    {
                        id: 'all_leads',
                        title: 'All Leads',
                        path: '/lead',
                        permission: PERMISSIONS.LEAD.LIST,
                    },
                    {
                        id: 'new_leads',
                        title: 'New Lead',
                        path: '/lead/create',
                        permission: PERMISSIONS.LEAD.CREATE,
                    },
                    {
                        id: 'lead_assigned',
                        title: 'Lead Assigned',
                        path: '/lead/assigned',
                        permission: PERMISSIONS.LEAD.ASSIGNED,
                    },
                    {
                        id: 'lead_follow_ups',
                        title: 'Lead Follow-Ups',
                        path: '/lead/lead-follow-up',
                        permission: PERMISSIONS.LEAD.FOLLOW_UP,
                    },
                    {
                        id: 'untouch_lead',
                        title: 'Un Touch Lead',
                        path: '/lead/untouch',
                        permission: PERMISSIONS.LEAD.UNTOUCH,
                    },
                    {
                        id: 'follow_up_due',
                        title: 'Follow-Ups Due',
                        path: '/lead/follow-up-due',
                        permission: PERMISSIONS.LEAD.FOLLOW_UP_DUE,
                    },
                    {
                        id: 'lead_bulk_import',
                        title: 'Bulk Import',
                        path: '/lead.bulk-import',
                        permission: PERMISSIONS.LEAD.BULK_IMPORT,
                    },
                ],
            },
            {
                id: 'customer_management',
                title: 'Customers',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },

                subItems: [
                    {
                        id: 'sales_customers',
                        title: 'All Customers',
                        path: '/operations/sales/customers',
                        permission: PERMISSIONS.CUSTOMER.LIST,
                    },
                    {
                        id: 'create_customer',
                        title: 'New Customer',
                        path: '/operations/sales/customers/create',
                        permission: PERMISSIONS.CUSTOMER.CREATE,
                    },
                ],
            },
            {
                id: 'crm_setup',
                title: 'CRM Setup',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'lead_sources',
                        title: 'Lead Sources',
                        path: '/lead-source',
                        permission: PERMISSIONS.CRM_SETUP.SOURCES,
                    },
                    {
                        id: 'lead_stages',
                        title: 'Lead Stages',
                        path: '/lead-stage',
                        permission: PERMISSIONS.CRM_SETUP.STAGES,
                    },
                    {
                        id: 'lead_sector',
                        title: 'Lead Sector',
                        path: '/sector',
                        permission: PERMISSIONS.CRM_SETUP.SECTORS,
                    },
                    {
                        id: 'lead_area',
                        title: 'Lead Area',
                        path: '/area',
                        permission: PERMISSIONS.CRM_SETUP.AREAS,
                    },
                    {
                        id: 'lead_designation',
                        title: 'Lead Designation',
                        path: '/lead-designation',
                        permission: PERMISSIONS.CRM_SETUP.DESIGNATIONS,
                    },
                    {
                        id: 'lead_Professions',
                        title: 'Lead Professions',
                        path: '/profession',
                        permission: PERMISSIONS.CRM_SETUP.PROFESSIONS,
                    },
                    {
                        id: 'sales_team',
                        title: 'Sales Teams',
                        path: '/sales-teams',
                        permission: PERMISSIONS.CRM_SETUP.TEAM_MANAGEMENT,
                    },
                ],
            },
        ],
    },

    // Machine start 


    {
        id: 'machine',
        title: 'Machine',

        items: [

            {
                id: 'machine',
                title: 'Machine',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                path: '/machine',

            },
             {
            id: 'machine_location',
            title: 'Machine Location',
            icon: { id: 'stroke-project', type: 'fill' }, // Change icon as needed
            path: '/machine-location',
        },

            {
                id: 'machine_setup',
                title: 'Machine Setup',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'building_setup',
                        title: 'Building',
                        path: '/building',
                    },
                    {
                        id: 'floor_setup',
                        title: 'Floor',
                        path: '/floor',
                    },
                    {
                        id: 'machine_category_setup',
                        title: 'Machine Category',
                        path: '/machine-category',
                    },
                    {
                        id: 'machine_model_setup',
                        title: 'Machine Model',
                        path: '/machine-model',
                    },
                    {
                        id: 'brand_setup',
                        title: 'Brand',
                        path: '/brand',
                    },

                ],
            },
        ],
    },



    // Machine end



    {
        id: 'sales_section',
        title: 'Sales',

        items: [
            // Sales
            {
                id: 'sales_management',
                title: 'Sales',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },

                subItems: [
                    {
                        id: 'sales_invoices',
                        title: 'Sales Invoice',
                        path: '/operations/sales/invoices',
                        permission: PERMISSIONS.SALES.GLOBAL,
                    },
                    {
                        id: 'sales_returns',
                        title: 'Sales Return',
                        path: '/operations/sales/returns',
                        permission: PERMISSIONS.SALES.RETURN,
                    },
                ],
            },
            {
                id: 'sales_customer_report',
                title: 'Sales Reports',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                path: '/operations/sales/report',
                permission: PERMISSIONS.SALES.REPORT,
            },
        ],
    },

    {
        id: 'inventory_warehouse',
        title: 'Inventory',

        items: [
            // Products
            {
                id: 'products_management',
                title: 'Products',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },

                subItems: [
                    {
                        id: 'products',
                        title: 'Products',
                        path: '/operations/products',
                        permission: PERMISSIONS.PRODUCT.LIST,
                    },
                    {
                        id: 'product_categories',
                        title: 'Categories',
                        path: '/operations/product-categories',
                        permission: PERMISSIONS.PRODUCT.CATEGORY,
                    },
                    {
                        id: 'product_brands',
                        title: 'Brands',
                        path: '/operations/product-brands',
                        permission: PERMISSIONS.PRODUCT.BRAND,
                    },
                ],
            },

            // stocks
            {
                id: 'stocks_management',
                title: 'Stocks',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },

                subItems: [
                    {
                        id: 'stock_receive',
                        title: 'Products Stock',
                        path: '/inventory/stocks',
                        permission: PERMISSIONS.STOCK.LIST,
                    },
                    {
                        id: 'stock_issue',
                        title: 'Reorder Alert',
                        path: '/inventory/reorder-alerts',
                        permission: PERMISSIONS.STOCK.REORDER,
                    },
                    {
                        id: 'stock_transfer',
                        title: 'Stock Transfer',
                        path: '/inventory/stock-transfers',
                        permission: PERMISSIONS.STOCK.TRANSFER,
                    },
                    {
                        id: 'stock_adjustment',
                        title: 'Stock Adjustment',
                        path: '/inventory/stock-adjustments',
                        permission: PERMISSIONS.STOCK.ADJUSTMENT,
                    },
                    {
                        id: 'stock_ledger',
                        title: 'Stock Ledger',
                        path: '/inventory/stock-ledger',
                        permission: PERMISSIONS.STOCK.LEDGER,
                    },
                ],
            },

            // warehouse
            {
                id: 'warehouse_management',
                title: 'Warehouse',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },

                subItems: [
                    {
                        id: 'warehouses',
                        title: 'Warehouses',
                        path: '/operations/warehouses',
                        permission: PERMISSIONS.WAREHOUSE.LIST,
                    },
                ],
            },

            {
                id: 'stocks_report',
                title: 'Stock Reports',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                path: '/inventory/stocks/report',
                permission: PERMISSIONS.STOCK.REPORT,
            },
        ],
    },
    {
        id: 'purchase_module',
        title: 'Purchase',

        items: [
            // Requisition
            {
                id: 'requisition_management',
                title: 'Requisition',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                path: '/requisition',
                permission: PERMISSIONS.REQUISITION.LIST,
            },

            // Purchase Order
            {
                id: 'po_management',
                title: 'PO',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                path: '/purchase-order',
                permission: PERMISSIONS.PURCHASE_ORDER.LIST,
            },

            // GRN
            {
                id: 'grn_management',
                title: 'GRN',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                path: '/grn',
                permission: PERMISSIONS.GRN.LIST,
            },

            // Purchase Invoice
            {
                id: 'bills',
                title: 'Bills',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                path: '/bill',
                permission: PERMISSIONS.BILL_PAYMENT.LIST,
            },
            // Purchase Return
            {
                id: 'purchase_return',
                title: 'Purchase Return',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                path: '/purchase-returns',
                permission: PERMISSIONS.PURCHASE_RETURN.LIST,
            },

            // Vendor List
            {
                id: 'vendors',
                title: 'Vendors',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                path: '/vendor',
                permission: PERMISSIONS.VENDOR.LIST,
            },
            {
                id: 'purchase_report',
                title: 'Purchase Reports',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                path: '/purchase/report',
                permission: PERMISSIONS.PURCHASE_ORDER.REPORT,
            },
        ],
    },
    {
        id: 'finance_module',
        title: 'Accounts',
        items: [
            {
                id: 'finance_payables',
                title: 'Payables',
                icon: { id: 'stroke-project', type: 'fill' },
                path: '/finance/payables',
                permission: PERMISSIONS.FINANCE.PAYABLE_LIST,
            },
            {
                id: 'finance_receivables',
                title: 'Receivables',
                icon: { id: 'stroke-project', type: 'fill' },
                path: '/finance/receivables',
                permission: PERMISSIONS.FINANCE.RECEIVABLE_LIST,
            },
            {
                id: 'finance_transactions',
                title: 'Transactions',
                icon: { id: 'stroke-project', type: 'fill' },
                path: '/finance/transactions',
                permission: PERMISSIONS.FINANCE.TRANSACTION_LIST,
            },
        ],
    },
    {
        id: 'human_resources',
        title: 'Human Resource',
        items: [
            // Manage Users
            {
                id: 'manage_users',
                title: 'Manage Users',

                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },

                subItems: [
                    {
                        id: 'user_roles',
                        title: 'Roles & Permissions',
                        path: '/roles',
                        permission: PERMISSIONS.ROLE.LIST,
                    },
                    {
                        id: 'users_list',
                        title: 'Manage Users',
                        path: '/user',
                        permission: PERMISSIONS.USERS.LIST,
                    },
                    {
                        id: 'documents',
                        title: 'Documents',
                        path: '/document',
                        permission: PERMISSIONS.USERS.LIST,
                    },
                ],
            },

            {
                id: 'manage_salary',
                title: 'Manage Salary',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'employee_salary',
                        title: 'Salary Overview',
                        path: '/hr/salary-overview',
                        permission: PERMISSIONS.SALARY.OVERVIEW,
                    },
                    {
                        id: 'increment',
                        title: 'Increment',
                        path: '/hr/increment',
                        permission: PERMISSIONS.INCREMENT.LIST,
                    },
                ],
            },

            {
                id: 'attendance',
                title: 'Attendance',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'attendance_list',
                        title: 'Attendance',
                        path: '/hr/attendance/employees',
                        permission: PERMISSIONS.ATTENDANCE.LIST,
                    },
                    {
                        id: 'manual_attendance',
                        title: 'Manual Attendance',
                        path: '/hr/attendance/manual',
                        permission: PERMISSIONS.ATTENDANCE.MANUAL,
                    },
                    {
                        id: 'attendance_report',
                        title: 'Report',
                        path: '/hr/attendance/reports',
                        permission: PERMISSIONS.ATTENDANCE.REPORT,
                    },
                ],
            },

            {
                id: 'leave',
                title: 'Leave',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'leave_request',
                        title: 'Leave Request',
                        path: '/hr/all-leave-request',
                        permission: PERMISSIONS.LEAVE.LIST,
                    },
                    {
                        id: 'manage_leave',
                        title: 'Manage Leave',
                        path: '/hr/leave-management',
                        permission: PERMISSIONS.LEAVE.ASSIGN,
                    },
                ],
            },

            {
                id: 'notice_board',
                title: 'Notice Board',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'notice',
                        title: 'Notice',
                        path: '/notice',
                        permission: PERMISSIONS.NOTICE.LIST,
                    },
                ],
            },

            {
                id: 'loan',
                title: 'Loan',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'loan_request',
                        title: 'Loan Request',
                        path: '/hr/all-loan-request',
                        permission: PERMISSIONS.LOAN.LIST,
                    },
                ],
            },

            {
                id: 'home_office',
                title: 'Home Office',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'wfh_request',
                        title: 'WFH Request',
                        path: '/hr/all-wfh',
                        permission: PERMISSIONS.WFH.LIST,
                    },
                ],
            },

            {
                id: 'hr_payroll',
                title: 'HR & Payroll',
                icon: {
                    id: 'stroke-project',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'salary_advance',
                        title: 'Salary Advance',
                        path: '/hr/salary-advance',
                        permission: PERMISSIONS.PAYROLL.ADVANCE,
                    },
                    {
                        id: 'salary_generate',
                        title: 'Salary Generate',
                        path: '/hr/salary-generate',
                        permission: PERMISSIONS.PAYROLL.GENERATE,
                    },
                    {
                        id: 'manage_payslip',
                        title: 'Manage Payslip',
                        path: '/hr/payslip',
                        permission: PERMISSIONS.PAYROLL.PAYSLIP,
                    },
                ],
            },
        ],
    },

    {
        id: 'system_settings',
        title: 'System Settings',
        items: [
            {
                id: 'general_settings',
                title: 'General Settings',
                icon: {
                    id: 'stroke-gallery',
                    type: 'fill',
                },
                subItems: [
                    {
                        id: 'ai_config',
                        title: 'AI Config',
                        path: '/settings/ai-config',
                        permission: PERMISSIONS.SETTINGS.AI_CONFIG,
                    },
                    {
                        id: 'departments',
                        title: 'Departments',
                        path: '/department',
                        permission: PERMISSIONS.SETTINGS.DEPARTMENT,
                    },
                    {
                        id: 'designations',
                        title: 'Designations',
                        path: '/designation',
                        permission: PERMISSIONS.SETTINGS.DESIGNATION,
                    },
                    {
                        id: 'work_shift',
                        title: 'Work Shift',
                        path: '/shift',
                        permission: PERMISSIONS.SETTINGS.SHIFT,
                    },

                    {
                        id: 'leave_setup',
                        title: 'Leave Setup',
                        path: '/leave',
                        permission: PERMISSIONS.SETTINGS.LEAVE,
                    },

                    {
                        id: 'holidays',
                        title: 'Holidays',
                        path: '/holiday',
                        permission: PERMISSIONS.SETTINGS.HOLIDAY,
                    },

                    {
                        id: 'commission',
                        title: 'Commission',
                        path: '/commission',
                        permission: PERMISSIONS.SETTINGS.COMMISSION,
                    },

                    {
                        id: 'interest',
                        title: 'Interest',
                        path: '/loan-interest',
                        permission: PERMISSIONS.SETTINGS.INTEREST,
                    },

                    {
                        id: 'wifi_ip_addresses',
                        title: 'Wifi IP Address',
                        path: '/wifi-ips',
                        permission: PERMISSIONS.SETTINGS.WIFI_IP,
                    },
                    {
                        id: 'units',
                        title: 'Units',
                        path: '/unit',
                        permission: PERMISSIONS.SETTINGS.UNITS,
                    },
                    {
                        id: 'currencies',
                        title: 'Currencies',
                        path: '/currency',
                        permission: PERMISSIONS.SETTINGS.CURRENCY,
                    },
                    {
                        id: 'taxes',
                        title: 'Taxes',
                        path: '/tax',
                        permission: PERMISSIONS.SETTINGS.TAXES,
                    },
                    {
                        id: 'set_timezone',
                        title: 'Set Timezone',
                        path: '/setup/timezone',
                        permission: PERMISSIONS.SETTINGS.TIMEZONE,
                    },
                ],
            },
            {
                id: 'system_settings',
                title: 'System Settings',
                icon: {
                    id: 'stroke-faq',
                    type: 'fill',
                },
                path: '/configure',
                permission: PERMISSIONS.SETTINGS.CONFIGURATION,
            },
        ],
    },
];

// Helper function to get item by ID
export const getSidebarItemById = (id: string): SidebarItem | null => {
    for (const section of SIDEBAR_SECTIONS) {
        for (const item of section.items) {
            if (item.id === id) {
                return item;
            }
        }
    }

    return null;
};

// Helper to get all items flat
export const getAllSidebarItems = (): SidebarItem[] => {
    return SIDEBAR_SECTIONS.flatMap((section) => section.items);
};
