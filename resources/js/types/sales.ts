import type { PaginatedData } from '@/types/pagination';

/*
|--------------------------------------------------------------------------
| Customer
|--------------------------------------------------------------------------
*/

export type Customer = {
    id: number;

    name: string;

    client_no: string | null;

    company_name: string | null;

    email: string | null;

    phone: string | null;

    address: string | null;

    state: string | null;

    city: string | null;

    country: string | null;

    image: string | null;

    created_at?: string;

    updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| Customer Search
|--------------------------------------------------------------------------
*/

export type CustomerSearchResult = {
    id: number;

    client_id: string | null;

    name: string;

    company_name: string | null;

    phone: string | null;
};

export type CustomerSuggestion = Record<string, unknown> & {
    id: number;

    client_id: string | null;

    name: string;

    company_name: string | null;

    phone: string | null;

    label: string;
};

/*
|--------------------------------------------------------------------------
| Customer Index
|--------------------------------------------------------------------------
*/

export type CustomerIndexProps = {
    data: PaginatedData<Customer>;

    filters: {
        customer_id?: number | string | null;
    };

    selectedCustomer: CustomerSuggestion | null;
};

/*
|--------------------------------------------------------------------------
| Shared Sales Lookup
|--------------------------------------------------------------------------
*/

export type SalesLookup = {
    id: number;

    name: string;

    client_no?: string | null;

    company_name?: string | null;

    phone?: string | null;
};

/*
|--------------------------------------------------------------------------
| Product Lookups
|--------------------------------------------------------------------------
*/

export type SalesProductLookup = {
    id: number;

    code: string;

    name: string;

    unit_id?: number | null;

    unit?: string | null;

    purchase_tax_ids?: number[];

    sales_tax_ids?: number[];
};

/*
|--------------------------------------------------------------------------
| Product Suggestion
|--------------------------------------------------------------------------
|
| Used by Sales Invoice product predictive search.
|
*/

export type SalesProductSuggestion = Record<string, unknown> & {
    id: number;

    code: string;

    name: string;

    unit: string | null;

    unit_id: number | null;

    sales_tax_ids: number[];
};

/*
|--------------------------------------------------------------------------
| Category
|--------------------------------------------------------------------------
*/

export type SalesCategoryLookup = {
    id: number;

    name: string;
};

/*
|--------------------------------------------------------------------------
| Sub Category
|--------------------------------------------------------------------------
*/

export type SalesSubcategoryLookup = {
    id: number;

    parent_id: number;

    name: string;
};

/*
|--------------------------------------------------------------------------
| Brand
|--------------------------------------------------------------------------
*/

export type SalesBrandLookup = {
    id: number;

    name: string;
};

/*
|--------------------------------------------------------------------------
| Warehouse
|--------------------------------------------------------------------------
*/

export type SalesWarehouseLookup = {
    id: number;

    code: string;

    name: string;
};

/*
|--------------------------------------------------------------------------
| Tax
|--------------------------------------------------------------------------
*/

export type SalesTaxLookup = {
    id: number;

    name: string;

    rate: string | number;
};

/*
|--------------------------------------------------------------------------
| Product / Brand Mapping
|--------------------------------------------------------------------------
|
| Used to show only brands that actually have an
| active product under:
|
| Category
|     ↓
| Sub Category
|     ↓
| Brand
|
*/

export type SalesProductBrandMap = {
    product_category_id: number;

    product_subcategory_id: number;

    product_brand_id: number;
};

/*
|--------------------------------------------------------------------------
| Sales Invoice Status
|--------------------------------------------------------------------------
*/

export type SalesInvoiceStatus = 'Pending' | 'Approved' | 'Rejected';

/*
|--------------------------------------------------------------------------
| Payment Status
|--------------------------------------------------------------------------
*/

export type SalesPaymentStatus = 'unpaid' | 'partial' | 'paid';

/*
|--------------------------------------------------------------------------
| Sales Invoice Item
|--------------------------------------------------------------------------
*/

export type SalesInvoiceItem = {
    id: number;

    sales_invoice_id: number;

    product_id: number;

    quantity: string | number;

    unit_price: string | number;

    discount: string | number;

    /*
    |--------------------------------------------------------------------------
    | Calculated Tax Amount
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | 172.50
    |
    */

    tax: string | number;

    /*
    |--------------------------------------------------------------------------
    | Applied Sales Tax IDs
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | [1, 3, 5]
    |
    */

    tax_ids: number[];

    line_total: string | number;

    returned_quantity?: string | number;

    product: SalesProductLookup | null;
};

/*
|--------------------------------------------------------------------------
| Sales Invoice
|--------------------------------------------------------------------------
*/

export type SalesInvoice = {
    id: number;

    invoice_no: string;

    client_id: number;

    warehouse_id: number;

    invoice_date: string;

    subtotal: string | number;

    /*
    |--------------------------------------------------------------------------
    | Header Discount
    |--------------------------------------------------------------------------
    */

    discount: string | number;

    /*
    |--------------------------------------------------------------------------
    | Additional Header Tax
    |--------------------------------------------------------------------------
    |
    | Product sales taxes live inside invoice items.
    |
    */

    tax: string | number;

    adjustment_amount: number;

    grand_total: string | number;

    paid_amount: string | number;

    due_amount: string | number;

    status: SalesInvoiceStatus;

    payment_status: SalesPaymentStatus;

    remarks: string | null;

    client: SalesLookup | null;

    warehouse: SalesWarehouseLookup | null;

    items: SalesInvoiceItem[];

    created_at?: string;

    updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| Sales Invoice Index Filters
|--------------------------------------------------------------------------
*/

export type SalesInvoiceIndexFilters = {
    search?: string | null;

    status?: SalesInvoiceStatus | null;
};

/*
|--------------------------------------------------------------------------
| Sales Invoice Index Props
|--------------------------------------------------------------------------
|
| We no longer send all customers/products/warehouses
| to the invoice index.
|
*/

export type SalesInvoiceIndexProps = {
    data: PaginatedData<SalesInvoice>;

    filters: SalesInvoiceIndexFilters;
};

/*
|--------------------------------------------------------------------------
| Sales Invoice Create Props
|--------------------------------------------------------------------------
*/

export type SalesInvoiceCreateProps = {
    defaultWarehouse: SalesWarehouseLookup | null;

    categories: SalesCategoryLookup[];

    subcategories: SalesSubcategoryLookup[];

    brands: SalesBrandLookup[];

    taxes: SalesTaxLookup[];
};

/*
|--------------------------------------------------------------------------
| Sales Return Item
|--------------------------------------------------------------------------
*/

export type SalesReturnItem = {
    id: number;

    sales_return_id: number;

    sales_invoice_item_id: number;

    product_id: number;

    quantity: string | number;

    unit_price: string | number;

    line_total: string | number;

    product: SalesProductLookup | null;
};

/*
|--------------------------------------------------------------------------
| Sales Return
|--------------------------------------------------------------------------
*/

export type SalesReturn = {
    id: number;

    return_no: string;

    sales_invoice_id: number;

    warehouse_id: number;

    return_date: string;

    total_amount: string | number;

    status: SalesInvoiceStatus;

    remarks: string | null;

    invoice: SalesInvoice | null;

    warehouse: SalesWarehouseLookup | null;

    items: SalesReturnItem[];

    created_at?: string;

    updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| Sales Payment
|--------------------------------------------------------------------------
*/

export type SalesPayment = {
    id: number;

    payment_no: string;

    sales_invoice_id: number;

    payment_date: string;

    amount: string | number;

    payment_method: string;

    reference: string | null;

    remarks: string | null;

    invoice: SalesInvoice | null;

    created_at?: string;

    updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| Sales Payment Index
|--------------------------------------------------------------------------
*/

export type SalesPaymentIndexProps = {
    data: PaginatedData<SalesPayment>;

    invoices: SalesInvoice[];
};

/*
|--------------------------------------------------------------------------
| Return Invoice Item Suggestion
|--------------------------------------------------------------------------
*/

export type SalesReturnInvoiceItemSuggestion = {
    id: number;

    product_id: number;

    product: SalesProductLookup | null;

    sold_quantity: number;

    returned_quantity: number;

    available_quantity: number;

    unit_price: number;
};

/*
|--------------------------------------------------------------------------
| Returnable Invoice Suggestion
|--------------------------------------------------------------------------
*/

export type SalesReturnInvoiceSuggestion = Record<string, unknown> & {
    id: number;

    invoice_no: string;

    invoice_date: string;

    warehouse_id: number;

    label: string;

    client: SalesLookup | null;

    warehouse: SalesWarehouseLookup | null;

    items: SalesReturnInvoiceItemSuggestion[];
};

/*
|--------------------------------------------------------------------------
| Sales Return Index
|--------------------------------------------------------------------------
*/

export type SalesReturnIndexProps = {
    data: PaginatedData<SalesReturn>;

    filters: {
        search?: string | null;

        status?: SalesInvoiceStatus | null;
    };
};
