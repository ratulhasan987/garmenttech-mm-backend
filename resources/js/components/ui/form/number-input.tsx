import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    type ChangeEvent,
    type FocusEvent,
} from 'react';

import {
    Input,
    type InputProps,
} from '@/components/ui/form/input';

export type NumberInputProps = Omit<
    InputProps,
    'type' | 'value' | 'defaultValue' | 'onChange'
> & {
    value?: number | null;

    onValueChange?: (
        value: number,
    ) => void;

    zeroAsEmpty?: boolean;
};

export const NumberInput =
    forwardRef<
        HTMLInputElement,
        NumberInputProps
    >(
        (
            {
                value = 0,
                onValueChange,
                zeroAsEmpty = true,
                onFocus,
                onBlur,
                ...props
            },
            ref,
        ) => {
            const inputRef =
                useRef<HTMLInputElement>(
                    null,
                );

            useImperativeHandle(
                ref,
                () =>
                    inputRef.current as HTMLInputElement,
            );

            /*
            |--------------------------------------------------------------------------
            | Display Value
            |--------------------------------------------------------------------------
            */

            const getDisplayValue = (
                currentValue:
                    | number
                    | null
                    | undefined,
            ): string => {
                if (
                    currentValue === null ||
                    currentValue ===
                        undefined
                ) {
                    return '';
                }

                if (
                    zeroAsEmpty &&
                    currentValue === 0
                ) {
                    return '0';
                }

                return String(
                    currentValue,
                );
            };

            /*
            |--------------------------------------------------------------------------
            | Internal Raw Value
            |--------------------------------------------------------------------------
            |
            | Keeps values like:
            |
            | 0.
            | 0.1
            | 10.
            | 10.50
            |
            */

            const [
                inputValue,
                setInputValue,
            ] = useState<string>(
                getDisplayValue(
                    value,
                ),
            );

            const [
                focused,
                setFocused,
            ] = useState(false);

            /*
            |--------------------------------------------------------------------------
            | Sync External Value
            |--------------------------------------------------------------------------
            |
            | Example:
            |
            | Product selected
            | -> purchase price changes externally
            | -> input updates automatically
            |
            */

            useEffect(() => {
                if (focused) {
                    return;
                }

                setInputValue(
                    getDisplayValue(
                        value,
                    ),
                );
            }, [
                value,
                focused,
                zeroAsEmpty,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Change
            |--------------------------------------------------------------------------
            */

            const handleChange = (
                event: ChangeEvent<HTMLInputElement>,
            ) => {
                const rawValue =
                    event.target.value;

                setInputValue(
                    rawValue,
                );

                if (
                    rawValue === ''
                ) {
                    onValueChange?.(
                        0,
                    );

                    return;
                }

                const parsedValue =
                    Number(
                        rawValue,
                    );

                if (
                    Number.isFinite(
                        parsedValue,
                    )
                ) {
                    onValueChange?.(
                        parsedValue,
                    );
                }
            };

            /*
            |--------------------------------------------------------------------------
            | Focus
            |--------------------------------------------------------------------------
            */

            const handleFocus = (
                event: FocusEvent<HTMLInputElement>,
            ) => {
                setFocused(
                    true,
                );

                onFocus?.(
                    event,
                );
            };

            /*
            |--------------------------------------------------------------------------
            | Blur
            |--------------------------------------------------------------------------
            */

            const handleBlur = (
                event: FocusEvent<HTMLInputElement>,
            ) => {
                setFocused(
                    false,
                );

                if (
                    inputValue === ''
                ) {
                    if (
                        !zeroAsEmpty
                    ) {
                        setInputValue(
                            '0',
                        );
                    }

                    onValueChange?.(
                        0,
                    );

                    onBlur?.(
                        event,
                    );

                    return;
                }

                const parsedValue =
                    Number(
                        inputValue,
                    );

                if (
                    Number.isFinite(
                        parsedValue,
                    )
                ) {
                    setInputValue(
                        getDisplayValue(
                            parsedValue,
                        ),
                    );

                    onValueChange?.(
                        parsedValue,
                    );
                }

                onBlur?.(
                    event,
                );
            };

            return (
                <Input
                    ref={inputRef}
                    {...props}
                    type="number"
                    value={inputValue}
                    onChange={
                        handleChange
                    }
                    onFocus={
                        handleFocus
                    }
                    onBlur={
                        handleBlur
                    }
                />
            );
        },
    );

NumberInput.displayName =
    'NumberInput';
