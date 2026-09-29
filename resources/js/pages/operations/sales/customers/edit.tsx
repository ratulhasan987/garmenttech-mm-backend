import { type FormEvent, useCallback, useEffect, useState } from 'react';

import { Head, Link, useForm } from '@inertiajs/react';

import { ArrowLeft, Save, User } from 'react-feather';

import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { DatePicker } from '@/components/ui/form/date-picker';
import { asset } from '@/lib/asset';

type Suggestion = {
    id: number;
    name: string;
};

type CustomerData = {
    id: number;
    client_no: string;
    name: string;
    phone: string;
    email: string | null;

    nid_no: string | null;
    passport_no: string | null;
    tin_no: string | null;
    date_of_birth: string | null;
    gender: string | null;
    marital_status: string | null;

    profession_id: number | null;
    lead_designation_id: number | null;
    company_name: string | null;

    present_address: string | null;
    permanent_address: string | null;
    area_id: number | null;
    sector_id: number | null;

    image: string | null;
    status: string;

    profession: Suggestion | null;
    area: Suggestion | null;
    designation: Suggestion | null;
    sector: Suggestion | null;

    created_at: string;
    updated_at: string;
};

type CustomerFormData = {
    name: string;
    phone: string;
    email: string | null;

    nid_no: string | null;
    passport_no: string | null;
    tin_no: string | null;
    date_of_birth: string | null;
    gender: string | null;
    marital_status: string | null;

    profession_id: number | null;
    lead_designation_id: number | null;
    company_name: string | null;

    present_address: string | null;
    permanent_address: string | null;
    area_id: number | null;
    sector_id: number | null;

    image: string | File | null;
    status: string;
};

export default function CreateCustomerPage({
    customer,
}: {
    customer: CustomerData;
}) {
    const { data, setData, put, processing, errors, transform } =
        useForm<CustomerFormData>({
            name: customer?.name ?? '',
            phone: customer?.phone ?? '',
            email: customer?.email ?? '',

            nid_no: customer?.nid_no ?? null,
            passport_no: customer?.passport_no ?? null,
            tin_no: customer?.tin_no ?? null,
            date_of_birth: customer?.date_of_birth ?? null,
            gender: customer?.gender ?? null,
            marital_status: customer?.marital_status ?? null,

            profession_id: customer?.profession_id ?? null,
            lead_designation_id: customer?.lead_designation_id ?? null,
            company_name: customer?.company_name ?? null,

            present_address: customer?.present_address ?? null,
            permanent_address: customer?.permanent_address ?? null,
            area_id: customer?.area_id ?? null,
            sector_id: customer?.sector_id ?? null,

            image: null,
            status: 'active',
        });

    const [imagePreview, setImagePreview] = useState<string | null>(
        asset(customer?.image ?? ''),
    );

    const [selectedProfession, setSelectedProfession] =
        useState<Suggestion | null>(customer?.profession || null);

    const [selectedDesignation, setSelectedDesignation] =
        useState<Suggestion | null>(customer?.designation || null);

    const [selectedArea, setSelectedArea] = useState<Suggestion | null>(
        customer?.area || null,
    );

    const [selectedSector, setSelectedSector] = useState<Suggestion | null>(
        customer?.sector || null,
    );

    useEffect(() => {
        return () => {
            if (imagePreview?.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const searchSuggestions = useCallback(
        async (endpoint: string, keyword: string): Promise<Suggestion[]> => {
            const response = await fetch(
                `${endpoint}?keyword=${encodeURIComponent(keyword)}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                return [];
            }

            const result = await response.json();

            /*
             * Supports:
             * { data: [...] }
             * { results: [...] }
             * [...]
             */
            if (Array.isArray(result)) {
                return result;
            }

            if (Array.isArray(result.data)) {
                return result.data;
            }

            if (Array.isArray(result.results)) {
                return result.results;
            }

            return [];
        },
        [],
    );

    const searchProfessions = useCallback(
        (keyword: string) =>
            searchSuggestions('/get-lead-professions', keyword),
        [searchSuggestions],
    );

    const searchDesignations = useCallback(
        (keyword: string) =>
            searchSuggestions('/get-lead-designations', keyword),
        [searchSuggestions],
    );

    const searchAreas = useCallback(
        (keyword: string) => searchSuggestions('/get-lead-area', keyword),
        [searchSuggestions],
    );

    const searchSectors = useCallback(
        (keyword: string) => searchSuggestions('/get-lead-sectors', keyword),
        [searchSuggestions],
    );

    const handleImageChange = (file: File | null) => {
        if (imagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        setData('image', file);

        if (!file) {
            setImagePreview(null);

            return;
        }

        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(`/operations/sales/customers/${customer?.id}`, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Edit Customer" />

            <PageTitle title="Create Customer" />

            <div className="container-fluid">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div>
                                    <h5 className="mb-1">Create Customer</h5>

                                    <p className="text-muted mb-0">
                                        Add customer profile and CRM
                                        information.
                                    </p>
                                </div>

                                <Link
                                    href="/operations/sales/customers"
                                    className="btn btn-outline-secondary"
                                >
                                    <ArrowLeft size={17} className="me-2" />
                                    Customers
                                </Link>
                            </div>
                        </CardHeader>

                        <CardBody>
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Customer Name
                                        <span className="text-danger ms-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        className={`form-control ${
                                            errors.name ? 'is-invalid' : ''
                                        }`}
                                        placeholder="Enter customer name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                    />

                                    {errors.name && (
                                        <div className="invalid-feedback">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Phone
                                        <span className="text-danger ms-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        className={`form-control ${
                                            errors.phone ? 'is-invalid' : ''
                                        }`}
                                        placeholder="01XXXXXXXXX"
                                        value={data.phone}
                                        onChange={(event) =>
                                            setData('phone', event.target.value)
                                        }
                                    />

                                    {errors.phone && (
                                        <div className="invalid-feedback">
                                            {errors.phone}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Email</label>

                                    <input
                                        type="email"
                                        className={`form-control ${
                                            errors.email ? 'is-invalid' : ''
                                        }`}
                                        placeholder="customer@example.com"
                                        value={data?.email ?? ''}
                                        onChange={(event) =>
                                            setData('email', event.target.value)
                                        }
                                    />

                                    {errors.email && (
                                        <div className="invalid-feedback">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        NID No.
                                    </label>

                                    <input
                                        type="text"
                                        className={`form-control ${
                                            errors.nid_no ? 'is-invalid' : ''
                                        }`}
                                        placeholder="Enter NID number"
                                        value={data?.nid_no ?? ''}
                                        onChange={(event) =>
                                            setData(
                                                'nid_no',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.nid_no && (
                                        <div className="invalid-feedback">
                                            {errors.nid_no}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Passport No.
                                    </label>

                                    <input
                                        type="text"
                                        className={`form-control ${
                                            errors.passport_no
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        placeholder="Enter passport number"
                                        value={data?.passport_no ?? ''}
                                        onChange={(event) =>
                                            setData(
                                                'passport_no',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.passport_no && (
                                        <div className="invalid-feedback">
                                            {errors.passport_no}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        TIN No.
                                    </label>

                                    <input
                                        type="text"
                                        className={`form-control ${
                                            errors.tin_no ? 'is-invalid' : ''
                                        }`}
                                        placeholder="Enter TIN number"
                                        value={data?.tin_no ?? ''}
                                        onChange={(event) =>
                                            setData(
                                                'tin_no',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.tin_no && (
                                        <div className="invalid-feedback">
                                            {errors.tin_no}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Date of Birth
                                    </label>

                                    <DatePicker
                                        id="date_of_birth"
                                        mode="single"
                                        value={data?.date_of_birth ?? ''}
                                        placeholder="Select required date"
                                        disabled={processing}
                                        onChange={(value) =>
                                            setData('date_of_birth', value)
                                        }
                                        dateFormat="Y-m-d"
                                        displayFormat="Y-m-d"
                                    />

                                    {errors.date_of_birth && (
                                        <div className="invalid-feedback">
                                            {errors.date_of_birth}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Gender</label>

                                    <select
                                        className={`form-select ${
                                            errors.gender ? 'is-invalid' : ''
                                        }`}
                                        value={data?.gender ?? ''}
                                        onChange={(event) =>
                                            setData(
                                                'gender',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>

                                    {errors.gender && (
                                        <div className="invalid-feedback">
                                            {errors.gender}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Marital Status
                                    </label>

                                    <select
                                        className={`form-select ${
                                            errors.marital_status
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={data?.marital_status ?? ''}
                                        onChange={(event) =>
                                            setData(
                                                'marital_status',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Select status</option>
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="divorced">
                                            Divorced
                                        </option>
                                        <option value="widowed">Widowed</option>
                                    </select>

                                    {errors.marital_status && (
                                        <div className="invalid-feedback">
                                            {errors.marital_status}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Profession
                                    </label>

                                    <SuggestionSearchInput<Suggestion>
                                        searchFn={searchProfessions}
                                        idKey="id"
                                        labelKey="name"
                                        placeholder="Select profession"
                                        showSearchIcon={false}
                                        clearOnFocus={false}
                                        disabled={processing}
                                        error={errors.profession_id}
                                        defaultSelectedItem={selectedProfession}
                                        onSelect={(profession) => {
                                            setSelectedProfession(profession);
                                            setData(
                                                'profession_id',
                                                profession.id,
                                            );
                                        }}
                                        onClear={() => {
                                            setSelectedProfession(null);
                                            setData('profession_id', null);
                                        }}
                                    />

                                    {errors.profession_id && (
                                        <div className="invalid-feedback d-block">
                                            {errors.profession_id}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Lead Designation
                                    </label>

                                    <SuggestionSearchInput<Suggestion>
                                        searchFn={searchDesignations}
                                        idKey="id"
                                        labelKey="name"
                                        placeholder="Select lead designation"
                                        showSearchIcon={false}
                                        clearOnFocus={false}
                                        disabled={processing}
                                        error={errors.lead_designation_id}
                                        defaultSelectedItem={
                                            selectedDesignation
                                        }
                                        onSelect={(designation) => {
                                            setSelectedDesignation(designation);

                                            setData(
                                                'lead_designation_id',
                                                designation.id,
                                            );
                                        }}
                                        onClear={() => {
                                            setSelectedDesignation(null);

                                            setData(
                                                'lead_designation_id',
                                                null,
                                            );
                                        }}
                                    />

                                    {errors.lead_designation_id && (
                                        <div className="invalid-feedback d-block">
                                            {errors.lead_designation_id}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Company Name
                                    </label>

                                    <input
                                        type="text"
                                        className={`form-control ${
                                            errors.company_name
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        placeholder="Enter company name"
                                        value={data?.company_name ?? ''}
                                        onChange={(event) =>
                                            setData(
                                                'company_name',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.company_name && (
                                        <div className="invalid-feedback">
                                            {errors.company_name}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Area</label>

                                    <SuggestionSearchInput<Suggestion>
                                        searchFn={searchAreas}
                                        idKey="id"
                                        labelKey="name"
                                        placeholder="Select area"
                                        showSearchIcon={false}
                                        clearOnFocus={false}
                                        disabled={processing}
                                        error={errors.area_id}
                                        defaultSelectedItem={selectedArea}
                                        onSelect={(area) => {
                                            setSelectedArea(area);
                                            setData('area_id', area.id);
                                        }}
                                        onClear={() => {
                                            setSelectedArea(null);
                                            setData('area_id', null);
                                        }}
                                    />

                                    {errors.area_id && (
                                        <div className="invalid-feedback d-block">
                                            {errors.area_id}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Sector</label>

                                    <SuggestionSearchInput<Suggestion>
                                        searchFn={searchSectors}
                                        idKey="id"
                                        labelKey="name"
                                        placeholder="Select sector"
                                        showSearchIcon={false}
                                        clearOnFocus={false}
                                        disabled={processing}
                                        error={errors.sector_id}
                                        defaultSelectedItem={selectedSector}
                                        onSelect={(sector) => {
                                            setSelectedSector(sector);
                                            setData('sector_id', sector.id);
                                        }}
                                        onClear={() => {
                                            setSelectedSector(null);
                                            setData('sector_id', null);
                                        }}
                                    />

                                    {errors.sector_id && (
                                        <div className="invalid-feedback d-block">
                                            {errors.sector_id}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Present Address
                                    </label>

                                    <textarea
                                        rows={4}
                                        className={`form-control ${
                                            errors.present_address
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        placeholder="Enter present address"
                                        value={data?.present_address ?? ''}
                                        onChange={(event) =>
                                            setData(
                                                'present_address',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.present_address && (
                                        <div className="invalid-feedback">
                                            {errors.present_address}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Permanent Address
                                    </label>

                                    <textarea
                                        rows={4}
                                        className={`form-control ${
                                            errors.permanent_address
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        placeholder="Enter permanent address"
                                        value={data?.permanent_address ?? ''}
                                        onChange={(event) =>
                                            setData(
                                                'permanent_address',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.permanent_address && (
                                        <div className="invalid-feedback">
                                            {errors.permanent_address}
                                        </div>
                                    )}
                                </div>

                                <div className="col-12">
                                    <hr className="my-0" />
                                </div>

                                <div className="col-9">
                                    <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-circle border overflow-hidden bg-light flex-shrink-0"
                                            style={{
                                                width: 90,
                                                height: 90,
                                            }}
                                        >
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Customer preview"
                                                    className="w-100 h-100"
                                                    style={{
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            ) : (
                                                <User
                                                    size={36}
                                                    className="text-muted"
                                                />
                                            )}
                                        </div>

                                        <div
                                            className="flex-grow-1"
                                            style={{ maxWidth: 500 }}
                                        >
                                            <label className="form-label">
                                                Customer Image
                                            </label>

                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className={`form-control ${
                                                    errors.image
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                onChange={(event) =>
                                                    handleImageChange(
                                                        event.target
                                                            .files?.[0] ?? null,
                                                    )
                                                }
                                            />

                                            {errors.image && (
                                                <div className="invalid-feedback">
                                                    {errors.image}
                                                </div>
                                            )}

                                            <div className="form-text">
                                                JPG, PNG or WebP. Maximum 2 MB.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Status</label>

                                    <select
                                        className={`form-select ${
                                            errors.status ? 'is-invalid' : ''
                                        }`}
                                        value={data.status}
                                        onChange={(event) =>
                                            setData(
                                                'status',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>

                                    {errors.status && (
                                        <div className="invalid-feedback">
                                            {errors.status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardBody>

                        <CardFooter>
                            <div className="d-flex w-100 justify-content-end gap-2">
                                <Link
                                    href="/operations/sales/customers"
                                    className="btn btn-outline-secondary"
                                >
                                    Cancel
                                </Link>

                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                aria-hidden="true"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} className="me-2" />
                                            Save Customer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </>
    );
}
