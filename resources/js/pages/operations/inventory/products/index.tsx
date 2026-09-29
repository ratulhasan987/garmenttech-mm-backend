import {
    useMemo,
    useState,
} from 'react';

import {
    Head,
    Link,
    router,
} from '@inertiajs/react';

import {
    Edit,
    Plus,
    Trash,
} from 'react-feather';

import {
    DeleteConfirmModal,
} from '@/components/modals/delete-confirm-modal';

import PageTitle from '@/components/page-title';

import {
    TableEmpty,
} from '@/components/shared/table-empty';

import {
    TablePaginationInfo,
} from '@/components/shared/table-pagination-info';

import {
    Button,
} from '@/components/ui/button';

import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';

import {
    Select,
} from '@/components/ui/form/select';

import {
    SuggestionSearchInput,
} from '@/components/ui/form/suggestion-search-input';

import {
    Pagination,
} from '@/components/ui/pagination';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type {
    PaginatedData,
} from '@/types/pagination';

import type {
    Product,
} from '@/types/inventory';


type ProductSuggestion = {
    id: number;

    code: string;

    name: string;
};

type CategoryOption = {
    id: number;

    name: string;
};

type SubcategoryOption = {
    id: number;

    parent_id: number;

    name: string;
};

type BrandOption = {
    id: number;

    name: string;
};

type TaxOption = {
    id: number;

    name: string;

    rate:
        | string
        | number;
};

type ProductListItem =
    Product & {
        product_category_id:
            | number
            | null;

        product_subcategory_id:
            | number
            | null;

        product_brand_id:
            | number
            | null;

        purchase_tax_ids:
            | number[]
            | null;

        sales_tax_ids:
            | number[]
            | null;

        subcategory?:
            | {
                  id: number;

                  name: string;

                  parent_id?:
                      number;
              }
            | null;
    };

type ProductIndexFilters = {
    keyword?:
        | string
        | null;

    category_id?:
        | number
        | string
        | null;

    subcategory_id?:
        | number
        | string
        | null;

    brand_id?:
        | number
        | string
        | null;

    status?:
        | number
        | string
        | boolean
        | null;
};

type ProductIndexPageProps = {
    data:
        PaginatedData<ProductListItem>;

    filters:
        ProductIndexFilters;

    categories:
        CategoryOption[];

    subcategories:
        SubcategoryOption[];

    brands:
        BrandOption[];

    taxes:
        TaxOption[];
};



async function searchProducts(
    query: string,
    signal?: AbortSignal,
): Promise<ProductSuggestion[]> {
    const params =
        new URLSearchParams();

    params.set(
        'keyword',
        query,
    );

    const response =
        await fetch(
            `/operations/products/search?${params.toString()}`,
            {
                signal,

                headers: {
                    Accept:
                        'application/json',
                },
            },
        );

    if (!response.ok) {
        throw new Error(
            'Failed to search products.',
        );
    }

    return response.json();
}


export default function ProductIndexPage({
    data,
    filters,
    categories,
    subcategories,
    brands,
    taxes,
}: ProductIndexPageProps) {


    const [
        keyword,
        setKeyword,
    ] =
        useState(
            filters.keyword ??
                '',
        );

    const [
        categoryId,
        setCategoryId,
    ] =
        useState<string>(
            filters.category_id
                ? String(
                      filters.category_id,
                  )
                : '',
        );

    const [
        subcategoryId,
        setSubcategoryId,
    ] =
        useState<string>(
            filters.subcategory_id
                ? String(
                      filters.subcategory_id,
                  )
                : '',
        );

    const [
        brandId,
        setBrandId,
    ] =
        useState<string>(
            filters.brand_id
                ? String(
                      filters.brand_id,
                  )
                : '',
        );

    const [
        status,
        setStatus,
    ] =
        useState<string>(() => {
            if (
                filters.status ===
                    null ||
                filters.status ===
                    undefined ||
                filters.status ===
                    ''
            ) {
                return '';
            }

            return String(
                Number(
                    filters.status,
                ),
            );
        });



    const [
        selectedProduct,
        setSelectedProduct,
    ] =
        useState<ProductListItem | null>(
            null,
        );

    const [
        deleteModalOpen,
        setDeleteModalOpen,
    ] =
        useState(false);

    const [
        deleting,
        setDeleting,
    ] =
        useState(false);

    /*
    | Filtered Sub Categories
    */

    const availableSubcategories =
        useMemo(
            () => {
                if (!categoryId) {
                    return [];
                }

                return subcategories.filter(
                    (
                        subcategory,
                    ) =>
                        Number(
                            subcategory.parent_id,
                        ) ===
                        Number(
                            categoryId,
                        ),
                );
            },
            [
                categoryId,
                subcategories,
            ],
        );

    /*
    | Tax Lookup
    */

    const taxMap =
        useMemo(
            () =>
                new Map(
                    taxes.map(
                        (
                            tax,
                        ) => [
                            tax.id,
                            tax,
                        ],
                    ),
                ),
            [
                taxes,
            ],
        );

    /*
    | Has Filters
    */

    const hasFilters =
        Boolean(
            filters.keyword ||
                filters.category_id ||
                filters.subcategory_id ||
                filters.brand_id ||
                filters.status !==
                    null &&
                    filters.status !==
                        undefined &&
                    filters.status !==
                        '',
        );

    /*
    | Tax Labels
    */

    const getTaxes = (
        ids:
            | number[]
            | null
            | undefined,
    ): TaxOption[] => {
        if (
            !ids ||
            ids.length ===
                0
        ) {
            return [];
        }

        return ids
            .map(
                (
                    id,
                ) =>
                    taxMap.get(
                        Number(
                            id,
                        ),
                    ),
            )
            .filter(
                (
                    tax,
                ): tax is TaxOption =>
                    Boolean(
                        tax,
                    ),
            );
    };

    /*
    | Apply Filters
    */

    const applyFilters =
        () => {
            router.get(
                '/operations/products',
                {
                    keyword:
                        keyword ||
                        undefined,

                    category_id:
                        categoryId ||
                        undefined,

                    subcategory_id:
                        subcategoryId ||
                        undefined,

                    brand_id:
                        brandId ||
                        undefined,

                    status:
                        status !==
                        ''
                            ? status
                            : undefined,
                },
                {
                    preserveState:
                        true,

                    preserveScroll:
                        true,

                    replace:
                        true,
                },
            );
        };

    /*
    | Reset Filters
    */

    const resetFilters =
        () => {
            setKeyword(
                '',
            );

            setCategoryId(
                '',
            );

            setSubcategoryId(
                '',
            );

            setBrandId(
                '',
            );

            setStatus(
                '',
            );

            router.get(
                '/operations/products',
                {},
                {
                    preserveState:
                        true,

                    preserveScroll:
                        true,

                    replace:
                        true,
                },
            );
        };

    /*
    | Category Change
    */

    const handleCategoryChange =
        (
            value: string,
        ) => {
            setCategoryId(
                value,
            );

            /*
            | Reset Child Filter
            */

            setSubcategoryId(
                '',
            );
        };

    /*
    | Product Suggestion Select
    |
    | Product code is unique, so after selecting a suggestion we use the
    | code as the keyword filter.
    |
    */

    const handleProductSelect =
        (
            product:
                ProductSuggestion,
        ) => {
            setKeyword(
                product.code,
            );

            router.get(
                '/operations/products',
                {
                    keyword:
                        product.code,

                    category_id:
                        categoryId ||
                        undefined,

                    subcategory_id:
                        subcategoryId ||
                        undefined,

                    brand_id:
                        brandId ||
                        undefined,

                    status:
                        status !==
                        ''
                            ? status
                            : undefined,
                },
                {
                    preserveState:
                        true,

                    preserveScroll:
                        true,

                    replace:
                        true,
                },
            );
        };



    const handleProductClear =
        () => {
            setKeyword(
                '',
            );

            router.get(
                '/operations/products',
                {
                    category_id:
                        categoryId ||
                        undefined,

                    subcategory_id:
                        subcategoryId ||
                        undefined,

                    brand_id:
                        brandId ||
                        undefined,

                    status:
                        status !==
                        ''
                            ? status
                            : undefined,
                },
                {
                    preserveState:
                        true,

                    preserveScroll:
                        true,

                    replace:
                        true,
                },
            );
        };



    const handlePageChange =
        (
            page: number,
        ) => {
            router.get(
                '/operations/products',
                {
                    page,

                    keyword:
                        filters.keyword ??
                        undefined,

                    category_id:
                        filters.category_id ??
                        undefined,

                    subcategory_id:
                        filters.subcategory_id ??
                        undefined,

                    brand_id:
                        filters.brand_id ??
                        undefined,

                    status:
                        filters.status !==
                            null &&
                        filters.status !==
                            undefined &&
                        filters.status !==
                            ''
                            ? filters.status
                            : undefined,
                },
                {
                    preserveState:
                        true,

                    preserveScroll:
                        true,

                    replace:
                        true,
                },
            );
        };

 

    const handleDelete =
        (
            product:
                ProductListItem,
        ) => {
            setSelectedProduct(
                product,
            );

            setDeleteModalOpen(
                true,
            );
        };

    const confirmDelete =
        () => {
            if (
                !selectedProduct
            ) {
                return;
            }

            router.delete(
                `/operations/products/${selectedProduct.id}`,
                {
                    preserveScroll:
                        true,

                    onStart:
                        () => {
                            setDeleting(
                                true,
                            );
                        },

                    onSuccess:
                        () => {
                            setDeleteModalOpen(
                                false,
                            );

                            setSelectedProduct(
                                null,
                            );
                        },

                    onFinish:
                        () => {
                            setDeleting(
                                false,
                            );
                        },
                },
            );
        };

    return (
        <>
        <Head title="Products" />
            <PageTitle
                title="Products"
            />

            <div className="container-fluid">
                <Card>
        

                    <CardHeader>
                        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
                            <div>
                                <h5 className="mb-1">
                                    Products
                                </h5>

                                <p className="text-muted mb-0">
                                    Manage products,
                                    classifications,
                                    taxes and inventory
                                    settings.
                                </p>
                            </div>

                            <Link
                                href="/operations/products/create"
                                className="btn btn-primary"
                            >
                                <Plus
                                    size={
                                        16
                                    }
                                    className="me-1"
                                />

                                Create Product
                            </Link>
                        </div>
                    </CardHeader>

                    <CardBody>
        

                        <div className="row g-2 mb-3">


                            <div className="col-lg-4 col-md-6">
                                <SuggestionSearchInput<ProductSuggestion>
                                    key={`product-search-${filters.keyword ?? 'all'}`}
                                    searchFn={
                                        searchProducts
                                    }
                                    idKey="id"
                                    labelKey="name"
                                    secondaryLabelKey="code"
                                    placeholder="Search product name or code..."
                                    showSearchIcon
                                    clearOnFocus={
                                        false
                                    }
                                    defaultValue={
                                        filters.keyword ??
                                        ''
                                    }
                                    emptyLabel="No products found."
                                    onSelect={
                                        handleProductSelect
                                    }
                                    onClear={
                                        handleProductClear
                                    }
                                    renderOption={(
                                        product,
                                    ) => (
                                        <div>
                                            <div className="f-w-500">
                                                {
                                                    product.name
                                                }
                                            </div>

                                            <small className="f-light d-block">
                                                {
                                                    product.code
                                                }
                                            </small>
                                        </div>
                                    )}
                                />
                            </div>

          

                            <div className="col-lg-2 col-md-6">
                                <Select
                                    value={
                                        categoryId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        handleCategoryChange(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                >
                                    <option value="">
                                        All Categories
                                    </option>

                                    {categories.map(
                                        (
                                            category,
                                        ) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        ),
                                    )}
                                </Select>
                            </div>

                

                            <div className="col-lg-2 col-md-6">
                                <Select
                                    value={
                                        subcategoryId
                                    }
                                    disabled={
                                        !categoryId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setSubcategoryId(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                >
                                    <option value="">
                                        {categoryId
                                            ? 'All Sub Categories'
                                            : 'Select Category First'}
                                    </option>

                                    {availableSubcategories.map(
                                        (
                                            subcategory,
                                        ) => (
                                            <option
                                                key={
                                                    subcategory.id
                                                }
                                                value={
                                                    subcategory.id
                                                }
                                            >
                                                {
                                                    subcategory.name
                                                }
                                            </option>
                                        ),
                                    )}
                                </Select>
                            </div>

              

                            <div className="col-lg-2 col-md-6">
                                <Select
                                    value={
                                        brandId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setBrandId(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                >
                                    <option value="">
                                        All Brands
                                    </option>

                                    {brands.map(
                                        (
                                            brand,
                                        ) => (
                                            <option
                                                key={
                                                    brand.id
                                                }
                                                value={
                                                    brand.id
                                                }
                                            >
                                                {
                                                    brand.name
                                                }
                                            </option>
                                        ),
                                    )}
                                </Select>
                            </div>


                            <div className="col-lg-2 col-md-6">
                                <Select
                                    value={
                                        status
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setStatus(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                >
                                    <option value="">
                                        All Status
                                    </option>

                                    <option value="1">
                                        Active
                                    </option>

                                    <option value="0">
                                        Inactive
                                    </option>
                                </Select>
                            </div>

                         

                            <div className="col-12">
                                <div className="d-flex justify-content-end gap-2">
                                    {hasFilters && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            appearance="outline"
                                            onClick={
                                                resetFilters
                                            }
                                        >
                                            Reset
                                        </Button>
                                    )}

                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={
                                            applyFilters
                                        }
                                    >
                                        Filter
                                    </Button>
                                </div>
                            </div>
                        </div>

                      

                        <Table
                            wrapperClassName="overflow-auto"
                            wrapperStyle={{
                                maxHeight:
                                    'calc(100vh - 350px)',
                            }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>
                                        Sl
                                    </TableHead>

                                    <TableHead sticky>
                                        Code
                                    </TableHead>

                                    <TableHead sticky>
                                        Product
                                    </TableHead>

                                    <TableHead sticky>
                                        Category
                                    </TableHead>

                                    <TableHead sticky>
                                        Sub Category
                                    </TableHead>

                                    <TableHead sticky>
                                        Brand
                                    </TableHead>

                                    <TableHead sticky>
                                        Unit
                                    </TableHead>

                                    <TableHead
                                        sticky
                                        className="text-end"
                                    >
                                        Reorder Level
                                    </TableHead>

                                    <TableHead sticky>
                                        Purchase Taxes
                                    </TableHead>

                                    <TableHead sticky>
                                        Sales Taxes
                                    </TableHead>

                                    <TableHead sticky>
                                        Status
                                    </TableHead>

                                    <TableHead sticky>
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length >
                                0 ? (
                                    data.data.map(
                                        (
                                            product,
                                            index,
                                        ) => {
                                            const purchaseTaxes =
                                                getTaxes(
                                                    product.purchase_tax_ids,
                                                );

                                            const salesTaxes =
                                                getTaxes(
                                                    product.sales_tax_ids,
                                                );

                                            return (
                                                <TableRow
                                                    key={
                                                        product.id
                                                    }
                                                >
                                                   

                                                    <TableCell>
                                                        {(data.current_page -
                                                            1) *
                                                            data.per_page +
                                                            index +
                                                            1}
                                                    </TableCell>

                                                    

                                                    <TableCell>
                                                        <strong className="text-nowrap">
                                                            {
                                                                product.code
                                                            }
                                                        </strong>
                                                    </TableCell>

                                                 

                                                    <TableCell>
                                                        <div
                                                            className="fw-semibold text-truncate"
                                                            style={{
                                                                minWidth:
                                                                    170,

                                                                maxWidth:
                                                                    280,
                                                            }}
                                                            title={
                                                                product.name
                                                            }
                                                        >
                                                            {
                                                                product.name
                                                            }
                                                        </div>

                                                        {product.description && (
                                                            <small
                                                                className="text-muted d-block text-truncate"
                                                                style={{
                                                                    maxWidth:
                                                                        280,
                                                                }}
                                                                title={
                                                                    product.description
                                                                }
                                                            >
                                                                {
                                                                    product.description
                                                                }
                                                            </small>
                                                        )}
                                                    </TableCell>

                                                    

                                                    <TableCell>
                                                        {product
                                                            .category
                                                            ?.name ??
                                                            '-'}
                                                    </TableCell>


                                                    <TableCell>
                                                        {product
                                                            .subcategory
                                                            ?.name ??
                                                            '-'}
                                                    </TableCell>

                                                    

                                                    <TableCell>
                                                        {product
                                                            .brand
                                                            ?.name ??
                                                            '-'}
                                                    </TableCell>

                                                  
                                                    <TableCell>
                                                        {product
                                                            .unit
                                                            ?.name ??
                                                            '-'}
                                                    </TableCell>

                                                   
                                                    <TableCell className="text-end">
                                                        {
                                                            product.reorder_level
                                                        }
                                                    </TableCell>

                                                    

                                                    <TableCell
                                                        style={{
                                                            minWidth:
                                                                170,
                                                        }}
                                                    >
                                                        {purchaseTaxes.length >
                                                        0 ? (
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {purchaseTaxes.map(
                                                                    (
                                                                        tax,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                tax.id
                                                                            }
                                                                            className="badge bg-light text-dark border"
                                                                        >
                                                                            {
                                                                                tax.name
                                                                            }{' '}
                                                                            {Number(
                                                                                tax.rate,
                                                                            )}
                                                                            %
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">
                                                                -
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    

                                                    <TableCell
                                                        style={{
                                                            minWidth:
                                                                170,
                                                        }}
                                                    >
                                                        {salesTaxes.length >
                                                        0 ? (
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {salesTaxes.map(
                                                                    (
                                                                        tax,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                tax.id
                                                                            }
                                                                            className="badge bg-light text-dark border"
                                                                        >
                                                                            {
                                                                                tax.name
                                                                            }{' '}
                                                                            {Number(
                                                                                tax.rate,
                                                                            )}
                                                                            %
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">
                                                                -
                                                            </span>
                                                        )}
                                                    </TableCell>

                                     

                                                    <TableCell>
                                                        <span
                                                            className={`badge ${
                                                                product.status
                                                                    ? 'bg-success'
                                                                    : 'bg-danger'
                                                            }`}
                                                        >
                                                            {product.status
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </span>
                                                    </TableCell>

                                               

                                                    <TableCell>
                                                        <ActionCell
                                                            product={
                                                                product
                                                            }
                                                            onDelete={() =>
                                                                handleDelete(
                                                                    product,
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        },
                                    )
                                ) : (
                                    <TableEmpty
                                        colSpan={
                                            12
                                        }
                                    />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>


                    <CardFooter>
                        <div className="d-flex w-100 flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
                            <TablePaginationInfo
                                from={
                                    data.from ??
                                    0
                                }
                                to={
                                    data.to ??
                                    0
                                }
                                total={
                                    data.total
                                }
                            />

                            <Pagination
                                currentPage={
                                    data.current_page
                                }
                                lastPage={
                                    data.last_page
                                }
                                onPageChange={
                                    handlePageChange
                                }
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

       

            <DeleteConfirmModal
                open={
                    deleteModalOpen
                }
                onOpenChange={(
                    open,
                ) => {
                    if (
                        deleting
                    ) {
                        return;
                    }

                    setDeleteModalOpen(
                        open,
                    );

                    if (!open) {
                        setSelectedProduct(
                            null,
                        );
                    }
                }}
                processing={
                    deleting
                }
                title="Delete Product?"
                description={
                    selectedProduct
                        ? `Are you sure you want to delete "${selectedProduct.name}"?`
                        : 'Are you sure you want to delete this product?'
                }
                onConfirm={
                    confirmDelete
                }
            />
        </>
    );
}



function ActionCell({
    product,
    onDelete,
}: {
    product:
        ProductListItem;

    onDelete:
        () => void;
}) {
    return (
        <div className="d-flex align-items-center gap-2">
      

            <Link
                href={`/operations/products/${product.id}/edit`}
                title="Edit Product"
                className="btn btn-link p-0 border-0"
            >
                <Edit
                    size={
                        22
                    }
                />
            </Link>

    

            <button
                type="button"
                title="Delete Product"
                className="btn btn-link text-danger p-0 border-0"
                onClick={
                    onDelete
                }
            >
                <Trash
                    size={
                        22
                    }
                />
            </button>
        </div>
    );
}