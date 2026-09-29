import {
    useEffect,
    useState,
    type FormEvent,
} from 'react';

import { useForm } from '@inertiajs/react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { Radio } from '@/components/ui/form/radio';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';

import type { Interest } from '@/types/interest';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type DesignationSuggestion = {
    id: number;
    code: string;
    name: string;
};

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const interestSchema = z.object({
    id: z
        .number({
            message: 'Interest ID is required.',
        })
        .nullable()
        .refine(
            (value) => value !== null,
            {
                message: 'Interest ID is required.',
            },
        ),

    designation: z
        .number({
            message: 'Please select a designation.',
        })
        .nullable()
        .refine(
            (value) => value !== null,
            {
                message: 'Please select a designation.',
            },
        ),

    rate: z
        .string()
        .min(1, 'Rate is required.')
        .refine(
            (value) => !Number.isNaN(Number(value)),
            'Rate must be a valid number.',
        )
        .refine(
            (value) => Number(value) > 0,
            'Rate must be greater than 0.',
        )
        .refine(
            (value) => Number(value) <= 100,
            'Rate cannot be greater than 100.',
        ),

    status: z.enum([
        'active',
        'inactive',
    ]),
});

type InterestFormData =
    z.input<typeof interestSchema>;

type InterestFormErrors =
    Partial<
        Record<
            keyof InterestFormData,
            string
        >
    >;

/*
|--------------------------------------------------------------------------
| Search Designations
|--------------------------------------------------------------------------
*/

async function searchDesignations(
    query: string,
    signal?: AbortSignal,
): Promise<DesignationSuggestion[]> {
    const response = await fetch(
        `/get-designations?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            'Failed to search designations.',
        );
    }

    return response.json();
}

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type UpdateInterestModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    interest: Interest | null;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function UpdateInterestModal({
    open,
    onOpenChange,
    interest,
}: UpdateInterestModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<InterestFormData>({
        id: null,
        designation: null,
        rate: '',
        status: 'active',
    });

    const [
        validationErrors,
        setValidationErrors,
    ] = useState<InterestFormErrors>({});

    /*
    |--------------------------------------------------------------------------
    | Populate Edit Data
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!interest || !open) {
            return;
        }

        setData({
            id: interest.id,
            designation:
                interest.designation_id,

            rate: String(
                interest.rate,
            ),

            status: interest.status,
        });

        clearErrors();
        setValidationErrors({});
    }, [
        interest,
        open,
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
        setValidationErrors({});

        onOpenChange(false);
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

        const result =
            interestSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: InterestFormErrors =
                {};

            result.error.issues.forEach(
                (issue) => {
                    const field =
                        issue.path[0] as keyof InterestFormData;

                    if (!fieldErrors[field]) {
                        fieldErrors[field] =
                            issue.message;
                    }
                },
            );

            setValidationErrors(
                fieldErrors,
            );

            return;
        }

        if (!interest) {
            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/interest-update', {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});

                onOpenChange(false);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Errors
    |--------------------------------------------------------------------------
    */

    const formErrors: InterestFormErrors = {
        ...validationErrors,
        ...errors,
    };

    /*
    |--------------------------------------------------------------------------
    | No Interest
    |--------------------------------------------------------------------------
    */

    if (!interest) {
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

                onOpenChange(nextOpen);
            }}
            title="Edit Interest"
            busy={processing}
            centered={false}
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        disabled={processing}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="update-interest-form"
                        disabled={processing}
                    >
                        {processing
                            ? 'Updating...'
                            : 'Update Interest'}
                    </Button>
                </>
            }
        >
            <form
                id="update-interest-form"
                onSubmit={handleSubmit}
            >
                <div className="row">
                    {/* Designation */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel required>
                                Designation
                            </FormLabel>

                            <SuggestionSearchInput<DesignationSuggestion>
                                searchFn={
                                    searchDesignations
                                }
                                idKey="id"
                                labelKey="name"
                                secondaryLabelKey="code"
                                placeholder="Search designation"
                                showSearchIcon={
                                    false
                                }
                                disabled={
                                    true
                                }
                                error={
                                    formErrors.designation
                                }

                                /*
                                 * Important for edit:
                                 *
                                 * Shows the existing
                                 * designation immediately.
                                 */
                                defaultSelectedItem={
                                    interest.designation
                                }


                                clearOnFocus={
                                    true
                                }


                                onSelect={(
                                    designation,
                                ) => {
                                    setData(
                                        'designation',
                                        designation.id,
                                    );

                                    setValidationErrors(
                                        (current) => ({
                                            ...current,
                                            designation:
                                                undefined,
                                        }),
                                    );
                                }}

                                onClear={() => {
                                    setData(
                                        'designation',
                                        null,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.designation
                                }
                            />
                        </FormField>
                    </div>

                    {/* Rate */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="rate"
                                required
                            >
                                Rate %
                            </FormLabel>

                            <Input
                                type="number"
                                id="rate"
                                name="rate"
                                value={data.rate}
                                placeholder="e.g. 5"
                                min="0"
                                max="100"
                                step="0.01"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.rate &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'rate',
                                        event.target
                                            .value,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.rate
                                }
                            />
                        </FormField>
                    </div>

                    {/* Status */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel required>
                                Status
                            </FormLabel>

                            <div className="d-flex gap-3">
                                <Radio
                                    id="update-status-active"
                                    name="status"
                                    value="active"
                                    label="Active"
                                    checked={
                                        data.status ===
                                        'active'
                                    }
                                    disabled={
                                        processing
                                    }
                                    onChange={() =>
                                        setData(
                                            'status',
                                            'active',
                                        )
                                    }
                                />

                                <Radio
                                    id="update-status-inactive"
                                    name="status"
                                    value="inactive"
                                    label="Inactive"
                                    checked={
                                        data.status ===
                                        'inactive'
                                    }
                                    disabled={
                                        processing
                                    }
                                    onChange={() =>
                                        setData(
                                            'status',
                                            'inactive',
                                        )
                                    }
                                />
                            </div>

                            <FormError
                                error={
                                    formErrors.status
                                }
                            />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
