import {
    type FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { AppModal } from '@/components/ui/modal/app-modal';
import { Head, Link, useForm } from '@inertiajs/react';
import { Check, CheckCircle, Trash2, XCircle } from 'react-feather';

import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/form/date-picker';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { NumberInput } from '@/components/ui/form/number-input';
import { Select } from '@/components/ui/form/select';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Minus, Plus } from 'react-feather';
type Option = {
    id: number;
    name: string;
};

type Stage = Option & {
    color?: string | null;
};

type Project = {
    id: number;
    project_id: string;
    name: string;
};

type ProductSuggestion = {
    id: number;
    name: string;
    code: string;
    unit: string;
};

type ProfessionSuggestion = {
    id: number;
    name: string;
};

type DesignationSuggestion = {
    id: number;
    name: string;
};

type SourceSuggestion = {
    id: number;
    name: string;
};

type SectorSuggestion = {
    id: number;
    name: string;
};

type AreaSuggestion = {
    id: number;
    name: string;
};

type LeadProductItem = {
    product_id: number;
    product_code: string;
    product_name: string;
    unit: string | null;
    quantity: number | null;
    estimated_price_per_unit: number | null;
};

type DraftProductItem = {
    product_id: number | null;
    product_code: string;
    product_name: string;
    quantity: number | null;
    unit: string;
    estimated_price_per_unit: number | null;
};

type CreateLeadProps = {
    professions: Option[];
    designations: Option[];
    sources: Option[];
    sectors: Option[];
    areas: Option[];
    stages: Stage[];
};

type LeadFormData = {
    phone: string;
    phone_secondary: string;
    phone_foreign: string;

    name: string;
    company_name: string | null;
    email: string;
    profession: number | null;
    designation: number | null;
    source: number | null;
    sector: number | null;
    area: number | null;
    address: string;

    stage: string;
    priority: string;
    interest_level: string;
    next_follow_up_at: string;

    items: LeadProductItem[];

    remarks: string;
};

const createEmptyDraftProduct = (): DraftProductItem => ({
    product_id: null,
    product_code: '',
    product_name: '',
    quantity: 1,
    unit: '',
    estimated_price_per_unit: null,
});

type ExistingLeadProduct = {
    product_id: number;
    product_code: string;
    product_name: string;
    unit?: string | null;
    quantity?: number | string | null;
    estimated_price_per_unit?: number | string | null;
};

type ExistingLead = {
    id: number;
    name: string;
    company_name?: string | null;
    phone: string;
    phone_secondary?: string | null;
    phone_foreign?: string | null;
    email?: string | null;
    area_id?: number | null;
    sector_id?: number | null;
    profession_id?: number | null;
    designation_id?: number | null;
    source_id?: number | null;
    stage_id: number;
    priority: string;
    interest_level?: string | null;
    next_follow_up_at?: string | null;
    address?: string | null;
    remarks?: string | null;
    lead_products?: ExistingLeadProduct[];

    designation: {
        id: number;
        name: string;
    } | null;
    area: {
        id: number;
        name: string;
    } | null;
    sector: {
        id: number;
        name: string;
    } | null;
    profession: {
        id: number;
        name: string;
    } | null;
    lead_source: {
        id: number;
        name: string;
    } | null;
};

type EditLeadProps = {
    lead: ExistingLead;
    professions: Option[];
    designations: Option[];
    sources: Option[];
    sectors: Option[];
    areas: Option[];
    stages: Stage[];
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

const createInitialData = (lead: ExistingLead): LeadFormData => ({
    phone: lead.phone,
    phone_secondary: lead.phone_secondary ?? '',
    phone_foreign: lead.phone_foreign ?? '',
    name: lead.name,
    company_name: lead.company_name ?? '',
    email: lead.email ?? '',
    profession: lead.profession_id ?? null,
    designation: lead.designation_id ?? null,
    source: lead.source_id ?? null,
    sector: lead.sector_id ?? null,
    area: lead.area_id ?? null,
    address: lead.address ?? '',
    stage: String(lead.stage_id),
    priority: lead.priority,
    interest_level: lead.interest_level ?? 'cold',
    next_follow_up_at: lead.next_follow_up_at ?? '',
    remarks: lead.remarks ?? '',

    items: (lead.lead_products ?? []).map((item) => ({
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        unit: item.unit ?? '',
        quantity:
            item.quantity === null || item.quantity === undefined
                ? null
                : Number(item.quantity),
        estimated_price_per_unit:
            item.estimated_price_per_unit === null ||
            item.estimated_price_per_unit === undefined
                ? null
                : Number(item.estimated_price_per_unit),
    })),
});

type PhoneCheckedExistingLead = {
    id: number;
    lead_code: string;
    name: string;
    phone: string;
    stage: string | null;
    created_by_name: string | null;
    created_by_employee_no: string | null;
    follow_up_by_name: string | null;
    follow_up_by_employee_no: string | null;
    is_assigned: boolean;
    last_conversation_date: string | null;
    last_conversation_by: string | null;
};

type PhoneCheckResponse = {
    exists: boolean;
    lead?: PhoneCheckedExistingLead;
};

type PhoneField = 'phone' | 'phone_secondary' | 'phone_foreign';

export default function CreateLead({
    lead,
    professions,
    designations,
    sources,
    sectors,
    areas,
    stages,
}: EditLeadProps) {
    const [isProductSectionOpen, setIsProductSectionOpen] = useState(false);

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

    const { data, setData, patch, processing, errors, clearErrors, reset } =
        useForm<LeadFormData>(createInitialData(lead));

    const [checkingPhones, setCheckingPhones] = useState<
        Record<PhoneField, boolean>
    >({
        phone: false,
        phone_secondary: false,
        phone_foreign: false,
    });

    const [existingLeads, setExistingLeads] = useState<
        Record<PhoneField, PhoneCheckedExistingLead | null>
    >({
        phone: null,
        phone_secondary: null,
        phone_foreign: null,
    });

    const [phoneCheckCompleted, setPhoneCheckCompleted] = useState<
        Record<PhoneField, boolean>
    >({
        phone: false,
        phone_secondary: false,
        phone_foreign: false,
    });

    const [existingLeadModalOpen, setExistingLeadModalOpen] = useState(false);

    const [selectedExistingLead, setSelectedExistingLead] =
        useState<PhoneCheckedExistingLead | null>(null);

    const checkPhoneExists = useCallback(
        async (field: PhoneField, phone: string, signal?: AbortSignal) => {
            const normalizedPhone = phone.replace(/\D/g, '');

            if (
                (field === 'phone' || field === 'phone_secondary') &&
                normalizedPhone.length !== 11
            ) {
                return;
            }

            if (field === 'phone_foreign' && normalizedPhone.length === 0) {
                return;
            }

            setCheckingPhones((current) => ({
                ...current,
                [field]: true,
            }));

            try {
                const params = new URLSearchParams({
                    phone: normalizedPhone,
                    lead_id: String(lead.id),
                });

                const response = await fetch(
                    `/leads/check-phone?${params.toString()}`,
                    {
                        signal,
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error('Unable to check phone number.');
                }

                const result = (await response.json()) as PhoneCheckResponse;

                const existingLead = result.exists
                    ? (result.lead ?? null)
                    : null;

                setExistingLeads((current) => ({
                    ...current,
                    [field]: existingLead,
                }));

                setPhoneCheckCompleted((current) => ({
                    ...current,
                    [field]: true,
                }));

                if (existingLead) {
                    setSelectedExistingLead(existingLead);
                    setExistingLeadModalOpen(true);
                }
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return;
                }

                console.error(error);

                setExistingLeads((current) => ({
                    ...current,
                    [field]: null,
                }));

                setPhoneCheckCompleted((current) => ({
                    ...current,
                    [field]: false,
                }));
            } finally {
                if (!signal?.aborted) {
                    setCheckingPhones((current) => ({
                        ...current,
                        [field]: false,
                    }));
                }
            }
        },
        [lead.id],
    );

    useEffect(() => {
        const normalizedPhone = data.phone.replace(/\D/g, '');

        if (normalizedPhone.length !== 11) {
            setExistingLeads((current) => ({
                ...current,
                phone: null,
            }));

            setCheckingPhones((current) => ({
                ...current,
                phone: false,
            }));

            setPhoneCheckCompleted((current) => ({
                ...current,
                phone: false,
            }));

            return;
        }

        setExistingLeads((current) => ({
            ...current,
            phone: null,
        }));

        setPhoneCheckCompleted((current) => ({
            ...current,
            phone: false,
        }));

        setCheckingPhones((current) => ({
            ...current,
            phone: true,
        }));

        const controller = new AbortController();

        const timeout = window.setTimeout(() => {
            void checkPhoneExists('phone', normalizedPhone, controller.signal);
        }, 400);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [data.phone, checkPhoneExists]);

    useEffect(() => {
        const normalizedPhone = data.phone_secondary.replace(/\D/g, '');

        if (normalizedPhone.length !== 11) {
            setExistingLeads((current) => ({
                ...current,
                phone_secondary: null,
            }));

            setCheckingPhones((current) => ({
                ...current,
                phone_secondary: false,
            }));

            setPhoneCheckCompleted((current) => ({
                ...current,
                phone_secondary: false,
            }));

            return;
        }

        setExistingLeads((current) => ({
            ...current,
            phone_secondary: null,
        }));

        setPhoneCheckCompleted((current) => ({
            ...current,
            phone_secondary: false,
        }));

        setCheckingPhones((current) => ({
            ...current,
            phone_secondary: true,
        }));

        const controller = new AbortController();

        const timeout = window.setTimeout(() => {
            void checkPhoneExists(
                'phone_secondary',
                normalizedPhone,
                controller.signal,
            );
        }, 400);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [data.phone_secondary, checkPhoneExists]);

    useEffect(() => {
        const normalizedPhone = data.phone_foreign.replace(/\D/g, '');

        if (normalizedPhone.length === 0) {
            setExistingLeads((current) => ({
                ...current,
                phone_foreign: null,
            }));

            setCheckingPhones((current) => ({
                ...current,
                phone_foreign: false,
            }));

            setPhoneCheckCompleted((current) => ({
                ...current,
                phone_foreign: false,
            }));

            return;
        }

        setExistingLeads((current) => ({
            ...current,
            phone_foreign: null,
        }));

        setPhoneCheckCompleted((current) => ({
            ...current,
            phone_foreign: false,
        }));

        setCheckingPhones((current) => ({
            ...current,
            phone_foreign: true,
        }));

        const controller = new AbortController();

        const timeout = window.setTimeout(() => {
            void checkPhoneExists(
                'phone_foreign',
                normalizedPhone,
                controller.signal,
            );
        }, 400);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [data.phone_foreign, checkPhoneExists]);

    const isPhoneAvailable = (field: PhoneField) => {
        const normalizedPhone = data[field].replace(/\D/g, '');

        const isBangladeshPhone =
            field === 'phone' || field === 'phone_secondary';

        const validLength = isBangladeshPhone
            ? normalizedPhone.length === 11
            : normalizedPhone.length > 0;

        return (
            validLength &&
            phoneCheckCompleted[field] &&
            !checkingPhones[field] &&
            !existingLeads[field] &&
            !errors[field]
        );
    };

    const [showSecondaryPhone, setShowSecondaryPhone] = useState(
        Boolean(lead.phone_secondary),
    );

    const [showForeignPhone, setShowForeignPhone] = useState(
        Boolean(lead.phone_foreign),
    );

    const [draftProduct, setDraftProduct] = useState<DraftProductItem>(
        createEmptyDraftProduct,
    );

    const [productSearchKey, setProductSearchKey] = useState(0);
    const [productError, setProductError] = useState<string | null>(null);

    const selectedProductIds = useMemo(
        () => new Set(data.items.map((item) => item.product_id)),
        [data.items],
    );

    const getError = (key: string): string | undefined => {
        return errors[key as keyof typeof errors] as string | undefined;
    };

    const removeSecondaryPhone = () => {
        setData('phone_secondary', '');
        setShowSecondaryPhone(false);
    };

    const removeForeignPhone = () => {
        setData('phone_foreign', '');
        setShowForeignPhone(false);
    };

    const handleBangladeshPhoneChange = (
        field: 'phone' | 'phone_secondary',
        value: string,
    ) => {
        setData(field, value.replace(/\D/g, '').slice(0, 11));
    };

    const handleForeignPhoneChange = (value: string) => {
        setData('phone_foreign', value.replace(/[^\d+]/g, '').slice(0, 20));
    };

    const searchSectors = useCallback(
        async (query: string): Promise<SectorSuggestion[]> => {
            const normalizedQuery = query.trim().toLowerCase();

            if (!normalizedQuery) {
                return sectors;
            }

            return sectors.filter((sector) =>
                sector.name.toLowerCase().includes(normalizedQuery),
            );
        },
        [sectors],
    );

    const searchAreas = useCallback(
        async (query: string): Promise<AreaSuggestion[]> => {
            const normalizedQuery = query.trim().toLowerCase();

            if (!normalizedQuery) {
                return areas;
            }

            return areas.filter((area) =>
                area.name.toLowerCase().includes(normalizedQuery),
            );
        },
        [areas],
    );

    const searchProfessions = useCallback(
        async (query: string): Promise<ProfessionSuggestion[]> => {
            const normalizedQuery = query.trim().toLowerCase();

            if (!normalizedQuery) {
                return professions;
            }

            return professions.filter((profession) =>
                profession.name.toLowerCase().includes(normalizedQuery),
            );
        },
        [professions],
    );

    const searchDesignations = useCallback(
        async (query: string): Promise<DesignationSuggestion[]> => {
            const normalizedQuery = query.trim().toLowerCase();

            if (!normalizedQuery) {
                return designations;
            }

            return designations.filter((designation) =>
                designation.name.toLowerCase().includes(normalizedQuery),
            );
        },
        [designations],
    );

    const searchSources = useCallback(
        async (query: string): Promise<SourceSuggestion[]> => {
            const normalizedQuery = query.trim().toLowerCase();

            if (!normalizedQuery) {
                return sources;
            }

            return sources.filter((source) =>
                source.name.toLowerCase().includes(normalizedQuery),
            );
        },
        [sources],
    );

    const searchProducts = useCallback(
        async (
            query: string,
            signal?: AbortSignal,
        ): Promise<ProductSuggestion[]> => {
            const params = new URLSearchParams();

            params.set('keyword', query);

            params.set('fields', 'id,code,name,unit');

            params.set('status', '1');

            /*
        |--------------------------------------------------------------------------
        | Category
        |--------------------------------------------------------------------------
        */

            if (categoryId !== null) {
                params.set('category_id', String(categoryId));
            }

            /*
        |--------------------------------------------------------------------------
        | Subcategory
        |--------------------------------------------------------------------------
        */

            if (subcategoryId !== null) {
                params.set('subcategory_id', String(subcategoryId));
            }

            /*
        |--------------------------------------------------------------------------
        | Brand
        |--------------------------------------------------------------------------
        */

            if (brandId !== null) {
                params.set('brand_id', String(brandId));
            }

            const response = await fetch(`/get-products?${params.toString()}`, {
                signal,

                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to search products.');
            }

            const products = (await response.json()) as ProductSuggestion[];

            return products.filter(
                (product) => !selectedProductIds.has(product.id),
            );
        },
        [brandId, categoryId, subcategoryId, selectedProductIds],
    );

    const resetDraftProduct = () => {
        setDraftProduct(createEmptyDraftProduct());
        setProductSearchKey((current) => current + 1);
        setProductError(null);
    };

    const handleProductSelect = (product: ProductSuggestion) => {
        console.log(product);
        if (selectedProductIds.has(product.id)) {
            setProductError('This product is already added.');

            return;
        }

        setDraftProduct({
            product_id: product.id,
            product_code: product.code,
            product_name: product.name,
            quantity: 1,
            unit: product.unit ?? '',
            estimated_price_per_unit: null,
        });

        setProductError(null);
    };

    const updateDraftProduct = <K extends keyof DraftProductItem>(
        key: K,
        value: DraftProductItem[K],
    ) => {
        setDraftProduct((current) => ({
            ...current,
            [key]: value,
        }));

        setProductError(null);
    };

    const addProduct = () => {
        if (
            !draftProduct.product_id ||
            !draftProduct.quantity ||
            draftProduct.quantity <= 0
        ) {
            setProductError(
                'Please select a product and enter a valid quantity.',
            );

            return;
        }

        if (selectedProductIds.has(draftProduct.product_id)) {
            setProductError('This product is already added.');

            return;
        }

        setData('items', [
            ...data.items,
            {
                product_id: draftProduct.product_id,
                product_code: draftProduct.product_code,
                product_name: draftProduct.product_name,
                unit: draftProduct.unit,
                quantity: draftProduct.quantity,
                estimated_price_per_unit: draftProduct.estimated_price_per_unit,
            },
        ]);

        clearErrors('items');

        resetDraftProduct();
    };

    const updateProduct = <K extends keyof LeadProductItem>(
        index: number,
        key: K,
        value: LeadProductItem[K],
    ) => {
        const items = [...data.items];

        items[index] = {
            ...items[index],
            [key]: value,
        };

        setData('items', items);
    };

    const removeProduct = (index: number) => {
        setData(
            'items',
            data.items.filter((_, itemIndex) => itemIndex !== index),
        );

        setProductSearchKey((current) => current + 1);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setProductError(null);

        if (draftProduct.product_id !== null) {
            setProductError(
                'Please click the add button to add the selected product before saving.',
            );

            return;
        }

        patch(`/lead/${lead.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                clearErrors();
                resetDraftProduct();
            },
        });
    };

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

        resetDraftProduct();
    };

    /*
    |--------------------------------------------------------------------------
    | Subcategory Change
    |--------------------------------------------------------------------------
    */

    const handleSubcategoryChange = (value: string) => {
        const selectedId = value ? Number(value) : null;

        setSubcategoryId(selectedId);

        resetDraftProduct();
    };

    /*
    |--------------------------------------------------------------------------
    | Brand Change
    |--------------------------------------------------------------------------
    */

    const handleBrandChange = (value: string) => {
        const selectedId = value ? Number(value) : null;

        setBrandId(selectedId);

        resetDraftProduct();
    };

    const phoneExistingLead = existingLeads.phone;
    const phoneChecking = checkingPhones.phone;
    const phoneAvailable = isPhoneAvailable('phone');

    const secondaryExistingLead = existingLeads.phone_secondary;
    const secondaryChecking = checkingPhones.phone_secondary;
    const secondaryAvailable = isPhoneAvailable('phone_secondary');

    const foreignExistingLead = existingLeads.phone_foreign;
    const foreignChecking = checkingPhones.phone_foreign;
    const foreignAvailable = isPhoneAvailable('phone_foreign');

    return (
        <>
            <Head title="Edit Lead" />

            <PageTitle title="Edit Lead" />

            <div className="container-fluid">
                <form onSubmit={submit}>
                    <div className="card mb-3">
                        <div className="card-header">
                            <h5 className="mb-0">Basic Identity</h5>
                        </div>

                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label
                                        htmlFor="phone"
                                        className="form-label"
                                    >
                                        Phone{' '}
                                        <span className="text-danger">*</span>
                                    </label>

                                    <div className="position-relative">
                                        <input
                                            id="phone"
                                            type="text"
                                            className={`form-control ${
                                                errors.phone
                                                    ? 'is-invalid'
                                                    : phoneExistingLead
                                                      ? 'border-warning'
                                                      : phoneAvailable
                                                        ? 'border-success'
                                                        : ''
                                            }`}
                                            placeholder="01XXXXXXXXX"
                                            maxLength={11}
                                            value={data.phone}
                                            disabled={true}
                                            onChange={(event) =>
                                                handleBangladeshPhoneChange(
                                                    'phone',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        {phoneChecking && (
                                            <span
                                                className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                                style={{ fontSize: '13px' }}
                                            >
                                                Checking...
                                            </span>
                                        )}
                                    </div>

                                    {errors.phone && (
                                        <div className="invalid-feedback d-block">
                                            {errors.phone}
                                        </div>
                                    )}

                                    {phoneExistingLead && !errors.phone && (
                                        <div
                                            className="d-block text-warning"
                                            style={{
                                                width: '100%',
                                                fontSize: '0.875em',
                                                marginTop: '0.5em',
                                            }}
                                        >
                                            <XCircle
                                                size={12}
                                                className="me-1"
                                            />
                                            This phone number already exists in
                                            the system.
                                        </div>
                                    )}

                                    {phoneAvailable && (
                                        <div
                                            className="d-block text-success"
                                            style={{
                                                width: '100%',
                                                fontSize: '0.875em',
                                                marginTop: '0.5em',
                                            }}
                                        >
                                            <CheckCircle
                                                size={12}
                                                className="me-1"
                                            />
                                            Phone number is available.
                                        </div>
                                    )}
                                </div>

                                {showSecondaryPhone && (
                                    <div className="col-md-4 mb-3">
                                        <label
                                            htmlFor="phone_secondary"
                                            className="form-label d-flex justify-content-between"
                                        >
                                            <span>Secondary Phone</span>

                                            <button
                                                type="button"
                                                className="btn btn-link text-danger p-0 text-decoration-none"
                                                disabled={processing}
                                                onClick={removeSecondaryPhone}
                                            >
                                                Remove
                                            </button>
                                        </label>

                                        <div className="position-relative">
                                            <input
                                                id="phone_secondary"
                                                type="text"
                                                className={`form-control ${
                                                    errors.phone_secondary
                                                        ? 'is-invalid'
                                                        : secondaryExistingLead
                                                          ? 'border-warning'
                                                          : secondaryAvailable
                                                            ? 'border-success'
                                                            : ''
                                                }`}
                                                placeholder="01XXXXXXXXX"
                                                maxLength={11}
                                                value={data.phone_secondary}
                                                disabled={processing}
                                                onChange={(event) =>
                                                    handleBangladeshPhoneChange(
                                                        'phone_secondary',
                                                        event.target.value,
                                                    )
                                                }
                                            />

                                            {secondaryChecking && (
                                                <span
                                                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                                    style={{ fontSize: '13px' }}
                                                >
                                                    Checking...
                                                </span>
                                            )}
                                        </div>

                                        {errors.phone_secondary && (
                                            <div className="invalid-feedback d-block">
                                                {errors.phone_secondary}
                                            </div>
                                        )}

                                        {secondaryExistingLead &&
                                            !errors.phone_secondary && (
                                                <div
                                                    className="d-block text-warning"
                                                    style={{
                                                        width: '100%',
                                                        fontSize: '0.875em',
                                                        marginTop: '0.5em',
                                                    }}
                                                >
                                                    <XCircle
                                                        size={12}
                                                        className="me-1"
                                                    />
                                                    This phone number already
                                                    exists in the system.
                                                </div>
                                            )}

                                        {secondaryAvailable && (
                                            <div
                                                className="d-block text-success"
                                                style={{
                                                    width: '100%',
                                                    fontSize: '0.875em',
                                                    marginTop: '0.5em',
                                                }}
                                            >
                                                <CheckCircle
                                                    size={12}
                                                    className="me-1"
                                                />
                                                Phone number is available.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {showForeignPhone && (
                                    <div className="col-md-4 mb-3">
                                        <label
                                            htmlFor="phone_foreign"
                                            className="form-label d-flex justify-content-between"
                                        >
                                            <span>Foreign Phone</span>

                                            <button
                                                type="button"
                                                className="btn btn-link text-danger p-0 text-decoration-none"
                                                disabled={processing}
                                                onClick={removeForeignPhone}
                                            >
                                                Remove
                                            </button>
                                        </label>

                                        <div className="position-relative">
                                            <input
                                                id="phone_foreign"
                                                type="text"
                                                className={`form-control ${
                                                    errors.phone_foreign
                                                        ? 'is-invalid'
                                                        : foreignExistingLead
                                                          ? 'border-warning'
                                                          : foreignAvailable
                                                            ? 'border-success'
                                                            : ''
                                                }`}
                                                placeholder="+9XXXXXXXXX"
                                                maxLength={20}
                                                value={data.phone_foreign}
                                                disabled={processing}
                                                onChange={(event) =>
                                                    handleForeignPhoneChange(
                                                        event.target.value,
                                                    )
                                                }
                                            />

                                            {foreignChecking && (
                                                <span
                                                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                                    style={{ fontSize: '13px' }}
                                                >
                                                    Checking...
                                                </span>
                                            )}
                                        </div>

                                        {errors.phone_foreign && (
                                            <div className="invalid-feedback d-block">
                                                {errors.phone_foreign}
                                            </div>
                                        )}

                                        {foreignExistingLead &&
                                            !errors.phone_foreign && (
                                                <div
                                                    className="d-block text-warning"
                                                    style={{
                                                        width: '100%',
                                                        fontSize: '0.875em',
                                                        marginTop: '0.5em',
                                                    }}
                                                >
                                                    <XCircle
                                                        size={12}
                                                        className="me-1"
                                                    />
                                                    This phone number already
                                                    exists in the system.
                                                </div>
                                            )}

                                        {foreignAvailable && (
                                            <div
                                                className="d-block text-success"
                                                style={{
                                                    width: '100%',
                                                    fontSize: '0.875em',
                                                    marginTop: '0.5em',
                                                }}
                                            >
                                                <CheckCircle
                                                    size={12}
                                                    className="me-1"
                                                />
                                                Phone number is available.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3 d-flex gap-2 flex-wrap">
                                {!showSecondaryPhone && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        disabled={processing}
                                        onClick={() =>
                                            setShowSecondaryPhone(true)
                                        }
                                    >
                                        + Add Secondary Phone
                                    </button>
                                )}

                                {!showForeignPhone && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-success btn-sm"
                                        disabled={processing}
                                        onClick={() =>
                                            setShowForeignPhone(true)
                                        }
                                    >
                                        + Add Foreign Phone
                                    </button>
                                )}
                            </div>

                            <div className="row">
                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="name" required>
                                            Name
                                        </FormLabel>

                                        <Input
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            placeholder="Enter name"
                                            disabled={processing}
                                            className={cn(
                                                errors.name && 'is-invalid',
                                            )}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <FormError error={errors.name} />
                                    </FormField>
                                </div>

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="email">
                                            Email
                                        </FormLabel>

                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={data.email}
                                            placeholder="Enter email"
                                            disabled={processing}
                                            className={cn(
                                                errors.email && 'is-invalid',
                                            )}
                                            onChange={(event) =>
                                                setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <FormError error={errors.email} />
                                    </FormField>
                                </div>

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="company_name">
                                            Company Name
                                        </FormLabel>

                                        <Input
                                            id="company_name"
                                            name="company_name"
                                            value={data.company_name ?? ''}
                                            placeholder="Enter company name"
                                            disabled={processing}
                                            className={cn(
                                                errors.company_name &&
                                                    'is-invalid',
                                            )}
                                            onChange={(event) =>
                                                setData(
                                                    'company_name',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={errors.company_name}
                                        />
                                    </FormField>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel>Profession</FormLabel>

                                        <SuggestionSearchInput<ProfessionSuggestion>
                                            searchFn={searchProfessions}
                                            idKey="id"
                                            labelKey="name"
                                            placeholder="Select profession"
                                            showSearchIcon={false}
                                            error={errors.profession}
                                            disabled={processing}
                                            defaultSelectedItem={
                                                lead.profession
                                            }
                                            onSelect={(profession) =>
                                                setData(
                                                    'profession',
                                                    profession.id,
                                                )
                                            }
                                            onClear={() =>
                                                setData('profession', null)
                                            }
                                            clearOnFocus={false}
                                        />

                                        <FormError error={errors.profession} />
                                    </FormField>
                                </div>

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel>Designation</FormLabel>

                                        <SuggestionSearchInput<DesignationSuggestion>
                                            searchFn={searchDesignations}
                                            idKey="id"
                                            labelKey="name"
                                            placeholder="Select designation"
                                            showSearchIcon={false}
                                            error={errors.designation}
                                            disabled={processing}
                                            defaultSelectedItem={
                                                lead.designation
                                            }
                                            onSelect={(designation) =>
                                                setData(
                                                    'designation',
                                                    designation.id,
                                                )
                                            }
                                            onClear={() =>
                                                setData('designation', null)
                                            }
                                            clearOnFocus={false}
                                        />

                                        <FormError error={errors.designation} />
                                    </FormField>
                                </div>

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel>Source</FormLabel>

                                        <SuggestionSearchInput<SourceSuggestion>
                                            searchFn={searchSources}
                                            idKey="id"
                                            labelKey="name"
                                            placeholder="Select source"
                                            showSearchIcon={false}
                                            error={errors.source}
                                            disabled={processing}
                                            defaultSelectedItem={
                                                lead.lead_source
                                            }
                                            onSelect={(source) =>
                                                setData('source', source.id)
                                            }
                                            onClear={() =>
                                                setData('source', null)
                                            }
                                            clearOnFocus={false}
                                        />

                                        <FormError error={errors.source} />
                                    </FormField>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel>Sector</FormLabel>

                                        <SuggestionSearchInput<SectorSuggestion>
                                            searchFn={searchSectors}
                                            idKey="id"
                                            labelKey="name"
                                            placeholder="Select sector"
                                            showSearchIcon={false}
                                            error={errors.sector}
                                            disabled={processing}
                                            defaultSelectedItem={lead.sector}
                                            onSelect={(sector) =>
                                                setData('sector', sector.id)
                                            }
                                            onClear={() =>
                                                setData('sector', null)
                                            }
                                            clearOnFocus={false}
                                        />

                                        <FormError error={errors.sector} />
                                    </FormField>
                                </div>

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel>Area</FormLabel>

                                        <SuggestionSearchInput<AreaSuggestion>
                                            searchFn={searchAreas}
                                            idKey="id"
                                            labelKey="name"
                                            placeholder="Select area"
                                            showSearchIcon={false}
                                            error={errors.area}
                                            disabled={processing}
                                            defaultSelectedItem={lead.area}
                                            onSelect={(area) =>
                                                setData('area', area.id)
                                            }
                                            onClear={() =>
                                                setData('area', null)
                                            }
                                            clearOnFocus={false}
                                        />

                                        <FormError error={errors.area} />
                                    </FormField>
                                </div>

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="address">
                                            Address
                                        </FormLabel>

                                        <textarea
                                            id="address"
                                            className={`form-control ${
                                                errors.address
                                                    ? 'is-invalid'
                                                    : ''
                                            }`}
                                            rows={2}
                                            placeholder="Enter address"
                                            value={data.address}
                                            disabled={processing}
                                            onChange={(event) =>
                                                setData(
                                                    'address',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <FormError error={errors.address} />
                                    </FormField>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="card-header">
                            <h5 className="mb-0">Stage Information</h5>
                        </div>

                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="stage" required>
                                            Stage
                                        </FormLabel>

                                        <Select
                                            id="stage"
                                            value={data.stage}
                                            disabled={processing}
                                            error={errors.stage}
                                            onChange={(event) =>
                                                setData(
                                                    'stage',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select Stage
                                            </option>

                                            {stages.map((stage) => (
                                                <option
                                                    key={stage.id}
                                                    value={stage.id}
                                                >
                                                    {stage.name}
                                                </option>
                                            ))}
                                        </Select>

                                        <FormError error={errors.stage} />
                                    </FormField>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Priority and Interest Level
                                    </label>

                                    <div className="d-flex">
                                        <select
                                            className="form-control"
                                            disabled={processing}
                                            style={{
                                                borderTopRightRadius: 0,
                                                borderBottomRightRadius: 0,
                                                borderRight: 0,
                                            }}
                                            value={data.priority}
                                            onChange={(event) =>
                                                setData(
                                                    'priority',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">
                                                Medium
                                            </option>
                                            <option value="high">High</option>
                                        </select>

                                        <select
                                            className="form-control"
                                            disabled={processing}
                                            style={{
                                                borderTopLeftRadius: 0,
                                                borderBottomLeftRadius: 0,
                                            }}
                                            value={data.interest_level}
                                            onChange={(event) =>
                                                setData(
                                                    'interest_level',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="cold">Cold</option>
                                            <option value="warm">Warm</option>
                                            <option value="hot">Hot</option>
                                        </select>
                                    </div>

                                    {(errors.priority ||
                                        errors.interest_level) && (
                                        <small className="text-danger">
                                            {errors.priority ??
                                                errors.interest_level}
                                        </small>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="next_follow_up_at">
                                            Next Follow-up
                                        </FormLabel>

                                        <DatePicker
                                            id="next_follow_up_at"
                                            mode="single"
                                            enableTime
                                            time24hr={false}
                                            value={data.next_follow_up_at}
                                            placeholder="Select required date"
                                            disabled={true}
                                            error={errors.next_follow_up_at}
                                            onChange={(value) =>
                                                setData(
                                                    'next_follow_up_at',
                                                    value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={errors.next_follow_up_at}
                                        />
                                    </FormField>
                                </div>
                            </div>

                            <div className="row mt-3">
                                <div className="col-12">
                                    <FormField>
                                        <FormLabel htmlFor="remarks">
                                            Remarks
                                        </FormLabel>

                                        <textarea
                                            id="remarks"
                                            className={`form-control ${
                                                errors.remarks
                                                    ? 'is-invalid'
                                                    : ''
                                            }`}
                                            rows={3}
                                            placeholder="Note"
                                            value={data.remarks}
                                            disabled={processing}
                                            onChange={(event) =>
                                                setData(
                                                    'remarks',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <FormError error={errors.remarks} />
                                    </FormField>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <div>
                                <h5 className="mb-0">Product Information</h5>

                                {!isProductSectionOpen &&
                                    data.items.length > 0 && (
                                        <small className="text-muted">
                                            {data.items.length} product
                                            {data.items.length > 1
                                                ? 's'
                                                : ''}{' '}
                                            added
                                        </small>
                                    )}
                            </div>

                            <Button
                                type="button"
                                size="sm"
                                variant="light"
                                disabled={processing}
                                aria-label={
                                    isProductSectionOpen
                                        ? 'Collapse product section'
                                        : 'Expand product section'
                                }
                                onClick={() =>
                                    setIsProductSectionOpen(
                                        (current) => !current,
                                    )
                                }
                            >
                                {isProductSectionOpen ? (
                                    <Minus size={18} />
                                ) : (
                                    <Plus size={18} />
                                )}
                            </Button>
                        </div>

                        {isProductSectionOpen && (
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4">
                                        <FormField>
                                            <FormLabel>Category</FormLabel>

                                            <Select
                                                value={categoryId ?? ''}
                                                disabled={
                                                    processing ||
                                                    loadingCategories
                                                }
                                                onChange={(event) =>
                                                    handleCategoryChange(
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    {loadingCategories
                                                        ? 'Loading categories...'
                                                        : 'Select Category'}
                                                </option>

                                                {categories.map((category) => (
                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormField>
                                    </div>

                                    <div className="col-md-4">
                                        <FormField>
                                            <FormLabel>Sub Category</FormLabel>

                                            <Select
                                                value={subcategoryId ?? ''}
                                                disabled={
                                                    processing ||
                                                    categoryId === null ||
                                                    loadingSubcategories
                                                }
                                                onChange={(event) =>
                                                    handleSubcategoryChange(
                                                        event.target.value,
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
                                                    (subcategory) => (
                                                        <option
                                                            key={subcategory.id}
                                                            value={
                                                                subcategory.id
                                                            }
                                                        >
                                                            {subcategory.name}
                                                        </option>
                                                    ),
                                                )}
                                            </Select>
                                        </FormField>
                                    </div>

                                    <div className="col-md-4">
                                        <FormField>
                                            <FormLabel>Brand</FormLabel>

                                            <Select
                                                value={brandId ?? ''}
                                                disabled={
                                                    processing || loadingBrands
                                                }
                                                onChange={(event) =>
                                                    handleBrandChange(
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    {loadingBrands
                                                        ? 'Loading brands...'
                                                        : 'Select Brand'}
                                                </option>

                                                {brands.map((brand) => (
                                                    <option
                                                        key={brand.id}
                                                        value={brand.id}
                                                    >
                                                        {brand.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormField>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12">
                                        <FormField>
                                            <FormLabel>
                                                Search Product
                                            </FormLabel>

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
                                                placeholder="Search products..."
                                                showSearchIcon={false}
                                                clearOnFocus={false}
                                                emptyLabel="No products found."
                                                disabled={processing}
                                                onSelect={handleProductSelect}
                                            />
                                        </FormField>
                                    </div>
                                </div>

                                {productError && (
                                    <div className="alert alert-danger py-2">
                                        {productError}
                                    </div>
                                )}

                                <Table wrapperClassName="overflow-auto">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead style={{ width: '6%' }}>
                                                SL
                                            </TableHead>

                                            <TableHead>Product</TableHead>

                                            <TableHead
                                                style={{
                                                    width: '15%',
                                                }}
                                            >
                                                Unit
                                            </TableHead>

                                            <TableHead style={{ width: '18%' }}>
                                                Quantity
                                            </TableHead>

                                            <TableHead style={{ width: '22%' }}>
                                                Estimated Price / Unit
                                            </TableHead>

                                            <TableHead
                                                className="text-center"
                                                style={{ width: '10%' }}
                                            >
                                                Action
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        <TableRow>
                                            <TableCell>New</TableCell>

                                            <TableCell
                                                style={{
                                                    minWidth: '230px',
                                                }}
                                            >
                                                <Input
                                                    value={
                                                        draftProduct.product_name
                                                            ? `${draftProduct.product_name} (${draftProduct.product_code})`
                                                            : ''
                                                    }
                                                    placeholder="Select a product first"
                                                    readOnly
                                                    disabled={processing}
                                                />
                                            </TableCell>

                                            <TableCell
                                                style={{
                                                    minWidth: '120px',
                                                }}
                                            >
                                                <Input
                                                    value={draftProduct.unit}
                                                    placeholder="Unit"
                                                    readOnly
                                                    disabled={processing}
                                                />
                                            </TableCell>

                                            <TableCell
                                                style={{
                                                    minWidth: '150px',
                                                }}
                                            >
                                                <NumberInput
                                                    min="0.01"
                                                    step="0.01"
                                                    value={
                                                        draftProduct.quantity
                                                    }
                                                    placeholder="Quantity"
                                                    disabled={processing}
                                                    onValueChange={(value) =>
                                                        updateDraftProduct(
                                                            'quantity',
                                                            value,
                                                        )
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell
                                                style={{
                                                    minWidth: '200px',
                                                }}
                                            >
                                                <NumberInput
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        draftProduct.estimated_price_per_unit
                                                    }
                                                    placeholder="Estimated price"
                                                    disabled={processing}
                                                    onValueChange={(value) =>
                                                        updateDraftProduct(
                                                            'estimated_price_per_unit',
                                                            value,
                                                        )
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="primary"
                                                    disabled={processing}
                                                    onClick={addProduct}
                                                >
                                                    <Check size={16} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {data.items.map((item, index) => (
                                            <TableRow key={item.product_id}>
                                                <TableCell>
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        value={
                                                            item.product_code
                                                                ? `${item.product_name} (${item.product_code})`
                                                                : item.product_name
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
                                                        value={item?.unit ?? ''}
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
                                                    <NumberInput
                                                        min="0.01"
                                                        step="0.01"
                                                        value={item.quantity}
                                                        disabled={processing}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateProduct(
                                                                index,
                                                                'quantity',
                                                                value,
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
                                                    <NumberInput
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            item.estimated_price_per_unit
                                                        }
                                                        placeholder="Estimated price"
                                                        disabled={processing}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateProduct(
                                                                index,
                                                                'estimated_price_per_unit',
                                                                value,
                                                            )
                                                        }
                                                    />

                                                    <FormError
                                                        error={getError(
                                                            `items.${index}.estimated_price_per_unit`,
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
                                                            removeProduct(index)
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
                        )}
                    </div>

                    <div className="row mb-5">
                        <div className="col-12 d-flex justify-content-end gap-2">
                            <Link href="/lead" className="btn btn-light">
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={processing}
                            >
                                {processing ? 'Saving...' : 'Save Lead'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <AppModal
                open={existingLeadModalOpen}
                onOpenChange={setExistingLeadModalOpen}
                size="lg"
                centered
                closeOnBackdropClick={true}
                keyboard
                title={
                    <span className="d-flex align-items-center gap-2">
                        <span
                            className="d-inline-flex align-items-center justify-content-center rounded-circle"
                            style={{
                                width: 30,
                                height: 30,
                                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            <span>!</span>
                        </span>
                        Existing Lead Found
                    </span>
                }
                classNames={{ header: 'bg-warning', title: 'fw-bold' }}
                footer={
                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => setExistingLeadModalOpen(false)}
                    >
                        Close
                    </Button>
                }
            >
                {selectedExistingLead && (
                    <>
                        <div className="alert alert-warning mb-4">
                            <p
                                className=""
                                style={{
                                    fontSize: '14px',
                                }}
                            >
                                This phone number already exists in the CRM.
                                Please review the lead information before
                                creating a duplicate.
                            </p>
                        </div>
                        <div className="row">
                            {/* Lead Information */}
                            <div className="col-md-6">
                                <div className="card border-primary mb-3">
                                    <div className="card-header bg-primary text-white">
                                        <strong>Lead Information</strong>
                                    </div>
                                    <div className="card-body p-0">
                                        <table className="table table-bordered table-sm mb-0">
                                            <tbody>
                                                <tr>
                                                    <th
                                                        style={{ width: '40%' }}
                                                    >
                                                        Lead Name
                                                    </th>
                                                    <td>
                                                        {selectedExistingLead.name ||
                                                            '-'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Lead Code</th>
                                                    <td>
                                                        {selectedExistingLead.lead_code ||
                                                            '-'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Phone</th>
                                                    <td>
                                                        {selectedExistingLead.phone ||
                                                            '-'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Current Stage</th>
                                                    <td>
                                                        {selectedExistingLead.stage ||
                                                            '-'}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {/* Sales Responsibility */}
                            <div className="col-md-6">
                                <div className="card border-success mb-3">
                                    <div className="card-header bg-success text-white">
                                        <strong>Sales Responsibility</strong>
                                    </div>
                                    <div className="card-body p-0">
                                        <table className="table table-bordered table-sm mb-0">
                                            <tbody>
                                                <tr>
                                                    <th
                                                        style={{ width: '45%' }}
                                                    >
                                                        Created By
                                                    </th>
                                                    <td>
                                                        {selectedExistingLead.created_by_name ||
                                                            '-'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Employee No</th>
                                                    <td>
                                                        {selectedExistingLead.created_by_employee_no ||
                                                            '-'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Follow Up By</th>
                                                    <td>
                                                        {selectedExistingLead.follow_up_by_name ||
                                                            '-'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Employee No</th>
                                                    <td>
                                                        {selectedExistingLead.follow_up_by_employee_no ||
                                                            '-'}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Last Conversation */}
                        <div className="card border-info">
                            <div className="card-header bg-info text-white">
                                <strong>Last Conversation</strong>
                            </div>
                            <div className="card-body p-0">
                                <table className="table table-bordered table-sm mb-0">
                                    <tbody>
                                        <tr>
                                            <th style={{ width: '30%' }}>
                                                Conversation Date
                                            </th>
                                            <td>
                                                {selectedExistingLead.last_conversation_date ||
                                                    '-'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Conversation By</th>
                                            <td>
                                                {selectedExistingLead.last_conversation_by ||
                                                    '-'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </AppModal>
        </>
    );
}
