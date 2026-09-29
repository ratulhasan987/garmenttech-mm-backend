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
import { Unit } from '@/types/unit';

type EditUnitModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unit: Unit | null;
};

type DesignationForm = {
    id: number | string;
    name: string;
};

export default function EditUnitModal({
    open,
    onOpenChange,
    unit,
}: EditUnitModalProps) {
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
        name: '',
    });

    useEffect(() => {
        if (!unit || !open) {
            return;
        }

        setData({
            id: unit.id,
            name: unit.name ?? '',
        });

        clearErrors();
    }, [unit, open]);

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

        if (!unit) {
            return;
        }

        post('/unit-update', {
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
            title="Edit Unit"
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
                            : 'Update Unit'}
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
