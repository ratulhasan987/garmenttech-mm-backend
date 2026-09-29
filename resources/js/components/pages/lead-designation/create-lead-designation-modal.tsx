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

type CreateDepartmentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type LeadSourceForm = {
    name: string;
    code: string;
};

export default function CreateLeadDesignationModal({
    open,
    onOpenChange,
}: CreateDepartmentModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<LeadSourceForm>({
            name: '',
            code: '',
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

        post('/lead-designation', {
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
                </div>
            </form>
        </AppModal>
    );
}
