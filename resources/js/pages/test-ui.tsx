import PageTitle from '@/components/page-title';

import {
    Head,
    useForm,
} from '@inertiajs/react';

import {
    type FormEvent,
    useMemo,
} from 'react';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

import { Input } from '@/components/ui/form/input';

import { Select } from '@/components/ui/form/select';

import { Textarea } from '@/components/ui/form/textarea';

import { DatePicker } from '@/components/ui/form/date-picker';

import { PasswordInput } from '@/components/ui/form/password-input';

import { Button } from '@/components/ui/button';

import {
    Card,
    CardBody,
    CardHeader,
} from '@/components/ui/card';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { searchEmployees } from '@/services/employee-service';
import { FileDropzone } from '@/components/ui/form/file-dropzone';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';

type EmployeeFormData = {
    role_id: string;

    attendance_type: string;

    reporting_officer_id: string;

    full_name: string;

    email: string;

    national_id_number: string;

    department_id: string;

    designation_id: string;

    shift_id: string;

    phone: string;

    mobile: string;

    emergency_contact: string;

    pay_frequency: string;

    bank_name: string;

    account_number: string;

    branch_address: string;

    tin_number: string;

    joining_date: string;

    probation_end_date: string;

    basic_salary: string;

    transport_allowance: string;

    family_allowance: string;

    others_allowance: string;

    gross_salary: string;

    gender: string;

    marital_status: string;

    blood_group: string;

    health_condition: string;

    password: string;

    address: string;
    image: File | null
};

type EmployeeSuggestion = {
    id: number;
    employee_id: string | null;
    name: string;
};

export default function TestUI() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        reset,
        transform,
    } =
        useForm<EmployeeFormData>({
            role_id: '',

            attendance_type:
                'IP',

            reporting_officer_id:
                '',

            full_name: '',

            email: '',

            national_id_number:
                '',

            department_id: '',

            designation_id: '',

            shift_id: '',

            phone: '',

            mobile: '',

            emergency_contact:
                '',

            pay_frequency:
                'Monthly',

            bank_name: '',

            account_number: '',

            branch_address: '',

            tin_number: '',

            joining_date:
                '2026-06-17',

            probation_end_date:
                '2026-08-11',

            basic_salary: '',

            transport_allowance:
                '',

            family_allowance:
                '',

            others_allowance:
                '',

            gross_salary: '',

            gender: '',

            marital_status: '',

            blood_group: '',

            health_condition: '',

            password: '',

            address: '',

            image: null
        });

    /*
    |--------------------------------------------------------------------------
    | Gross salary
    |--------------------------------------------------------------------------
    */

    const grossSalary =
        useMemo(() => {
            const basic =
                Number(
                    data.basic_salary,
                ) || 0;

            const transport =
                Number(
                    data.transport_allowance,
                ) || 0;

            const family =
                Number(
                    data.family_allowance,
                ) || 0;

            const others =
                Number(
                    data.others_allowance,
                ) || 0;

            return (
                basic +
                transport +
                family +
                others
            ).toFixed(2);
        }, [
            data.basic_salary,
            data.transport_allowance,
            data.family_allowance,
            data.others_allowance,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Form update helper
    |--------------------------------------------------------------------------
    |
    | clearErrors() here is NOT client validation.
    |
    | It only removes an old Laravel error once the user changes that field.
    |
    */

    function updateField<
        K extends keyof EmployeeFormData,
    >(
        field: K,
        value: EmployeeFormData[K],
    ) {
        setData(
            field,
            value,
        );

        if (
            errors[field]
        ) {
            clearErrors(
                field,
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    function handleSubmit(
        e: FormEvent<HTMLFormElement>,
    ) {
        e.preventDefault();

        transform(
            (values) => ({
                ...values,

                gross_salary:
                    grossSalary,
            }),
        );


        console.log(data)

        // post(
        //     '/dashboard/employees',
        //     {
        //         preserveScroll:
        //             true,

        //         onSuccess: () => {
        //             reset();
        //         },
        //     },
        // );
    }

    return (
        <>
            <Head title="Employee Form" />

            <PageTitle title="Employee Form" />


            <div className="container-fluid">
                <Card>
                    <CardBody>
                        <div>
                            <p className='fs-6 fw-semibold'>Document Completion</p>
                            <ProgressBar
                                value={99}
                                animated
                                showValue

                            />
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="container-fluid">
                <Card>
                    <CardHeader
                        title="Employee Information"
                        description="Create a new employee"
                    />

                    <CardBody>
                        <form
                            onSubmit={
                                handleSubmit
                            }
                            noValidate
                        >
                            <div className="row">
                                {/* Role */}

                                <div className="col-md-6">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="role_id"
                                            required
                                        >
                                            Assign
                                            Role
                                        </FormLabel>

                                        <Select
                                            id="role_id"
                                            value={
                                                data.role_id
                                            }
                                            error={
                                                errors.role_id
                                            }
                                            disabled={
                                                processing
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'role_id',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select
                                                Role
                                            </option>

                                            <option value="1">
                                                Admin
                                            </option>

                                            <option value="2">
                                                HR
                                            </option>

                                            <option value="3">
                                                Employee
                                            </option>
                                        </Select>

                                        <FormError
                                            error={
                                                errors.role_id
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Attendance */}

                                <div className="col-md-6">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="attendance_type"
                                            required
                                        >
                                            Attendance
                                            Type
                                        </FormLabel>

                                        <Select
                                            id="attendance_type"
                                            value={
                                                data.attendance_type
                                            }
                                            error={
                                                errors.attendance_type
                                            }
                                            disabled={
                                                processing
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'attendance_type',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="IP">
                                                IP
                                            </option>

                                            <option value="Device">
                                                Device
                                            </option>

                                            <option value="Manual">
                                                Manual
                                            </option>
                                        </Select>

                                        <FormError
                                            error={
                                                errors.attendance_type
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Reporting Officer */}

                                <div className="col-md-6">
                                    <FormField>
                                        <FormLabel htmlFor="reporting_officer">
                                            Reporting Officer
                                        </FormLabel>

                                        <SuggestionSearchInput<EmployeeSuggestion>
                                            searchFn={searchEmployees}

                                            labelKey="name"
                                            secondaryLabelKey="employee_id"
                                            idKey="id"
                                            placeholder="Search employees"
                                            error={
                                                errors.reporting_officer_id
                                            }
                                            showSearchIcon={false}
                                            clearOnFocus
                                            onSelect={(
                                                employee,
                                            ) => {
                                                setData(
                                                    'reporting_officer_id',
                                                    String(
                                                        employee.id,
                                                    ),
                                                );

                                                clearErrors(
                                                    'reporting_officer_id',
                                                );
                                            }}
                                            onClear={() => {
                                                setData(
                                                    'reporting_officer_id',
                                                    '',
                                                );

                                                clearErrors(
                                                    'reporting_officer_id',
                                                );
                                            }}
                                        />

                                        <FormError
                                            error={
                                                errors.reporting_officer_id
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Full Name */}

                                <div className="col-md-6">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="full_name"
                                            required
                                        >
                                            Full Name
                                        </FormLabel>

                                        <Input
                                            id="full_name"
                                            value={
                                                data.full_name
                                            }
                                            error={
                                                errors.full_name
                                            }
                                            disabled={
                                                processing
                                            }
                                            placeholder="Enter full name"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'full_name',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.full_name
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Email */}

                                <div className="col-md-6">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="email"
                                            required
                                        >
                                            Email
                                        </FormLabel>

                                        <Input
                                            id="email"
                                            type="email"
                                            value={
                                                data.email
                                            }
                                            error={
                                                errors.email
                                            }
                                            disabled={
                                                processing
                                            }
                                            placeholder="Enter email address"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'email',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.email
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* NID */}

                                <div className="col-md-6">
                                    <FormField>
                                        <FormLabel htmlFor="national_id_number">
                                            National
                                            ID Number
                                        </FormLabel>

                                        <Input
                                            id="national_id_number"
                                            value={
                                                data.national_id_number
                                            }
                                            error={
                                                errors.national_id_number
                                            }
                                            disabled={
                                                processing
                                            }
                                            placeholder="Enter national ID"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'national_id_number',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.national_id_number
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Department */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="department_id"
                                            required
                                        >
                                            Department
                                        </FormLabel>

                                        <Select
                                            id="department_id"
                                            value={
                                                data.department_id
                                            }
                                            error={
                                                errors.department_id
                                            }
                                            disabled={
                                                processing
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'department_id',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select
                                                Department
                                            </option>

                                            <option value="1">
                                                HR
                                            </option>

                                            <option value="2">
                                                IT
                                            </option>

                                            <option value="3">
                                                Accounts
                                            </option>
                                        </Select>

                                        <FormError
                                            error={
                                                errors.department_id
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Designation */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="designation_id"
                                            required
                                        >
                                            Designation
                                        </FormLabel>

                                        <Select
                                            id="designation_id"
                                            value={
                                                data.designation_id
                                            }
                                            error={
                                                errors.designation_id
                                            }
                                            disabled={
                                                processing
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'designation_id',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select
                                                Designation
                                            </option>

                                            <option value="1">
                                                Manager
                                            </option>

                                            <option value="2">
                                                Executive
                                            </option>

                                            <option value="3">
                                                Officer
                                            </option>
                                        </Select>

                                        <FormError
                                            error={
                                                errors.designation_id
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Shift */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="shift_id"
                                            required
                                        >
                                            Shift
                                        </FormLabel>

                                        <Select
                                            id="shift_id"
                                            value={
                                                data.shift_id
                                            }
                                            error={
                                                errors.shift_id
                                            }
                                            disabled={
                                                processing
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'shift_id',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select
                                                Shift
                                            </option>

                                            <option value="1">
                                                General
                                            </option>

                                            <option value="2">
                                                Morning
                                            </option>

                                            <option value="3">
                                                Night
                                            </option>
                                        </Select>

                                        <FormError
                                            error={
                                                errors.shift_id
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Phone */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="phone"
                                            required
                                        >
                                            Phone
                                        </FormLabel>

                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={
                                                data.phone
                                            }
                                            error={
                                                errors.phone
                                            }
                                            disabled={
                                                processing
                                            }
                                            placeholder="01XXXXXXXXX"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'phone',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.phone
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Mobile */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="mobile">
                                            Mobile
                                        </FormLabel>

                                        <Input
                                            id="mobile"
                                            type="tel"
                                            value={
                                                data.mobile
                                            }
                                            error={
                                                errors.mobile
                                            }
                                            disabled={
                                                processing
                                            }
                                            placeholder="Mobile number"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'mobile',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.mobile
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Emergency */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="emergency_contact"
                                            required
                                        >
                                            Emergency
                                            Contact
                                        </FormLabel>

                                        <Input
                                            id="emergency_contact"
                                            type="tel"
                                            value={
                                                data.emergency_contact
                                            }
                                            error={
                                                errors.emergency_contact
                                            }
                                            disabled={
                                                processing
                                            }
                                            placeholder="Emergency contact"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'emergency_contact',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.emergency_contact
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Pay frequency */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="pay_frequency">
                                            Pay
                                            Frequency
                                        </FormLabel>

                                        <Select
                                            id="pay_frequency"
                                            value={
                                                data.pay_frequency
                                            }
                                            error={
                                                errors.pay_frequency
                                            }
                                            disabled={
                                                processing
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'pay_frequency',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="Monthly">
                                                Monthly
                                            </option>

                                            <option value="Weekly">
                                                Weekly
                                            </option>

                                            <option value="Daily">
                                                Daily
                                            </option>
                                        </Select>

                                        <FormError
                                            error={
                                                errors.pay_frequency
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Bank */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="bank_name">
                                            Bank Name
                                        </FormLabel>

                                        <Input
                                            id="bank_name"
                                            value={
                                                data.bank_name
                                            }
                                            error={
                                                errors.bank_name
                                            }
                                            placeholder="Bank name"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'bank_name',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.bank_name
                                            }
                                        />
                                    </FormField>
                                </div>

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="account_number">
                                            Account
                                            Number
                                        </FormLabel>

                                        <Input
                                            id="account_number"
                                            value={
                                                data.account_number
                                            }
                                            error={
                                                errors.account_number
                                            }
                                            placeholder="Account number"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'account_number',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.account_number
                                            }
                                        />
                                    </FormField>
                                </div>

                                <div className="col-md-6">
                                    <FormField>
                                        <FormLabel htmlFor="branch_address">
                                            Branch
                                            Address
                                        </FormLabel>

                                        <Input
                                            id="branch_address"
                                            value={
                                                data.branch_address
                                            }
                                            error={
                                                errors.branch_address
                                            }
                                            placeholder="Bank branch address"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'branch_address',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.branch_address
                                            }
                                        />
                                    </FormField>
                                </div>

                                <div className="col-md-6">
                                    <FormField>
                                        <FormLabel htmlFor="tin_number">
                                            TIN
                                            Number
                                        </FormLabel>

                                        <Input
                                            id="tin_number"
                                            value={
                                                data.tin_number
                                            }
                                            error={
                                                errors.tin_number
                                            }
                                            placeholder="TIN number"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'tin_number',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.tin_number
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Joining Date */}

                                <div className="col-md-6">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="joining_date"
                                            required
                                        >
                                            Joining
                                            Date
                                        </FormLabel>

                                        <DatePicker
                                            id="joining_date"
                                            value={
                                                data.joining_date
                                            }
                                            error={
                                                errors.joining_date
                                            }
                                            disabled={
                                                processing
                                            }
                                            onChange={(value) =>
                                                updateField(
                                                    'joining_date',
                                                    value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.joining_date
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Probation */}

                                <div className="col-md-6">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="probation_end_date"
                                            required
                                        >
                                            Probation
                                            Period End
                                            Date
                                        </FormLabel>

                                        <DatePicker
                                            id="probation_end_date"
                                            value={
                                                data.probation_end_date
                                            }
                                            error={
                                                errors.probation_end_date
                                            }
                                            disabled={
                                                processing
                                            }

                                            onChange={(value) =>
                                                updateField(
                                                    "probation_end_date",
                                                    value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.probation_end_date
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Salary */}

                                <div className="col-md-3">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="basic_salary"
                                            required
                                        >
                                            Basic
                                            Salary
                                        </FormLabel>

                                        <Input
                                            id="basic_salary"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                data.basic_salary
                                            }
                                            error={
                                                errors.basic_salary
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'basic_salary',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.basic_salary
                                            }
                                        />
                                    </FormField>
                                </div>

                                <div className="col-md-3">
                                    <FormField>
                                        <FormLabel htmlFor="transport_allowance">
                                            Transport
                                            Allowance
                                        </FormLabel>

                                        <Input
                                            id="transport_allowance"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                data.transport_allowance
                                            }
                                            error={
                                                errors.transport_allowance
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'transport_allowance',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.transport_allowance
                                            }
                                        />
                                    </FormField>
                                </div>

                                <div className="col-md-3">
                                    <FormField>
                                        <FormLabel htmlFor="family_allowance">
                                            Family
                                            Allowance
                                        </FormLabel>

                                        <Input
                                            id="family_allowance"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                data.family_allowance
                                            }
                                            error={
                                                errors.family_allowance
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'family_allowance',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.family_allowance
                                            }
                                        />
                                    </FormField>
                                </div>

                                <div className="col-md-3">
                                    <FormField>
                                        <FormLabel htmlFor="others_allowance">
                                            Others
                                            Allowance
                                        </FormLabel>

                                        <Input
                                            id="others_allowance"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                data.others_allowance
                                            }
                                            error={
                                                errors.others_allowance
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'others_allowance',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.others_allowance
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Gross */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel>
                                            Gross
                                            Salary
                                        </FormLabel>

                                        <Input
                                            value={
                                                grossSalary
                                            }
                                            readOnly
                                            error={
                                                errors.gross_salary
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.gross_salary
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Gender */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="gender">
                                            Gender
                                        </FormLabel>

                                        <Select
                                            id="gender"
                                            value={
                                                data.gender
                                            }
                                            error={
                                                errors.gender
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'gender',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select
                                                one
                                            </option>

                                            <option value="male">
                                                Male
                                            </option>

                                            <option value="female">
                                                Female
                                            </option>

                                            <option value="other">
                                                Other
                                            </option>
                                        </Select>

                                        <FormError
                                            error={
                                                errors.gender
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Marital */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="marital_status">
                                            Marital
                                            Status
                                        </FormLabel>

                                        <Select
                                            id="marital_status"
                                            value={
                                                data.marital_status
                                            }
                                            error={
                                                errors.marital_status
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'marital_status',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select
                                                one
                                            </option>

                                            <option value="single">
                                                Single
                                            </option>

                                            <option value="married">
                                                Married
                                            </option>

                                            <option value="divorced">
                                                Divorced
                                            </option>

                                            <option value="widowed">
                                                Widowed
                                            </option>
                                        </Select>

                                        <FormError
                                            error={
                                                errors.marital_status
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Blood Group */}

                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel htmlFor="blood_group">
                                            Blood
                                            Group
                                        </FormLabel>

                                        <Select
                                            id="blood_group"
                                            value={
                                                data.blood_group
                                            }
                                            error={
                                                errors.blood_group
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'blood_group',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select
                                                blood
                                                group
                                            </option>

                                            <option value="A+">
                                                A+
                                            </option>

                                            <option value="A-">
                                                A-
                                            </option>

                                            <option value="B+">
                                                B+
                                            </option>

                                            <option value="B-">
                                                B-
                                            </option>

                                            <option value="AB+">
                                                AB+
                                            </option>

                                            <option value="AB-">
                                                AB-
                                            </option>

                                            <option value="O+">
                                                O+
                                            </option>

                                            <option value="O-">
                                                O-
                                            </option>
                                        </Select>

                                        <FormError
                                            error={
                                                errors.blood_group
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Health */}

                                <div className="col-md-8">
                                    <FormField>
                                        <FormLabel htmlFor="health_condition">
                                            Health
                                            Condition
                                        </FormLabel>

                                        <Input
                                            id="health_condition"
                                            value={
                                                data.health_condition
                                            }
                                            error={
                                                errors.health_condition
                                            }
                                            placeholder="Enter health condition"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'health_condition',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.health_condition
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Password */}

                                <div className="col-12">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="password"
                                            required
                                        >
                                            Password
                                        </FormLabel>

                                        <PasswordInput
                                            id="password"
                                            value={
                                                data.password
                                            }
                                            error={
                                                errors.password
                                            }
                                            disabled={
                                                processing
                                            }
                                            placeholder="Enter password"
                                            autoComplete="new-password"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'password',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                            onGenerate={(
                                                password,
                                            ) =>
                                                updateField(
                                                    'password',
                                                    password,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.password
                                            }
                                        />
                                    </FormField>
                                </div>

                                {/* Address */}

                                <div className="col-12">
                                    <FormField>
                                        <FormLabel htmlFor="address">
                                            Address
                                        </FormLabel>

                                        <Textarea
                                            id="address"
                                            rows={4}
                                            value={
                                                data.address
                                            }
                                            error={
                                                errors.address
                                            }
                                            disabled={
                                                processing
                                            }
                                            placeholder="Enter employee address"
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'address',
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.address
                                            }
                                        />
                                    </FormField>
                                </div>
                                <div className="col-6">
                                    <FormField>
                                        <FormLabel htmlFor="address">
                                            Address
                                        </FormLabel>

                                        <FileDropzone

                                            showFileList
                                            label="Employee Photo"
                                            required
                                            value={data.image}
                                            disabled={processing}
                                            error={errors.image}
                                            accept={{
                                                'image/jpeg': [
                                                    '.jpg',
                                                    '.jpeg',
                                                ],

                                                'image/png': [
                                                    '.png',
                                                ],

                                                'image/webp': [
                                                    '.webp',
                                                ],
                                            }}
                                            maxSize={
                                                2 *
                                                1024 *
                                                1024
                                            }
                                            description="JPG, PNG or WebP. Maximum 2MB."
                                            onChange={(file) => {
                                                setData(
                                                    'image',
                                                    file as File | null,
                                                );

                                                if (
                                                    errors.image
                                                ) {
                                                    clearErrors(
                                                        'image',
                                                    );
                                                }
                                            }}
                                        />

                                        <FormError
                                            error={
                                                errors.address
                                            }
                                        />
                                    </FormField>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <Button
                                    type="button"
                                    variant="light"
                                    disabled={
                                        processing
                                    }
                                    onClick={() => {
                                        reset();
                                        clearErrors();
                                    }}
                                >
                                    Reset
                                </Button>

                                <Button
                                    type="submit"
                                    loading={
                                        processing
                                    }
                                    loadingText="Saving..."
                                >
                                    Save
                                    Employee
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
