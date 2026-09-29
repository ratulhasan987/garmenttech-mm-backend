// [Biztek] NEW FILE - Edit modal (employee is disabled, fetched via AJAX)
import { useState, useEffect, type FormEvent } from 'react';

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
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';
import type { Commission } from '@/types/commission';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const commissionSchema = z.object({
    id: z.string(),
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
| Props
|--------------------------------------------------------------------------
*/

type EditCommissionModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    commission: Commission | null;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function EditCommissionModal({
    open,
    onOpenChange,
    commission,
}: EditCommissionModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<CommissionFormData>({
        id: '',
        type: 'percentage',
        commission_rate: '',
        status: 'active',
        note: '',
    });

    const [validationErrors, setValidationErrors] = useState<CommissionFormErrors>({});

    // [Biztek] Store employee info for display (disabled field)
    const [employeeDisplay, setEmployeeDisplay] = useState('');

    /*
    |--------------------------------------------------------------------------
    | Fetch commission data via AJAX when modal opens
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (open && commission) {
            fetch(`/commission/${commission.id}/edit`)
                .then((res) => res.json())
                .then((res) => {
                    setData({
                        id: String(res.id),
                        type: res.commission_type,
                        commission_rate: String(res.commission_rate),
                        status: res.status,
                        note: res.note ?? '',
                    });
                    // [Biztek] Show employee name + employee_id in disabled field
                    setEmployeeDisplay(`${res.user.name} - #${res.user.employee_id}`);
                });
        }
    }, [open, commission]);

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
        setEmployeeDisplay('');

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

        post('/commission-update', {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});
                setEmployeeDisplay('');

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
            title="Update Commission"
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
                        form="edit-commission-form"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update Commission'}
                    </Button>
                </>
            }
        >
            <form id="edit-commission-form" onSubmit={handleSubmit}>
                <input type="hidden" name="id" value={data.id} />

                <div className="row">
                    {/* [Biztek] Employee - disabled, shows name from AJAX */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel>
                                Employee
                            </FormLabel>

                            <Input
                                type="text"
                                value={employeeDisplay}
                                disabled
                            />
                        </FormField>
                    </div>

                    {/* [Biztek] Commission Type */}
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

                    {/* [Biztek] Commission Rate */}
                    <div className="col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit_commission_rate" required>
                                Rate
                            </FormLabel>

                            <Input
                                type="number"
                                id="edit_commission_rate"
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

                    {/* [Biztek] Status */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel required>
                                Status
                            </FormLabel>

                            <div className="d-flex gap-3">
                                <Radio
                                    id="edit-status-active"
                                    name="status"
                                    value="active"
                                    label="Active"
                                    checked={data.status === 'active'}
                                    disabled={processing}
                                    onChange={() => setData('status', 'active')}
                                />

                                <Radio
                                    id="edit-status-inactive"
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

                    {/* [Biztek] Note */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit_note">
                                Note (Optional)
                            </FormLabel>

                            <textarea
                                id="edit_note"
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