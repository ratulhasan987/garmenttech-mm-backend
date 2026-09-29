// [Biztek] NEW FILE - Create modal (follows CreateInterestModal pattern)
import { useState, type FormEvent } from 'react';


import { useForm } from '@inertiajs/react';


// import { useForm } from '@inertiajs/react';

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
import { DatePicker } from '@/components/ui/form/date-picker';

/*
|--------------------------------------------------------------------------
| Validation - matches Realbiz: name required, date required & unique, is_recurring optional
|--------------------------------------------------------------------------
*/

const holidaySchema = z.object({
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

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type CreateHolidayModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateHolidayModal({
    open,
    onOpenChange,
}: CreateHolidayModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<HolidayFormData>({
        name: '',
        date: '',
        is_recurring: false,
    });

    const [validationErrors, setValidationErrors] = useState<HolidayFormErrors>({});

    /*
    |--------------------------------------------------------------------------
    | Close - reset everything when modal closes
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
    | Submit - validate with zod first, then post to holiday.store route
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // [Biztek] Client-side validation before sending to server
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

        post('/holiday-store', {
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
    | Merge client-side validation errors + server-side errors
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
            title="Add New Holiday"
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
                        form="create-holiday-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save Holiday'}
                    </Button>
                </>
            }
        >
            <form id="create-holiday-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* [Biztek] Holiday Name - replaces Realbiz blade input */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="name" required>
                                Holiday Name
                            </FormLabel>

                            <Input
                                type="text"
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="Enter a Holiday Name"
                                disabled={processing}
                                className={cn(formErrors.name && 'is-invalid')}
                                onChange={(event) => {
                                    setData('name', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>

                    {/* [Biztek] Is Recurring - replaces Realbiz blade form-switch */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel>Is Recurring</FormLabel>

                            <div className="form-check form-switch mt-1">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="create-is-recurring"
                                    checked={data.is_recurring}
                                    disabled={processing}
                                    onChange={(event) => {
                                        setData('is_recurring', event.target.checked);
                                    }}
                                />
                            </div>
                        </FormField>


                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel required>
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