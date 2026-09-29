import type {
    CustomerSuggestion,
    SalesReturnInvoiceSuggestion,
} from '@/types/sales';

// Search customers
export async function searchCustomers(
    query: string,
    signal?: AbortSignal,
): Promise<CustomerSuggestion[]> {
    const params =
        new URLSearchParams();

    params.set(
        'keyword',
        query,
    );

    const response =
        await fetch(
            `/operations/sales/customers?${params.toString()}`,
            {
                signal,

                headers: {
                    Accept:
                        'application/json',
                },
            },
        );

    if (!response.ok) {
        throw new Error(
            'Failed to search customers.',
        );
    }

    return response.json();
}

// Search returnable sales invoices
export async function searchReturnableInvoices(
    query: string,
    signal?: AbortSignal,
): Promise<
    SalesReturnInvoiceSuggestion[]
> {
    const params =
        new URLSearchParams();

    params.set(
        'keyword',
        query,
    );

    const response =
        await fetch(
            `/operations/sales/returns/create?${params.toString()}`,
            {
                signal,

                headers: {
                    Accept:
                        'application/json',
                },
            },
        );

    if (!response.ok) {
        throw new Error(
            'Failed to search returnable invoices.',
        );
    }

    return response.json();
}