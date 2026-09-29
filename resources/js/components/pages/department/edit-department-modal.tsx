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
import type { Department } from '@/types/department';

type EditDepartmentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    department: Department | null;
};

type DepartmentForm = {
    id: number | string;
    code: string;
    name: string;
};

export default function EditDepartmentModal({
    open,
    onOpenChange,
    department,
}: EditDepartmentModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<DepartmentForm>({
        id: '',
        code: '',
        name: '',
    });

    useEffect(() => {
        if (!department || !open) {
            return;
        }

        setData({
            id: department.id,
            code: department.code ?? '',
            name: department.name ?? '',
        });

        clearErrors();
    }, [department, open]);

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

        if (!department) {
            return;
        }

        post('/department-update', {
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
                        form="edit-department-form"
                        disabled={processing}
                    >
                        {processing
                            ? 'Updating...'
                            : 'Update Department'}
                    </Button>
                </>
            }
        >
            <form
                id="edit-department-form"
                onSubmit={handleSubmit}
            >
                <FormField>
                    <FormLabel
                        htmlFor="edit-department-code"
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
