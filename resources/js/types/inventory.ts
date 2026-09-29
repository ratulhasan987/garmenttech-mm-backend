import type { PaginatedData } from '@/types/pagination';

/*
|--------------------------------------------------------------------------
| Common Lookup Types
|--------------------------------------------------------------------------
*/

export type LookupItem = {
    id: number;
    name: string;
};

export type CodedLookupItem = {
    id: number;
    code: string;
    name: string;
};

/*
|--------------------------------------------------------------------------
| Product Category
|--------------------------------------------------------------------------
*/

export type ProductCategory = {
    id: number;
    name: string;

    parent_id: number | null;

    parent: LookupItem | null;

    created_at?: string;
    updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| Product Brand
|--------------------------------------------------------------------------
*/

export type ProductBrand = {
    id: number;
    name: string;

    created_at?: string;
    updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| Product
|--------------------------------------------------------------------------
*/

export type Product = {
    id: number;

    code: string;
    name: string;

    product_category_id: number;

    product_brand_id:
        | number
        | null;

    unit_id: number;

    reorder_level:
        | string
        | number;

    status: boolean;

    description:
        | string
        | null;

    category:
        | LookupItem
        | null;

    brand:
        | LookupItem
        | null;

    unit:
        | LookupItem
        | null;

    created_at?: string;
    updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| Warehouse
|--------------------------------------------------------------------------
*/

export type Warehouse = {
    id: number;

    code: string;
    name: string;

    phone:
        | string
        | null;

    address:
        | string
        | null;

    status: boolean;
    
    is_default: boolean;

    created_at?: string;
    updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| Stock Documents
|--------------------------------------------------------------------------
*/

export type StockDocumentStatus =
    | 'draft'
    | 'posted'
    | 'cancelled';

export type StockDocumentMode =
    | 'receive'
    | 'issue'
    | 'adjustment'
    | 'transfer';

export type StockDirection =
    | 'increase'
    | 'decrease';

export type StockDocumentItem = {
    id: number;

    product_id: number;

    quantity:
        | number
        | string;

    direction?:
        | StockDirection
        | null;

    product:
        | CodedLookupItem
        | null;
};

export type StockDocument = {
    id: number;

    reference_no: string;

    warehouse_id?:
        | number
        | null;

    from_warehouse_id?:
        | number
        | null;

    to_warehouse_id?:
        | number
        | null;

    receive_date?:
        | string
        | null;

    issue_date?:
        | string
        | null;

    adjustment_date?:
        | string
        | null;

    transfer_date?:
        | string
        | null;

    status: StockDocumentStatus;

    remarks:
        | string
        | null;

    warehouse?:
        | CodedLookupItem
        | null;

    from_warehouse?:
        | CodedLookupItem
        | null;

    to_warehouse?:
        | CodedLookupItem
        | null;

    items: StockDocumentItem[];

    created_at?: string;
    updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| Stock Movement / Ledger
|--------------------------------------------------------------------------
*/

export type StockMovement = {
    id: number;

    warehouse_id: number;
    product_id: number;

    movement_date: string;

    movement_type: string;

    reference_type: string;

    reference_id: number;

    reference_no: string;

    quantity:
        | string
        | number;

    balance_after:
        | string
        | number;

    note:
        | string
        | null;

    warehouse:
        | CodedLookupItem
        | null;

    product:
        | CodedLookupItem
        | null;

    created_at?: string;
};

/*
|--------------------------------------------------------------------------
| Page Props
|--------------------------------------------------------------------------
*/

export type ProductIndexProps = {
    data: PaginatedData<Product>;

    filters: {
        product_id?:
            | number
            | string
            | null;
    };

    categories: LookupItem[];
    brands: LookupItem[];
    units: LookupItem[];
};

export type CategoryIndexProps = {
    data:
        PaginatedData<ProductCategory>;

    parents: LookupItem[];
};

export type BrandIndexProps = {
    data:
        PaginatedData<ProductBrand>;
};

export type WarehouseIndexProps = {
    data:
        PaginatedData<Warehouse>;
};

export type StockDocumentIndexProps = {
    data:
        PaginatedData<StockDocument>;

    products:
        CodedLookupItem[];

    warehouses:
        CodedLookupItem[];
};

export type StockLedgerIndexProps = {
    data:
        PaginatedData<StockMovement>;

    filters: {
        warehouse_id?:
            | number
            | string
            | null;

        product_id?:
            | number
            | string
            | null;

        from?:
            | string
            | null;

        to?:
            | string
            | null;
    };

    products:
        CodedLookupItem[];

    warehouses:
        CodedLookupItem[];
};