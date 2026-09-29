type EmployeeSuggestion = {
    id: number;
    employee_id: string | null;
    name: string;
};

export async function searchEmployees(
    query: string,
    signal?: AbortSignal,
): Promise<EmployeeSuggestion[]> {
    const params = new URLSearchParams();

    if (query.trim()) {
        params.set('keyword', query.trim());
    }

    const response = await fetch(`/get-employees?${params.toString()}`, {
        signal,

        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Unable to load employees.');
    }

    return response.json();
}
