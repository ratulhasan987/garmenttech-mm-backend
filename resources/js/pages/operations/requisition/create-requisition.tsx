import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react';

import { Head, router, useForm } from '@inertiajs/react';

import { Check, Trash2 } from 'react-feather';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

import { DatePicker } from '@/components/ui/form/date-picker';

import { FileDropzone } from '@/components/ui/form/file-dropzone';

import { Input } from '@/components/ui/form/input';

import { Select } from '@/components/ui/form/select';

import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

import { Textarea } from '@/components/ui/form/textarea';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { NumberInput } from '@/components/ui/form/number-input';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Priority = 'Low' | 'Medium' | 'High';

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

type ProductSuggestion = {
    id: number;
    code: string;
    name: string;
    unit: string;
};

type RequisitionItemForm = {
    product_id: number;

    /*
    |--------------------------------------------------------------------------
    | UI Data
    |--------------------------------------------------------------------------
    */

    product_code: string;

    product_name: string;

    /*
    |--------------------------------------------------------------------------
    | Database Data
    |--------------------------------------------------------------------------
    */

    unit: string;

    quantity: number;

    priority: Priority;

    required_date: string;
};

type DraftItem = {
    product_id: number | null;

    product_code: string;

    product_name: string;

    unit: string;

    quantity: number;

    priority: Priority;

    required_date: string;
};

type RequisitionFormData = {
    required_date: string;

    files: File[];

    items: RequisitionItemForm[];
};

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const MAX_FILES = 5;

const MAX_TOTAL_FILE_SIZE = 30 * 1024 * 1024;

/*
|--------------------------------------------------------------------------
| Empty Draft Item
|--------------------------------------------------------------------------
*/

function createEmptyDraftItem(): DraftItem {
    return {
        product_id: null,

        product_code: '',

        product_name: '',

        unit: '',

        quantity: 1,

        priority: 'Medium',

        required_date: '',
    };
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function CreateRequisitionPage() {
    /*
    |--------------------------------------------------------------------------
    | Filter Options
    |--------------------------------------------------------------------------
    */

    const [brands, setBrands] = useState<BrandOption[]>([]);

    const [categories, setCategories] = useState<CategoryOption[]>([]);

    const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);

    /*
    |--------------------------------------------------------------------------
    | Filter State
    |--------------------------------------------------------------------------
    */

    const [brandId, setBrandId] = useState<number | null>(null);

    const [categoryId, setCategoryId] = useState<number | null>(null);

    const [subcategoryId, setSubcategoryId] = useState<number | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Filter Loading
    |--------------------------------------------------------------------------
    */

    const [loadingBrands, setLoadingBrands] = useState(false);

    const [loadingCategories, setLoadingCategories] = useState(false);

    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Draft Item
    |--------------------------------------------------------------------------
    */

    const [draftItem, setDraftItem] = useState<DraftItem>(createEmptyDraftItem);

    /*
    |--------------------------------------------------------------------------
    | Product Search Reset
    |--------------------------------------------------------------------------
    */

    const [productSearchKey, setProductSearchKey] = useState(0);

    /*
    |--------------------------------------------------------------------------
    | Local Errors
    |--------------------------------------------------------------------------
    */

    const [draftError, setDraftError] = useState<string | null>(null);

    const [fileError, setFileError] = useState<string | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const { data, setData, post, processing, errors, clearErrors, transform } =
        useForm<RequisitionFormData>({
            required_date: '',

            files: [],

            items: [],
        });

    /*
    |--------------------------------------------------------------------------
    | Error Helpers
    |--------------------------------------------------------------------------
    */

    const fieldErrors = errors as Record<string, string>;

    const getError = (key: string) => fieldErrors[key];

    /*
    |--------------------------------------------------------------------------
    | Validation Summary
    |--------------------------------------------------------------------------
    */

    const errorMessages = useMemo(
        () => Array.from(new Set(Object.values(fieldErrors).filter(Boolean))),
        [fieldErrors],
    );

    /*
    |--------------------------------------------------------------------------
    | Selected Product IDs
    |--------------------------------------------------------------------------
    */

    const selectedProductIds = useMemo(
        () => new Set(data.items.map((item) => item.product_id)),
        [data.items],
    );

    /*
    |--------------------------------------------------------------------------
    | Reset Product Search
    |--------------------------------------------------------------------------
    */

    const resetProductSearch = () => {
        setProductSearchKey((current) => current + 1);
    };

    /*
    |--------------------------------------------------------------------------
    | Reset Draft Item
    |--------------------------------------------------------------------------
    */

    const resetDraftItem = () => {
        setDraftItem(createEmptyDraftItem());

        setDraftError(null);

        resetProductSearch();
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

                const result = (await response.json()) as BrandOption[];

                setBrands(result);
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

                const result = (await response.json()) as CategoryOption[];

                setCategories(result);
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
    |
    | Subcategories only load when category is selected.
    |
    */

    useEffect(() => {
        /*
            |--------------------------------------------------------------------------
            | No Category
            |--------------------------------------------------------------------------
            */

        if (categoryId === null) {
            setSubcategories([]);

            setSubcategoryId(null);

            return;
        }

        const controller = new AbortController();

        const loadSubcategories = async () => {
            setLoadingSubcategories(true);

            try {
                const params = new URLSearchParams();

                params.set('category_id', String(categoryId));

                params.set('keyword', '');

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

                const result = (await response.json()) as SubcategoryOption[];

                setSubcategories(result);
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
    | Product Search
    |--------------------------------------------------------------------------
    |
    | Category is required.
    |
    | Filters:
    |
    | Category
    |     ↓
    | Category + Subcategory
    |     ↓
    | Category + Subcategory + Brand
    |
    | Brand can also narrow category results even without subcategory.
    |
    */

    const searchProducts = useCallback(
        async (
            query: string,
            signal?: AbortSignal,
        ): Promise<ProductSuggestion[]> => {
            const params = new URLSearchParams();

            params.set('keyword', query);

            /*
                |--------------------------------------------------------------------------
                | Category
                |--------------------------------------------------------------------------
                */

            params.set('category_id', String(categoryId));

            /*
                |--------------------------------------------------------------------------
                | Subcategory - Optional Narrowing
                |--------------------------------------------------------------------------
                */

            if (subcategoryId !== null) {
                params.set('subcategory_id', String(subcategoryId));
            }

            /*
                |--------------------------------------------------------------------------
                | Brand - Optional Narrowing
                |--------------------------------------------------------------------------
                */

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

            /*
                |--------------------------------------------------------------------------
                | Remove Already Added Products
                |--------------------------------------------------------------------------
                */

            return products.filter(
                (product) => !selectedProductIds.has(product.id),
            );
        },
        [brandId, categoryId, subcategoryId, selectedProductIds],
    );

    /*
    |--------------------------------------------------------------------------
    | Category Change
    |--------------------------------------------------------------------------
    */

    const handleCategoryChange = (value: string) => {
        const selectedId = value ? Number(value) : null;

        setCategoryId(selectedId);

        /*
            |--------------------------------------------------------------------------
            | Clear Child Filter
            |--------------------------------------------------------------------------
            */

        setSubcategoryId(null);

        setSubcategories([]);

        resetDraftItem();
    };

    /*
    |--------------------------------------------------------------------------
    | Subcategory Change
    |--------------------------------------------------------------------------
    */

    const handleSubcategoryChange = (value: string) => {
        const selectedId = value ? Number(value) : null;

        setSubcategoryId(selectedId);

        resetDraftItem();
    };

    /*
    |--------------------------------------------------------------------------
    | Brand Change
    |--------------------------------------------------------------------------
    */

    const handleBrandChange = (value: string) => {
        const selectedId = value ? Number(value) : null;

        setBrandId(selectedId);

        resetDraftItem();
    };

    /*
    |--------------------------------------------------------------------------
    | Product Selected
    |--------------------------------------------------------------------------
    */

    const handleProductSelect = (product: ProductSuggestion) => {
        /*
            |--------------------------------------------------------------------------
            | Duplicate Protection
            |--------------------------------------------------------------------------
            */

        if (selectedProductIds.has(product.id)) {
            setDraftError(
                'This product is already included in the requisition.',
            );

            resetProductSearch();

            return;
        }

        setDraftError(null);

        /*
            |--------------------------------------------------------------------------
            | Fill Main Row
            |--------------------------------------------------------------------------
            */

        setDraftItem({
            product_id: product.id,

            product_code: product.code,

            product_name: product.name,

            unit: product.unit ?? '',

            quantity: 1,

            priority: 'Medium',

            required_date: '',
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Update Draft Item
    |--------------------------------------------------------------------------
    */

    const updateDraftItem = <K extends keyof DraftItem>(
        key: K,
        value: DraftItem[K],
    ) => {
        setDraftItem((current) => ({
            ...current,

            [key]: value,
        }));

        if (draftError) {
            setDraftError(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Add Draft Item
    |--------------------------------------------------------------------------
    */

    const handleAddItem = () => {
        if (
            !draftItem.product_id ||
            !draftItem.product_name.trim() ||
            !draftItem.unit.trim() ||
            !draftItem.quantity ||
            draftItem.quantity <= 0 ||
            !draftItem.priority
        ) {
            setDraftError('Please complete all item information.');

            return;
        }

        /*
            |--------------------------------------------------------------------------
            | Duplicate
            |--------------------------------------------------------------------------
            */

        if (selectedProductIds.has(draftItem.product_id)) {
            setDraftError(
                'This product is already included in the requisition.',
            );

            return;
        }

        const item: RequisitionItemForm = {
            product_id: draftItem.product_id,

            product_code: draftItem.product_code,

            product_name: draftItem.product_name,

            unit: draftItem.unit,

            quantity: draftItem.quantity,

            priority: draftItem.priority,

            required_date: draftItem.required_date,
        };

        setData('items', [...data.items, item]);

        clearErrors('items');

        resetDraftItem();
    };

    /*
    |--------------------------------------------------------------------------
    | Update Added Item
    |--------------------------------------------------------------------------
    */

    const updateItem = <K extends keyof RequisitionItemForm>(
        index: number,
        key: K,
        value: RequisitionItemForm[K],
    ) => {
        const items = [...data.items];

        items[index] = {
            ...items[index],

            [key]: value,
        };

        setData('items', items);
    };

    /*
    |--------------------------------------------------------------------------
    | Remove Added Item
    |--------------------------------------------------------------------------
    */

    const removeItem = (index: number) => {
        setData(
            'items',
            data.items.filter((_, itemIndex) => itemIndex !== index),
        );

        resetProductSearch();
    };

    /*
    |--------------------------------------------------------------------------
    | Header Required Date
    |--------------------------------------------------------------------------
    */

    const handleRequiredDateChange = (value: string) => {
        setData('required_date', value);

        clearErrors('required_date');
    };

    /*
    |--------------------------------------------------------------------------
    | Files
    |--------------------------------------------------------------------------
    */

    const handleFilesChange = (value: File | File[] | null) => {
        const files = Array.isArray(value) ? value : value ? [value] : [];

        /*
            |--------------------------------------------------------------------------
            | Maximum Files
            |--------------------------------------------------------------------------
            */

        if (files.length > MAX_FILES) {
            setFileError('Maximum 5 files allowed.');

            return;
        }

        /*
            |--------------------------------------------------------------------------
            | Total Size
            |--------------------------------------------------------------------------
            */

        const totalSize = files.reduce((total, file) => total + file.size, 0);

        if (totalSize > MAX_TOTAL_FILE_SIZE) {
            setFileError('Total file size cannot exceed 30 MB.');

            return;
        }

        setFileError(null);

        setData('files', files);

        if (errors.files) {
            clearErrors('files');
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

        /*
            |--------------------------------------------------------------------------
            | Require Items
            |--------------------------------------------------------------------------
            */

        if (data.items.length === 0) {
            setDraftError(
                'Please add at least one product to the requisition.',
            );

            return;
        }

        /*
            |--------------------------------------------------------------------------
            | Unsaved Draft
            |--------------------------------------------------------------------------
            */

        if (draftItem.product_id !== null) {
            setDraftError(
                'Please click the check button to add the selected product before saving.',
            );

            return;
        }

        clearErrors();

        /*
            |--------------------------------------------------------------------------
            | Transform
            |--------------------------------------------------------------------------
            */

        transform((formData) => ({
            required_date: formData.required_date,

            files: formData.files,

            items: formData.items.map((item) => ({
                product_id: item.product_id,

                unit: item.unit,

                quantity: item.quantity,

                priority: item.priority,

                required_date: item.required_date,
            })),
        }));

        post('/requisition', {
            preserveScroll: true,

            forceFormData: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Create Requisition" />

            <PageTitle title="Create Requisition" />

            <div className="container-fluid">
                {/*
                |--------------------------------------------------------------------------
                | Validation Summary
                |--------------------------------------------------------------------------
                */}

                {(errorMessages.length > 0 || fileError) && (
                    <div className="alert alert-danger">
                        <strong>
                            There were some problems with your input:
                        </strong>

                        <ul className="mb-0 mt-2">
                            {errorMessages.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}

                            {fileError && <li>{fileError}</li>}
                        </ul>
                    </div>
                )}

                <Card>
                    {/*
                    |--------------------------------------------------------------------------
                    | Header
                    |--------------------------------------------------------------------------
                    */}

                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-2">
                            <h4 className="mb-0">Create Requisition</h4>

                            <Button
                                type="button"
                                variant="primary"
                                appearance="outline"
                                disabled={processing}
                                onClick={() => router.visit('/requisition')}
                            >
                                Go Back
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <form onSubmit={handleSubmit}>
                            {/*
                            |--------------------------------------------------------------------------
                            | Header Section
                            |--------------------------------------------------------------------------
                            */}

                            <div className="row">
                                {/*
                                |--------------------------------------------------------------------------
                                | Left
                                |--------------------------------------------------------------------------
                                */}

                                <div className="col-md-6">
                                    <div className="row mb-3">
                                        <div
                                            className="col-12"
                                            style={{
                                                borderRight: '1px solid #ddd',
                                            }}
                                        >
                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Required Date
                                            |--------------------------------------------------------------------------
                                            */}

                                            <div className="mb-3">
                                                <FormField>
                                                    <FormLabel
                                                        htmlFor="required_date"
                                                        required
                                                    >
                                                        Required Date
                                                    </FormLabel>

                                                    <DatePicker
                                                        id="required_date"
                                                        mode="single"
                                                        value={
                                                            data.required_date
                                                        }
                                                        placeholder="Select required date"
                                                        disabled={processing}
                                                        error={
                                                            errors.required_date
                                                        }
                                                        onChange={
                                                            handleRequiredDateChange
                                                        }
                                                    />

                                                    <FormError
                                                        error={
                                                            errors.required_date
                                                        }
                                                    />
                                                </FormField>
                                            </div>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Category
                                            |--------------------------------------------------------------------------
                                            */}

                                            <div className="mb-3">
                                                <FormField>
                                                    <FormLabel>
                                                        Category
                                                    </FormLabel>

                                                    <Select
                                                        value={categoryId ?? ''}
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

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Subcategory / Brand
                                            |--------------------------------------------------------------------------
                                            */}

                                            <div className="row">
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
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    handleSubcategoryChange(
                                                                        event
                                                                            .target
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
                                                                    brandId ??
                                                                    ''
                                                                }
                                                                disabled={
                                                                    processing ||
                                                                    loadingBrands
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    handleBrandChange(
                                                                        event
                                                                            .target
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
                                    </div>
                                </div>

                                {/*
                                |--------------------------------------------------------------------------
                                | File Upload
                                |--------------------------------------------------------------------------
                                */}

                                <div className="col-md-6">
                                    <div className="mt-4">
                                        <FileDropzone
                                            value={data.files}
                                            onChange={handleFilesChange}
                                            multiple
                                            maxFiles={5}
                                            showImagePreview
                                            previewInsideDropzone
                                            previewHeight={120}
                                            accept={{
                                                'image/jpeg': ['.jpg', '.jpeg'],

                                                'image/png': ['.png'],

                                                'application/pdf': ['.pdf'],

                                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                                                    ['.xlsx'],

                                                'application/vnd.ms-excel': [
                                                    '.xls',
                                                ],
                                            }}
                                            placeholder="Drop Excel here or click to select."
                                            description={
                                                <>
                                                    ( You can upload up to 5
                                                    files, max 30 MB total.
                                                    Upload occurs on form
                                                    submission. )
                                                </>
                                            }
                                            disabled={processing}
                                            error={fileError ?? errors.files}
                                        />

                                        <FormError error={errors.files} />
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
                                {/*
                                |--------------------------------------------------------------------------
                                | Product Search
                                |--------------------------------------------------------------------------
                                */}

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="position-relative">
                                            <SuggestionSearchInput<ProductSuggestion>
                                                key={[
                                                    'product',
                                                    brandId ?? 'all',
                                                    categoryId ?? 'none',
                                                    subcategoryId ?? 'all',
                                                    productSearchKey,
                                                ].join('-')}
                                                searchFn={searchProducts}
                                                idKey="id"
                                                labelKey="name"
                                                secondaryLabelKey="code"
                                                placeholder="Search items"
                                                showSearchIcon={false}
                                                clearOnFocus={false}
                                                emptyLabel="No items found."
                                                onSelect={handleProductSelect}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/*
                                |--------------------------------------------------------------------------
                                | Draft Error
                                |--------------------------------------------------------------------------
                                */}

                                {draftError && (
                                    <div className="alert alert-danger py-2">
                                        {draftError}
                                    </div>
                                )}

                                {/*
                                |--------------------------------------------------------------------------
                                | Items Table
                                |--------------------------------------------------------------------------
                                */}

                                <Table wrapperClassName="overflow-auto">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                style={{
                                                    width: '5%',
                                                }}
                                            >
                                                SL
                                            </TableHead>

                                            <TableHead>Item</TableHead>

                                            <TableHead
                                                style={{
                                                    width: '15%',
                                                }}
                                            >
                                                Unit
                                            </TableHead>

                                            <TableHead
                                                style={{
                                                    width: '15%',
                                                }}
                                            >
                                                Quantity
                                            </TableHead>

                                            <TableHead
                                                style={{
                                                    width: '15%',
                                                }}
                                            >
                                                Priority
                                            </TableHead>

                                            <TableHead
                                                style={{
                                                    width: '20%',
                                                }}
                                            >
                                                Required Date
                                            </TableHead>

                                            <TableHead
                                                className="text-center"
                                                style={{
                                                    width: '10%',
                                                }}
                                            >
                                                Action
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Main / Draft Row
                                        |--------------------------------------------------------------------------
                                        */}

                                        <TableRow>
                                            <TableCell>New</TableCell>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Product
                                            |--------------------------------------------------------------------------
                                            */}

                                            <TableCell
                                                style={{
                                                    minWidth: '220px',
                                                }}
                                            >
                                                <Textarea
                                                    rows={2}
                                                    value={
                                                        draftItem.product_name
                                                    }
                                                    placeholder="Item name"
                                                    readOnly
                                                    disabled={processing}
                                                />
                                            </TableCell>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Unit
                                            |--------------------------------------------------------------------------
                                            */}

                                            <TableCell
                                                style={{
                                                    minWidth: '120px',
                                                }}
                                            >
                                                <Input
                                                    value={draftItem.unit}
                                                    placeholder="Unit"
                                                    readOnly
                                                    disabled={processing}
                                                />
                                            </TableCell>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Quantity
                                            |--------------------------------------------------------------------------
                                            */}

                                            <TableCell
                                                style={{
                                                    minWidth: '130px',
                                                }}
                                            >
                                                <NumberInput
                                                    min="0.01"
                                                    step="0.01"
                                                    value={draftItem.quantity}
                                                    placeholder="Quantity"
                                                    disabled={processing}
                                                    onValueChange={(value) =>
                                                        updateDraftItem(
                                                            'quantity',
                                                            value,
                                                        )
                                                    }
                                                />
                                            </TableCell>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Priority
                                            |--------------------------------------------------------------------------
                                            */}

                                            <TableCell
                                                style={{
                                                    minWidth: '140px',
                                                }}
                                            >
                                                <Select
                                                    value={draftItem.priority}
                                                    disabled={processing}
                                                    onChange={(event) =>
                                                        updateDraftItem(
                                                            'priority',
                                                            event.target
                                                                .value as Priority,
                                                        )
                                                    }
                                                >
                                                    <option value="Low">
                                                        Low
                                                    </option>

                                                    <option value="Medium">
                                                        Medium
                                                    </option>

                                                    <option value="High">
                                                        High
                                                    </option>
                                                </Select>
                                            </TableCell>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Required Date
                                            |--------------------------------------------------------------------------
                                            */}

                                            <TableCell
                                                style={{
                                                    minWidth: '190px',
                                                }}
                                            >
                                                <DatePicker
                                                    mode="single"
                                                    value={
                                                        draftItem.required_date
                                                    }
                                                    placeholder="Select date"
                                                    disabled={processing}
                                                    onChange={(value) =>
                                                        updateDraftItem(
                                                            'required_date',
                                                            value,
                                                        )
                                                    }
                                                />
                                            </TableCell>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Add
                                            |--------------------------------------------------------------------------
                                            */}

                                            <TableCell className="text-center">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="primary"
                                                    disabled={processing}
                                                    onClick={handleAddItem}
                                                >
                                                    <Check size={16} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Added Rows
                                        |--------------------------------------------------------------------------
                                        */}

                                        {data.items.map((item, index) => (
                                            <TableRow key={item.product_id}>
                                                <TableCell>
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell>
                                                    <Textarea
                                                        rows={2}
                                                        value={
                                                            item.product_name
                                                        }
                                                        readOnly
                                                        disabled={processing}
                                                    />

                                                    <FormError
                                                        error={getError(
                                                            `items.${index}.product_id`,
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        value={item.unit}
                                                        readOnly
                                                        disabled={processing}
                                                    />

                                                    <FormError
                                                        error={getError(
                                                            `items.${index}.unit`,
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={item.quantity}
                                                        disabled={processing}
                                                        onChange={(event) =>
                                                            updateItem(
                                                                index,
                                                                'quantity',
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />

                                                    <FormError
                                                        error={getError(
                                                            `items.${index}.quantity`,
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Select
                                                        value={item.priority}
                                                        disabled={processing}
                                                        onChange={(event) =>
                                                            updateItem(
                                                                index,
                                                                'priority',
                                                                event.target
                                                                    .value as Priority,
                                                            )
                                                        }
                                                    >
                                                        <option value="Low">
                                                            Low
                                                        </option>

                                                        <option value="Medium">
                                                            Medium
                                                        </option>

                                                        <option value="High">
                                                            High
                                                        </option>
                                                    </Select>

                                                    <FormError
                                                        error={getError(
                                                            `items.${index}.priority`,
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <DatePicker
                                                        mode="single"
                                                        value={
                                                            item.required_date
                                                        }
                                                        placeholder="Select date"
                                                        disabled={processing}
                                                        error={getError(
                                                            `items.${index}.required_date`,
                                                        )}
                                                        onChange={(value) =>
                                                            updateItem(
                                                                index,
                                                                'required_date',
                                                                value,
                                                            )
                                                        }
                                                    />

                                                    <FormError
                                                        error={getError(
                                                            `items.${index}.required_date`,
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="danger"
                                                        disabled={processing}
                                                        onClick={() =>
                                                            removeItem(index)
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | Submit
                            |--------------------------------------------------------------------------
                            */}

                            <div className="mt-4 d-flex justify-content-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={
                                        processing || data.items.length === 0
                                    }
                                >
                                    {processing
                                        ? 'Saving...'
                                        : 'Save Requisition'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
