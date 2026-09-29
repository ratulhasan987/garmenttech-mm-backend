import { type FormEvent, useEffect } from 'react';

import { useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { NumberInput } from '@/components/ui/form/number-input';
import { Switch } from '@/components/ui/form/switch';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';

type LeadStage = {
    id: number;
    name: string;
    code: string;
    created_at: string;
    updated_at: string;
};

type EditLeadStageModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stage: LeadStage | null;
};

type LeadStageForm = {
    id: number;
    name: string;
    code: string;
};

export default function EditLeadDesignationModal({
    open,
    onOpenChange,
    stage,
}: EditLeadStageModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<LeadStageForm>({
            id: 0,
            name: '',
            code: '',
        });

    useEffect(() => {
        if (!stage || !open) {
            return;
        }

        setData({
            id: stage.id,
            name: stage.name ?? '',
            code: stage.name ?? '',
        });

        clearErrors();
    }, [stage, open, setData, clearErrors]);

    const handleClose = () => {
        if (processing) {
            return;
        }

        reset();
        clearErrors();

        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stage) {
            return;
        }

        post('/lead-designation-update', {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();

                onOpenChange(false);
            },
        });
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
            title="Edit Lead Area"
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
                        form="edit-lead-stage-form"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update Area'}
                    </Button>
                </>
            }
        >
            <form id="edit-lead-stage-form" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="code" required>
                                Designation Apparition
                            </FormLabel>

                            <Input
                                id="code"
                                name="code"
                                value={data.code}
                                placeholder="e.g. Website"
                                disabled={processing}
                                className={cn(errors.code && 'is-invalid')}
                                onChange={(event) =>
                                    setData('code', event.target.value)
                                }
                            />

                            <FormError error={errors.code} />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-lead-stage-name" required>
                                Name
                            </FormLabel>

                            <Input
                                id="edit-lead-stage-name"
                                name="name"
                                value={data.name}
                                placeholder="e.g. Interested"
                                disabled={processing}
                                className={cn(errors.name && 'is-invalid')}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                            />

                            <FormError error={errors.name} />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
