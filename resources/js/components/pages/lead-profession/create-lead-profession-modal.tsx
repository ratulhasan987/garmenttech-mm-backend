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
import { Switch } from '@/components/ui/form/switch';

type CreateDepartmentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type LeadSourceForm = {
    name: string;
    is_active: boolean;
};

export default function CreateLeadProfessionModal({
    open,
    onOpenChange,
}: CreateDepartmentModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<LeadSourceForm>({
            name: '',
            is_active: true,
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

        post('/profession', {
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
            title="Add New Area"
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
                        {processing ? 'Saving...' : 'Save Area'}
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
                            <FormLabel htmlFor="is_active">Status</FormLabel>

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
                </div>
            </form>
        </AppModal>
    );
}
