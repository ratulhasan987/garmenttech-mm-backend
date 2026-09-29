import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';

import { Head, useForm } from '@inertiajs/react';

import { Edit3, Eye, EyeOff, RefreshCcw } from 'react-feather';

import { z } from 'zod';

import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/form/select';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { DatePicker } from '@/components/ui/form/date-picker';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Role = {
    id: number;
    name: string;
};

type Department = {
    id: number;
    name: string;
};

type Designation = {
    id: number;
    name: string;
};

type Shift = {
    id: number;
    name: string;
};

type EmployeeSuggestion = {
    id: number;
    employee_id: string;
    name: string;
    label: string;
};

type ReportingOfficer = {
    id: number;
    employee_id: string;
    name: string;
};

type UserRole = {
    id?: number;
    name: string;
};

type User = {
    id: number;

    name: string;
    email: string;
    national_id?: string | null;

    attendance_type?: string | null;

    department_id?: number | null;
    designation_id?: number | null;
    shift_id?: number | null;

    reporting_officer?: number | string | null;
    reporting_officer_user?: ReportingOfficer | null;

    phone?: string | null;
    mobile?: string | null;
    emergency_contact?: string | null;

    pay_frequency?: string | null;

    bank_name?: string | null;
    account_number?: string | null;
    branch_address?: string | null;
    tin_number?: string | null;

    joining_date?: string | null;
    probation_period_end_date?: string | null;

    basic_salary?: number | string | null;
    transport_allowance?: number | string | null;
    family_allowance?: number | string | null;
    others_allowance?: number | string | null;

    gender?: string | null;
    marital_status?: string | null;
    blood_group?: string | null;
    health_condition?: string | null;

    address?: string | null;

    image?: string | null;
    image_url?: string | null;

    role?: string | null;
    roles?: UserRole[];
};

type EditUserPageProps = {
    user: User;

    roles: Role[];

    departments: Department[];

    designations: Designation[];

    shifts: Shift[];
};

type EditUserForm = {
    role: string;

    attendance_type: string;

    reporting_officer: string;

    name: string;

    email: string;

    national_id: string;

    department: string;

    designation: string;

    shift: string;

    phone: string;

    mobile: string;

    emergency_contact: string;

    pay_frequency: string;

    bank_name: string;

    account_number: string;

    branch_address: string;

    tin_number: string;

    joining_date: string;

    probation_period_end_date: string;

    basic_salary: string;

    transport_allowance: string;

    family_allowance: string;

    others_allowance: string;

    gender: string;

    marital_status: string;

    blood_group: string;

    health_condition: string;

    password: string;

    image: File | null;

    address: string;
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function toStringValue(value: string | number | null | undefined) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value);
}

function toDateInputValue(value?: string | null) {
    if (!value) {
        return '';
    }

    return value.slice(0, 10);
}

/*
|--------------------------------------------------------------------------
| Validation Helpers
|--------------------------------------------------------------------------
*/

const requiredString = (label: string, max = 255) =>
    z
        .string()
        .trim()
        .min(1, `${label} is required.`)
        .max(max, `${label} must not exceed ${max} characters.`);

const optionalString = (label: string, max = 255) =>
    z.string().trim().max(max, `${label} must not exceed ${max} characters.`);

const requiredId = (label: string) =>
    z
        .string()
        .trim()
        .min(1, `${label} is required.`)
        .refine((value) => /^\d+$/.test(value), {
            message: `${label} is invalid.`,
        });

const optionalId = (label: string) =>
    z
        .string()
        .trim()
        .refine((value) => value === '' || /^\d+$/.test(value), {
            message: `${label} is invalid.`,
        });

const requiredNumeric = (label: string) =>
    z
        .string()
        .trim()
        .min(1, `${label} is required.`)
        .refine((value) => Number.isFinite(Number(value)), {
            message: `${label} must be numeric.`,
        })
        .refine((value) => Number(value) >= 1, {
            message: `${label} must be at least 1.`,
        });

const optionalNumeric = (label: string) =>
    z
        .string()
        .trim()
        .refine((value) => value === '' || Number.isFinite(Number(value)), {
            message: `${label} must be numeric.`,
        })
        .refine((value) => value === '' || Number(value) >= 1, {
            message: `${label} must be at least 1.`,
        });

/*
|--------------------------------------------------------------------------
| Image Validation
|--------------------------------------------------------------------------
*/

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const imageSchema = z
    .custom<File | null>(
        (value) => {
            if (value === null) {
                return true;
            }

            if (typeof File === 'undefined') {
                return false;
            }

            return value instanceof File;
        },
        {
            message: 'Invalid image file.',
        },
    )
    .refine(
        (file) => file === null || ALLOWED_IMAGE_TYPES.includes(file.type),
        {
            message: 'Image must be jpeg, jpg, png, or gif.',
        },
    )
    .refine((file) => file === null || file.size <= MAX_IMAGE_SIZE, {
        message: 'Image must not exceed 2 MB.',
    });

/*
|--------------------------------------------------------------------------
| Edit User Schema
|--------------------------------------------------------------------------
*/

const editUserSchema = z.object({
    role: requiredString('Role'),

    attendance_type: z
        .string()
        .min(1, 'Attendance type is required.')
        .refine((value) => ['ip', 'location', 'device'].includes(value), {
            message: 'Invalid attendance type.',
        }),

    reporting_officer: optionalId('Reporting officer'),

    name: requiredString('Full name'),

    email: z
        .string()
        .trim()
        .min(1, 'Email is required.')
        .email('Please enter a valid email address.')
        .max(255, 'Email must not exceed 255 characters.'),

    national_id: optionalString('National ID number'),

    department: requiredId('Department'),

    designation: requiredId('Designation'),

    shift: requiredId('Shift'),

    phone: requiredString('Phone'),

    mobile: optionalString('Mobile'),

    emergency_contact: requiredString('Emergency contact'),

    pay_frequency: requiredString('Pay frequency'),

    bank_name: optionalString('Bank name'),

    account_number: optionalString('Account number'),

    branch_address: optionalString('Branch address'),

    tin_number: optionalString('Tin number'),

    joining_date: requiredString('Joining date'),

    probation_period_end_date: requiredString('Probation period end date'),

    basic_salary: requiredNumeric('Basic salary'),

    transport_allowance: optionalNumeric('Transport allowance'),

    family_allowance: optionalNumeric('Family allowance'),

    others_allowance: optionalNumeric('Others allowance'),

    gender: optionalString('Gender'),

    marital_status: optionalString('Marital status'),

    blood_group: optionalString('Blood group'),

    health_condition: optionalString('Health condition'),

    /*
        |--------------------------------------------------------------------------
        | Password
        |--------------------------------------------------------------------------
        |
        | Empty = keep current password.
        |
        */

    password: z.string().refine((value) => value === '' || value.length >= 8, {
        message: 'Password must be at least 8 characters.',
    }),

    image: imageSchema,

    address: optionalString('Address'),
});

/*
|--------------------------------------------------------------------------
| Employee Search
|--------------------------------------------------------------------------
*/

async function searchEmployees(
    query: string,
    signal?: AbortSignal,
): Promise<EmployeeSuggestion[]> {
    const response = await fetch(
        `/get-employees?keyword=${encodeURIComponent(query)}`,
        {
            signal,

            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Unable to load employees.');
    }

    const employees: Omit<EmployeeSuggestion, 'label'>[] =
        await response.json();

    return employees.map((employee) => ({
        ...employee,

        label: `${employee.name} - ${employee.employee_id}`,
    }));
}

/*
|--------------------------------------------------------------------------
| Password Generator
|--------------------------------------------------------------------------
*/

function generatePassword(length = 12) {
    const chars =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=?';

    const values = new Uint32Array(length);

    crypto.getRandomValues(values);

    return Array.from(values)
        .map((value) => chars[value % chars.length])
        .join('');
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function EditUserPage({
    user,
    roles = [],
    departments = [],
    designations = [],
    shifts = [],
}: EditUserPageProps) {
    const [showPassword, setShowPassword] = useState(false);

    const existingImage =
        user.image_url ?? user.image ?? '/riho/assets/images/img-preview.png';

    const [imagePreview, setImagePreview] = useState(existingImage);

    const currentRole = user.role ?? user.roles?.[0]?.name ?? '';

    const currentReportingOfficer = user.reporting_officer_user;

    const reportingOfficerLabel = currentReportingOfficer
        ? `${currentReportingOfficer.name} - ${currentReportingOfficer.employee_id}`
        : '';

    const {
        data,
        setData,
        post,
        processing,
        errors,
        setError,
        clearErrors,
        transform,
    } = useForm<EditUserForm>({
        role: currentRole,

        attendance_type: user.attendance_type ?? 'ip',

        reporting_officer: toStringValue(user.reporting_officer),

        name: user.name ?? '',

        email: user.email ?? '',

        national_id: user.national_id ?? '',

        department: toStringValue(user.department_id),

        designation: toStringValue(user.designation_id),

        shift: toStringValue(user.shift_id),

        phone: user.phone ?? '',

        mobile: user.mobile ?? '',

        emergency_contact: user.emergency_contact ?? '',

        pay_frequency: user.pay_frequency ?? 'Monthly',

        bank_name: user.bank_name ?? '',

        account_number: user.account_number ?? '',

        branch_address: user.branch_address ?? '',

        tin_number: user.tin_number ?? '',

        joining_date: toDateInputValue(user.joining_date),

        probation_period_end_date: toDateInputValue(
            user.probation_period_end_date,
        ),

        basic_salary: toStringValue(user.basic_salary),

        transport_allowance: toStringValue(user.transport_allowance),

        family_allowance: toStringValue(user.family_allowance),

        others_allowance: toStringValue(user.others_allowance),

        gender: user.gender ?? '',

        marital_status: user.marital_status ?? '',

        blood_group: user.blood_group ?? '',

        health_condition: user.health_condition ?? '',

        /*
            |--------------------------------------------------------------------------
            | Password
            |--------------------------------------------------------------------------
            |
            | Never prefill password.
            |
            */

        password: '',

        /*
            |--------------------------------------------------------------------------
            | Image
            |--------------------------------------------------------------------------
            |
            | Null means keep existing image unless a new image is selected.
            |
            */

        image: null,

        address: user.address ?? '',
    });

    /*
    |--------------------------------------------------------------------------
    | Update Field
    |--------------------------------------------------------------------------
    */

    const updateField = <K extends keyof EditUserForm>(
        field: K,
        value: EditUserForm[K],
    ) => {
        setData((currentData): EditUserForm => ({
            ...currentData,

            [field]: value,
        }));

        clearErrors(field);
    };

    /*
    |--------------------------------------------------------------------------
    | Gross Salary
    |--------------------------------------------------------------------------
    */

    const grossSalary = useMemo(() => {
        const basic = Number(data.basic_salary) || 0;

        const transport = Number(data.transport_allowance) || 0;

        const family = Number(data.family_allowance) || 0;

        const others = Number(data.others_allowance) || 0;

        return (basic + transport + family + others).toFixed(2);
    }, [
        data.basic_salary,
        data.transport_allowance,
        data.family_allowance,
        data.others_allowance,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Image Change
    |--------------------------------------------------------------------------
    */

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        clearErrors('image');

        if (!file) {
            setData((currentData): EditUserForm => ({
                ...currentData,
                image: null,
            }));

            setImagePreview(existingImage);

            return;
        }

        const result = imageSchema.safeParse(file);

        if (!result.success) {
            /*
            |--------------------------------------------------------------------------
            | Do not use updateField() here because it clears the image error.
            |--------------------------------------------------------------------------
            */

            setData((currentData): EditUserForm => ({
                ...currentData,
                image: null,
            }));

            setError(
                'image',
                result.error.issues[0]?.message ?? 'Invalid image.',
            );

            setImagePreview(existingImage);

            event.target.value = '';

            return;
        }

        updateField('image', file);

        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setImagePreview(reader.result);
            }
        };

        reader.readAsDataURL(file);
    };

    /*
    |--------------------------------------------------------------------------
    | Validate Form
    |--------------------------------------------------------------------------
    */

    const validateForm = (): boolean => {
        clearErrors();

        const result = editUserSchema.safeParse(data);

        if (result.success) {
            return true;
        }

        const fields = new Set<string>();

        result.error.issues.forEach((issue) => {
            const field = issue.path[0];

            if (typeof field !== 'string') {
                return;
            }

            /*
                    |--------------------------------------------------------------------------
                    | Only show first error per field
                    |--------------------------------------------------------------------------
                    */

            if (fields.has(field)) {
                return;
            }

            fields.add(field);

            setError(field as keyof EditUserForm, issue.message);
        });

        requestAnimationFrame(() => {
            const element = document.querySelector('.is-invalid');

            element?.scrollIntoView({
                behavior: 'smooth',

                block: 'center',
            });
        });

        return false;
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Laravel File Upload + PUT
        |--------------------------------------------------------------------------
        |
        | Multipart PUT/PATCH requests can be problematic in PHP.
        |
        | Send POST and spoof PUT instead.
        |
        */

        transform((formData) => ({
            ...formData,

            _method: 'put',
        }));

        post(`/user/${user.id}`, {
            preserveScroll: true,

            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Edit User" />

            <PageTitle title="Edit user" />

            <style>{`
                .employee-profile-upload {
                    position: relative;
                    width: 100%;
                    height: 195px;
                    margin-top: 10px;
                    padding: 5px;
                    border: 1px solid #ddd;
                    overflow: hidden;
                }

                .employee-profile-upload.is-invalid {
                    border-color: #dc3545;
                }

                .employee-profile-upload img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .employee-profile-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(14, 14, 14, 0.44);
                    opacity: 0;
                    cursor: pointer;
                    transition: opacity .2s ease;
                }

                .employee-profile-upload:hover
                .employee-profile-overlay {
                    opacity: 1;
                }

                .employee-profile-overlay input {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    cursor: pointer;
                }

                .employee-profile-edit-icon {
                    color: #fff;
                }
            `}</style>

            <div className="container-fluid">
                <form onSubmit={handleSubmit} noValidate>
                    {/*
                    |--------------------------------------------------------------------------
                    | Basic / Employment
                    |--------------------------------------------------------------------------
                    */}

                    <div className="row">
                        <div className="col-md-6">
                            <div className="card p-3">
                                <div className="row">
                                    {/* Role */}

                                    <div className="col-md-4">
                                        <div className="form-group mb-3">
                                            <label
                                                htmlFor="role"
                                                className="text-gray"
                                            >
                                                Assign Role (*)
                                            </label>

                                            <Select
                                                id="role"
                                                name="role"
                                                value={data.role}
                                                error={errors.role}
                                                onChange={(event) =>
                                                    updateField(
                                                        'role',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select Role
                                                </option>

                                                {roles.map((role) => (
                                                    <option
                                                        key={role.id}
                                                        value={role.name}
                                                    >
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </Select>

                                            {errors.role && (
                                                <div className="form-text text-danger">
                                                    {errors.role}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Attendance Type */}

                                    <div className="col-md-4">
                                        <div className="form-group mb-3">
                                            <label
                                                htmlFor="attendance_type"
                                                className="text-gray"
                                            >
                                                Attendance Type (*)
                                            </label>

                                            <Select
                                                id="attendance_type"
                                                name="attendance_type"
                                                value={data.attendance_type}
                                                error={errors.attendance_type}
                                                onChange={(event) =>
                                                    updateField(
                                                        'attendance_type',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="ip">IP</option>

                                                <option value="location">
                                                    Location
                                                </option>

                                                <option value="device">
                                                    Biometric Device
                                                </option>
                                            </Select>

                                            {errors.attendance_type && (
                                                <div className="form-text text-danger">
                                                    {errors.attendance_type}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reporting Officer */}

                                    <div className="col-md-4">
                                        <div className="form-group mb-3">
                                            <label className="text-gray">
                                                Reporting Officer
                                            </label>

                                            <SuggestionSearchInput<EmployeeSuggestion>
                                                searchFn={searchEmployees}
                                                idKey="id"
                                                labelKey="label"
                                                defaultValue={
                                                    reportingOfficerLabel
                                                }
                                                placeholder="Search employees"
                                                clearOnFocus={false}
                                                showSearchIcon
                                                error={errors.reporting_officer}
                                                onSelect={(employee) =>
                                                    updateField(
                                                        'reporting_officer',
                                                        String(employee.id),
                                                    )
                                                }
                                                onClear={() =>
                                                    updateField(
                                                        'reporting_officer',
                                                        '',
                                                    )
                                                }
                                            />

                                            {errors.reporting_officer && (
                                                <div className="form-text text-danger">
                                                    {errors.reporting_officer}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Name */}

                                <div className="form-group mb-3">
                                    <label htmlFor="name" className="text-gray">
                                        Full Name (*)
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        className={`form-control ${
                                            errors.name ? 'is-invalid' : ''
                                        }`}
                                        value={data.name}
                                        onChange={(event) =>
                                            updateField(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.name && (
                                        <div className="form-text text-danger">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                {/* Email */}

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="email"
                                        className="text-gray"
                                    >
                                        Email (*)
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        className={`form-control ${
                                            errors.email ? 'is-invalid' : ''
                                        }`}
                                        value={data.email}
                                        onChange={(event) =>
                                            updateField(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.email && (
                                        <div className="form-text text-danger">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                {/* National ID */}

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="national_id"
                                        className="text-gray"
                                    >
                                        National Id Number
                                    </label>

                                    <input
                                        id="national_id"
                                        type="text"
                                        className={`form-control ${
                                            errors.national_id
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={data.national_id}
                                        onChange={(event) =>
                                            updateField(
                                                'national_id',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.national_id && (
                                        <div className="form-text text-danger">
                                            {errors.national_id}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/*
                        |--------------------------------------------------------------------------
                        | Employment
                        |--------------------------------------------------------------------------
                        */}

                        <div className="col-md-6">
                            <div className="card p-3">
                                <div className="row">
                                    {/* Department */}

                                    <div className="col-md-4">
                                        <div className="form-group mb-3">
                                            <label
                                                htmlFor="department"
                                                className="text-gray"
                                            >
                                                Department (*)
                                            </label>

                                            <Select
                                                id="department"
                                                value={data.department}
                                                error={errors.department}
                                                onChange={(event) =>
                                                    updateField(
                                                        'department',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select Department
                                                </option>

                                                {departments.map(
                                                    (department) => (
                                                        <option
                                                            key={department.id}
                                                            value={String(
                                                                department.id,
                                                            )}
                                                        >
                                                            {department.name}
                                                        </option>
                                                    ),
                                                )}
                                            </Select>

                                            {errors.department && (
                                                <div className="form-text text-danger">
                                                    {errors.department}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Designation */}

                                    <div className="col-md-4">
                                        <div className="form-group mb-3">
                                            <label
                                                htmlFor="designation"
                                                className="text-gray"
                                            >
                                                Designation (*)
                                            </label>

                                            <Select
                                                id="designation"
                                                value={data.designation}
                                                error={errors.designation}
                                                onChange={(event) =>
                                                    updateField(
                                                        'designation',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select Designation
                                                </option>

                                                {designations.map(
                                                    (designation) => (
                                                        <option
                                                            key={designation.id}
                                                            value={String(
                                                                designation.id,
                                                            )}
                                                        >
                                                            {designation.name}
                                                        </option>
                                                    ),
                                                )}
                                            </Select>

                                            {errors.designation && (
                                                <div className="form-text text-danger">
                                                    {errors.designation}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Shift */}

                                    <div className="col-md-4">
                                        <div className="form-group mb-3">
                                            <label
                                                htmlFor="shift"
                                                className="text-gray"
                                            >
                                                Shift (*)
                                            </label>

                                            <Select
                                                id="shift"
                                                value={data.shift}
                                                error={errors.shift}
                                                onChange={(event) =>
                                                    updateField(
                                                        'shift',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select Shift
                                                </option>

                                                {shifts.map((shift) => (
                                                    <option
                                                        key={shift.id}
                                                        value={String(shift.id)}
                                                    >
                                                        {shift.name}
                                                    </option>
                                                ))}
                                            </Select>

                                            {errors.shift && (
                                                <div className="form-text text-danger">
                                                    {errors.shift}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Phone */}

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="phone"
                                        className="text-gray"
                                    >
                                        Phone (*)
                                    </label>

                                    <input
                                        id="phone"
                                        type="text"
                                        inputMode="numeric"
                                        className={`form-control ${
                                            errors.phone ? 'is-invalid' : ''
                                        }`}
                                        value={data.phone}
                                        onChange={(event) =>
                                            updateField(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.phone && (
                                        <div className="form-text text-danger">
                                            {errors.phone}
                                        </div>
                                    )}
                                </div>

                                {/* Mobile */}

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="mobile"
                                        className="text-gray"
                                    >
                                        Mobile
                                    </label>

                                    <input
                                        id="mobile"
                                        type="text"
                                        inputMode="numeric"
                                        className={`form-control ${
                                            errors.mobile ? 'is-invalid' : ''
                                        }`}
                                        value={data.mobile}
                                        onChange={(event) =>
                                            updateField(
                                                'mobile',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.mobile && (
                                        <div className="form-text text-danger">
                                            {errors.mobile}
                                        </div>
                                    )}
                                </div>

                                {/* Emergency */}

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="emergency_contact"
                                        className="text-gray"
                                    >
                                        Emergency Contact (*)
                                    </label>

                                    <input
                                        id="emergency_contact"
                                        type="text"
                                        inputMode="numeric"
                                        className={`form-control ${
                                            errors.emergency_contact
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={data.emergency_contact}
                                        onChange={(event) =>
                                            updateField(
                                                'emergency_contact',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.emergency_contact && (
                                        <div className="form-text text-danger">
                                            {errors.emergency_contact}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Bank / Salary
                    |--------------------------------------------------------------------------
                    */}

                    <div className="row">
                        <div className="col-md-6">
                            <div className="card p-3">
                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="pay_frequency"
                                        className="text-gray"
                                    >
                                        Pay Frequency
                                    </label>

                                    <Select
                                        id="pay_frequency"
                                        value={data.pay_frequency}
                                        error={errors.pay_frequency}
                                        onChange={(event) =>
                                            updateField(
                                                'pay_frequency',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="Monthly">Monthly</option>
                                    </Select>

                                    {errors.pay_frequency && (
                                        <div className="form-text text-danger">
                                            {errors.pay_frequency}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="bank_name"
                                        className="text-gray"
                                    >
                                        Bank Name
                                    </label>

                                    <input
                                        id="bank_name"
                                        type="text"
                                        className={`form-control ${
                                            errors.bank_name ? 'is-invalid' : ''
                                        }`}
                                        value={data.bank_name}
                                        onChange={(event) =>
                                            updateField(
                                                'bank_name',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.bank_name && (
                                        <div className="form-text text-danger">
                                            {errors.bank_name}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="account_number"
                                        className="text-gray"
                                    >
                                        Account Number
                                    </label>

                                    <input
                                        id="account_number"
                                        type="text"
                                        className={`form-control ${
                                            errors.account_number
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={data.account_number}
                                        onChange={(event) =>
                                            updateField(
                                                'account_number',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.account_number && (
                                        <div className="form-text text-danger">
                                            {errors.account_number}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="branch_address"
                                        className="text-gray"
                                    >
                                        Branch Address
                                    </label>

                                    <input
                                        id="branch_address"
                                        type="text"
                                        className={`form-control ${
                                            errors.branch_address
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={data.branch_address}
                                        onChange={(event) =>
                                            updateField(
                                                'branch_address',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.branch_address && (
                                        <div className="form-text text-danger">
                                            {errors.branch_address}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="tin_number"
                                        className="text-gray"
                                    >
                                        Tin Number
                                    </label>

                                    <input
                                        id="tin_number"
                                        type="text"
                                        className={`form-control ${
                                            errors.tin_number
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={data.tin_number}
                                        onChange={(event) =>
                                            updateField(
                                                'tin_number',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.tin_number && (
                                        <div className="form-text text-danger">
                                            {errors.tin_number}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card p-3">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label
                                                htmlFor="joining_date"
                                                className="text-gray"
                                            >
                                                Joining Date (*)
                                            </label>

                                            <DatePicker
                                                id="joining_date"
                                                className={`form-control ${
                                                    errors.joining_date
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                value={data.joining_date}
                                                placeholder="mm/dd/yyyy"
                                                onChange={(date) => {
                                                    updateField(
                                                        'joining_date',
                                                        date,
                                                    );
                                                    updateField(
                                                        'probation_period_end_date',
                                                        '',
                                                    );
                                                }}
                                                displayFormat="m/d/Y"
                                                showClearButton
                                            />

                                            {errors.joining_date && (
                                                <div className="form-text text-danger">
                                                    {errors.joining_date}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label
                                                htmlFor="probation_period_end_date"
                                                className="text-gray"
                                            >
                                                Probation End Date (*)
                                            </label>

                                            <DatePicker
                                                disabled={!data?.joining_date}
                                                id="probation_period_end_date"
                                                className={`form-control ${
                                                    errors.probation_period_end_date
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                value={
                                                    data.probation_period_end_date
                                                }
                                                placeholder="mm/dd/yyyy"
                                                onChange={(date) => {
                                                    updateField(
                                                        'probation_period_end_date',
                                                        date,
                                                    );
                                                }}
                                                displayFormat="m/d/Y"
                                                minDate={data.joining_date}
                                                showClearButton
                                            />

                                            {errors.probation_period_end_date && (
                                                <div className="form-text text-danger">
                                                    {
                                                        errors.probation_period_end_date
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="basic_salary"
                                        className="text-gray"
                                    >
                                        Basic Salary (*)
                                    </label>

                                    <input
                                        id="basic_salary"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        className={`form-control ${
                                            errors.basic_salary
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={data.basic_salary}
                                        onChange={(event) =>
                                            updateField(
                                                'basic_salary',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.basic_salary && (
                                        <div className="form-text text-danger">
                                            {errors.basic_salary}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="transport_allowance"
                                        className="text-gray"
                                    >
                                        Transport Allowance
                                    </label>

                                    <input
                                        id="transport_allowance"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        className={`form-control ${
                                            errors.transport_allowance
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={data.transport_allowance}
                                        onChange={(event) =>
                                            updateField(
                                                'transport_allowance',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.transport_allowance && (
                                        <div className="form-text text-danger">
                                            {errors.transport_allowance}
                                        </div>
                                    )}
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label
                                                htmlFor="family_allowance"
                                                className="text-gray"
                                            >
                                                Family Allowance
                                            </label>

                                            <input
                                                id="family_allowance"
                                                type="number"
                                                min="1"
                                                step="0.01"
                                                className={`form-control ${
                                                    errors.family_allowance
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                value={data.family_allowance}
                                                onChange={(event) =>
                                                    updateField(
                                                        'family_allowance',
                                                        event.target.value,
                                                    )
                                                }
                                            />

                                            {errors.family_allowance && (
                                                <div className="form-text text-danger">
                                                    {errors.family_allowance}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label
                                                htmlFor="others_allowance"
                                                className="text-gray"
                                            >
                                                Others Allowance
                                            </label>

                                            <input
                                                id="others_allowance"
                                                type="number"
                                                min="1"
                                                step="0.01"
                                                className={`form-control ${
                                                    errors.others_allowance
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                value={data.others_allowance}
                                                onChange={(event) =>
                                                    updateField(
                                                        'others_allowance',
                                                        event.target.value,
                                                    )
                                                }
                                            />

                                            {errors.others_allowance && (
                                                <div className="form-text text-danger">
                                                    {errors.others_allowance}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="gross_salary"
                                        className="text-gray"
                                    >
                                        Gross Salary
                                    </label>

                                    <input
                                        id="gross_salary"
                                        type="text"
                                        className="form-control"
                                        value={grossSalary}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Personal / Security
                    |--------------------------------------------------------------------------
                    */}

                    <div className="row">
                        <div className="col-md-6">
                            <div className="card p-3">
                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="gender"
                                        className="text-gray"
                                    >
                                        Gender
                                    </label>

                                    <Select
                                        id="gender"
                                        value={data.gender}
                                        error={errors.gender}
                                        onChange={(event) =>
                                            updateField(
                                                'gender',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Select one</option>

                                        <option value="Male">Male</option>

                                        <option value="Female">Female</option>

                                        <option value="Others">Others</option>
                                    </Select>

                                    {errors.gender && (
                                        <div className="form-text text-danger">
                                            {errors.gender}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="marital_status"
                                        className="text-gray"
                                    >
                                        Marital Status
                                    </label>

                                    <Select
                                        id="marital_status"
                                        value={data.marital_status}
                                        error={errors.marital_status}
                                        onChange={(event) =>
                                            updateField(
                                                'marital_status',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Select one</option>

                                        <option value="Single">Single</option>

                                        <option value="Married">Married</option>

                                        <option value="Divorced">
                                            Divorced
                                        </option>
                                    </Select>

                                    {errors.marital_status && (
                                        <div className="form-text text-danger">
                                            {errors.marital_status}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="blood_group"
                                        className="text-gray"
                                    >
                                        Blood Group
                                    </label>

                                    <input
                                        id="blood_group"
                                        type="text"
                                        className={`form-control ${
                                            errors.blood_group
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={data.blood_group}
                                        onChange={(event) =>
                                            updateField(
                                                'blood_group',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.blood_group && (
                                        <div className="form-text text-danger">
                                            {errors.blood_group}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="health_condition"
                                        className="text-gray"
                                    >
                                        Health Condition
                                    </label>

                                    <input
                                        id="health_condition"
                                        type="text"
                                        className={`form-control ${
                                            errors.health_condition
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={data.health_condition}
                                        onChange={(event) =>
                                            updateField(
                                                'health_condition',
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {errors.health_condition && (
                                        <div className="form-text text-danger">
                                            {errors.health_condition}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card p-3">
                                {/*
                                |--------------------------------------------------------------------------
                                | Password
                                |--------------------------------------------------------------------------
                                */}

                                <div className="form-group mb-3">
                                    <label
                                        htmlFor="password"
                                        className="form-label"
                                    >
                                        New Password
                                    </label>

                                    <div className="input-group">
                                        <input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            className={`form-control ${
                                                errors.password
                                                    ? 'is-invalid'
                                                    : ''
                                            }`}
                                            placeholder="Leave blank to keep current password"
                                            value={data.password}
                                            onChange={(event) =>
                                                updateField(
                                                    'password',
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="input-group-text list-light-danger"
                                            onClick={() =>
                                                setShowPassword(
                                                    (previous) => !previous,
                                                )
                                            }
                                        >
                                            {showPassword ? (
                                                <Eye size={18} />
                                            ) : (
                                                <EyeOff size={18} />
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            className="input-group-text list-light-danger"
                                            title="Generate password"
                                            onClick={() =>
                                                updateField(
                                                    'password',
                                                    generatePassword(),
                                                )
                                            }
                                        >
                                            <RefreshCcw size={18} />
                                        </button>
                                    </div>

                                    {errors.password && (
                                        <div className="form-text text-danger">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="row">
                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Profile Image
                                    |--------------------------------------------------------------------------
                                    */}

                                    <div className="col-md-6">
                                        <div className="form-group mb-4">
                                            <label className="form-label">
                                                Profile Image
                                            </label>

                                            <div
                                                className={`employee-profile-upload ${
                                                    errors.image
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                            >
                                                <img
                                                    src={imagePreview}
                                                    alt="Profile preview"
                                                />

                                                <label className="employee-profile-overlay">
                                                    <Edit3
                                                        size={35}
                                                        className="employee-profile-edit-icon"
                                                    />

                                                    <input
                                                        type="file"
                                                        accept=".jpeg,.jpg,.png,.gif,image/jpeg,image/png,image/gif"
                                                        onChange={
                                                            handleImageChange
                                                        }
                                                    />
                                                </label>
                                            </div>

                                            {errors.image && (
                                                <div className="form-text text-danger">
                                                    {errors.image}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Address
                                    |--------------------------------------------------------------------------
                                    */}

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label
                                                htmlFor="address"
                                                className="form-label"
                                            >
                                                Address
                                            </label>

                                            <textarea
                                                id="address"
                                                className={`form-control ${
                                                    errors.address
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                rows={8}
                                                value={data.address}
                                                onChange={(event) =>
                                                    updateField(
                                                        'address',
                                                        event.target.value,
                                                    )
                                                }
                                            />

                                            {errors.address && (
                                                <div className="form-text text-danger">
                                                    {errors.address}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Submit
                    |--------------------------------------------------------------------------
                    */}

                    <div className="d-flex justify-content-end mb-3">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update User'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
