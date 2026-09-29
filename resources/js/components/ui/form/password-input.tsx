import {
    type ChangeEvent,
    type InputHTMLAttributes,
    useState,
} from 'react';

import { cn } from '@/lib/utils';

type PasswordInputProps =
    Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'type'
    > & {
        error?: string;

        onGenerate?: (
            password: string,
        ) => void;

        showGenerate?: boolean;

        generatedPasswordLength?: number;
    };

function randomCharacter(
    characters: string,
) {
    const array =
        new Uint32Array(1);

    crypto.getRandomValues(
        array,
    );

    return characters[
        array[0] %
            characters.length
    ];
}

function generateStrongPassword(
    length = 14,
) {
    const uppercase =
        'ABCDEFGHJKLMNPQRSTUVWXYZ';

    const lowercase =
        'abcdefghijkmnopqrstuvwxyz';

    const numbers =
        '23456789';

    const symbols =
        '!@#$%^&*';

    const all =
        uppercase +
        lowercase +
        numbers +
        symbols;

    const password = [
        randomCharacter(
            uppercase,
        ),
        randomCharacter(
            lowercase,
        ),
        randomCharacter(
            numbers,
        ),
        randomCharacter(
            symbols,
        ),
    ];

    while (
        password.length <
        length
    ) {
        password.push(
            randomCharacter(
                all,
            ),
        );
    }

    /*
     * Shuffle generated password
     */

    for (
        let i =
            password.length -
            1;
        i > 0;
        i--
    ) {
        const random =
            new Uint32Array(
                1,
            );

        crypto.getRandomValues(
            random,
        );

        const j =
            random[0] %
            (i + 1);

        [
            password[i],
            password[j],
        ] = [
            password[j],
            password[i],
        ];
    }

    return password.join('');
}

export function PasswordInput({
    error,
    value,
    disabled,
    className,
    onChange,
    onGenerate,
    showGenerate = true,
    generatedPasswordLength = 14,
    ...props
}: PasswordInputProps) {
    const [
        visible,
        setVisible,
    ] = useState(false);

    function handleGenerate() {
        const password =
            generateStrongPassword(
                generatedPasswordLength,
            );

        onGenerate?.(
            password,
        );
    }

    return (
        <div className="input-group">
            <input
                {...props}
                type={
                    visible
                        ? 'text'
                        : 'password'
                }
                value={value}
                disabled={
                    disabled
                }
                onChange={
                    onChange
                }
                className={cn(
                    'form-control',

                    error &&
                        'is-invalid',

                    className,
                )}
                aria-invalid={
                    error
                        ? true
                        : undefined
                }
            />

            <button
                type="button"
                className="btn btn-outline-secondary"
                title={
                    visible
                        ? 'Hide password'
                        : 'Show password'
                }
                disabled={
                    disabled
                }
                onClick={() =>
                    setVisible(
                        (previous) =>
                            !previous,
                    )
                }
            >
                <i
                    className={cn(
                        'fa',

                        visible
                            ? 'fa-eye-slash'
                            : 'fa-eye',
                    )}
                />
            </button>

            {showGenerate && (
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={
                        disabled
                    }
                    onClick={
                        handleGenerate
                    }
                >
                    <i className="fa fa-refresh me-1" />

                    Generate
                </button>
            )}
        </div>
    );
}
