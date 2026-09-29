// resources/js/components/ui/form/textarea.tsx

import {
    forwardRef,
    type TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

type TextareaAppearance =
    | 'default'
    | 'flat'
    | 'pill'
    | 'raised';

export type TextareaProps =
    TextareaHTMLAttributes<HTMLTextAreaElement> & {
        error?: string;

        appearance?: TextareaAppearance;
    };

function getAppearanceClass(
    appearance: TextareaAppearance,
) {
    switch (appearance) {
        case 'flat':
            return 'btn-square';

        case 'pill':
            return 'btn-pill';

        case 'raised':
            return 'input-air-primary';

        default:
            return undefined;
    }
}

export const Textarea =
    forwardRef<
        HTMLTextAreaElement,
        TextareaProps
    >(
        (
            {
                error,
                appearance = 'default',
                className,
                ...props
            },
            ref,
        ) => {
            return (
                <textarea
                    ref={ref}
                    className={cn(
                        'form-control',

                        getAppearanceClass(
                            appearance,
                        ),

                        error &&
                            'is-invalid',

                        className,
                    )}
                    aria-invalid={
                        error
                            ? true
                            : undefined
                    }
                    {...props}
                />
            );
        },
    );

Textarea.displayName =
    'Textarea';
