import { type FormEvent } from 'react';

import { useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';
import { NumberInput } from '@/components/ui/form/number-input';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Switch } from '@/components/ui/form/switch';

type CreateDepartmentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type LeadSourceForm = {
    name: string;
    probability_percent: number;
    order: number;
    color: string | null;
    is_active: boolean;
    is_default: boolean;
    is_convert_to_customer: boolean;
};

const DEFAULT_COLOR = '#006666';

export default function CreateLeadStageModal({
    open,
    onOpenChange,
}: CreateDepartmentModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<LeadSourceForm>({
            name: '',
            probability_percent: 0,
            order: 1,
            color: DEFAULT_COLOR,
            is_active: true,
            is_default: false,
            is_convert_to_customer: false,
        });

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

        post('/lead-stage', {
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
            title="Add New Stage"
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
                        form="create-lead-source-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save Source'}
                    </Button>
                </>
            }
        >
            <form id="create-lead-source-form" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="name" required>
                                Name
                            </FormLabel>

                            <Input
                                id="name"
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
                            <FormLabel htmlFor="code" required>
                                Probability percent (0 - 100%)
                            </FormLabel>

                            <NumberInput
                                min={0}
                                id="code"
                                name="code"
                                value={data.probability_percent}
                                placeholder="e.g. 3.5"
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
                            <FormLabel htmlFor="code" required>
                                Order
                            </FormLabel>

                            <NumberInput
                                id="code"
                                name="code"
                                min={1}
                                value={data.order}
                                placeholder="e.g. 3.5"
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
                            <FormLabel htmlFor="color" required>
                                Color
                            </FormLabel>

                            <input
                                id="color"
                                name="color"
                                className={cn(
                                    'form-control form-control-color w-100',
                                    errors.color && 'is-invalid',
                                )}
                                style={{
                                    height: '36px',
                                }}
                                type="color"
                                value={data.color ?? DEFAULT_COLOR}
                                disabled={processing}
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
                                id="is_active"
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
                                id="is_default"
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
                                id="is_convert_to_customer"
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
                                className="lh-sm text-secondary"
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
