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

type CreateDesignationModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type DesignationForm = {
    code: string;
    name: string;
};

export default function CreateDesignationModal({
    open,
    onOpenChange,
}: CreateDesignationModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<DesignationForm>({
        code: '',
        name: '',
    });

    const handleClose = () => {
        if (processing) {
            return;
        }

        reset();
        clearErrors();

        onOpenChange(false);
    };

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        post('/designation', {
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
            title="Add New Designation"
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
                        form="create-designation-form"
                        disabled={processing}
                    >
                        {processing
                            ? 'Saving...'
                            : 'Save Designation'}
                    </Button>
                </>
            }
        >
            <form
                id="create-designation-form"
                onSubmit={handleSubmit}
            >
                <div className="row">
                    {/* Code */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="code"
                                required
                            >
                                Code
                            </FormLabel>

                            <Input
                                id="code"
                                name="code"
                                value={data.code}
                                placeholder="e.g. MGMT"
                                disabled={processing}
                                className={cn(
                                    errors.code &&
                                    'is-invalid',
                                )}
                                onChange={(event) =>
                                    setData(
                                        'code',
                                        event.target.value,
                                    )
                                }
                            />

                            <FormError
                                error={errors.code}
                            />
                        </FormField>
                    </div>

                    {/* Name */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="name"
                                required
                            >
                                Name
                            </FormLabel>

                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="e.g. Management"
                                disabled={processing}
                                className={cn(
                                    errors.name &&
                                    'is-invalid',
                                )}
                                onChange={(event) =>
                                    setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
                            />

                            <FormError
                                error={errors.name}
                            />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
