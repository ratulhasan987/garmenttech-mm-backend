import { useEffect, useState, type FormEvent } from 'react';
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
import type { Machine, MachineModelOption, FloorOption } from '@/types/machine';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const machineSchema = z.object({
    model_id: z.string().min(1, 'Machine model is required.'),
    code: z.string().min(1, 'Machine code is required.').max(100, 'Code too long.'),
    status: z.enum(['active', 'inactive', 'maintenance', 'retired']),
    notes: z.string().optional().or(z.literal('')),
    location: z.object({
        floor_id: z.string().optional().or(z.literal('')),
        sl_no: z.string().optional().or(z.literal('')),
        remarks: z.string().optional().or(z.literal('')),
    }).optional(),
}).superRefine((val, ctx) => {
    if (val.location?.floor_id && !val.location.sl_no) {
        ctx.addIssue({
            code: 'custom',
            path: ['location.sl_no'],
            message: 'Serial Number is required when assigning a floor.',
        });
    }
});

type MachineFormData = z.input<typeof machineSchema>;
type MachineFormErrors = Partial<Record<keyof MachineFormData | `location.${string}`, string>>;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type EditMachineModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    machine: Machine | null;
    models: MachineModelOption[];
    floors: FloorOption[];
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function EditMachineModal({
    open,
    onOpenChange,
    machine,
    models,
    floors,
}: EditMachineModalProps) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<MachineFormData>({
        model_id: '',
        code: '',
        status: 'active',
        notes: '',
        location: {
            floor_id: '',
            sl_no: '',
            remarks: '',
        },
    });

    const [validationErrors, setValidationErrors] = useState<MachineFormErrors>({});

    useEffect(() => {
        if (open && machine) {
            clearErrors();
            setValidationErrors({});
            setData({
                model_id: String(machine.model_id || ''),
                code: machine.code || '',
                status: (machine.status as any) || 'active',
                notes: machine.notes || '',
                location: {
                    floor_id: machine.current_location?.floor_id ? String(machine.current_location.floor_id) : '',
                    sl_no: machine.current_location?.sl_no || '',
                    remarks: machine.current_location?.remarks || '',
                },
            });
        }
    }, [open, machine]);

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!machine) return;

        const result = machineSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: MachineFormErrors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                if (!fieldErrors[path as keyof MachineFormErrors]) {
                    fieldErrors[path as keyof MachineFormErrors] = issue.message;
                }
            });
            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        const payload = {
            ...data,
            location: data.location?.floor_id ? data.location : null,
        };

        put(`/machine/${machine.id}`, {
            data: payload,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});
                onOpenChange(false);
            },
        });
    };

    const formErrors: MachineFormErrors = {
        ...validationErrors,
        ...errors,
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    handleClose();
                } else {
                    onOpenChange(nextOpen);
                }
            }}
            title="Edit Machine"
            busy={processing}
            centered={false}
            size="xl"
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
                        form="edit-machine-form"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update Machine'}
                    </Button>
                </>
            }
        >
            <form id="edit-machine-form" onSubmit={handleSubmit}>
                <div className="row">
                    <h6 className="col-12 mb-3 text-muted border-bottom pb-2">Machine Details</h6>
                    
                    {/* Model */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-model_id" required>Machine Model</FormLabel>
                            <select
                                id="edit-model_id"
                                className={cn('form-control', formErrors.model_id && 'is-invalid')}
                                value={data.model_id}
                                disabled={processing}
                                onChange={(e) => setData('model_id', e.target.value)}
                            >
                                <option value="">Select Model</option>
                                {models.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.name} ({opt.code})
                                    </option>
                                ))}
                            </select>
                            <FormError error={formErrors.model_id as string} />
                        </FormField>
                    </div>

                    {/* Code */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-code" required>Machine Code</FormLabel>
                            <Input
                                type="text"
                                id="edit-code"
                                value={data.code}
                                placeholder="e.g. MCH-001"
                                disabled={processing}
                                className={cn(formErrors.code && 'is-invalid')}
                                onChange={(e) => setData('code', e.target.value)}
                            />
                            <FormError error={formErrors.code as string} />
                        </FormField>
                    </div>

                    {/* Status */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-status" required>Status</FormLabel>
                            <select
                                id="edit-status"
                                className={cn('form-control', formErrors.status && 'is-invalid')}
                                value={data.status}
                                disabled={processing}
                                onChange={(e) => setData('status', e.target.value as any)}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="retired">Retired</option>
                            </select>
                            <FormError error={formErrors.status as string} />
                        </FormField>
                    </div>

                    {/* Notes */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-notes">Notes</FormLabel>
                            <Input
                                type="text"
                                id="edit-notes"
                                value={data.notes}
                                placeholder="Optional notes..."
                                disabled={processing}
                                className={cn(formErrors.notes && 'is-invalid')}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                            <FormError error={formErrors.notes as string} />
                        </FormField>
                    </div>

                    <h6 className="col-12 mt-4 mb-3 text-muted border-bottom pb-2">
                        Update Location (Changing this will move the machine)
                    </h6>

                    {/* Floor */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-loc-floor">Floor</FormLabel>
                            <select
                                id="edit-loc-floor"
                                className={cn('form-control', formErrors['location.floor_id'] && 'is-invalid')}
                                value={data.location?.floor_id}
                                disabled={processing}
                                onChange={(e) => setData('location.floor_id', e.target.value)}
                            >
                                <option value="">Select Floor</option>
                                {floors.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.building?.name} - Floor {opt.floor_number}
                                    </option>
                                ))}
                            </select>
                            <FormError error={formErrors['location.floor_id'] as string} />
                        </FormField>
                    </div>

                    {/* SL No */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-loc-sl_no">Serial Number (SL No)</FormLabel>
                            <Input
                                type="text"
                                id="edit-loc-sl_no"
                                value={data.location?.sl_no}
                                placeholder="e.g. A-01"
                                disabled={processing}
                                className={cn(formErrors['location.sl_no'] && 'is-invalid')}
                                onChange={(e) => setData('location.sl_no', e.target.value)}
                            />
                            <FormError error={formErrors['location.sl_no'] as string} />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}