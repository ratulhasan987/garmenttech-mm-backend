import {
    useEffect,
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
    DatePicker,
} from '@/components/ui/form/date-picker';


/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Increment = {
    id: number;

    increment_type:
        | 'percentage'
        | 'fixed';

    increment_value:
        | number
        | string;

    effective_date: string;

    user: {
        id: number;

        employee_id: string;

        name: string;
    };
};


type Props = {
    open: boolean;

    increment:
        | Increment
        | null;

    onClose: () => void;
};


type FormData = {
    id: number;

    increment_type:
        | 'percentage'
        | 'fixed';

    increment_value:
        | number
        | string;

    effective_date: string;
};


/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function IncrementEditModal({
    open,
    increment,
    onClose,
}: Props) {

    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } =
        useForm<FormData>({
            id:
                increment?.id ??
                0,

            increment_type:
                increment?.increment_type ??
                'percentage',

            increment_value:
                increment?.increment_value ??
                '',

            effective_date:
                increment?.effective_date ??
                '',
        });


    /*
    |--------------------------------------------------------------------------
    | Load Increment
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!increment) {
            return;
        }


        setData({
            id:
                increment.id,

            increment_type:
                increment.increment_type,

            increment_value:
                increment.increment_value,

            effective_date:
                increment.effective_date
                    ? increment.effective_date.slice(
                        0,
                        10,
                    )
                    : '',
        });

    }, [
        increment,
    ]);


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


        if (!increment) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | Route:
        |
        | PUT /hr/increment/{increment}
        |
        */

        put(
            `/hr/increment/${increment.id}`,
            {
                preserveScroll:
                    true,

                onSuccess: () => {

                    reset();

                    clearErrors();

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
            title="Update Increment"
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
                        form="increment-edit-form"
                        disabled={
                            processing ||
                            !increment
                        }
                    >
                        {processing
                            ? 'Updating...'
                            : 'Save changes'}
                    </Button>
                </>
            }
        >

            {!increment ? (

                <div className="text-center text-muted py-4">
                    No increment selected.
                </div>

            ) : (

                <form
                    id="increment-edit-form"
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="row g-3">

                        {/* Employee */}

                        <div className="col-12">

                            <FormField>

                                <FormLabel>
                                    Employee
                                </FormLabel>


                                <Input
                                    value={
                                        `${increment.user.name} - ${increment.user.employee_id}`
                                    }
                                    disabled
                                />

                            </FormField>

                        </div>


                        {/* Increment Type */}

                        <div className="col-md-6">

                            <FormField>

                                <FormLabel
                                    htmlFor="edit_increment_type"
                                    required
                                >
                                    Increment Type
                                </FormLabel>


                                <Select
                                    id="edit_increment_type"
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
                                    htmlFor="edit_increment_value"
                                    required
                                >
                                    Increment Value
                                </FormLabel>


                                <Input
                                    id="edit_increment_value"
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
                                    htmlFor="edit_effective_date"
                                    required
                                >
                                    Effective Date
                                </FormLabel>


                                <DatePicker
                                    id="edit_effective_date"
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

            )}

        </AppModal>
    );
}