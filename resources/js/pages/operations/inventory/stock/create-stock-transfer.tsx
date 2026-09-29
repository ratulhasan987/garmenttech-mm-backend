import { Head, router, useForm } from '@inertiajs/react';

import { useCallback, useMemo, useState, type FormEvent } from 'react';

import { Plus, Trash2 } from 'lucide-react';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { DatePicker } from '@/components/ui/form/date-picker';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

import { Input } from '@/components/ui/form/input';

import { Select } from '@/components/ui/form/select';

import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Warehouse = {
    id: number;

    name: string;
};

type Product = {
    id: number;

    code: string;

    name: string;

    unit: string;
};

type Stock = {
    id: number;

    warehouse_id: number;

    item_id: number;

    unit: string | null;

    quantity: number;

    reserved_quantity: number;

    available_quantity: number;
};

type ProductSuggestion = Record<string, unknown> &
    Product & {
        available_quantity: number;
    };

type TransferItem = {
    item_id: number;

    code: string;

    name: string;

    unit: string;

    quantity: number;

    available_quantity: number;
};

type Props = {
    warehouses: Warehouse[];

    products: Product[];

    stocks: Stock[];
};

type TransferForm = {
    from_warehouse_id: string;

    to_warehouse_id: string;

    transfer_date: string;

    transportation_cost: string;

    note: string;

    items: {
        item_id: number;

        unit: string;

        quantity: number;
    }[];
};

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function CreateStockTransferPage({
    warehouses,
    products,
    stocks,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const { data, setData, post, processing, errors } = useForm<TransferForm>({
        from_warehouse_id: '',

        to_warehouse_id: '',

        transfer_date: '',

        transportation_cost: '',

        note: '',

        items: [],
    });

    /*
    |--------------------------------------------------------------------------
    | UI State
    |--------------------------------------------------------------------------
    */

    const [transferItems, setTransferItems] = useState<TransferItem[]>([]);

    const [selectedProduct, setSelectedProduct] =
        useState<ProductSuggestion | null>(null);

    const [quantity, setQuantity] = useState('1');

    const [itemError, setItemError] = useState<string | null>(null);

    const [productSearchVersion, setProductSearchVersion] = useState(0);

    /*
    |--------------------------------------------------------------------------
    | Added Products
    |--------------------------------------------------------------------------
    */

    const addedProductIds = useMemo(
        () => new Set(transferItems.map((item) => item.item_id)),
        [transferItems],
    );

    /*
    |--------------------------------------------------------------------------
    | Available Products By Selected Source Warehouse
    |--------------------------------------------------------------------------
    */

    const availableProducts = useMemo(() => {
        if (!data.from_warehouse_id) {
            return [];
        }

        const warehouseId = Number(data.from_warehouse_id);

        return products
            .map((product): ProductSuggestion | null => {
                const stock = stocks.find(
                    (stockRow) =>
                        stockRow.warehouse_id === warehouseId &&
                        stockRow.item_id === product.id,
                );

                if (!stock || Number(stock.available_quantity) <= 0) {
                    return null;
                }

                return {
                    ...product,

                    available_quantity: Number(stock.available_quantity),
                };
            })
            .filter(
                (product): product is ProductSuggestion =>
                    product !== null && !addedProductIds.has(product.id),
            );
    }, [products, stocks, data.from_warehouse_id, addedProductIds]);

    /*
    |--------------------------------------------------------------------------
    | Search Products
    |--------------------------------------------------------------------------
    */

    const searchProducts = useCallback(
        async (query: string) => {
            const keyword = query.trim().toLowerCase();

            if (!keyword) {
                return availableProducts.slice(0, 20);
            }

            return availableProducts
                .filter(
                    (product) =>
                        product.name.toLowerCase().includes(keyword) ||
                        product.code.toLowerCase().includes(keyword),
                )
                .slice(0, 20);
        },
        [availableProducts],
    );

    /*
    |--------------------------------------------------------------------------
    | Source Warehouse Change
    |--------------------------------------------------------------------------
    */

    const handleSourceWarehouseChange = (value: string) => {
        setData('from_warehouse_id', value);

        /*
            |--------------------------------------------------------------------------
            | If source == destination, reset destination.
            |--------------------------------------------------------------------------
            */

        if (value === data.to_warehouse_id) {
            setData('to_warehouse_id', '');
        }

        /*
            |--------------------------------------------------------------------------
            | Products were selected based on old source stock,
            | so reset the item list.
            |--------------------------------------------------------------------------
            */

        setTransferItems([]);

        setData('items', []);

        setSelectedProduct(null);

        setQuantity('1');

        setItemError(null);

        setProductSearchVersion((current) => current + 1);
    };

    /*
    |--------------------------------------------------------------------------
    | Add Item
    |--------------------------------------------------------------------------
    */

    const handleAddItem = () => {
        setItemError(null);

        if (!data.from_warehouse_id) {
            setItemError('Select source warehouse first.');

            return;
        }

        if (!selectedProduct) {
            setItemError('Select a product.');

            return;
        }

        const requestedQuantity = Number(quantity);

        if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
            setItemError('Quantity must be greater than 0.');

            return;
        }

        if (requestedQuantity > selectedProduct.available_quantity) {
            setItemError(
                `Only ${Number(selectedProduct.available_quantity).toFixed(
                    2,
                )} ${selectedProduct.unit} available.`,
            );

            return;
        }

        const newItem: TransferItem = {
            item_id: selectedProduct.id,

            code: selectedProduct.code,

            name: selectedProduct.name,

            unit: selectedProduct.unit,

            quantity: requestedQuantity,

            available_quantity: selectedProduct.available_quantity,
        };

        const nextItems = [...transferItems, newItem];

        setTransferItems(nextItems);

        setData(
            'items',
            nextItems.map((item) => ({
                item_id: item.item_id,

                unit: item.unit,

                quantity: item.quantity,
            })),
        );

        setSelectedProduct(null);

        setQuantity('1');

        setProductSearchVersion((current) => current + 1);
    };

    /*
    |--------------------------------------------------------------------------
    | Remove Item
    |--------------------------------------------------------------------------
    */

    const handleRemoveItem = (itemId: number) => {
        const nextItems = transferItems.filter(
            (item) => item.item_id !== itemId,
        );

        setTransferItems(nextItems);

        setData(
            'items',
            nextItems.map((item) => ({
                item_id: item.item_id,

                unit: item.unit,

                quantity: item.quantity,
            })),
        );

        setSelectedProduct(null);

        setProductSearchVersion((current) => current + 1);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setItemError(null);

        if (!data.from_warehouse_id) {
            setItemError('Select source warehouse.');

            return;
        }

        if (!data.to_warehouse_id) {
            setItemError('Select destination warehouse.');

            return;
        }

        if (data.from_warehouse_id === data.to_warehouse_id) {
            setItemError(
                'Source and destination warehouse cannot be the same.',
            );

            return;
        }

        if (transferItems.length === 0) {
            setItemError('Add at least one item.');

            return;
        }

        post('/inventory/stock-transfers', {
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Create Stock Transfer" />

            <PageTitle title="Create Stock Transfer" />

            <div className="container-fluid">
                <form onSubmit={handleSubmit}>
                    <div className="card">
                        <div className="card-body p-4">
                            {/*
                            |--------------------------------------------------------------------------
                            | Transfer Information
                            |--------------------------------------------------------------------------
                            */}

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <FormField>
                                            <FormLabel required>
                                                From Warehouse
                                            </FormLabel>

                                            <Select
                                                value={data.from_warehouse_id}
                                                disabled={processing}
                                                onChange={(event) =>
                                                    handleSourceWarehouseChange(
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select Source Warehouse
                                                </option>

                                                {warehouses.map((warehouse) => (
                                                    <option
                                                        key={warehouse.id}
                                                        value={warehouse.id}
                                                    >
                                                        {warehouse.name}
                                                    </option>
                                                ))}
                                            </Select>

                                            <FormError
                                                error={errors.from_warehouse_id}
                                            />
                                        </FormField>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <FormField>
                                            <FormLabel required>
                                                To Warehouse
                                            </FormLabel>

                                            <Select
                                                value={data.to_warehouse_id}
                                                disabled={
                                                    processing ||
                                                    !data.from_warehouse_id
                                                }
                                                onChange={(event) =>
                                                    setData(
                                                        'to_warehouse_id',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select Destination Warehouse
                                                </option>

                                                {warehouses
                                                    .filter(
                                                        (warehouse) =>
                                                            warehouse.id !==
                                                            Number(
                                                                data.from_warehouse_id,
                                                            ),
                                                    )
                                                    .map((warehouse) => (
                                                        <option
                                                            key={warehouse.id}
                                                            value={warehouse.id}
                                                        >
                                                            {warehouse.name}
                                                        </option>
                                                    ))}
                                            </Select>

                                            <FormError
                                                error={errors.to_warehouse_id}
                                            />
                                        </FormField>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <FormField>
                                            <FormLabel required>
                                                Transfer Date
                                            </FormLabel>

                                            <DatePicker
                                                id="transfer_date"
                                                mode="single"
                                                value={data.transfer_date}
                                                disabled={processing}
                                                error={errors.transfer_date}
                                                placeholder="Select transfer date"
                                                onChange={(value) =>
                                                    setData(
                                                        'transfer_date',
                                                        value ?? '',
                                                    )
                                                }
                                            />

                                            <FormError
                                                error={errors.transfer_date}
                                            />
                                        </FormField>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <FormField>
                                            <FormLabel>
                                                Transportation Cost
                                            </FormLabel>

                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.transportation_cost}
                                                disabled={processing}
                                                placeholder="0.00"
                                                onChange={(event) =>
                                                    setData(
                                                        'transportation_cost',
                                                        event.target.value,
                                                    )
                                                }
                                            />

                                            <FormError
                                                error={
                                                    errors.transportation_cost
                                                }
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/*
                            |--------------------------------------------------------------------------
                            | Items
                            |--------------------------------------------------------------------------
                            */}

                            <div className="mt-4">
                                <h5 className="mb-3">Items</h5>

                                <div className="row align-items-end">
                                    <div className="col-md-7">
                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel required>
                                                    Product
                                                </FormLabel>

                                                <SuggestionSearchInput<ProductSuggestion>
                                                    key={`stock-transfer-product-${data.from_warehouse_id || 'none'}-${productSearchVersion}`}
                                                    searchFn={searchProducts}
                                                    idKey="id"
                                                    labelKey="name"
                                                    secondaryLabelKey="code"
                                                    placeholder={
                                                        data.from_warehouse_id
                                                            ? 'Search available product...'
                                                            : 'Select source warehouse first'
                                                    }
                                                    showSearchIcon
                                                    clearOnFocus={false}
                                                    disabled={
                                                        processing ||
                                                        !data.from_warehouse_id
                                                    }
                                                    emptyLabel="No available products found."
                                                    renderOption={(product) => (
                                                        <div className="d-flex justify-content-between align-items-center gap-3">
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </div>

                                                                <small className="text-muted">
                                                                    {
                                                                        product.code
                                                                    }
                                                                </small>
                                                            </div>

                                                            <small className="text-muted text-nowrap">
                                                                Available:{' '}
                                                                {Number(
                                                                    product.available_quantity,
                                                                ).toFixed(
                                                                    2,
                                                                )}{' '}
                                                                {product.unit}
                                                            </small>
                                                        </div>
                                                    )}
                                                    onSelect={(product) => {
                                                        setSelectedProduct(
                                                            product,
                                                        );

                                                        setQuantity('1');

                                                        setItemError(null);
                                                    }}
                                                    onClear={() =>
                                                        setSelectedProduct(null)
                                                    }
                                                />
                                            </FormField>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel required>
                                                    Quantity
                                                </FormLabel>

                                                <Input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    max={
                                                        selectedProduct?.available_quantity
                                                    }
                                                    value={quantity}
                                                    disabled={
                                                        processing ||
                                                        !selectedProduct
                                                    }
                                                    onChange={(event) =>
                                                        setQuantity(
                                                            event.target.value,
                                                        )
                                                    }
                                                />

                                                {selectedProduct && (
                                                    <small className="text-muted">
                                                        Available:{' '}
                                                        {Number(
                                                            selectedProduct.available_quantity,
                                                        ).toFixed(2)}{' '}
                                                        {selectedProduct.unit}
                                                    </small>
                                                )}
                                            </FormField>
                                        </div>
                                    </div>

                                    <div className="col-md-2">
                                        <div className="mb-3">
                                            <Button
                                                type="button"
                                                className="w-100"
                                                disabled={
                                                    processing ||
                                                    !selectedProduct
                                                }
                                                onClick={handleAddItem}
                                            >
                                                <Plus
                                                    size={16}
                                                    className="me-1"
                                                />
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {itemError && (
                                    <div className="text-danger small mb-3">
                                        {itemError}
                                    </div>
                                )}

                                <FormError error={errors.items} />

                                {/*
                                |--------------------------------------------------------------------------
                                | Items Table
                                |--------------------------------------------------------------------------
                                */}

                                <div className="table-responsive">
                                    <table className="table table-bordered align-middle">
                                        <thead>
                                            <tr>
                                                <th
                                                    style={{
                                                        width: '5%',
                                                    }}
                                                >
                                                    SL
                                                </th>

                                                <th>Product</th>

                                                <th>Unit</th>

                                                <th>Available</th>

                                                <th>Transfer Quantity</th>

                                                <th
                                                    style={{
                                                        width: '8%',
                                                    }}
                                                    className="text-center"
                                                >
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {transferItems.length > 0 ? (
                                                transferItems.map(
                                                    (item, index) => (
                                                        <tr key={item.item_id}>
                                                            <td>{index + 1}</td>

                                                            <td>
                                                                <div className="fw-semibold">
                                                                    {item.name}
                                                                </div>

                                                                <small className="text-muted">
                                                                    {item.code}
                                                                </small>
                                                            </td>

                                                            <td>{item.unit}</td>

                                                            <td>
                                                                {Number(
                                                                    item.available_quantity,
                                                                ).toFixed(2)}
                                                            </td>

                                                            <td>
                                                                {Number(
                                                                    item.quantity,
                                                                ).toFixed(2)}
                                                            </td>

                                                            <td className="text-center">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link text-danger p-0"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        handleRemoveItem(
                                                                            item.item_id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="text-center text-muted py-4"
                                                    >
                                                        No items added.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | Note
                            |--------------------------------------------------------------------------
                            */}

                            <div className="mt-4">
                                <FormField>
                                    <FormLabel>Note</FormLabel>

                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        value={data.note}
                                        disabled={processing}
                                        placeholder="Write note..."
                                        onChange={(event) =>
                                            setData('note', event.target.value)
                                        }
                                    />

                                    <FormError error={errors.note} />
                                </FormField>
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | Actions
                            |--------------------------------------------------------------------------
                            */}

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    appearance="outline"
                                    disabled={processing}
                                    onClick={() =>
                                        router.visit(
                                            '/inventory/stock-transfers',
                                        )
                                    }
                                >
                                    Back
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        processing || transferItems.length === 0
                                    }
                                >
                                    {processing
                                        ? 'Saving...'
                                        : 'Create Transfer'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
