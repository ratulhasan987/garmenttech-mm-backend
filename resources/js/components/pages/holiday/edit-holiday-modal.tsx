import { useState, useEffect, type FormEvent } from 'react';

import { useForm } from '@inertiajs/react';


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
import type { Holiday } from '@/types/holiday';
import { DatePicker } from '@/components/ui/form/date-picker';



const holidaySchema = z.object({
    id: z.string(),
    name: z
        .string()
        .min(1, 'Holiday name is required.')
        .max(255, 'Holiday name cannot exceed 255 characters.'),

    date: z
        .string()
        .min(1, 'Date is required.'),

    is_recurring: z.boolean(),
});

type HolidayFormData = z.input<typeof holidaySchema>;

type HolidayFormErrors = Partial<Record<keyof HolidayFormData, string>>;



type EditHolidayModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    holiday: Holiday | null;
};


export default function EditHolidayModal({
    open,
    onOpenChange,
    holiday,
}: EditHolidayModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<HolidayFormData>({
        id: '',
        name: '',
        date: '',
        is_recurring: false,
    });

    const [validationErrors, setValidationErrors] = useState<HolidayFormErrors>({});


    useEffect(() => {
        if (open && holiday) {
            // fetch(route('holiday.edit', holiday.id))
            fetch(`/holiday/${holiday.id}/edit`)
                .then((res) => res.json())
                .then((res) => {
                    setData({
                        id: String(res.id),
                        name: res.name,
                        date: res.date ? res.date.split('T')[0] : '',
                        is_recurring: res.is_recurring == 1,
                    });
                });
        }
    }, [open, holiday]);

    /*
    |--------------------------------------------------------------------------
    | Close
    |--------------------------------------------------------------------------
    */

    const handleClose = () => {
        if (processing) return;

        reset();
        clearErrors();
        setValidationErrors({});

        onOpenChange(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit - posts to holiday.update route
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = holidaySchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: HolidayFormErrors = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof HolidayFormData;

                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });

            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        // post(route('holiday.update'), {
        post('/holiday', {
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

    const formErrors: HolidayFormErrors = {
        ...validationErrors,
        ...errors,
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
            title="Update Holiday"
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
                        form="edit-holiday-form"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update Holiday'}
                    </Button>
                </>
            }
        >
            <form id="edit-holiday-form" onSubmit={handleSubmit}>
                {/* [Biztek] Hidden ID field - needed for update route */}
                <input type="hidden" name="id" value={data.id} />

                <div className="row">
                    {/* [Biztek] Holiday Name */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-name" required>
                                Holiday Name
                            </FormLabel>

                            <Input
                                type="text"
                                id="edit-name"
                                name="name"
                                value={data.name}
                                placeholder="Enter a name"
                                disabled={processing}
                                className={cn(formErrors.name && 'is-invalid')}
                                onChange={(event) => {
                                    setData('name', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>

                    {/* [Biztek] Is Recurring */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel>Is Recurring</FormLabel>

                            <div className="form-check form-switch mt-1">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="edit-is-recurring"
                                    checked={data.is_recurring}
                                    disabled={processing}
                                    onChange={(event) => {
                                        setData('is_recurring', event.target.checked);
                                    }}
                                />
                            </div>
                        </FormField>
                    </div>

                    {/* [Biztek] Date */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-date" required>
                                Date
                            </FormLabel>

                            <>
                                <style>{`.holiday-dp-wrap input:first-of-type{position:absolute!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;padding:0!important;margin:0!important;border:0!important;overflow:hidden!important}`}</style>
                                <div className="holiday-dp-wrap">
                                    <DatePicker
                                        value={data.date}
                                        error={formErrors.date}
                                        disabled={processing}
                                        allowInput={false}
                                        onChange={(dateString) => {
                                            setData('date', dateString);
                                        }}
                                    />
                                </div>
                            </>

                            <FormError error={formErrors.date} />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}