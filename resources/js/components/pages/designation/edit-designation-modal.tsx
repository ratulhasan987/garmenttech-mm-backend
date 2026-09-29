import { type FormEvent, useEffect } from 'react';

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
import type { Designation } from '@/types/designation';

type EditDesignationModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    designation: Designation | null;
};

type DesignationForm = {
    id: number | string;
    code: string;
    name: string;
};

export default function EditDesignationModal({
    open,
    onOpenChange,
    designation,
}: EditDesignationModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<DesignationForm>({
        id: '',
        code: '',
        name: '',
    });

    useEffect(() => {
        if (!designation || !open) {
            return;
        }

        setData({
            id: designation.id,
            code: designation.code ?? '',
            name: designation.name ?? '',
        });

        clearErrors();
    }, [designation, open]);

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

        if (!designation) {
            return;
        }

        post('/designation-update', {
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
            title="Edit Department"
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
                        form="edit-designation-form"
                        disabled={processing}
                    >
                        {processing
                            ? 'Updating...'
                            : 'Update Designation'}
                    </Button>
                </>
            }
        >
            <form
                id="edit-designation-form"
                onSubmit={handleSubmit}
            >
                <FormField>
                    <FormLabel
                        htmlFor="edit-designation-code"
                        required
                    >
                        Code
                    </FormLabel>

                    <Input
                        id="edit-department-code"
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

                <FormField>
                    <FormLabel
                        htmlFor="edit-department-name"
                        required
                    >
                        Name
                    </FormLabel>

                    <Input
                        id="edit-department-name"
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
            </form>
        </AppModal>
    );
}
