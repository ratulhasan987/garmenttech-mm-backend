import { type InputHTMLAttributes, useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import type { Instance } from 'flatpickr/dist/types/instance';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import { X } from 'react-feather';
import { cn } from '@/lib/utils';

type DatePickerMode = 'single' | 'range' | 'month';

type DatePickerProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'onChange' | 'min' | 'max'
> & {
    value?: string;
    error?: string;
    onChange?: (value: string) => void;
    minDate?: string;
    maxDate?: string;
    mode?: DatePickerMode;
    dateFormat?: string;
    displayFormat?: string;
    rangeSeparator?: string;
    allowInput?: boolean;
    enableTime?: boolean;
    time24hr?: boolean;
    showClearButton?: boolean;
};

export function DatePicker({
    value = '',
    error,
    onChange,
    minDate,
    maxDate,
    mode = 'single',
    dateFormat,
    displayFormat,
    rangeSeparator = ' to ',
    allowInput = true,
    enableTime = false,
    time24hr = false,
    showClearButton = false,
    disabled,
    className,
    ...props
}: DatePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const flatpickrRef = useRef<Instance | null>(null);
    const onChangeRef = useRef(onChange);

    const isMonthMode = mode === 'month';

    const resolvedDateFormat =
        dateFormat ??
        (isMonthMode ? 'Y-m' : enableTime ? 'Y-m-d H:i' : 'Y-m-d');

    const resolvedDisplayFormat =
        displayFormat ??
        (isMonthMode ? 'F Y' : enableTime ? 'd M, Y h:i K' : 'd M, Y');

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    /**
     * Initialize Flatpickr.
     */
    useEffect(() => {
        if (!inputRef.current) {
            return;
        }

        const instance = flatpickr(inputRef.current, {
            mode: isMonthMode ? 'single' : mode,

            dateFormat: resolvedDateFormat,

            altInput: true,

            enableTime: enableTime && !isMonthMode,

            time_24hr: time24hr,

            altFormat: resolvedDisplayFormat,

            locale: {
                rangeSeparator,
            },

            plugins: isMonthMode
                ? [
                      monthSelectPlugin({
                          shorthand: false,
                          dateFormat: resolvedDateFormat,
                          altFormat: resolvedDisplayFormat,
                      }),
                  ]
                : [],

            allowInput,

            defaultDate: value || undefined,

            minDate: minDate || undefined,

            maxDate: maxDate || undefined,

            onChange: (_selectedDates, dateString) => {
                onChangeRef.current?.(dateString);
            },

            onReady: (_selectedDates, _dateString, currentInstance) => {
                currentInstance.input.type = 'hidden';

                if (currentInstance.altInput) {
                    currentInstance.altInput.className = cn(
                        'form-control',
                        className,
                        error && 'is-invalid',
                    );

                    currentInstance.altInput.disabled = Boolean(disabled);
                }
            },
        });

        flatpickrRef.current = instance;

        instance.input.type = 'hidden';

        return () => {
            instance.destroy();
            flatpickrRef.current = null;
        };
    }, []);

    /**
     * Sync external value with Flatpickr.
     */
    useEffect(() => {
        const instance = flatpickrRef.current;

        if (!instance) {
            return;
        }

        if (!value) {
            instance.clear(false);
            return;
        }

        if (instance.input.value === value) {
            return;
        }

        instance.setDate(value, false, resolvedDateFormat);
    }, [value, resolvedDateFormat]);

    /**
     * Sync minimum date.
     */
    useEffect(() => {
        flatpickrRef.current?.set('minDate', minDate || undefined);
    }, [minDate]);

    /**
     * Sync maximum date.
     */
    useEffect(() => {
        flatpickrRef.current?.set('maxDate', maxDate || undefined);
    }, [maxDate]);

    /**
     * Sync disabled state.
     */
    useEffect(() => {
        const instance = flatpickrRef.current;

        if (!instance) {
            return;
        }

        instance.input.type = 'hidden';

        instance.input.disabled = Boolean(disabled);

        if (instance.altInput) {
            instance.altInput.disabled = Boolean(disabled);
        }
    }, [disabled]);

    /**
     * Sync validation state.
     */
    useEffect(() => {
        const instance = flatpickrRef.current;

        if (!instance) {
            return;
        }

        const visibleInput = instance.altInput ?? instance.input;

        visibleInput.classList.toggle('is-invalid', Boolean(error));

        visibleInput.setAttribute('aria-invalid', error ? 'true' : 'false');
    }, [error]);

    /**
     * Sync input classes.
     */
    useEffect(() => {
        const instance = flatpickrRef.current;

        if (!instance?.altInput) {
            return;
        }

        instance.altInput.className = cn(
            'form-control',
            className,
            error && 'is-invalid',
        );
    }, [className, error]);

    /**
     * Clear the selected date.
     */
    const handleClear = () => {
        const instance = flatpickrRef.current;

        if (!instance || disabled) {
            return;
        }

        // Clear Flatpickr without triggering its onChange.
        instance.clear(false);

        // Notify React/Inertia form.
        onChangeRef.current?.('');

        // Keep focus on the date input.
        requestAnimationFrame(() => {
            instance.altInput?.focus();
        });
    };

    /**
     * Show clear button whenever a value exists.
     */
    const showClear = !disabled && showClearButton && Boolean(value);

    return (
        <div className="position-relative">
            <input
                ref={inputRef}
                type="hidden"
                className={cn('form-control', className)}
                disabled={disabled}
                {...props}
            />

            {showClear && (
                <button
                    type="button"
                    aria-label="Clear date"
                    title="Clear date"
                    className="position-absolute top-50 translate-middle-y border-0 bg-secondary rounded-circle p-1 d-flex align-items-center justify-content-center"
                    style={{
                        right: error ? 30 : 8,
                        zIndex: 5,
                        width: 20,
                        height: 20,
                    }}
                    onMouseDown={(event) => {
                        event.preventDefault();
                    }}
                    onClick={handleClear}
                >
                    <X size={14} className="text-white" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
