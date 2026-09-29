// [Biztek] NEW FILE - Edit modal (follows EditHolidayModal pattern)
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
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';
import type { Leave } from '@/types/leave';

/*
|--------------------------------------------------------------------------
| Validation - same schema as create
|--------------------------------------------------------------------------
*/

const leaveSchema = z.object({
    id: z.string(),
    name: z
        .string()
        .min(1, 'Leave name is required.')
        .max(255, 'Leave name cannot exceed 255 characters.'),

    qty: z
        .string()
        .min(1, 'Quantity is required.')
        .refine((value) => !Number.isNaN(Number(value)), 'Quantity must be a valid number.')
        .refine((value) => Number(value) > 0, 'Quantity must be greater than 0.'),

            // ✅ NEW: is_default validation
    is_default: z.boolean(),
});

type LeaveFormData = z.input<typeof leaveSchema>;

type LeaveFormErrors = Partial<Record<keyof LeaveFormData, string>>;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type EditLeaveModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    leave: Leave | null;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function EditLeaveModal({
    open,
    onOpenChange,
    leave,
}: EditLeaveModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<LeaveFormData>({
        id: '',
        name: '',
        qty: '',
        is_default: false, 
    });

    const [validationErrors, setValidationErrors] = useState<LeaveFormErrors>({});

    /*
    |--------------------------------------------------------------------------
    | Fetch leave data via AJAX when modal opens
    | Replaces Realbiz jQuery .editLeave click -> AJAX call
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (open && leave) {
            fetch(`/leave/${leave.id}/edit`)
                .then((res) => res.json())
                .then((res) => {
                    setData({
                        id: String(res.id),
                        name: res.name,
                        qty: String(res.qty),
                          is_default: Boolean(res.is_default),  
                    });
                });
        }
    }, [open, leave]);

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
    | Submit - posts to leave.update route
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = leaveSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: LeaveFormErrors = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof LeaveFormData;

                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });

            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/leave', {
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

    const formErrors: LeaveFormErrors = {
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
            title="Update Leave"
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
                        form="edit-leave-form"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update Leave'}
                    </Button>
                </>
            }
        >
            <form id="edit-leave-form" onSubmit={handleSubmit}>
                {/* [Biztek] Hidden ID field - needed for update route */}
                <input type="hidden" name="id" value={data.id} />

                <div className="row">
                    {/* [Biztek] Leave Name */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-name" required>
                                Leave Name
                            </FormLabel>

                            <Input
                                type="text"
                                id="edit-name"
                                name="name"
                                value={data.name}
                                placeholder="Enter a name"
                                disabled={processing}
                                className={cn(formErrors.name && 'is-invalid')}
                                onChange={(event) => {
                                    setData('name', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>

                    {/* [Biztek] Leave Quantity */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-qty" required>
                                Leave Quantity
                            </FormLabel>

                            <Input
                                type="number"
                                id="edit-qty"
                                name="qty"
                                value={data.qty}
                                placeholder="Enter Quantity"
                                min="0"
                                step="1"
                                disabled={processing}
                                className={cn(formErrors.qty && 'is-invalid')}
                                onChange={(event) => {
                                    setData('qty', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.qty} />
                        </FormField>
                    </div>


                      {/* ✅ NEW: Default toggle */}
                    <div className="col-12">
                        <FormField>
                            <div className="d-flex align-items-center justify-content-between border rounded-3 p-3">
                                <div>
                                    <FormLabel htmlFor="edit-is_default" className="mb-0">
                                        Default Leave
                                    </FormLabel>
                                    <p className="text-muted small mb-0">
                                        Mark this leave as default (assigned to new users automatically).
                                    </p>
                                </div>

                                <div className="form-check form-switch m-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="edit-is_default"
                                        checked={data.is_default}
                                        disabled={processing}
                                        onChange={(event) => {
                                            setData('is_default', event.target.checked);
                                        }}
                                    />
                                </div>
                            </div>
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}