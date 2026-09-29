
import { useForm } from '@inertiajs/react';

import { useState, type FormEvent } from 'react';

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


const leaveSchema = z.object({
    name: z
        .string()
        .min(1, 'Leave name is required.')
        .max(255, 'Leave name cannot exceed 255 characters.'),

    qty: z
        .string()
        .min(1, 'Quantity is required.')
        .refine((value) => !Number.isNaN(Number(value)), 'Quantity must be a valid number.')
        .refine((value) => Number(value) > 0, 'Quantity must be greater than 0.'),

        //  NEW: is_default validation
    is_default: z.boolean(),
});

type LeaveFormData = z.input<typeof leaveSchema>;

type LeaveFormErrors = Partial<Record<keyof LeaveFormData, string>>;


type CreateLeaveModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};



export default function CreateLeaveModal({
    open,
    onOpenChange,
}: CreateLeaveModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<LeaveFormData>({
        name: '',
        qty: '',
          is_default: false, 
    });

    const [validationErrors, setValidationErrors] = useState<LeaveFormErrors>({});


    const handleClose = () => {
        if (processing) return;

        reset();
        clearErrors();
        setValidationErrors({});

        onOpenChange(false);
    };


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

        post('/leave-store', {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});

                onOpenChange(false);
            },
        });
    };

 

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
            title="Add New Leave"
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
                        form="create-leave-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save Leave'}
                    </Button>
                </>
            }
        >
            <form id="create-leave-form" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="name" required>
                                Leave Name
                            </FormLabel>

                            <Input
                                type="text"
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="Enter a Leave Name"
                                disabled={processing}
                                className={cn(formErrors.name && 'is-invalid')}
                                onChange={(event) => {
                                    setData('name', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="qty" required>
                                Leave Quantity
                            </FormLabel>

                            <Input
                                type="number"
                                id="qty"
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
                                    <FormLabel htmlFor="is_default" className="mb-0">
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
                                        id="is_default"
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