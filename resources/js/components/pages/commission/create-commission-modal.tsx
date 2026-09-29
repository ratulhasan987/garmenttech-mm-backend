// [Biztek] NEW FILE - Create modal with employee search (follows CreateInterestModal pattern)
import { useState, type FormEvent } from 'react';

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

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type EmployeeSuggestion = {
    id: number;
    name: string;
    employee_id: string;
};

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const commissionSchema = z.object({
    employee: z
        .number({
            message: 'Please select an employee.',
        })
        .nullable()
        .refine(
            (value) => value !== null,
            { message: 'Please select an employee.' },
        ),

    type: z.enum(['percentage', 'fixed'], {
        message: 'Please select a commission type.',
    }),

    commission_rate: z
        .string()
        .min(1, 'Rate is required.')
        .refine((value) => !Number.isNaN(Number(value)), 'Rate must be a valid number.')
        .refine((value) => Number(value) > 0, 'Rate must be greater than 0.'),

    status: z.enum(['active', 'inactive']),

    note: z.string().max(500, 'Note cannot exceed 500 characters.').nullable(),
});

type CommissionFormData = z.input<typeof commissionSchema>;

type CommissionFormErrors = Partial<Record<keyof CommissionFormData, string>>;

/*
|--------------------------------------------------------------------------
| Search Employees - uses existing /get-employees endpoint
|--------------------------------------------------------------------------
*/

async function searchEmployees(
    query: string,
    signal?: AbortSignal,
): Promise<EmployeeSuggestion[]> {
    const response = await fetch(
        `/get-employees?keyword=${encodeURIComponent(query)}`,
        { signal, headers: { Accept: 'application/json' } },
    );

    if (!response.ok) {
        throw new Error('Failed to search employees.');
    }

    return response.json();
}

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type CreateCommissionModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateCommissionModal({
    open,
    onOpenChange,
}: CreateCommissionModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<CommissionFormData>({
        employee: null,
        type: 'percentage',
        commission_rate: '',
        status: 'active',
        note: '',
    });

    const [validationErrors, setValidationErrors] = useState<CommissionFormErrors>({});

    /*
    |--------------------------------------------------------------------------
    | Close
    |--------------------------------------------------------------------------
    */

    const handleClose = () => {
        if (processing) return;

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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = commissionSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: CommissionFormErrors = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof CommissionFormData;

                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });

            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/commission', {
            data: {
                employee: data.employee,
                type: data.type,
                commission_rate: data.commission_rate,
                status: data.status,
                note: data.note,
            },

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

    const formErrors: CommissionFormErrors = {
        ...validationErrors,
        ...errors,
    };

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
            title="Add New Commission"
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
                        form="create-commission-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save Commission'}
                    </Button>
                </>
            }
        >
            <form id="create-commission-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* [Biztek] Employee search - replaces Realbiz jQuery autocomplete */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel required>
                                Employee
                            </FormLabel>

                            <SuggestionSearchInput<EmployeeSuggestion>
                                searchFn={searchEmployees}
                                idKey="id"
                                labelKey="name"
                                secondaryLabelKey="employee_id"
                                placeholder="Search employees"
                                showSearchIcon={false}
                                disabled={processing}
                                error={formErrors.employee}
                                onSelect={(employee) => {
                                    setData('employee', employee.id);
                                    setValidationErrors((current) => ({
                                        ...current,
                                        employee: undefined,
                                    }));
                                }}
                                onClear={() => {
                                    setData('employee', null);
                                }}
                            />

                            <FormError error={formErrors.employee} />
                        </FormField>
                    </div>

                    {/* [Biztek] Commission Type - replaces Realbiz blade select */}
                    <div className="col-md-6">
                        <FormField>
                            <FormLabel required>
                                Commission Type
                            </FormLabel>

                            <div className="form-control">
                                <select
                                    className="form-select border-0 p-0"
                                    value={data.type}
                                    disabled={processing}
                                    onChange={(event) => setData('type', event.target.value)}
                                >
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                            </div>

                            <FormError error={formErrors.type} />
                        </FormField>
                    </div>

                    {/* [Biztek] Commission Rate - replaces Realbiz blade number input */}
                    <div className="col-md-6">
                        <FormField>
                            <FormLabel htmlFor="commission_rate" required>
                                Rate
                            </FormLabel>

                            <Input
                                type="number"
                                id="commission_rate"
                                name="commission_rate"
                                value={data.commission_rate}
                                placeholder="Commission Rate"
                                min="0"
                                step="0.01"
                                disabled={processing}
                                className={cn(formErrors.commission_rate && 'is-invalid')}
                                onChange={(event) => {
                                    setData('commission_rate', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.commission_rate} />
                        </FormField>
                    </div>

                    {/* [Biztek] Status - replaces Realbiz blade radio buttons */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel required>
                                Status
                            </FormLabel>

                            <div className="d-flex gap-3">
                                <Radio
                                    id="create-status-active"
                                    name="status"
                                    value="active"
                                    label="Active"
                                    checked={data.status === 'active'}
                                    disabled={processing}
                                    onChange={() => setData('status', 'active')}
                                />

                                <Radio
                                    id="create-status-inactive"
                                    name="status"
                                    value="inactive"
                                    label="Inactive"
                                    checked={data.status === 'inactive'}
                                    disabled={processing}
                                    onChange={() => setData('status', 'inactive')}
                                />
                            </div>

                            <FormError error={formErrors.status} />
                        </FormField>
                    </div>

                    {/* [Biztek] Note - replaces Realbiz blade textarea */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="note">
                                Note (Optional)
                            </FormLabel>

                            <textarea
                                id="note"
                                name="note"
                                className={`form-control ${formErrors.note ? 'is-invalid' : ''}`}
                                rows={2}
                                placeholder="Notes"
                                value={data.note ?? ''}
                                disabled={processing}
                                onChange={(event) => {
                                    setData('note', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.note} />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}