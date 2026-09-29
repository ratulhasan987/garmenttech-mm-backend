import { router } from '@inertiajs/react';
import { useState } from 'react';

type QueryValue = string | number | boolean | null | undefined;

type FilterSerializer<Value> = (value: Value) => QueryValue;

type FilterSerializers<T extends Record<string, unknown>> = {
    [K in keyof T]?: FilterSerializer<T[K]>;
};

type UseFiltersOptions<T extends Record<string, unknown>> = {
    url?: string;
    serializers?: FilterSerializers<T>;
    resetValues?: T;
};

export function useFilters<T extends Record<string, unknown>>(
    initialFilters: T,
    options: UseFiltersOptions<T> = {},
) {
    const url = options.url ?? window.location.pathname;

    const serializers: FilterSerializers<T> = options.serializers ?? {};

    const [filters, setFilters] = useState<T>(initialFilters);

    const updateFilter = <K extends keyof T>(key: K, value: T[K]) => {
        setFilters((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const replaceFilters = (newFilters: T) => {
        setFilters(newFilters);
    };

    const buildQuery = (): Record<string, QueryValue> => {
        const query: Record<string, QueryValue> = {};

        for (const key of Object.keys(filters) as Array<keyof T>) {
            const value = filters[key];
            const serializer = serializers[key];

            const serializedValue = serializer
                ? serializer(value)
                : (value as QueryValue);

            if (
                serializedValue === null ||
                serializedValue === undefined ||
                serializedValue === ''
            ) {
                continue;
            }

            query[String(key)] = serializedValue;
        }

        return query;
    };

    const submit = () => {
        router.get(url, buildQuery(), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetState = () => {
        setFilters(options.resetValues ?? initialFilters);
    };

    const reset = () => {
        const resetValues = options.resetValues ?? initialFilters;

        setFilters(resetValues);

        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        filters,
        setFilters,
        updateFilter,
        replaceFilters,
        buildQuery,
        submit,
        resetState,
        reset,
    };
}

// import { router } from '@inertiajs/react';
// import { useState } from 'react';

// type QueryValue = string | number | boolean | null | undefined;

// type FilterSerializer<Value> = (value: Value) => QueryValue;

// type FilterSerializers<T extends Record<string, unknown>> = {
//     [K in keyof T]?: FilterSerializer<T[K]>;
// };

// type UseFiltersOptions<T extends Record<string, unknown>> = {
//     url?: string;
//     serializers?: FilterSerializers<T>;
// };

// export function useFilters<T extends Record<string, unknown>>(
//     initialFilters: T,
//     options: UseFiltersOptions<T> = {},
// ) {
//     const url = options.url ?? window.location.pathname;

//     const serializers: FilterSerializers<T> = options.serializers ?? {};

//     const [filters, setFilters] = useState<T>(initialFilters);

//     const updateFilter = <K extends keyof T>(key: K, value: T[K]) => {
//         setFilters((previous) => ({
//             ...previous,
//             [key]: value,
//         }));
//     };

//     const replaceFilters = (newFilters: T) => {
//         setFilters(newFilters);
//     };

//     const buildQuery = (): Record<string, QueryValue> => {
//         const query: Record<string, QueryValue> = {};

//         for (const key of Object.keys(filters) as Array<keyof T>) {
//             const value = filters[key];
//             const serializer = serializers[key];

//             const serializedValue = serializer
//                 ? serializer(value)
//                 : (value as QueryValue);

//             if (
//                 serializedValue === null ||
//                 serializedValue === undefined ||
//                 serializedValue === ''
//             ) {
//                 continue;
//             }

//             query[String(key)] = serializedValue;
//         }

//         return query;
//     };

//     const submit = () => {
//         router.get(url, buildQuery(), {
//             preserveState: true,
//             preserveScroll: true,
//             replace: true,
//         });
//     };

//     const resetState = () => {
//         setFilters(initialFilters);
//     };

//     const reset = () => {

//         setFilters(initialFilters);

//         router.get(
//             url,
//             {},
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 replace: true,
//             },
//         );
//     };

//     return {
//         filters,
//         setFilters,
//         updateFilter,
//         replaceFilters,
//         buildQuery,
//         submit,
//         resetState,
//         reset,
//     };
// }
