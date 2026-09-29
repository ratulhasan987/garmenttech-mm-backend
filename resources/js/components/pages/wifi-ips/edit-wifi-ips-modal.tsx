import { useForm } from '@inertiajs/react';
import type { SubmitEvent } from 'react';
import { useEffect, useState } from 'react';

import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';

import type { WifiIPAddress } from '@/types/wifi-ips';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const wifiIPSchema = z.object({
    id: z.number({
        message: 'WiFi IP ID is required.',
    }),

    ip_address: z
        .string()
        .trim()
        .min(1, 'IP address is required.')
        .refine(
            (value) => {
                const parts = value.split('.');

                if (parts.length !== 4) {
                    return false;
                }

                return parts.every((part) => {
                    if (!/^\d+$/.test(part)) {
                        return false;
                    }

                    const number = Number(part);

                    return number >= 0 && number <= 255;
                });
            },
            {
                message: 'Please enter a valid IPv4 address.',
            },
        ),
});

type WifiIPFormData = z.input<typeof wifiIPSchema>;

type WifiIPFormErrors = Partial<Record<keyof WifiIPFormData, string>>;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type EditWifiIPModalProps = {
    open: boolean;

    onOpenChange: (open: boolean) => void;

    wifiIP: WifiIPAddress | null;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function EditWifiIPModal({
    open,
    onOpenChange,
    wifiIP,
}: EditWifiIPModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<WifiIPFormData>({
            id: 0,
            ip_address: '',
        });

    const [validationErrors, setValidationErrors] = useState<WifiIPFormErrors>(
        {},
    );

    // Populate Edit Data

    useEffect(() => {
        if (!wifiIP || !open) {
            return;
        }

        setData({
            id: Number(wifiIP.id),

            ip_address: wifiIP.ip_address ?? '',
        });

        clearErrors();
        setValidationErrors({});
    }, [wifiIP, open]);

    /*
    |--------------------------------------------------------------------------
    | Close
    |--------------------------------------------------------------------------
    */

    const handleClose = () => {
        if (processing) {
            return;
        }

        reset();
        clearErrors();
        setValidationErrors({});

        onOpenChange(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!wifiIP) {
            return;
        }

        const result = wifiIPSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: WifiIPFormErrors = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof WifiIPFormData;

                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });

            setValidationErrors(fieldErrors);

            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/wifi-ips-update', {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});

                onOpenChange(false);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Errors
    |--------------------------------------------------------------------------
    */

    const formErrors: WifiIPFormErrors = {
        ...validationErrors,
        ...errors,
    };

    /*
    |--------------------------------------------------------------------------
    | No WiFi IP Selected
    |--------------------------------------------------------------------------
    */

    if (!wifiIP) {
        return null;
    }

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
            title="Edit WiFi IP Address"
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
                        form="edit-wifi-ip-form"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update IP Address'}
                    </Button>
                </>
            }
        >
            <form id="edit-wifi-ip-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* IP Address */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-wifi-ip-address" required>
                                IP Address
                            </FormLabel>

                            <Input
                                id="edit-wifi-ip-address"
                                name="ip_address"
                                value={data.ip_address}
                                placeholder="e.g. 192.168.1.100"
                                disabled={processing}
                                className={cn(
                                    formErrors.ip_address && 'is-invalid',
                                )}
                                onChange={(event) => {
                                    setData('ip_address', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.ip_address} />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
