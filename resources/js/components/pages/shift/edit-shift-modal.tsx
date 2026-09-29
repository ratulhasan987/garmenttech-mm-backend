import {
    useEffect,
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

import type { Shift } from '@/types/shift';

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function normalizeTime(
    value: string | null | undefined,
): string {
    if (!value) {
        return '';
    }

    const time = String(value).trim();

    /*
    |--------------------------------------------------------------------------
    | 12-hour format
    |--------------------------------------------------------------------------
    |
    | 09:30 AM
    | 9:30 AM
    | 06:00 PM
    |
    */

    const twelveHourMatch = time.match(
        /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i,
    );

    if (twelveHourMatch) {
        let hour = Number(
            twelveHourMatch[1],
        );

        const minute =
            twelveHourMatch[2];

        const period =
            twelveHourMatch[3].toUpperCase();

        if (
            period === 'PM' &&
            hour !== 12
        ) {
            hour += 12;
        }

        if (
            period === 'AM' &&
            hour === 12
        ) {
            hour = 0;
        }

        return `${String(hour).padStart(
            2,
            '0',
        )}:${minute}`;
    }

    /*
    |--------------------------------------------------------------------------
    | Laravel datetime
    |--------------------------------------------------------------------------
    |
    | 2026-08-19 09:30:00
    |
    */

    const dateTimeMatch = time.match(
        /^\d{4}-\d{2}-\d{2}\s+(\d{2}):(\d{2})/,
    );

    if (dateTimeMatch) {
        return `${dateTimeMatch[1]}:${dateTimeMatch[2]}`;
    }

    /*
    |--------------------------------------------------------------------------
    | ISO datetime
    |--------------------------------------------------------------------------
    |
    | 2026-08-19T09:30:00
    |
    */

    const isoMatch = time.match(
        /T(\d{2}):(\d{2})/,
    );

    if (isoMatch) {
        return `${isoMatch[1]}:${isoMatch[2]}`;
    }

    /*
    |--------------------------------------------------------------------------
    | Normal DB time
    |--------------------------------------------------------------------------
    |
    | 09:30
    | 09:30:00
    | 09:30:00.000000
    |
    */

    const normalTimeMatch = time.match(
        /^(\d{1,2}):(\d{2})/,
    );

    if (normalTimeMatch) {
        return `${normalTimeMatch[1].padStart(
            2,
            '0',
        )}:${normalTimeMatch[2]}`;
    }

    return '';
}

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const shiftSchema = z.object({
    id: z.number({
        message: 'Shift ID is required.',
    }),

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

type EditShiftModalProps = {
    open: boolean;

    onOpenChange: (
        open: boolean,
    ) => void;

    shift: Shift | null;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function EditShiftModal({
    open,
    onOpenChange,
    shift,
}: EditShiftModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm<ShiftFormData>({
        id: 0,
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
    ] = useState<ShiftFormErrors>({});

    const [
        weekendInput,
        setWeekendInput,
    ] = useState('');

    /*
    |--------------------------------------------------------------------------
    | Weekends
    |--------------------------------------------------------------------------
    */

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
    | Populate Edit Data
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!shift || !open) {
            return;
        }

        setData({
            id: Number(
                shift.id,
            ),

            name:
                shift.name ??
                '',

            shift_start_time:
                normalizeTime(
                    shift.shift_start_time,
                ),

            shift_end_time:
                normalizeTime(
                    shift.shift_end_time,
                ),

            first_half_shift_end_time:
                normalizeTime(
                    shift.first_half_shift_end_time,
                ),

            second_half_shift_start_time:
                normalizeTime(
                    shift.second_half_shift_start_time,
                ),

            weekends:
                shift.weekends ??
                null,
        });

        setWeekendInput('');

        clearErrors();
        setValidationErrors({});
    }, [
        shift,
        open,
    ]);

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
         * Tab adds the weekend
         * and still moves focus.
         */
        if (event.key === 'Tab') {
            addWeekend();

            return;
        }

        /*
         * Enter / comma add the tag
         * without submitting the form.
         */
        if (
            event.key === 'Enter' ||
            event.key === ','
        ) {
            event.preventDefault();

            addWeekend();

            return;
        }

        /*
         * Backspace removes the last tag
         * when the input is empty.
         */
        if (
            event.key === 'Backspace' &&
            weekendInput === '' &&
            weekends.length > 0
        ) {
            removeWeekend(
                weekends[
                    weekends.length - 1
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

        setValidationErrors({});

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

        if (!shift) {
            return;
        }

        /*
         * If a weekend is still typed in the
         * input, include it in the submitted data.
         */

        const pendingWeekend =
            weekendInput.trim();

        let finalWeekends =
            data.weekends;

        if (pendingWeekend) {
            const exists =
                weekends.some(
                    (weekend) =>
                        weekend.toLowerCase() ===
                        pendingWeekend.toLowerCase(),
                );

            if (!exists) {
                finalWeekends = [
                    ...weekends,
                    pendingWeekend,
                ].join(',');
            }
        }

        const submitData: ShiftFormData = {
            ...data,

            weekends:
                finalWeekends ||
                null,
        };

        /*
         * Zod validation
         */

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

        /*
         * Important:
         *
         * transform guarantees finalWeekends
         * is included in this request even
         * though React state updates are async.
         */

        transform(
            (currentData) => ({
                ...currentData,

                weekends:
                    finalWeekends ||
                    null,
            }),
        );

        post('/shift-update', {
            preserveScroll: true,

            onSuccess: () => {
                reset();

                clearErrors();

                setValidationErrors({});

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

    /*
    |--------------------------------------------------------------------------
    | No Shift
    |--------------------------------------------------------------------------
    */

    if (!shift) {
        return null;
    }

    return (
        <AppModal
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    handleClose();

                    return;
                }

                onOpenChange(
                    nextOpen,
                );
            }}
            title="Edit Shift"
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
                        form="edit-shift-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Updating...'
                            : 'Update Shift'}
                    </Button>
                </>
            }
        >
            <form
                id="edit-shift-form"
                onSubmit={
                    handleSubmit
                }
            >
                <div className="row">
                    {/* Shift Name */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-shift-name"
                                required
                            >
                                Shift Name
                            </FormLabel>

                            <Input
                                id="edit-shift-name"
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

                    {/* Shift Start Time */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-shift-start-time"
                                required
                            >
                                Shift Start Time
                            </FormLabel>

                            <input
                                type="time"
                                id="edit-shift-start-time"
                                name="shift_start_time"
                                value={
                                    data.shift_start_time
                                }
                                disabled={
                                    processing
                                }
                                className={cn(
                                    'form-control',

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

                    {/* Shift End Time */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-shift-end-time"
                                required
                            >
                                Shift End Time
                            </FormLabel>

                            <input
                                type="time"
                                id="edit-shift-end-time"
                                name="shift_end_time"
                                value={
                                    data.shift_end_time
                                }
                                disabled={
                                    processing
                                }
                                className={cn(
                                    'form-control',

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

                    {/* First Half End Time */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-first-half-shift-end-time"
                                required
                            >
                                First Half End Time
                            </FormLabel>

                            <input
                                type="time"
                                id="edit-first-half-shift-end-time"
                                name="first_half_shift_end_time"
                                value={
                                    data.first_half_shift_end_time
                                }
                                disabled={
                                    processing
                                }
                                className={cn(
                                    'form-control',

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

                    {/* Second Half Start Time */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-second-half-shift-start-time"
                                required
                            >
                                Second Half Start Time
                            </FormLabel>

                            <input
                                type="time"
                                id="edit-second-half-shift-start-time"
                                name="second_half_shift_start_time"
                                value={
                                    data.second_half_shift_start_time
                                }
                                disabled={
                                    processing
                                }
                                className={cn(
                                    'form-control',

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
                                htmlFor="edit-weekends"
                            >
                                Weekends
                            </FormLabel>

                            <div
                                className={cn(
                                    'form-control',
                                    'd-flex flex-wrap align-items-center gap-2',

                                    formErrors.weekends &&
                                        'is-invalid',
                                )}
                                style={{
                                    minHeight: 42,
                                }}
                            >
                                {weekends.map(
                                    (weekend) => (
                                        <span
                                            key={
                                                weekend
                                            }
                                            className="badge rounded-pill badge-primary d-inline-flex align-items-center gap-1"
                                        >
                                            {weekend}

                                            <button
                                                type="button"
                                                aria-label={`Remove ${weekend}`}
                                                disabled={
                                                    processing
                                                }
                                                className="border-0 bg-transparent text-white p-0 d-flex align-items-center"
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
                                    type="text"
                                    id="edit-weekends"
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
                                Type a weekend
                                name and press
                                Tab, Enter, or
                                comma to add.
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