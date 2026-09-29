// resources/js/components/ui/form/suggestion-search-input.tsx

import {
    type KeyboardEvent,
    type ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    Loader,
    Search,
    X,
    type Icon,
} from 'react-feather';

import { cn } from '@/lib/utils';

export type SuggestionSearchClassNames = {
    root?: string;
    label?: string;
    input?: string;
    dropdown?: string;
    loadingWrapper?: string;
    spinner?: string;
    loadingText?: string;
    emptyText?: string;
    option?: string;
    optionLabel?: string;
    optionSecondaryLabel?: string;
    iconWrapper?: string;
    searchIcon?: string;
    clearIcon?: string;
};

export interface SuggestionSearchProps<
    T extends Record<string, unknown>,
> {
    label?: ReactNode;

    required?: boolean;

    placeholder?: string;

    /**
     * Async search function.
     *
     * Example:
     *
     * searchEmployees(query, signal)
     */
    searchFn: (
        query: string,
        signal?: AbortSignal,
    ) => Promise<T[]>;

    /**
     * Main field shown after selection.
     *
     * Example:
     *
     * "name"
     */
    labelKey: keyof T;

    /**
     * Secondary text shown in the default
     * option renderer.
     *
     * Example:
     *
     * "employee_id"
     */
    secondaryLabelKey?: keyof T;

    /**
     * Unique key for each result.
     *
     * Example:
     *
     * "id"
     */
    idKey: keyof T;

    className?: string;

    classNames?: SuggestionSearchClassNames;

    /**
     * Custom render-props option renderer.
     *
     * When supplied, the default label +
     * secondary label rendering is replaced.
     */
    renderOption?: (
        item: T,
    ) => ReactNode;

    /**
     * Called after selecting an option.
     */
    onSelect?: (
        item: T,
    ) => void;

    /**
     * Called when the search/selection
     * gets cleared.
     */
    onClear?: () => void;

    disabled?: boolean;

    /**
     * Initial visible input label.
     *
     * Useful for edit forms.
     */
    defaultValue?: string;

    /**
     * If true, focusing a field that already
     * has a value clears it and reloads the
     * initial suggestions.
     */
    clearOnFocus?: boolean;

    /**
     * Show icon before the input.
     */
    showSearchIcon?: boolean;

    /**
     * Custom react-feather search icon.
     */
    SearchIcon?: Icon;

    /**
     * Custom react-feather loading icon.
     */
    LoadingIcon?: Icon;

    /**
     * Custom react-feather clear icon.
     */
    ClearIcon?: Icon;

    /**
     * Laravel / Inertia validation error.
     */
    error?: string;

    /**
     * Search debounce delay.
     */
    debounceMs?: number;

    loadingLabel?: string;

    emptyLabel?: string;

    defaultSelectedItem?: T | null;
}

/**
 * Convert an object field into a displayable
 * string safely.
 */
function getStringValue<
    T extends Record<string, unknown>,
>(
    item: T,
    key: keyof T,
): string {
    const value =
        item[key];

    if (
        value === null ||
        value === undefined
    ) {
        return '';
    }

    return String(value);
}

export function SuggestionSearchInput<
    T extends Record<string, unknown>,
>({
    label,

    required = false,

    placeholder = 'Search...',

    searchFn,

    labelKey,

    secondaryLabelKey,

    idKey,

    className,

    classNames,

    renderOption,

    onSelect,

    onClear,

    disabled = false,

    defaultValue = '',

    clearOnFocus = false,

    showSearchIcon = true,

    SearchIcon = Search,

    LoadingIcon = Loader,

    ClearIcon = X,

    error,

    debounceMs = 300,

    loadingLabel = 'Searching...',

    emptyLabel = 'No results found.',
    defaultSelectedItem = null,

}: SuggestionSearchProps<T>) {
    /*
    |--------------------------------------------------------------------------
    | Refs
    |--------------------------------------------------------------------------
    */

    const rootRef =
        useRef<HTMLDivElement>(
            null,
        );

    const inputRef =
        useRef<HTMLInputElement>(
            null,
        );

    const debounceRef =
        useRef<
            ReturnType<
                typeof setTimeout
            > | undefined
        >(undefined);

    const abortRef =
        useRef<AbortController | null>(
            null,
        );

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [query, setQuery] = useState(() => {
        if (defaultSelectedItem) {
            return getStringValue(
                defaultSelectedItem,
                labelKey,
            );
        }

        return defaultValue;
    });

    const [
        results,
        setResults,
    ] = useState<T[]>(
        [],
    );

    const [selectedItem, setSelectedItem] =
        useState<T | null>(defaultSelectedItem);

    const [
        open,
        setOpen,
    ] = useState(
        false,
    );

    const [
        loading,
        setLoading,
    ] = useState(
        false,
    );

    const [
        highlightedIndex,
        setHighlightedIndex,
    ] = useState(
        -1,
    );

    /*
    |--------------------------------------------------------------------------
    | Sync default value
    |--------------------------------------------------------------------------
    |
    | Useful when an edit form receives the
    | selected item's label from Laravel.
    |
    */

    useEffect(() => {
        if (defaultSelectedItem) {
            setSelectedItem(defaultSelectedItem);

            setQuery(
                getStringValue(
                    defaultSelectedItem,
                    labelKey,
                ),
            );

            return;
        }

        setSelectedItem(null);
        setQuery(defaultValue);
    }, [
        defaultSelectedItem,
        defaultValue,
        labelKey,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const performSearch =
        useCallback(
            async (
                searchQuery: string,
            ) => {
                /*
                 * Cancel previous request.
                 */
                abortRef.current?.abort();

                const controller =
                    new AbortController();

                abortRef.current =
                    controller;

                setLoading(
                    true,
                );

                try {
                    const data =
                        await searchFn(
                            searchQuery,
                            controller.signal,
                        );

                    /*
                     * Ignore cancelled request.
                     */
                    if (
                        controller
                            .signal
                            .aborted
                    ) {
                        return;
                    }

                    setResults(
                        data,
                    );

                    setHighlightedIndex(
                        -1,
                    );

                    setOpen(
                        true,
                    );
                } catch (
                exception
                ) {
                    /*
                     * Abort is expected when another
                     * search replaces this request.
                     */
                    if (
                        controller
                            .signal
                            .aborted
                    ) {
                        return;
                    }

                    console.error(
                        'Suggestion search failed:',
                        exception,
                    );

                    setResults(
                        [],
                    );

                    setOpen(
                        true,
                    );
                } finally {
                    /*
                     * Only the latest request is allowed
                     * to control the loading state.
                     */
                    if (
                        abortRef.current ===
                        controller
                    ) {
                        setLoading(
                            false,
                        );
                    }
                }
            },
            [
                searchFn,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Debounced search
    |--------------------------------------------------------------------------
    */

    const scheduleSearch = (
        value: string,
    ) => {
        if (
            debounceRef.current
        ) {
            clearTimeout(
                debounceRef.current,
            );
        }

        /*
         * Immediately show loading state
         * while waiting for debounce.
         */
        setLoading(
            true,
        );

        debounceRef.current =
            setTimeout(
                () => {
                    void performSearch(
                        value.trim(),
                    );
                },
                debounceMs,
            );
    };

    /*
    |--------------------------------------------------------------------------
    | Input change
    |--------------------------------------------------------------------------
    */

    const handleInputChange = (
        value: string,
    ) => {
        /*
         * If the user changes text after
         * selecting an option, the previous
         * selected ID is no longer valid.
         */
        if (
            selectedItem
        ) {
            setSelectedItem(
                null,
            );

            onClear?.();
        }

        setQuery(
            value,
        );

        setOpen(
            true,
        );

        setHighlightedIndex(
            -1,
        );

        scheduleSearch(
            value,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Focus
    |--------------------------------------------------------------------------
    |
    | Empty search calls the endpoint with:
    |
    | keyword=
    |
    | Your Laravel endpoint can therefore
    | return the first 20 records.
    |
    */

    const handleFocus = () => {
        if (
            disabled
        ) {
            return;
        }

        setOpen(
            true,
        );

        /*
         * Same behavior as your old Blade
         * implementation.
         */
        if (
            clearOnFocus &&
            (
                selectedItem ||
                query
            )
        ) {
            setSelectedItem(
                null,
            );

            setQuery('');

            onClear?.();

            void performSearch(
                '',
            );

            return;
        }

        void performSearch(
            '',
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Select option
    |--------------------------------------------------------------------------
    */

    const handleSelect = (
        item: T,
    ) => {
        const selectedLabel =
            getStringValue(
                item,
                labelKey,
            );

        setSelectedItem(
            item,
        );

        /*
         * Show human-readable label
         * inside the search input.
         */
        setQuery(
            selectedLabel,
        );

        setOpen(
            false,
        );

        setHighlightedIndex(
            -1,
        );


        inputRef.current?.blur();
        onSelect?.(
            item,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Clear selection
    |--------------------------------------------------------------------------
    */

    const handleClear = () => {
        /*
         * Cancel running HTTP request.
         */
        abortRef.current?.abort();

        /*
         * Cancel pending debounce.
         */
        if (debounceRef.current) {
            clearTimeout(
                debounceRef.current,
            );
        }

        setSelectedItem(null);

        setQuery('');

        setResults([]);

        setHighlightedIndex(-1);

        onClear?.();

        /*
         * Keep dropdown open and immediately
         * load the initial suggestions.
         */
        setOpen(true);

        void performSearch('');

        /*
         * Keep focus on the input.
         */
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Keyboard navigation
    |--------------------------------------------------------------------------
    */

    const handleKeyDown = (
        event: KeyboardEvent<HTMLInputElement>,
    ) => {
        /*
         * Escape
         */
        if (
            event.key ===
            'Escape'
        ) {
            setOpen(
                false,
            );

            return;
        }

        if (
            !open ||
            !results.length
        ) {
            return;
        }

        /*
         * Arrow Down
         */
        if (
            event.key ===
            'ArrowDown'
        ) {
            event.preventDefault();

            setHighlightedIndex(
                (current) => {
                    if (
                        current >=
                        results.length -
                        1
                    ) {
                        return 0;
                    }

                    return (
                        current +
                        1
                    );
                },
            );

            return;
        }

        /*
         * Arrow Up
         */
        if (
            event.key ===
            'ArrowUp'
        ) {
            event.preventDefault();

            setHighlightedIndex(
                (current) => {
                    if (
                        current <=
                        0
                    ) {
                        return (
                            results.length -
                            1
                        );
                    }

                    return (
                        current -
                        1
                    );
                },
            );

            return;
        }

        /*
         * Enter
         */
        if (
            event.key ===
            'Enter' &&
            highlightedIndex >=
            0
        ) {
            event.preventDefault();

            const item =
                results[
                highlightedIndex
                ];

            if (
                item
            ) {
                handleSelect(
                    item,
                );
            }
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Click outside
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const handleClickOutside =
            (
                event: MouseEvent,
            ) => {
                if (
                    !rootRef.current
                ) {
                    return;
                }

                if (
                    rootRef.current.contains(
                        event.target as Node,
                    )
                ) {
                    return;
                }

                setOpen(
                    false,
                );
            };

        document.addEventListener(
            'mousedown',
            handleClickOutside,
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside,
            );
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Component cleanup
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        return () => {
            /*
             * Abort HTTP request.
             */
            abortRef.current?.abort();

            /*
             * Clear pending debounce.
             */
            if (
                debounceRef.current
            ) {
                clearTimeout(
                    debounceRef.current,
                );
            }
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Computed state
    |--------------------------------------------------------------------------
    */

    const showClear =
        !disabled &&
        query.length >
        0 && !clearOnFocus;

    return (
        <div
            ref={rootRef}
            className={cn(
                'position-relative',
                classNames?.root,
            )}
        >
            {/* Label */}

            {label && (
                <label
                    className={cn(
                        'form-label',
                        classNames?.label,
                    )}
                >
                    {label}

                    {required && (
                        <span className="text-danger ms-1">
                            *
                        </span>
                    )}
                </label>
            )}

            {/* Input wrapper */}

            <div className="position-relative">
                {/* Search icon */}

                {showSearchIcon && (
                    <span
                        className={cn(
                            'position-absolute top-50 translate-middle-y',
                            'd-flex align-items-center justify-content-center',
                            classNames?.iconWrapper,
                        )}
                        style={{
                            left: 12,
                            zIndex: 3,

                            pointerEvents:
                                'none',
                        }}
                    >
                        <SearchIcon
                            size={
                                16
                            }
                            className={cn(
                                'text-muted',
                                classNames?.searchIcon,
                            )}
                            aria-hidden="true"
                        />
                    </span>
                )}

                {/* Search input */}

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    disabled={
                        disabled
                    }
                    placeholder={
                        placeholder
                    }
                    autoComplete="off"
                    aria-invalid={
                        error
                            ? true
                            : undefined
                    }
                    aria-expanded={
                        open
                    }
                    aria-autocomplete="list"
                    className={cn(
                        'form-control',

                        showSearchIcon &&
                        'ps-5',

                        showClear &&
                        'pe-5',

                        error &&
                        'is-invalid',

                        className,

                        classNames?.input,
                    )}
                    onFocus={
                        handleFocus
                    }
                    onChange={(
                        event,
                    ) =>
                        handleInputChange(
                            event
                                .target
                                .value,
                        )
                    }
                    onKeyDown={
                        handleKeyDown
                    }
                />

                {/* Clear button */}

                {showClear && (
                    <button
                        type="button"
                        aria-label="Clear selection"
                        className={cn(
                            'position-absolute top-50 translate-middle-y',
                            'border-0 bg-transparent p-1',
                            'd-flex align-items-center justify-content-center',
                            classNames?.clearIcon,
                        )}
                        style={{
                            /*
                             * Bootstrap is-invalid has
                             * its own validation icon.
                             */
                            right: error
                                ? 30
                                : 10,

                            zIndex: 4,
                        }}
                        onMouseDown={(
                            event,
                        ) => {
                            /*
                             * Prevent input blur before
                             * the click executes.
                             */
                            event.preventDefault();
                        }}
                        onClick={
                            handleClear
                        }
                    >
                        <ClearIcon
                            size={
                                16
                            }
                            aria-hidden="true"
                        />
                    </button>
                )}
            </div>

            {/* Dropdown */}

            {open &&
                !disabled && (
                    <div

                        className={cn(
                            'dropdown-menu show w-100',

                            'position-absolute start-0',

                            'mt-1 p-0 overflow-auto',

                            classNames?.dropdown,
                        )}
                        style={{
                            maxHeight:
                                260,

                            zIndex:
                                2,
                        }}
                    >
                        {/* Loading */}

                        {loading && (
                            <div
                                className={cn(
                                    'd-flex align-items-center justify-content-center gap-2 p-3',
                                    classNames?.loadingWrapper,
                                )}
                            >
                                <LoadingIcon
                                    size={
                                        18
                                    }
                                    className={cn(
                                        'suggestion-search-spinner',
                                        classNames?.spinner,
                                    )}
                                    aria-hidden="true"
                                />

                                <span
                                    className={cn(
                                        'f-light',
                                        classNames?.loadingText,
                                    )}
                                >
                                    {
                                        loadingLabel
                                    }
                                </span>
                            </div>
                        )}

                        {/* Results */}

                        {!loading &&
                            results.map(
                                (
                                    item,
                                    index,
                                ) => {
                                    const id =
                                        getStringValue(
                                            item,
                                            idKey,
                                        );

                                    const optionLabel =
                                        getStringValue(
                                            item,
                                            labelKey,
                                        );

                                    const secondaryLabel =
                                        secondaryLabelKey
                                            ? getStringValue(
                                                item,
                                                secondaryLabelKey,
                                            )
                                            : '';

                                    const highlighted =
                                        index ===
                                        highlightedIndex;

                                    return (
                                        <button
                                            key={
                                                id
                                            }
                                            type="button"
                                            className={cn(
                                                'dropdown-item',

                                                'py-2 px-3',

                                                highlighted &&
                                                'active',

                                                classNames?.option,
                                            )}
                                            /*
                                             * MouseDown is used instead
                                             * of click so input blur does
                                             * not happen first.
                                             */
                                            onMouseDown={(
                                                event,
                                            ) => {
                                                event.preventDefault();

                                                handleSelect(
                                                    item,
                                                );
                                            }}
                                            onMouseEnter={() =>
                                                setHighlightedIndex(
                                                    index,
                                                )
                                            }
                                        >
                                            {renderOption ? (
                                                renderOption(
                                                    item,
                                                )
                                            ) : (
                                                <>
                                                    {/* Main label */}

                                                    <div
                                                        className={cn(
                                                            'f-w-500',
                                                            classNames?.optionLabel,
                                                        )}
                                                    >
                                                        {
                                                            optionLabel
                                                        }
                                                    </div>

                                                    {/* Secondary label */}

                                                    {secondaryLabel && (
                                                        <small
                                                            className={cn(
                                                                'f-light d-block',

                                                                classNames?.optionSecondaryLabel,
                                                            )}
                                                        >
                                                            {
                                                                secondaryLabel
                                                            }
                                                        </small>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    );
                                },
                            )}

                        {/* Empty */}

                        {!loading &&
                            results.length ===
                            0 && (
                                <div
                                    className={cn(
                                        'text-center f-light p-3',

                                        classNames?.emptyText,
                                    )}
                                >
                                    {
                                        emptyLabel
                                    }
                                </div>
                            )}
                    </div>
                )}
        </div>
    );
}
