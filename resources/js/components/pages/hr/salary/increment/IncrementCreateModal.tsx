import {
    useState,
    type FormEvent,
} from 'react';

import {
    useForm,
} from '@inertiajs/react';

import {
    AppModal,
} from '@/components/ui/modal/app-modal';

import {
    Button,
} from '@/components/ui/button';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

import {
    Input,
} from '@/components/ui/form/input';

import {
    Select,
} from '@/components/ui/form/select';

import {
    SuggestionSearchInput,
} from '@/components/ui/form/suggestion-search-input';

import {
    DatePicker,
} from '@/components/ui/form/date-picker';


/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Employee = {
    id: number;

    employee_id: string;

    name: string;

    basic_salary?:
        | number
        | string;
};


type FormData = {
    user_id:
        | number
        | null;

    increment_type:
        | 'percentage'
        | 'fixed';

    increment_value:
        | string
        | number;

    effective_date: string;
};


type Props = {
    open: boolean;

    onClose: () => void;
};


/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function IncrementCreateModal({
    open,
    onClose,
}: Props) {

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } =
        useForm<FormData>({
            user_id:
                null,

            increment_type:
                'percentage',

            increment_value:
                '',

            effective_date:
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10,
                    ),
        });


    /*
    |--------------------------------------------------------------------------
    | Selected Employee
    |--------------------------------------------------------------------------
    */

    const [
        selectedEmployee,
        setSelectedEmployee,
    ] =
        useState<Employee | null>(
            null,
        );


    /*
    |--------------------------------------------------------------------------
    | Employee Search
    |--------------------------------------------------------------------------
    */

    const searchEmployees = async (
        query: string,
        signal?: AbortSignal,
    ): Promise<Employee[]> => {

        const response =
            await fetch(
                `/get-employees?keyword=${encodeURIComponent(
                    query,
                )}`,
                {
                    signal,

                    headers: {
                        Accept:
                            'application/json',
                    },
                },
            );


        if (!response.ok) {
            return [];
        }


        return (
            await response.json()
        ) as Employee[];
    };


    /*
    |--------------------------------------------------------------------------
    | Employee Select
    |--------------------------------------------------------------------------
    */

    const handleEmployeeSelect = (
        employee: Employee,
    ) => {

        setSelectedEmployee(
            employee,
        );


        setData(
            'user_id',
            employee.id,
        );


        clearErrors(
            'user_id',
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Close
    |--------------------------------------------------------------------------
    */

    const handleClose = () => {

        if (processing) {
            return;
        }


        reset();

        clearErrors();


        setSelectedEmployee(
            null,
        );


        onClose();
    };


    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {

        event.preventDefault();


        post(
            '/hr/increment',
            {
                preserveScroll:
                    true,

                onSuccess: () => {

                    reset();

                    clearErrors();


                    setSelectedEmployee(
                        null,
                    );


                    onClose();
                },
            },
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppModal
            open={
                open
            }
            onOpenChange={(
                nextOpen,
            ) => {

                if (
                    !nextOpen
                ) {

                    handleClose();
                }
            }}
            title="Add New Increment"
            size="md"
            centered
            busy={
                processing
            }
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        disabled={
                            processing
                        }
                        onClick={
                            handleClose
                        }
                    >
                        Cancel
                    </Button>


                    <Button
                        type="submit"
                        form="increment-create-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Saving...'
                            : 'Save changes'}
                    </Button>
                </>
            }
        >

            <form
                id="increment-create-form"
                onSubmit={
                    handleSubmit
                }
            >

                <div className="row g-3">

                    {/* Employee */}

                    <div className="col-12">

                        <FormField>
                            <FormLabel
                                required
                            >
                                Employee
                            </FormLabel>


                            <SuggestionSearchInput<Employee>
                                placeholder="Search employee"
                                searchFn={
                                    searchEmployees
                                }
                                labelKey="name"
                                secondaryLabelKey="employee_id"
                                idKey="id"
                                defaultValue={
                                    selectedEmployee
                                        ? `${selectedEmployee.name} - ${selectedEmployee.employee_id}`
                                        : ''
                                }
                                clearOnFocus={
                                    false
                                }
                                onSelect={
                                    handleEmployeeSelect
                                }
                                disabled={
                                    processing
                                }
                            />


                            <FormError
                                error={
                                    errors.user_id
                                }
                            />

                        </FormField>

                    </div>


                    {/* Increment Type */}

                    <div className="col-md-6">

                        <FormField>

                            <FormLabel
                                htmlFor="increment_type"
                                required
                            >
                                Increment Type
                            </FormLabel>


                            <Select
                                id="increment_type"
                                value={
                                    data.increment_type
                                }
                                disabled={
                                    processing
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setData(
                                        'increment_type',
                                        event
                                            .target
                                            .value as
                                            | 'percentage'
                                            | 'fixed',
                                    )
                                }
                            >

                                <option value="percentage">
                                    Percentage
                                </option>

                                <option value="fixed">
                                    Fixed Amount
                                </option>

                            </Select>


                            <FormError
                                error={
                                    errors.increment_type
                                }
                            />

                        </FormField>

                    </div>


                    {/* Increment Value */}

                    <div className="col-md-6">

                        <FormField>

                            <FormLabel
                                htmlFor="increment_value"
                                required
                            >
                                Increment Value
                            </FormLabel>


                            <Input
                                id="increment_value"
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    data.increment_value
                                }
                                disabled={
                                    processing
                                }
                                placeholder={
                                    data.increment_type ===
                                    'percentage'
                                        ? 'Example: 5'
                                        : 'Example: 5000'
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setData(
                                        'increment_value',
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />


                            <FormError
                                error={
                                    errors.increment_value
                                }
                            />

                        </FormField>

                    </div>


                    {/* Effective Date */}

                    <div className="col-md-6">

                        <FormField>

                            <FormLabel
                                htmlFor="effective_date"
                                required
                            >
                                Effective Date
                            </FormLabel>


                            <DatePicker
                                id="effective_date"
                                name="effective_date"
                                value={
                                    data.effective_date
                                }
                                dateFormat="Y-m-d"
                                displayFormat="d M, Y"
                                allowInput
                                disabled={
                                    processing
                                }
                                placeholder="Select effective date"
                                onChange={(
                                    value,
                                ) =>
                                    setData(
                                        'effective_date',
                                        value,
                                    )
                                }
                            />


                            <FormError
                                error={
                                    errors.effective_date
                                }
                            />

                        </FormField>

                    </div>

                </div>

            </form>

        </AppModal>
    );
}