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

type LeadSource = {
    id: number;
    name: string;
    cost_per_lead: number;
    is_active: boolean;
    is_default: boolean;
};

type EditLeadSourceModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    source: LeadSource | null;
};

type LeadSourceForm = {
    id: number;
    name: string;
    cost_per_lead: number;
    is_active: boolean;
    is_default: boolean;
};

export default function EditLeadSourceModal({
    open,
    onOpenChange,
    source,
}: EditLeadSourceModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<LeadSourceForm>({
            id: 0,
            name: '',
            cost_per_lead: 0,
            is_active: true,
            is_default: false,
        });

    useEffect(() => {
        if (!source || !open) {
            return;
        }

        setData({
            id: source.id,
            name: source.name ?? '',
            cost_per_lead: Number(source.cost_per_lead ?? 0),
            is_active: Boolean(source.is_active),
            is_default: Boolean(source.is_default),
        });

        clearErrors();
    }, [source, open, setData, clearErrors]);

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

        if (!source) {
            return;
        }

        post('/lead-source-update', {
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
            title="Edit Lead Source"
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
                        form="edit-lead-source-form"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update Source'}
                    </Button>
                </>
            }
        >
            <form id="edit-lead-source-form" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-lead-source-name" required>
                                Name
                            </FormLabel>

                            <Input
                                id="edit-lead-source-name"
                                name="name"
                                value={data.name}
                                placeholder="e.g. Website"
                                disabled={processing}
                                className={cn(errors.name && 'is-invalid')}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                            />

                            <FormError error={errors.name} />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-cost-per-lead" required>
                                Cost Per Lead
                            </FormLabel>

                            <NumberInput
                                id="edit-cost-per-lead"
                                name="cost_per_lead"
                                value={data.cost_per_lead}
                                placeholder="e.g. 3.5"
                                disabled={processing}
                                className={cn(
                                    errors.cost_per_lead && 'is-invalid',
                                )}
                                onValueChange={(value) =>
                                    setData('cost_per_lead', value)
                                }
                            />

                            <FormError error={errors.cost_per_lead} />
                        </FormField>
                    </div>

                    <div className="col-6">
                        <FormField>
                            <FormLabel htmlFor="edit-is-active">
                                Status
                            </FormLabel>

                            <Switch
                                id="edit-is-active"
                                name="is_active"
                                label="Is Active"
                                checked={data.is_active}
                                disabled={processing}
                                onChange={(event) =>
                                    setData('is_active', event.target.checked)
                                }
                            />

                            <FormError error={errors.is_active} />
                        </FormField>
                    </div>

                    <div className="col-6">
                        <FormField>
                            <FormLabel htmlFor="edit-is-default">
                                Default
                            </FormLabel>

                            <Switch
                                id="edit-is-default"
                                name="is_default"
                                label="Is Default"
                                checked={data.is_default}
                                disabled={processing}
                                onChange={(event) =>
                                    setData('is_default', event.target.checked)
                                }
                            />

                            <FormError error={errors.is_default} />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
