import type {
    SalaryAdvanceEmployee,
} from '@/types/hr';

export async function searchEmployees(
    query: string,
    signal?: AbortSignal,
): Promise<SalaryAdvanceEmployee[]> {
    const params =
        new URLSearchParams();

    params.set(
        'keyword',
        query,
    );

    const response =
        await fetch(
            `/hr/salary-advance?${params.toString()}`,
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
            'Failed to search employees.',
        );
    }

    return response.json();
}