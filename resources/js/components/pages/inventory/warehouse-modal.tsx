import { useEffect, type FormEvent } from 'react';

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

import type { Warehouse } from '@/types/inventory';

type WarehouseFormData = {
    name: string;

    phone: string;
    address: string;

    status: boolean;

    is_default: boolean;
};

type WarehouseModalProps = {
    open: boolean;

    onOpenChange: (open: boolean) => void;

    warehouse?: Warehouse | null;
};

export default function WarehouseModal({
    open,
    onOpenChange,
    warehouse = null,
}: WarehouseModalProps) {
    const isEditing = warehouse !== null;

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<WarehouseFormData>({
            name: '',

            phone: '',
            address: '',

            status: true,

            is_default: false,
        });

    useEffect(() => {
        if (!open) {
            return;
        }

        if (warehouse) {
            setData({

                name: warehouse.name,

                phone: warehouse.phone ?? '',

                address: warehouse.address ?? '',

                status: Boolean(warehouse.status),

                is_default: warehouse?.is_default ?? false,
            });

            clearErrors();

            return;
        }

        reset();
        clearErrors();
    }, [open, warehouse]);

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

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();

                onOpenChange(false);
            },
        };

        if (warehouse) {
            put(`/operations/warehouses/${warehouse.id}`, options);

            return;
        }

        post('/operations/warehouses', options);
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
            title={isEditing ? 'Edit Warehouse' : 'Add New Warehouse'}
            busy={processing}
            centered={false}
            size="lg"
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
                        form="warehouse-form"
                        disabled={processing}
                    >
                        {processing
                            ? 'Saving...'
                            : isEditing
                              ? 'Update Warehouse'
                              : 'Save Warehouse'}
                    </Button>
                </>
            }
        >
            <form id="warehouse-form" onSubmit={handleSubmit}>
                <div className="row g-3">
   
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="warehouse-name" required>
                                Warehouse Name
                            </FormLabel>

                            <Input
                                id="warehouse-name"
                                value={data.name}
                                placeholder="Main Warehouse"
                                disabled={processing}
                                className={cn(errors.name && 'is-invalid')}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                            />

                            <FormError error={errors.name} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="warehouse-phone">
                                Phone
                            </FormLabel>

                            <Input
                                id="warehouse-phone"
                                value={data.phone}
                                disabled={processing}
                                placeholder="01XXXXXXXXX"
                                className={cn(errors.phone && 'is-invalid')}
                                onChange={(event) =>
                                    setData('phone', event.target.value)
                                }
                            />

                            <FormError error={errors.phone} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="warehouse-status" required>
                                Status
                            </FormLabel>

                            <select
                                id="warehouse-status"
                                className="form-select"
                                disabled={processing}
                                value={data.status ? '1' : '0'}
                                onChange={(event) =>
                                    setData(
                                        'status',
                                        event.target.value === '1',
                                    )
                                }
                            >
                                <option value="1">Active</option>

                                <option value="0">Inactive</option>
                            </select>
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="warehouse-address">
                                Address
                            </FormLabel>

                            <textarea
                                id="warehouse-address"
                                rows={3}
                                className={cn(
                                    'form-control',
                                    errors.address && 'is-invalid',
                                )}
                                value={data.address}
                                disabled={processing}
                                onChange={(event) =>
                                    setData('address', event.target.value)
                                }
                            />

                            <FormError error={errors.address} />
                        </FormField>
                    </div>

                    {/* Default warehouse */}
                    <div className="col-md-6 mb-3">
                        <FormField>
                            <FormLabel>Default Warehouse</FormLabel>

                            <div className="form-check form-switch mt-2">
                                <input
                                    id="is_default"
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={data.is_default}
                                    disabled={processing}
                                    onChange={(event) => {
                                        setData(
                                            'is_default',
                                            event.target.checked,
                                        );

                                        clearErrors('is_default');
                                    }}
                                />

                                <label
                                    htmlFor="is_default"
                                    className="form-check-label"
                                >
                                    Use as main/default warehouse
                                </label>
                            </div>

                            <FormError error={errors.is_default} />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
