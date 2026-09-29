export type ProductProject = {
    id: number;
    project_no: string | null;
    name: string;
};

export type ProductCategory = {
    id: number;
    name: string;
};

export type ProductType = {
    id: number;
    name: string;
};

export type ProductUnit = {
    id: number;
    name: string;
};

export type ProductStatus =
    | boolean
    | 0
    | 1
    | '0'
    | '1'
    | 'active'
    | 'inactive'
    | null;

export type Product = {
    id: number;
    product_code: string;
    name: string;

    project_id: number | null;
    product_type_id: number | null;
    product_category_id: number | null;
    unit_id: number | null;

    size: number | string | null;
    price_per_unit: number | string | null;

    taxes: number[] | string | null;

    status: ProductStatus;

    image: string | null;
    description: string | null;

    project: ProductProject | null;
    product_category: ProductCategory | null;
    product_type: ProductType | null;
    unit: ProductUnit | null;

    created_at?: string;
    updated_at?: string;
};