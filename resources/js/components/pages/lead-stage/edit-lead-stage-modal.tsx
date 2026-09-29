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
    probability_percent: number;
    order: number;
    color: string;
    is_active: boolean;
    is_default: boolean;
    is_convert_to_customer: boolean;
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
    probability_percent: number;
    order: number;
    color: string | null;
    is_active: boolean;
    is_default: boolean;
    is_convert_to_customer: boolean;
};

const DEFAULT_COLOR = '#006666';

export default function EditLeadStageModal({
    open,
    onOpenChange,
    stage,
}: EditLeadStageModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<LeadStageForm>({
            id: 0,
            name: '',
            probability_percent: 0,
            order: 0,
            color: DEFAULT_COLOR,
            is_active: true,
            is_default: false,
            is_convert_to_customer: false,
        });

    useEffect(() => {
        if (!stage || !open) {
            return;
        }

        setData({
            id: stage.id,
            name: stage.name ?? '',
            probability_percent: Number(stage.probability_percent ?? 0),
            order: Number(stage.order ?? 0),
            color: stage.color ?? DEFAULT_COLOR,
            is_active: Boolean(stage.is_active),
            is_default: Boolean(stage.is_default),
            is_convert_to_customer: Boolean(stage.is_convert_to_customer),
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

        post('/lead-stage-update', {
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
            title="Edit Lead Stage"
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
                        {processing ? 'Updating...' : 'Update Stage'}
                    </Button>
                </>
            }
        >
            <form id="edit-lead-stage-form" onSubmit={handleSubmit}>
                <div className="row">
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

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-probability-percent"
                                required
                            >
                                Probability Percent (0 - 100%)
                            </FormLabel>

                            <NumberInput
                                id="edit-probability-percent"
                                name="probability_percent"
                                value={data.probability_percent}
                                placeholder="e.g. 50"
                                disabled={processing}
                                className={cn(
                                    errors.probability_percent && 'is-invalid',
                                )}
                                onValueChange={(value) =>
                                    setData('probability_percent', value)
                                }
                            />

                            <FormError error={errors.probability_percent} />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-stage-order" required>
                                Order
                            </FormLabel>

                            <NumberInput
                                id="edit-stage-order"
                                name="order"
                                value={data.order}
                                placeholder="e.g. 1"
                                disabled={processing}
                                className={cn(errors.order && 'is-invalid')}
                                onValueChange={(value) =>
                                    setData('order', value)
                                }
                            />

                            <FormError error={errors.order} />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-stage-color" required>
                                Color
                            </FormLabel>

                            <input
                                id="edit-stage-color"
                                name="color"
                                type="color"
                                value={data.color ?? DEFAULT_COLOR}
                                disabled={processing}
                                className={cn(
                                    'form-control form-control-color w-100',
                                    errors.color && 'is-invalid',
                                )}
                                style={{
                                    height: '36px',
                                }}
                                onChange={(event) =>
                                    setData('color', event.target.value)
                                }
                            />

                            <FormError error={errors.color} />
                        </FormField>
                    </div>

                    <div className="col-6">
                        <FormField>
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

                    <div className="col-12">
                        <FormField>
                            <Switch
                                id="edit-is-convert-to-customer"
                                name="is_convert_to_customer"
                                label="Automatically Convert Lead to Customer"
                                checked={data.is_convert_to_customer}
                                disabled={processing}
                                onChange={(event) =>
                                    setData(
                                        'is_convert_to_customer',
                                        event.target.checked,
                                    )
                                }
                            />

                            <FormError error={errors.is_convert_to_customer} />

                            <p
                                className="lh-sm text-secondary mb-0"
                                style={{
                                    paddingLeft: '36px',
                                }}
                            >
                                <small>
                                    When a lead is moved to this stage, the
                                    system will automatically create a customer
                                    if one does not already exist.
                                </small>
                            </p>
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
