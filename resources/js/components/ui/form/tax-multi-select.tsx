import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    ChevronDown,
    X,
} from 'react-feather';

export type TaxOption = {
    id: number;

    name: string;

    rate:
        | number
        | string;
};

type TaxMultiSelectProps = {
    taxes: TaxOption[];

    value: number[];

    placeholder?: string;

    disabled?: boolean;

    error?: string;

    onChange: (
        value: number[],
    ) => void;
};

export function TaxMultiSelect({
    taxes,
    value,
    placeholder = 'Select taxes',
    disabled = false,
    error,
    onChange,
}: TaxMultiSelectProps) {
    const [
        open,
        setOpen,
    ] =
        useState(false);

    const wrapperRef =
        useRef<HTMLDivElement>(
            null,
        );

    /*
    |--------------------------------------------------------------------------
    | Selected Taxes
    |--------------------------------------------------------------------------
    */

    const selectedTaxes =
        useMemo(
            () => {
                const ids =
                    new Set(
                        value.map(
                            Number,
                        ),
                    );

                return taxes.filter(
                    (tax) =>
                        ids.has(
                            tax.id,
                        ),
                );
            },
            [
                taxes,
                value,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Outside Click
    |--------------------------------------------------------------------------
    */

    useEffect(
        () => {
            const handleClick =
                (
                    event:
                        MouseEvent,
                ) => {
                    if (
                        wrapperRef.current &&
                        !wrapperRef.current.contains(
                            event.target as Node,
                        )
                    ) {
                        setOpen(
                            false,
                        );
                    }
                };

            document.addEventListener(
                'mousedown',
                handleClick,
            );

            return () => {
                document.removeEventListener(
                    'mousedown',
                    handleClick,
                );
            };
        },
        [],
    );

    /*
    |--------------------------------------------------------------------------
    | Toggle
    |--------------------------------------------------------------------------
    */

    const toggleTax =
        (
            id: number,
        ) => {
            if (
                value.includes(
                    id,
                )
            ) {
                onChange(
                    value.filter(
                        (valueId) =>
                            valueId !==
                            id,
                    ),
                );

                return;
            }

            onChange([
                ...value,
                id,
            ]);
        };

    /*
    |--------------------------------------------------------------------------
    | Remove
    |--------------------------------------------------------------------------
    */

    const removeTax =
        (
            id: number,
        ) => {
            onChange(
                value.filter(
                    (valueId) =>
                        valueId !==
                        id,
                ),
            );
        };

    return (
        <div
            ref={
                wrapperRef
            }
            className="position-relative"
        >
            <button
                type="button"
                disabled={
                    disabled
                }
                className={[
                    'form-control',
                    'd-flex',
                    'align-items-center',
                    'justify-content-between',
                    'gap-2',
                    'text-start',
                    error
                        ? 'is-invalid'
                        : '',
                ]
                    .filter(
                        Boolean,
                    )
                    .join(
                        ' ',
                    )}
                style={{
                    minHeight:
                        '38px',
                }}
                onClick={() =>
                    setOpen(
                        (current) =>
                            !current,
                    )
                }
            >
                <div className="d-flex flex-wrap gap-1 flex-grow-1">
                    {selectedTaxes.length >
                    0 ? (
                        selectedTaxes.map(
                            (
                                tax,
                            ) => (
                                <span
                                    key={
                                        tax.id
                                    }
                                    className="badge bg-body-secondary text-body border d-inline-flex align-items-center gap-1"
                                >
                                    {tax.name}{' '}
                                    (
                                    {Number(
                                        tax.rate,
                                    )}
                                    %)

                                    <span
                                        role="button"
                                        tabIndex={
                                            0
                                        }
                                        onClick={(
                                            event,
                                        ) => {
                                            event.stopPropagation();

                                            removeTax(
                                                tax.id,
                                            );
                                        }}
                                    >
                                        <X
                                            size={
                                                12
                                            }
                                        />
                                    </span>
                                </span>
                            ),
                        )
                    ) : (
                        <span className="text-muted">
                            {
                                placeholder
                            }
                        </span>
                    )}
                </div>

                <ChevronDown
                    size={
                        16
                    }
                />
            </button>

            {open &&
                !disabled && (
                    <div
                        className="position-absolute start-0 end-0 mt-1 bg-body border rounded shadow-sm p-2"
                        style={{
                            zIndex:
                                1050,

                            maxHeight:
                                '260px',

                            overflowY:
                                'auto',
                        }}
                    >
                        {taxes.length >
                        0 ? (
                            taxes.map(
                                (
                                    tax,
                                ) => {
                                    const checked =
                                        value.includes(
                                            tax.id,
                                        );

                                    return (
                                        <label
                                            key={
                                                tax.id
                                            }
                                            className="d-flex align-items-center gap-2 px-2 py-2 rounded"
                                            style={{
                                                cursor:
                                                    'pointer',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="form-check-input mt-0"
                                                checked={
                                                    checked
                                                }
                                                onChange={() =>
                                                    toggleTax(
                                                        tax.id,
                                                    )
                                                }
                                            />

                                            <span className="flex-grow-1">
                                                {
                                                    tax.name
                                                }
                                            </span>

                                            <small className="text-muted">
                                                {Number(
                                                    tax.rate,
                                                )}
                                                %
                                            </small>
                                        </label>
                                    );
                                },
                            )
                        ) : (
                            <div className="text-muted text-center py-3">
                                No taxes
                                available.
                            </div>
                        )}
                    </div>
                )}

            {error && (
                <div className="invalid-feedback d-block">
                    {
                        error
                    }
                </div>
            )}
        </div>
    );
}