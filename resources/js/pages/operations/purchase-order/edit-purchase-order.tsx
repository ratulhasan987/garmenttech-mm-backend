import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react';

import { Head, router, useForm } from '@inertiajs/react';

import { Check, Trash2, X } from 'lucide-react';

import { createPortal } from 'react-dom';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

import { DatePicker } from '@/components/ui/form/date-picker';

import { Input } from '@/components/ui/form/input';

import { Select } from '@/components/ui/form/select';

import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import {
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from '@/components/ui/table';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type PurchaseMode = 'requisition' | 'free';

type Warehouse = {
    id: number;
    name: string;
};

type Vendor = {
    id: number;
    name: string;
};

type Tax = {
    id: number;
    name: string;
    rate: number;
};

type Currency = {
    id?: number;
    symbol?: string | null;
};

type BrandOption = {
    id: number;
    name: string;
};

type CategoryOption = {
    id: number;
    name: string;
};

type SubcategoryOption = {
    id: number;
    name: string;
};

type RequisitionSuggestion = Record<string, unknown> & {
    id: number;

    requisition_id: string;

    purpose: string | null;

    required_date: string | null;

    label: string;
};

type RequisitionProduct = Record<string, unknown> & {
    requisition_item_id: number;

    item_id: number;

    code: string;

    name: string;

    unit: string;

    requested_quantity: number;

    already_ordered: number;

    remaining_quantity: number;

    suggested_rate: number;
};

type RequisitionItemsResponse = {
    meta: {
        id: number;

        requisition_id: string;

        purpose: string | null;

        required_date: string | null;
    };

    items: RequisitionProduct[];
};

type ProductSuggestion = Record<string, unknown> & {
    id: number;

    code: string;

    name: string;

    unit: string | null;
};

type ItemSuggestion = Record<string, unknown> & {
    search_id: string;

    requisition_item_id: number | null;

    item_id: number;

    code: string;

    name: string;

    unit: string;

    quantity: number;

    max_quantity: number | null;

    unit_price: number;
};

type PurchaseItemForm = {
    requisition_item_id: number | null;

    item_id: number;

    code: string;

    name: string;

    unit: string;

    quantity: number;

    max_quantity: number | null;

    unit_price: number;

    tax_ids: string[];
};

type PurchaseOrderFormData = {
    purchase_mode: PurchaseMode;

    requisition_id: number | null;

    warehouse_id: string;

    vendor_id: string;

    order_date: string;

    expected_delivery: string;

    document: File | null;

    remove_document: boolean;

    items: PurchaseItemForm[];

    shipping_cost: string;

    order_discount: string;

    note: string;
};

type PurchaseOrder = {
    id: number;

    order_id: string;

    requisition_id: number | null;

    is_requisition_based: boolean;

    warehouse_id: number | null;

    vendor_id: number;

    order_date: string | null;

    expected_delivery: string | null;

    document: string | null;

    shipping_cost: string | null;

    order_discount: string | null;

    note: string | null;

    status: string;

    requisition: RequisitionSuggestion | null;

    purchase_items: PurchaseItemForm[];
};

type Props = {
    purchaseOrder: PurchaseOrder;

    requisitionItems: RequisitionProduct[];

    warehouses: Warehouse[];

    vendors: Vendor[];

    taxes: Tax[];

    activeCurrency: Currency | null;
};

/*
|--------------------------------------------------------------------------
| Empty Item
|--------------------------------------------------------------------------
*/

const EMPTY_ITEM: PurchaseItemForm = {
    requisition_item_id: null,

    item_id: 0,

    code: '',

    name: '',

    unit: '',

    quantity: 1,

    max_quantity: null,

    unit_price: 0,

    tax_ids: [],
};

/*
|--------------------------------------------------------------------------
| Requisition Search
|--------------------------------------------------------------------------
*/

async function searchApprovedRequisitions(
    query: string,
    signal?: AbortSignal,
): Promise<RequisitionSuggestion[]> {
    const params = new URLSearchParams({
        keyword: query,
    });

    const response = await fetch(
        `/get-approved-requisitions?${params.toString()}`,
        {
            signal,

            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to load approved requisitions.');
    }

    return response.json();
}

/*
|--------------------------------------------------------------------------
| Tax Multi Select
|--------------------------------------------------------------------------
*/

type TaxMultiSelectProps = {
    taxes: Tax[];

    value: string[];

    disabled?: boolean;

    onChange: (value: string[]) => void;
};

function TaxMultiSelect({
    taxes,
    value,
    disabled = false,
    onChange,
}: TaxMultiSelectProps) {
    const [open, setOpen] = useState(false);

    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
    });

    const controlRef = useRef<HTMLDivElement>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedTaxes = useMemo(() => {
        const selectedIds = new Set(value.map(String));

        return taxes.filter((tax) => selectedIds.has(String(tax.id)));
    }, [taxes, value]);

    const updateDropdownPosition = useCallback(() => {
        if (!controlRef.current) {
            return;
        }

        const rect = controlRef.current.getBoundingClientRect();

        setDropdownPosition({
            top: rect.bottom + 4,

            left: rect.left,

            width: rect.width,
        });
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        updateDropdownPosition();

        const handleWindowChange = () => {
            updateDropdownPosition();
        };

        window.addEventListener('resize', handleWindowChange);

        window.addEventListener('scroll', handleWindowChange, true);

        return () => {
            window.removeEventListener('resize', handleWindowChange);

            window.removeEventListener('scroll', handleWindowChange, true);
        };
    }, [open, updateDropdownPosition]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleMouseDown = (event: MouseEvent) => {
            const target = event.target as Node;

            const insideControl = controlRef.current?.contains(target);

            const insideDropdown = dropdownRef.current?.contains(target);

            if (!insideControl && !insideDropdown) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [open]);

    const handleAddTax = (taxId: number) => {
        const id = String(taxId);

        if (value.includes(id)) {
            return;
        }

        onChange([...value, id]);

        /*
            |--------------------------------------------------------------------------
            | Close After Selecting Tax
            |--------------------------------------------------------------------------
            */

        setOpen(false);
    };

    const handleRemoveTax = (taxId: number) => {
        const id = String(taxId);

        onChange(value.filter((currentId) => currentId !== id));
    };

    return (
        <>
            <div
                ref={controlRef}
                className={`form-control d-flex flex-wrap align-items-center gap-1 ${
                    disabled ? 'bg-light' : ''
                }`}
                style={{
                    minHeight: '38px',

                    cursor: disabled ? 'not-allowed' : 'pointer',

                    position: 'relative',

                    paddingRight: '28px',
                }}
                onClick={() => {
                    if (disabled) {
                        return;
                    }

                    setOpen((current) => !current);
                }}
            >
                {selectedTaxes.length === 0 ? (
                    <span className="text-muted">Select Tax</span>
                ) : (
                    selectedTaxes.map((tax) => (
                        <span
                            key={tax.id}
                            className="badge bg-primary d-inline-flex align-items-center gap-1"
                            style={{
                                fontSize: '11px',

                                fontWeight: 500,

                                padding: '5px 7px',
                            }}
                        >
                            <span>
                                {tax.name} ({tax.rate}
                                %)
                            </span>

                            {!disabled && (
                                <button
                                    type="button"
                                    className="border-0 bg-transparent text-white d-inline-flex align-items-center justify-content-center p-0"
                                    title={`Remove ${tax.name}`}
                                    onClick={(event) => {
                                        event.stopPropagation();

                                        handleRemoveTax(tax.id);
                                    }}
                                >
                                    <X size={12} strokeWidth={3} />
                                </button>
                            )}
                        </span>
                    ))
                )}

                <span
                    className="position-absolute"
                    style={{
                        right: '10px',

                        top: '50%',

                        transform: 'translateY(-50%)',

                        fontSize: '10px',

                        opacity: 0.65,

                        pointerEvents: 'none',
                    }}
                >
                    ▼
                </span>
            </div>

            {open &&
                !disabled &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className="bg-body border rounded shadow-sm"
                        style={{
                            position: 'fixed',

                            top: dropdownPosition.top,

                            left: dropdownPosition.left,

                            width: dropdownPosition.width,

                            zIndex: 99999,

                            maxHeight: '240px',

                            overflowY: 'auto',

                            padding: '6px',
                        }}
                    >
                        {taxes.length > 0 ? (
                            taxes.map((tax) => {
                                const selected = value.includes(String(tax.id));

                                return (
                                    <button
                                        key={tax.id}
                                        type="button"
                                        className={`btn w-100 text-start border-0 d-flex justify-content-between align-items-center ${
                                            selected ? 'bg-light' : ''
                                        }`}
                                        style={{
                                            padding: '7px 8px',
                                        }}
                                        disabled={selected}
                                        onClick={() => handleAddTax(tax.id)}
                                    >
                                        <span>{tax.name}</span>

                                        <span className="text-muted small">
                                            {tax.rate}%
                                        </span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="text-muted text-center small py-2">
                                No taxes found.
                            </div>
                        )}
                    </div>,
                    document.body,
                )}
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function EditPurchaseOrderPage({
    purchaseOrder,
    requisitionItems: initialRequisitionItems,
    warehouses,
    vendors,
    taxes,
    activeCurrency,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Product Filter Options
    |--------------------------------------------------------------------------
    */

    const [brands, setBrands] = useState<BrandOption[]>([]);

    const [categories, setCategories] = useState<CategoryOption[]>([]);

    const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);

    /*
    |--------------------------------------------------------------------------
    | Product Filter State
    |--------------------------------------------------------------------------
    */

    const [brandId, setBrandId] = useState<number | null>(null);

    const [categoryId, setCategoryId] = useState<number | null>(null);

    const [subcategoryId, setSubcategoryId] = useState<number | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    const [loadingBrands, setLoadingBrands] = useState(false);

    const [loadingCategories, setLoadingCategories] = useState(false);

    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Current Requisition
    |--------------------------------------------------------------------------
    */

    const [selectedRequisition, setSelectedRequisition] =
        useState<RequisitionSuggestion | null>(purchaseOrder.requisition);

    const [requisitionItems, setRequisitionItems] = useState<
        RequisitionProduct[]
    >(initialRequisitionItems);

    const [requisitionMeta, setRequisitionMeta] = useState<
        RequisitionItemsResponse['meta'] | null
    >(
        purchaseOrder.requisition
            ? {
                  id: purchaseOrder.requisition.id,

                  requisition_id: purchaseOrder.requisition.requisition_id,

                  purpose: purchaseOrder.requisition.purpose,

                  required_date: purchaseOrder.requisition.required_date,
              }
            : null,
    );

    const [loadingRequisitionItems, setLoadingRequisitionItems] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Draft Item
    |--------------------------------------------------------------------------
    */

    const [draftItem, setDraftItem] = useState<PurchaseItemForm>(EMPTY_ITEM);

    const [draftError, setDraftError] = useState<string | null>(null);

    const [productSearchVersion, setProductSearchVersion] = useState(0);

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const { data, setData, post, processing, errors, clearErrors, transform } =
        useForm<PurchaseOrderFormData>({
            purchase_mode: purchaseOrder.is_requisition_based
                ? 'requisition'
                : 'free',

            requisition_id: purchaseOrder.requisition_id,

            warehouse_id: purchaseOrder.warehouse_id
                ? String(purchaseOrder.warehouse_id)
                : '',

            vendor_id: String(purchaseOrder.vendor_id),

            order_date: purchaseOrder.order_date ?? '',

            expected_delivery: purchaseOrder.expected_delivery ?? '',

            document: null,

            remove_document: false,

            items: purchaseOrder.purchase_items.map((item) => ({
                ...item,

                quantity: Number(item.quantity),

                unit_price: Number(item.unit_price),

                tax_ids: item.tax_ids.map(String),
            })),

            shipping_cost: purchaseOrder.shipping_cost ?? '',

            order_discount: purchaseOrder.order_discount ?? '',

            note: purchaseOrder.note ?? '',
        });

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    const currencySymbol = activeCurrency?.symbol ?? '$';

    /*
    |--------------------------------------------------------------------------
    | Tax Map
    |--------------------------------------------------------------------------
    */

    const taxRateMap = useMemo(
        () =>
            new Map(
                taxes.map((tax) => [String(tax.id), Number(tax.rate) || 0]),
            ),
        [taxes],
    );

    /*
    |--------------------------------------------------------------------------
    | Products Already Added
    |--------------------------------------------------------------------------
    */

    const selectedProductIds = useMemo(
        () => new Set(data.items.map((item) => item.item_id)),
        [data.items],
    );

    /*
    |--------------------------------------------------------------------------
    | Tax / Line Calculation
    |--------------------------------------------------------------------------
    */

    const lineTotal = useCallback(
        (item: PurchaseItemForm) => {
            const base =
                (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);

            const taxAmount = item.tax_ids.reduce((total, taxId) => {
                const rate = taxRateMap.get(String(taxId)) ?? 0;

                return total + (base * rate) / 100;
            }, 0);

            return base + taxAmount;
        },
        [taxRateMap],
    );

    /*
    |--------------------------------------------------------------------------
    | Totals
    |--------------------------------------------------------------------------
    */

    const totals = useMemo(() => {
        let subTotal = 0;

        let orderTax = 0;

        data.items.forEach((item) => {
            const base =
                (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);

            const itemTax = item.tax_ids.reduce((total, taxId) => {
                const rate = taxRateMap.get(String(taxId)) ?? 0;

                return total + (base * rate) / 100;
            }, 0);

            subTotal += base;

            orderTax += itemTax;
        });

        const shippingCost = Number(data.shipping_cost) || 0;

        const orderDiscount = Number(data.order_discount) || 0;

        return {
            totalItems: data.items.length,

            subTotal,

            orderTax,

            shippingCost,

            orderDiscount,

            grandTotal: subTotal + orderTax - orderDiscount + shippingCost,
        };
    }, [data.items, data.order_discount, data.shipping_cost, taxRateMap]);

    /*
    |--------------------------------------------------------------------------
    | Reset Draft
    |--------------------------------------------------------------------------
    */

    const resetDraft = () => {
        setDraftItem(EMPTY_ITEM);

        setDraftError(null);

        setProductSearchVersion((current) => current + 1);
    };

    /*
    |--------------------------------------------------------------------------
    | Load Brands
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const controller = new AbortController();

        const loadBrands = async () => {
            setLoadingBrands(true);

            try {
                const response = await fetch(
                    '/requisition-get-product-brands?keyword=',
                    {
                        signal: controller.signal,

                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error('Failed to load brands.');
                }

                setBrands(await response.json());
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return;
                }

                console.error(error);
            } finally {
                setLoadingBrands(false);
            }
        };

        void loadBrands();

        return () => {
            controller.abort();
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Load Categories
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const controller = new AbortController();

        const loadCategories = async () => {
            setLoadingCategories(true);

            try {
                const response = await fetch(
                    '/requisition-get-product-categories?keyword=',
                    {
                        signal: controller.signal,

                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error('Failed to load categories.');
                }

                setCategories(await response.json());
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return;
                }

                console.error(error);
            } finally {
                setLoadingCategories(false);
            }
        };

        void loadCategories();

        return () => {
            controller.abort();
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Load Subcategories
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (categoryId === null) {
            setSubcategories([]);

            setSubcategoryId(null);

            return;
        }

        const controller = new AbortController();

        const loadSubcategories = async () => {
            setLoadingSubcategories(true);

            try {
                const params = new URLSearchParams({
                    category_id: String(categoryId),

                    keyword: '',
                });

                const response = await fetch(
                    `/requisition-get-product-subcategories?${params.toString()}`,
                    {
                        signal: controller.signal,

                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error('Failed to load subcategories.');
                }

                setSubcategories(await response.json());
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return;
                }

                console.error(error);

                setSubcategories([]);
            } finally {
                setLoadingSubcategories(false);
            }
        };

        void loadSubcategories();

        return () => {
            controller.abort();
        };
    }, [categoryId]);

    /*
    |--------------------------------------------------------------------------
    | Requisition Search
    |--------------------------------------------------------------------------
    |
    | Keep the current requisition available in edit mode even if all of its
    | quantity is currently reserved by this Purchase Order.
    |
    */

    const searchRequisitions = useCallback(
        async (
            query: string,

            signal?: AbortSignal,
        ) => {
            const results = await searchApprovedRequisitions(query, signal);

            const current = purchaseOrder.requisition;

            if (!current) {
                return results;
            }

            const normalized = query.trim().toLowerCase();

            const matchesCurrent =
                normalized === '' ||
                current.requisition_id.toLowerCase().includes(normalized) ||
                (current.purpose ?? '').toLowerCase().includes(normalized);

            const exists = results.some((item) => item.id === current.id);

            if (matchesCurrent && !exists) {
                return [current, ...results];
            }

            return results;
        },
        [purchaseOrder.requisition],
    );

    /*
    |--------------------------------------------------------------------------
    | Mode Change
    |--------------------------------------------------------------------------
    */

    const handleModeChange = (mode: PurchaseMode) => {
        setData('purchase_mode', mode);

        setData('requisition_id', null);

        setData('items', []);

        clearErrors();

        setSelectedRequisition(null);

        setRequisitionMeta(null);

        setRequisitionItems([]);

        setBrandId(null);

        setCategoryId(null);

        setSubcategoryId(null);

        setSubcategories([]);

        resetDraft();
    };

    /*
    |--------------------------------------------------------------------------
    | Map Requisition Item To Purchase Item
    |--------------------------------------------------------------------------
    */

    const mapRequisitionItem = (
        item: RequisitionProduct,
    ): PurchaseItemForm => ({
        requisition_item_id: item.requisition_item_id,

        item_id: item.item_id,

        code: item.code,

        name: item.name,

        unit: item.unit,

        quantity: Number(item.remaining_quantity),

        max_quantity: Number(item.remaining_quantity),

        unit_price: Number(item.suggested_rate) || 0,

        tax_ids: [],
    });

    /*
    |--------------------------------------------------------------------------
    | Load Requisition Items
    |--------------------------------------------------------------------------
    */

    const loadRequisitionItems = useCallback(
        async (
            requisitionId: number,

            autoLoad = true,
        ) => {
            setLoadingRequisitionItems(true);

            try {
                let payload: RequisitionItemsResponse;

                /*
                    |--------------------------------------------------------------------------
                    | Existing Requisition
                    |--------------------------------------------------------------------------
                    |
                    | Use controller-provided values because they exclude the
                    | Purchase Order currently being edited.
                    |
                    */

                if (requisitionId === purchaseOrder.requisition_id) {
                    payload = {
                        meta: purchaseOrder.requisition
                            ? {
                                  id: purchaseOrder.requisition.id,

                                  requisition_id:
                                      purchaseOrder.requisition.requisition_id,

                                  purpose: purchaseOrder.requisition.purpose,

                                  required_date:
                                      purchaseOrder.requisition.required_date,
                              }
                            : {
                                  id: requisitionId,

                                  requisition_id: '',

                                  purpose: null,

                                  required_date: null,
                              },

                        items: initialRequisitionItems,
                    };
                } else {
                    const params = new URLSearchParams({
                        requisition_id: String(requisitionId),
                    });

                    const response = await fetch(
                        `/get-requisition-items-for-po?${params.toString()}`,
                        {
                            headers: {
                                Accept: 'application/json',
                            },
                        },
                    );

                    if (!response.ok) {
                        throw new Error('Failed to load requisition items.');
                    }

                    payload = await response.json();
                }

                setRequisitionMeta(payload.meta);

                setRequisitionItems(payload.items ?? []);

                if (autoLoad) {
                    /*
                        |--------------------------------------------------------------------------
                        | Preserve Current Prices / Taxes When Reloading Same Requisition
                        |--------------------------------------------------------------------------
                        */

                    const existingMap = new Map(
                        data.items.map((currentItem) => [
                            currentItem.requisition_item_id,

                            currentItem,
                        ]),
                    );

                    setData(
                        'items',
                        (payload.items ?? []).map((item) => {
                            const existing = existingMap.get(
                                item.requisition_item_id,
                            );

                            if (
                                existing &&
                                requisitionId === purchaseOrder.requisition_id
                            ) {
                                return {
                                    ...existing,

                                    max_quantity: Number(
                                        item.remaining_quantity,
                                    ),
                                };
                            }

                            return mapRequisitionItem(item);
                        }),
                    );
                }

                resetDraft();
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingRequisitionItems(false);
            }
        },
        [
            data.items,
            initialRequisitionItems,
            purchaseOrder.requisition,
            purchaseOrder.requisition_id,
            setData,
        ],
    );

    /*
    |--------------------------------------------------------------------------
    | Requisition Select
    |--------------------------------------------------------------------------
    */

    const handleRequisitionSelect = (requisition: RequisitionSuggestion) => {
        setSelectedRequisition(requisition);

        setData('requisition_id', requisition.id);

        clearErrors('requisition_id');

        void loadRequisitionItems(requisition.id, true);
    };

    const handleRequisitionClear = () => {
        setSelectedRequisition(null);

        setRequisitionMeta(null);

        setRequisitionItems([]);

        setData('requisition_id', null);

        setData('items', []);

        resetDraft();
    };

    /*
    |--------------------------------------------------------------------------
    | Free Product Search
    |--------------------------------------------------------------------------
    */

    const searchFreeProducts = useCallback(
        async (
            query: string,

            signal?: AbortSignal,
        ): Promise<ItemSuggestion[]> => {
            if (categoryId === null) {
                return [];
            }

            const params = new URLSearchParams();

            params.set('keyword', query);

            params.set('category_id', String(categoryId));

            if (subcategoryId !== null) {
                params.set('subcategory_id', String(subcategoryId));
            }

            if (brandId !== null) {
                params.set('brand_id', String(brandId));
            }

            const response = await fetch(
                `/requisition-get-product?${params.toString()}`,
                {
                    signal,

                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Failed to search products.');
            }

            const products = (await response.json()) as ProductSuggestion[];

            return products
                .filter((product) => !selectedProductIds.has(product.id))
                .map((product) => ({
                    search_id: `free-${product.id}`,

                    requisition_item_id: null,

                    item_id: product.id,

                    code: product.code,

                    name: product.name,

                    unit: product.unit ?? '',

                    quantity: 1,

                    max_quantity: null,

                    unit_price: 0,
                }));
        },
        [brandId, categoryId, selectedProductIds, subcategoryId],
    );

    /*
    |--------------------------------------------------------------------------
    | Requisition Product Search
    |--------------------------------------------------------------------------
    */

    const searchRequisitionProducts = useCallback(
        async (query: string): Promise<ItemSuggestion[]> => {
            const normalized = query.trim().toLowerCase();

            return requisitionItems
                .filter((item) => !selectedProductIds.has(item.item_id))
                .filter((item) => {
                    if (!normalized) {
                        return true;
                    }

                    return [item.name, item.code].some((value) =>
                        String(value ?? '')
                            .toLowerCase()
                            .includes(normalized),
                    );
                })
                .map((item) => ({
                    search_id: `req-${item.requisition_item_id}`,

                    requisition_item_id: item.requisition_item_id,

                    item_id: item.item_id,

                    code: item.code,

                    name: item.name,

                    unit: item.unit,

                    quantity: Number(item.remaining_quantity),

                    max_quantity: Number(item.remaining_quantity),

                    unit_price: Number(item.suggested_rate) || 0,
                }));
        },
        [requisitionItems, selectedProductIds],
    );

    const searchItems = useCallback(
        (
            query: string,

            signal?: AbortSignal,
        ) =>
            data.purchase_mode === 'requisition'
                ? searchRequisitionProducts(query)
                : searchFreeProducts(query, signal),
        [data.purchase_mode, searchFreeProducts, searchRequisitionProducts],
    );

    /*
    |--------------------------------------------------------------------------
    | Item Select
    |--------------------------------------------------------------------------
    */

    const handleItemSelect = (item: ItemSuggestion) => {
        if (selectedProductIds.has(item.item_id)) {
            setDraftError('This item is already added.');

            setProductSearchVersion((current) => current + 1);

            return;
        }

        setDraftItem({
            requisition_item_id: item.requisition_item_id,

            item_id: item.item_id,

            code: item.code,

            name: item.name,

            unit: item.unit,

            quantity: item.quantity,

            max_quantity: item.max_quantity,

            unit_price: item.unit_price,

            tax_ids: [],
        });

        setDraftError(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Add Item
    |--------------------------------------------------------------------------
    */

    const addDraftItem = () => {
        if (!draftItem.item_id || !draftItem.name.trim()) {
            setDraftError('Please select an item first.');

            return;
        }

        if (!draftItem.unit.trim()) {
            setDraftError('Selected item does not have a unit.');

            return;
        }

        if (Number(draftItem.quantity) <= 0) {
            setDraftError('Quantity must be greater than 0.');

            return;
        }

        if (
            draftItem.max_quantity !== null &&
            Number(draftItem.quantity) > Number(draftItem.max_quantity)
        ) {
            setDraftError(
                `Quantity cannot exceed remaining quantity (${draftItem.max_quantity}).`,
            );

            return;
        }

        if (selectedProductIds.has(draftItem.item_id)) {
            setDraftError('This item is already added.');

            return;
        }

        setData('items', [...data.items, draftItem]);

        clearErrors('items');

        resetDraft();
    };

    const updateItem = <K extends keyof PurchaseItemForm>(
        index: number,
        field: K,
        value: PurchaseItemForm[K],
    ) => {
        const items = [...data.items];

        items[index] = {
            ...items[index],

            [field]: value,
        };

        setData('items', items);
    };

    const removeItem = (index: number) => {
        setData(
            'items',
            data.items.filter((_, itemIndex) => itemIndex !== index),
        );

        setProductSearchVersion((current) => current + 1);
    };

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const handleCategoryChange = (value: string) => {
        setCategoryId(value ? Number(value) : null);

        setSubcategoryId(null);

        setSubcategories([]);

        resetDraft();
    };

    const handleSubcategoryChange = (value: string) => {
        setSubcategoryId(value ? Number(value) : null);

        resetDraft();
    };

    const handleBrandChange = (value: string) => {
        setBrandId(value ? Number(value) : null);

        resetDraft();
    };

    /*
    |--------------------------------------------------------------------------
    | Document
    |--------------------------------------------------------------------------
    */

    const handleDocumentChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        setData('document', file);

        if (file) {
            setData('remove_document', false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setDraftError(null);

        if (data.purchase_mode === 'requisition' && !data.requisition_id) {
            setDraftError('Please select an approved requisition.');

            return;
        }

        if (data.items.length === 0) {
            setDraftError('Please add at least one item.');

            return;
        }

        const invalidItem = data.items.find(
            (item) =>
                Number(item.quantity) <= 0 ||
                (item.max_quantity !== null &&
                    Number(item.quantity) > Number(item.max_quantity)),
        );

        if (invalidItem) {
            setDraftError('One or more item quantities are invalid.');

            return;
        }

        /*
            |--------------------------------------------------------------------------
            | PUT via Method Spoofing
            |--------------------------------------------------------------------------
            |
            | This allows document upload to continue using FormData.
            |
            */

        transform((current) => ({
            _method: 'put',

            purchase_mode: current.purchase_mode,

            requisition_id:
                current.purchase_mode === 'requisition'
                    ? current.requisition_id
                    : null,

            warehouse_id: current.warehouse_id,

            vendor_id: current.vendor_id,

            order_date: current.order_date,

            expected_delivery: current.expected_delivery,

            document: current.document,

            remove_document: current.remove_document,

            items: current.items.map((item) => ({
                requisition_item_id:
                    current.purchase_mode === 'requisition'
                        ? item.requisition_item_id
                        : null,

                item_id: item.item_id,

                unit: item.unit,

                quantity: item.quantity,

                unit_price: item.unit_price,

                tax_ids: item.tax_ids,
            })),

            shipping_cost: current.shipping_cost,

            order_discount: current.order_discount,

            note: current.note,
        }));

        post(`/purchase-order/${purchaseOrder.id}/update`, {
            forceFormData: true,

            preserveScroll: true,
        });
    };

    const currentDocumentName = purchaseOrder.document?.split('/').pop() ?? '';

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title={`Edit ${purchaseOrder.order_id}`} />

            <PageTitle title="Purchases" />

            <div className="container-fluid">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-8">
                            <div className="card p-4">
                                {/*
                                |--------------------------------------------------------------------------
                                | Purchase Mode
                                |--------------------------------------------------------------------------
                                */}

                                <div className="mb-3">
                                    <label className="form-label text-gray">
                                        Purchase Mode{' '}
                                        <span className="text-danger">*</span>
                                    </label>

                                    <div className="d-flex gap-4 flex-wrap">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id="mode_requisition"
                                                checked={
                                                    data.purchase_mode ===
                                                    'requisition'
                                                }
                                                disabled={processing}
                                                onChange={() =>
                                                    handleModeChange(
                                                        'requisition',
                                                    )
                                                }
                                            />

                                            <label
                                                className="form-check-label"
                                                htmlFor="mode_requisition"
                                            >
                                                Requisition Based
                                            </label>
                                        </div>

                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id="mode_free"
                                                checked={
                                                    data.purchase_mode ===
                                                    'free'
                                                }
                                                disabled={processing}
                                                onChange={() =>
                                                    handleModeChange('free')
                                                }
                                            />

                                            <label
                                                className="form-check-label"
                                                htmlFor="mode_free"
                                            >
                                                Free Purchase
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/*
                                |--------------------------------------------------------------------------
                                | Requisition
                                |--------------------------------------------------------------------------
                                */}

                                {data.purchase_mode === 'requisition' && (
                                    <div className="mb-3">
                                        <FormField>
                                            <FormLabel required>
                                                Requisition
                                            </FormLabel>

                                            <SuggestionSearchInput<RequisitionSuggestion>
                                                key={`edit-requisition-${data.purchase_mode}-${selectedRequisition?.id ?? 'none'}`}
                                                searchFn={searchRequisitions}
                                                idKey="id"
                                                labelKey="label"
                                                secondaryLabelKey="purpose"
                                                defaultValue={
                                                    selectedRequisition?.label ??
                                                    ''
                                                }
                                                placeholder="Search approved requisitions..."
                                                showSearchIcon
                                                clearOnFocus={false}
                                                disabled={processing}
                                                emptyLabel="No PO-eligible approved requisition found."
                                                onSelect={
                                                    handleRequisitionSelect
                                                }
                                                onClear={handleRequisitionClear}
                                            />

                                            <FormError
                                                error={errors.requisition_id}
                                            />
                                        </FormField>

                                        {selectedRequisition && (
                                            <div
                                                className="mt-2 rounded"
                                                style={{
                                                    background: '#f8f9fa',

                                                    borderLeft:
                                                        '4px solid #0d6efd',

                                                    padding: '10px 14px',

                                                    fontSize: '13px',
                                                }}
                                            >
                                                <div>
                                                    <strong>Selected:</strong>{' '}
                                                    {selectedRequisition.label}
                                                </div>

                                                {requisitionMeta?.purpose && (
                                                    <div>
                                                        <strong>
                                                            Purpose:
                                                        </strong>{' '}
                                                        {
                                                            requisitionMeta.purpose
                                                        }
                                                    </div>
                                                )}

                                                {requisitionMeta?.required_date && (
                                                    <div>
                                                        <strong>
                                                            Required Date:
                                                        </strong>{' '}
                                                        {
                                                            requisitionMeta.required_date
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/*
                                |--------------------------------------------------------------------------
                                | Warehouse / Supplier
                                |--------------------------------------------------------------------------
                                */}

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel required>
                                                    Warehouse
                                                </FormLabel>

                                                <Select
                                                    id="warehouse_id"
                                                    value={data.warehouse_id}
                                                    disabled={processing}
                                                    error={errors.warehouse_id}
                                                    onChange={(event) =>
                                                        setData(
                                                            'warehouse_id',
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select Warehouse
                                                    </option>

                                                    {warehouses.map(
                                                        (warehouse) => (
                                                            <option
                                                                key={
                                                                    warehouse.id
                                                                }
                                                                value={
                                                                    warehouse.id
                                                                }
                                                            >
                                                                {warehouse.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </Select>

                                                <FormError
                                                    error={errors.warehouse_id}
                                                />
                                            </FormField>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel required>
                                                    Supplier
                                                </FormLabel>

                                                <Select
                                                    id="vendor_id"
                                                    value={data.vendor_id}
                                                    disabled={processing}
                                                    error={errors.vendor_id}
                                                    onChange={(event) =>
                                                        setData(
                                                            'vendor_id',
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select Supplier
                                                    </option>

                                                    {vendors.map((vendor) => (
                                                        <option
                                                            key={vendor.id}
                                                            value={vendor.id}
                                                        >
                                                            {vendor.name}
                                                        </option>
                                                    ))}
                                                </Select>

                                                <FormError
                                                    error={errors.vendor_id}
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                </div>

                                {/*
                                |--------------------------------------------------------------------------
                                | Dates / Document
                                |--------------------------------------------------------------------------
                                */}

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <FormField>
                                                        <FormLabel
                                                            htmlFor="order_date"
                                                            required
                                                        >
                                                            Purchase Date
                                                        </FormLabel>

                                                        <DatePicker
                                                            id="order_date"
                                                            mode="single"
                                                            value={
                                                                data.order_date
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            error={
                                                                errors.order_date
                                                            }
                                                            placeholder="Select date"
                                                            onChange={(value) =>
                                                                setData(
                                                                    'order_date',
                                                                    value ?? '',
                                                                )
                                                            }
                                                        />

                                                        <FormError
                                                            error={
                                                                errors.order_date
                                                            }
                                                        />
                                                    </FormField>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <FormField>
                                                        <FormLabel
                                                            htmlFor="expected_delivery"
                                                            required
                                                        >
                                                            Expected Delivery
                                                            Date
                                                        </FormLabel>

                                                        <DatePicker
                                                            id="expected_delivery"
                                                            mode="single"
                                                            value={
                                                                data.expected_delivery
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            error={
                                                                errors.expected_delivery
                                                            }
                                                            placeholder="Select date"
                                                            onChange={(value) =>
                                                                setData(
                                                                    'expected_delivery',
                                                                    value ?? '',
                                                                )
                                                            }
                                                        />

                                                        <FormError
                                                            error={
                                                                errors.expected_delivery
                                                            }
                                                        />
                                                    </FormField>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel>
                                                    Attach Document (Optional)
                                                </FormLabel>

                                                <Input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    disabled={processing}
                                                    onChange={
                                                        handleDocumentChange
                                                    }
                                                />

                                                <FormError
                                                    error={errors.document}
                                                />

                                                {purchaseOrder.document && (
                                                    <div className="mt-2">
                                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                                            <small
                                                                className={
                                                                    data.remove_document
                                                                        ? 'text-decoration-line-through text-muted'
                                                                        : 'text-muted'
                                                                }
                                                            >
                                                                Current:{' '}
                                                                {
                                                                    currentDocumentName
                                                                }
                                                            </small>

                                                            <button
                                                                type="button"
                                                                className={
                                                                    data.remove_document
                                                                        ? 'btn btn-sm btn-outline-secondary'
                                                                        : 'btn btn-sm btn-outline-danger'
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    setData(
                                                                        'remove_document',
                                                                        !data.remove_document,
                                                                    )
                                                                }
                                                            >
                                                                {data.remove_document
                                                                    ? 'Keep'
                                                                    : 'Remove'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </FormField>
                                        </div>
                                    </div>
                                </div>

                                {/*
                                |--------------------------------------------------------------------------
                                | Free Purchase Filters
                                |--------------------------------------------------------------------------
                                */}

                                {data.purchase_mode === 'free' && (
                                    <div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <FormField>
                                                        <FormLabel>
                                                            Category
                                                        </FormLabel>

                                                        <Select
                                                            value={
                                                                categoryId ?? ''
                                                            }
                                                            disabled={
                                                                processing ||
                                                                loadingCategories
                                                            }
                                                            onChange={(event) =>
                                                                handleCategoryChange(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                {loadingCategories
                                                                    ? 'Loading categories...'
                                                                    : 'Select Category'}
                                                            </option>

                                                            {categories.map(
                                                                (category) => (
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
                                                    </FormField>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <FormField>
                                                        <FormLabel>
                                                            Sub Category
                                                        </FormLabel>

                                                        <Select
                                                            value={
                                                                subcategoryId ??
                                                                ''
                                                            }
                                                            disabled={
                                                                processing ||
                                                                categoryId ===
                                                                    null ||
                                                                loadingSubcategories
                                                            }
                                                            onChange={(event) =>
                                                                handleSubcategoryChange(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                {loadingSubcategories
                                                                    ? 'Loading sub categories...'
                                                                    : categoryId
                                                                      ? 'Select Sub Category'
                                                                      : 'Select Category First'}
                                                            </option>

                                                            {subcategories.map(
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
                                                    </FormField>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <FormField>
                                                        <FormLabel>
                                                            Brand
                                                        </FormLabel>

                                                        <Select
                                                            value={
                                                                brandId ?? ''
                                                            }
                                                            disabled={
                                                                processing ||
                                                                loadingBrands
                                                            }
                                                            onChange={(event) =>
                                                                handleBrandChange(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                {loadingBrands
                                                                    ? 'Loading brands...'
                                                                    : 'Select Brand'}
                                                            </option>

                                                            {brands.map(
                                                                (brand) => (
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
                                                    </FormField>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <hr />

                                {/*
                                |--------------------------------------------------------------------------
                                | Product Search
                                |--------------------------------------------------------------------------
                                */}

                                <div className="mt-4">
                                    <div className="row mb-3 align-items-end">
                                        <div className="col-md-8">
                                            <SuggestionSearchInput<ItemSuggestion>
                                                key={[
                                                    'edit-po-item',

                                                    data.purchase_mode,

                                                    data.requisition_id ??
                                                        'no-req',

                                                    categoryId ?? 'no-cat',

                                                    subcategoryId ?? 'no-sub',

                                                    brandId ?? 'no-brand',

                                                    productSearchVersion,
                                                ].join('-')}
                                                searchFn={searchItems}
                                                idKey="search_id"
                                                labelKey="name"
                                                secondaryLabelKey="code"
                                                placeholder={
                                                    data.purchase_mode ===
                                                    'requisition'
                                                        ? data.requisition_id
                                                            ? 'Search items...'
                                                            : 'Select requisition first'
                                                        : categoryId
                                                          ? 'Search items...'
                                                          : 'Select category first'
                                                }
                                                showSearchIcon
                                                clearOnFocus={false}
                                                disabled={
                                                    processing ||
                                                    (data.purchase_mode ===
                                                        'requisition' &&
                                                        !data.requisition_id) ||
                                                    (data.purchase_mode ===
                                                        'free' &&
                                                        categoryId === null)
                                                }
                                                emptyLabel="No items available."
                                                renderOption={(item) => (
                                                    <div className="d-flex justify-content-between gap-2">
                                                        <div>
                                                            <div className="fw-semibold">
                                                                {item.name}
                                                            </div>

                                                            <small className="text-muted">
                                                                {item.code} •{' '}
                                                                {item.unit}
                                                            </small>
                                                        </div>

                                                        {item.max_quantity !==
                                                            null && (
                                                            <small className="text-muted text-nowrap">
                                                                {
                                                                    item.max_quantity
                                                                }{' '}
                                                                left
                                                            </small>
                                                        )}
                                                    </div>
                                                )}
                                                onSelect={handleItemSelect}
                                            />

                                            {draftError && (
                                                <div className="text-danger small mt-1">
                                                    {draftError}
                                                </div>
                                            )}

                                            <FormError error={errors.items} />
                                        </div>

                                        <div className="col-md-4 text-end">
                                            {data.purchase_mode ===
                                                'requisition' &&
                                                data.requisition_id && (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        appearance="outline"
                                                        disabled={
                                                            processing ||
                                                            loadingRequisitionItems
                                                        }
                                                        onClick={() =>
                                                            void loadRequisitionItems(
                                                                data.requisition_id!,
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        {loadingRequisitionItems
                                                            ? 'Loading...'
                                                            : 'Load All Remaining Items'}
                                                    </Button>
                                                )}
                                        </div>
                                    </div>

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Items
                                    |--------------------------------------------------------------------------
                                    */}

                                    <Table className="table-bordered border-bottom">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead
                                                    style={{
                                                        minWidth: '60px',
                                                    }}
                                                >
                                                    SL
                                                </TableHead>

                                                <TableHead
                                                    style={{
                                                        minWidth: '200px',
                                                    }}
                                                >
                                                    Item
                                                </TableHead>

                                                <TableHead
                                                    style={{
                                                        minWidth: '110px',
                                                    }}
                                                >
                                                    Unit
                                                </TableHead>

                                                <TableHead
                                                    style={{
                                                        minWidth: '120px',
                                                    }}
                                                >
                                                    Quantity
                                                </TableHead>

                                                <TableHead
                                                    style={{
                                                        minWidth: '120px',
                                                    }}
                                                >
                                                    Price
                                                </TableHead>

                                                <TableHead
                                                    style={{
                                                        minWidth: '123px',
                                                    }}
                                                >
                                                    Tax
                                                </TableHead>

                                                <TableHead
                                                    style={{
                                                        width: '11%',
                                                    }}
                                                >
                                                    Line Total
                                                </TableHead>

                                                <TableHead
                                                    style={{
                                                        width: '8%',

                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    Action
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Draft Row
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableRow>
                                                <TableCell>New</TableCell>

                                                <TableCell>
                                                    <textarea
                                                        rows={2}
                                                        className="form-control"
                                                        placeholder="Item name"
                                                        value={draftItem.name}
                                                        readOnly
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        value={draftItem.unit}
                                                        placeholder="Unit"
                                                        readOnly
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={
                                                            draftItem.quantity
                                                        }
                                                        disabled={processing}
                                                        className={
                                                            draftItem.max_quantity !==
                                                                null &&
                                                            Number(
                                                                draftItem.quantity,
                                                            ) >
                                                                Number(
                                                                    draftItem.max_quantity,
                                                                )
                                                                ? 'is-invalid'
                                                                : undefined
                                                        }
                                                        onChange={(event) =>
                                                            setDraftItem(
                                                                (current) => ({
                                                                    ...current,

                                                                    quantity:
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                }),
                                                            )
                                                        }
                                                    />

                                                    {draftItem.max_quantity !==
                                                        null && (
                                                        <small
                                                            className={
                                                                Number(
                                                                    draftItem.quantity,
                                                                ) >
                                                                Number(
                                                                    draftItem.max_quantity,
                                                                )
                                                                    ? 'text-danger'
                                                                    : 'text-muted'
                                                            }
                                                        >
                                                            Max:{' '}
                                                            {
                                                                draftItem.max_quantity
                                                            }
                                                        </small>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            draftItem.unit_price
                                                        }
                                                        disabled={processing}
                                                        onChange={(event) =>
                                                            setDraftItem(
                                                                (current) => ({
                                                                    ...current,

                                                                    unit_price:
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <TaxMultiSelect
                                                        taxes={taxes}
                                                        value={
                                                            draftItem.tax_ids
                                                        }
                                                        disabled={processing}
                                                        onChange={(taxIds) =>
                                                            setDraftItem(
                                                                (current) => ({
                                                                    ...current,

                                                                    tax_ids:
                                                                        taxIds,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <span className="fw-semibold">
                                                        {lineTotal(
                                                            draftItem,
                                                        ).toFixed(2)}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-primary"
                                                        disabled={processing}
                                                        onClick={addDraftItem}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                </TableCell>
                                            </TableRow>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Existing / Added Items
                                                |--------------------------------------------------------------------------
                                                */}

                                            {data.items.map((item, index) => {
                                                const maxExceeded =
                                                    item.max_quantity !==
                                                        null &&
                                                    Number(item.quantity) >
                                                        Number(
                                                            item.max_quantity,
                                                        );

                                                return (
                                                    <TableRow
                                                        key={`${item.requisition_item_id ?? 'free'}-${item.item_id}-${index}`}
                                                    >
                                                        <TableCell>
                                                            {index + 1}
                                                        </TableCell>

                                                        <TableCell>
                                                            <textarea
                                                                rows={2}
                                                                className="form-control"
                                                                value={
                                                                    item.name
                                                                }
                                                                readOnly
                                                            />

                                                            {item.code && (
                                                                <small className="text-muted">
                                                                    {item.code}
                                                                </small>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <Input
                                                                value={
                                                                    item.unit
                                                                }
                                                                readOnly
                                                            />
                                                        </TableCell>

                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0.01"
                                                                step="0.01"
                                                                value={
                                                                    item.quantity
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                className={
                                                                    maxExceeded
                                                                        ? 'is-invalid'
                                                                        : undefined
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateItem(
                                                                        index,
                                                                        'quantity',
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                            />

                                                            {item.max_quantity !==
                                                                null && (
                                                                <small
                                                                    className={
                                                                        maxExceeded
                                                                            ? 'text-danger'
                                                                            : 'text-muted'
                                                                    }
                                                                >
                                                                    Max:{' '}
                                                                    {
                                                                        item.max_quantity
                                                                    }
                                                                </small>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    item.unit_price
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateItem(
                                                                        index,
                                                                        'unit_price',
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                            />
                                                        </TableCell>

                                                        <TableCell>
                                                            <TaxMultiSelect
                                                                taxes={taxes}
                                                                value={
                                                                    item.tax_ids
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                onChange={(
                                                                    taxIds,
                                                                ) =>
                                                                    updateItem(
                                                                        index,
                                                                        'tax_ids',
                                                                        taxIds,
                                                                    )
                                                                }
                                                            />
                                                        </TableCell>

                                                        <TableCell>
                                                            <span className="fw-semibold">
                                                                {lineTotal(
                                                                    item,
                                                                ).toFixed(2)}
                                                            </span>
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-danger"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    removeItem(
                                                                        index,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}

                                            {data.items.length === 0 && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={8}
                                                        className="text-center text-muted py-3"
                                                    >
                                                        No purchase items added.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                        {/*
                        |--------------------------------------------------------------------------
                        | Summary
                        |--------------------------------------------------------------------------
                        */}

                        <div className="col-md-4">
                            <div className="card p-4">
                                <div className="mb-3">
                                    <FormField>
                                        <FormLabel>
                                            Shipping Cost (Optional)
                                        </FormLabel>

                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.shipping_cost}
                                            disabled={processing}
                                            error={errors.shipping_cost}
                                            onChange={(event) =>
                                                setData(
                                                    'shipping_cost',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={errors.shipping_cost}
                                        />
                                    </FormField>
                                </div>

                                <div className="mb-3">
                                    <FormField>
                                        <FormLabel>
                                            Order Discount (Optional)
                                        </FormLabel>

                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.order_discount}
                                            disabled={processing}
                                            error={errors.order_discount}
                                            onChange={(event) =>
                                                setData(
                                                    'order_discount',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={errors.order_discount}
                                        />
                                    </FormField>
                                </div>

                                <table
                                    className="table mb-3"
                                    style={{
                                        border: '1px solid #c7ecee',
                                    }}
                                >
                                    <tbody>
                                        <tr
                                            style={{
                                                backgroundColor: '#c7ecee',
                                            }}
                                        >
                                            <th>Total Items</th>

                                            <th>{totals.totalItems} Items</th>
                                        </tr>

                                        <tr>
                                            <th>Sub Total (excl. tax)</th>

                                            <td>
                                                {currencySymbol}{' '}
                                                {totals.subTotal.toFixed(2)}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>Total Tax</th>

                                            <td>
                                                {currencySymbol}{' '}
                                                {totals.orderTax.toFixed(2)}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>Order Discount</th>

                                            <td>
                                                {currencySymbol}{' '}
                                                {totals.orderDiscount.toFixed(
                                                    2,
                                                )}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>Shipping Cost</th>

                                            <td>
                                                {currencySymbol}{' '}
                                                {totals.shippingCost.toFixed(2)}
                                            </td>
                                        </tr>

                                        <tr
                                            style={{
                                                backgroundColor: '#c7ecee',
                                            }}
                                        >
                                            <th>Grand Total</th>

                                            <td>
                                                {currencySymbol}{' '}
                                                {totals.grandTotal.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="mb-3">
                                    <FormField>
                                        <FormLabel>Note (Optional)</FormLabel>

                                        <textarea
                                            className="form-control"
                                            rows={2}
                                            value={data.note}
                                            disabled={processing}
                                            onChange={(event) =>
                                                setData(
                                                    'note',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <FormError error={errors.note} />
                                    </FormField>
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        appearance="outline"
                                        disabled={processing}
                                        onClick={() =>
                                            router.visit('/purchase-order')
                                        }
                                    >
                                        Back
                                    </Button>

                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Updating...'
                                            : 'Update Purchase'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
