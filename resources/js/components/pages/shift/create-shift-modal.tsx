import {
    useState,
    type KeyboardEvent,
    type SubmitEvent,
} from 'react';

import { useForm } from '@inertiajs/react';
import { X } from 'react-feather';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const shiftSchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            1,
            'Shift name is required.',
        )
        .max(
            255,
            'Shift name cannot exceed 255 characters.',
        ),

    shift_start_time: z
        .string()
        .trim()
        .min(
            1,
            'Shift start time is required.',
        ),

    shift_end_time: z
        .string()
        .trim()
        .min(
            1,
            'Shift end time is required.',
        ),

    first_half_shift_end_time: z
        .string()
        .trim()
        .min(
            1,
            'First half shift end time is required.',
        ),

    second_half_shift_start_time: z
        .string()
        .trim()
        .min(
            1,
            'Second half shift start time is required.',
        ),

    weekends: z
        .string()
        .nullable()
        .optional(),
});

type ShiftFormData =
    z.input<typeof shiftSchema>;

type ShiftFormErrors =
    Partial<
        Record<
            keyof ShiftFormData,
            string
        >
    >;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type CreateShiftModalProps = {
    open: boolean;

    onOpenChange: (
        open: boolean,
    ) => void;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateShiftModal({
    open,
    onOpenChange,
}: CreateShiftModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<ShiftFormData>({
        name: '',
        shift_start_time: '',
        shift_end_time: '',
        first_half_shift_end_time: '',
        second_half_shift_start_time: '',
        weekends: null,
    });

    const [
        validationErrors,
        setValidationErrors,
    ] =
        useState<ShiftFormErrors>({});

    /*
    |--------------------------------------------------------------------------
    | Weekend Input
    |--------------------------------------------------------------------------
    */

    const [
        weekendInput,
        setWeekendInput,
    ] = useState('');

    const weekends =
        data.weekends
            ?.split(',')
            .map(
                (weekend) =>
                    weekend.trim(),
            )
            .filter(Boolean) ??
        [];

    /*
    |--------------------------------------------------------------------------
    | Add Weekend
    |--------------------------------------------------------------------------
    */

    const addWeekend = () => {
        const value =
            weekendInput.trim();

        if (!value) {
            return;
        }

        /*
         * Prevent duplicate weekend names.
         */
        const alreadyExists =
            weekends.some(
                (weekend) =>
                    weekend.toLowerCase() ===
                    value.toLowerCase(),
            );

        if (alreadyExists) {
            setWeekendInput('');

            return;
        }

        const updatedWeekends = [
            ...weekends,
            value,
        ];

        setData(
            'weekends',
            updatedWeekends.join(','),
        );

        setWeekendInput('');
    };

    /*
    |--------------------------------------------------------------------------
    | Remove Weekend
    |--------------------------------------------------------------------------
    */

    const removeWeekend = (
        weekendToRemove: string,
    ) => {
        const updatedWeekends =
            weekends.filter(
                (weekend) =>
                    weekend !==
                    weekendToRemove,
            );

        setData(
            'weekends',
            updatedWeekends.length
                ? updatedWeekends.join(
                      ',',
                  )
                : null,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Weekend Keyboard
    |--------------------------------------------------------------------------
    */

    const handleWeekendKeyDown = (
        event: KeyboardEvent<HTMLInputElement>,
    ) => {
        /*
         * Tab:
         * Add current weekend, but DON'T
         * prevent default so focus can move
         * to the next control normally.
         */
        if (event.key === 'Tab') {
            addWeekend();

            return;
        }

        /*
         * Enter or comma can also add.
         */
        if (
            event.key ===
                'Enter' ||
            event.key === ','
        ) {
            event.preventDefault();

            addWeekend();

            return;
        }

        /*
         * Backspace on empty field removes
         * the last weekend.
         */
        if (
            event.key ===
                'Backspace' &&
            weekendInput === '' &&
            weekends.length
        ) {
            removeWeekend(
                weekends[
                    weekends.length -
                        1
                ],
            );
        }
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

        setValidationErrors(
            {},
        );

        setWeekendInput('');

        onOpenChange(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event: SubmitEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        /*
         * If user typed a weekend but clicked
         * Save without pressing Tab/Enter,
         * include it before validation.
         */

        let submitData = data;

        const pendingWeekend =
            weekendInput.trim();

        if (pendingWeekend) {
            const exists =
                weekends.some(
                    (weekend) =>
                        weekend.toLowerCase() ===
                        pendingWeekend.toLowerCase(),
                );

            if (!exists) {
                submitData = {
                    ...data,

                    weekends: [
                        ...weekends,
                        pendingWeekend,
                    ].join(','),
                };

                setData(
                    'weekends',
                    submitData.weekends,
                );
            }

            setWeekendInput('');
        }

        const result =
            shiftSchema.safeParse(
                submitData,
            );

        if (!result.success) {
            const fieldErrors: ShiftFormErrors =
                {};

            result.error.issues.forEach(
                (issue) => {
                    const field =
                        issue
                            .path[0] as keyof ShiftFormData;

                    if (
                        !fieldErrors[
                            field
                        ]
                    ) {
                        fieldErrors[
                            field
                        ] =
                            issue.message;
                    }
                },
            );

            setValidationErrors(
                fieldErrors,
            );

            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/shift', {
            preserveScroll: true,

            onSuccess: () => {
                reset();

                clearErrors();

                setValidationErrors(
                    {},
                );

                setWeekendInput('');

                onOpenChange(false);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Errors
    |--------------------------------------------------------------------------
    */

    const formErrors: ShiftFormErrors = {
        ...validationErrors,
        ...errors,
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(
                nextOpen,
            ) => {
                if (!nextOpen) {
                    handleClose();

                    return;
                }

                onOpenChange(
                    nextOpen,
                );
            }}
            title="Add New Shift"
            busy={processing}
            centered={false}
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
                        form="create-shift-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Saving...'
                            : 'Save Shift'}
                    </Button>
                </>
            }
        >
            <form
                id="create-shift-form"
                onSubmit={
                    handleSubmit
                }
            >
                <div className="row">
                    {/* Shift Name */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="name"
                                required
                            >
                                Shift Name
                            </FormLabel>

                            <Input
                                id="name"
                                name="name"
                                value={
                                    data.name
                                }
                                placeholder="e.g. General Shift"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.name &&
                                        'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'name',
                                        event
                                            .target
                                            .value,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.name
                                }
                            />
                        </FormField>
                    </div>

                    {/* Shift Start */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="shift_start_time"
                                required
                            >
                                Shift Start
                                Time
                            </FormLabel>

                            <Input
                                type="time"
                                id="shift_start_time"
                                name="shift_start_time"
                                value={
                                    data.shift_start_time
                                }
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.shift_start_time &&
                                        'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'shift_start_time',
                                        event
                                            .target
                                            .value,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.shift_start_time
                                }
                            />
                        </FormField>
                    </div>

                    {/* Shift End */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="shift_end_time"
                                required
                            >
                                Shift End
                                Time
                            </FormLabel>

                            <Input
                                type="time"
                                id="shift_end_time"
                                name="shift_end_time"
                                value={
                                    data.shift_end_time
                                }
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.shift_end_time &&
                                        'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'shift_end_time',
                                        event
                                            .target
                                            .value,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.shift_end_time
                                }
                            />
                        </FormField>
                    </div>

                    {/* First Half End */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="first_half_shift_end_time"
                                required
                            >
                                First Half End
                                Time
                            </FormLabel>

                            <Input
                                type="time"
                                id="first_half_shift_end_time"
                                name="first_half_shift_end_time"
                                value={
                                    data.first_half_shift_end_time
                                }
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.first_half_shift_end_time &&
                                        'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'first_half_shift_end_time',
                                        event
                                            .target
                                            .value,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.first_half_shift_end_time
                                }
                            />
                        </FormField>
                    </div>

                    {/* Second Half Start */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="second_half_shift_start_time"
                                required
                            >
                                Second Half
                                Start Time
                            </FormLabel>

                            <Input
                                type="time"
                                id="second_half_shift_start_time"
                                name="second_half_shift_start_time"
                                value={
                                    data.second_half_shift_start_time
                                }
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.second_half_shift_start_time &&
                                        'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'second_half_shift_start_time',
                                        event
                                            .target
                                            .value,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.second_half_shift_start_time
                                }
                            />
                        </FormField>
                    </div>

                    {/* Weekends */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="weekends"
                            >
                                Weekends
                            </FormLabel>

                            <div
                                className={cn(
                                    'form-control d-flex flex-wrap align-items-center gap-2',
                                    formErrors.weekends &&
                                        'is-invalid',
                                )}
                                style={{
                                    minHeight:
                                        42,
                                }}
                            >
                                {weekends.map(
                                    (
                                        weekend,
                                    ) => (
                                        <span
                                            key={
                                                weekend
                                            }
                                            className="badge rounded-pill badge-primary d-inline-flex align-items-center gap-1"
                                        >
                                            {
                                                weekend
                                            }

                                            <button
                                                type="button"
                                                className="border-0 bg-transparent text-white p-0 d-flex align-items-center"
                                                disabled={
                                                    processing
                                                }
                                                onClick={() =>
                                                    removeWeekend(
                                                        weekend,
                                                    )
                                                }
                                            >
                                                <X
                                                    size={
                                                        12
                                                    }
                                                />
                                            </button>
                                        </span>
                                    ),
                                )}

                                <input
                                    id="weekends"
                                    type="text"
                                    value={
                                        weekendInput
                                    }
                                    placeholder={
                                        weekends.length
                                            ? ''
                                            : 'e.g. Friday'
                                    }
                                    disabled={
                                        processing
                                    }
                                    className="border-0 bg-transparent flex-grow-1 p-0"
                                    style={{
                                        outline:
                                            'none',
                                        minWidth:
                                            120,
                                    }}
                                    onChange={(
                                        event,
                                    ) => {
                                        setWeekendInput(
                                            event
                                                .target
                                                .value,
                                        );
                                    }}
                                    onKeyDown={
                                        handleWeekendKeyDown
                                    }
                                />
                            </div>

                            <small className="text-muted">
                                Type a
                                weekend name
                                and press Tab
                                or Enter to
                                add it.
                            </small>

                            <FormError
                                error={
                                    formErrors.weekends
                                }
                            />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}