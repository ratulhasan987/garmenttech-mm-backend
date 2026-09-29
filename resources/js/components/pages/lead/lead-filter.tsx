import { Search } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/form/date-picker';
import { Select } from '@/components/ui/form/select';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { Filter } from 'react-feather';

type LeadSuggestion = {
    id: number;
    name: string;
    lead_code: string;
};

type EmployeeSuggestion = {
    id: number;
    name: string;
    employee_id?: string | null;
};

type SuggestionOption = {
    id: number;
    name: string;
};

async function searchEmployees(
    query: string,
    signal?: AbortSignal,
): Promise<EmployeeSuggestion[]> {
    const response = await fetch(
        `/get-employees?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search employees.');
    }

    return response.json();
}

async function searchSectors(
    query: string,
    signal?: AbortSignal,
): Promise<SuggestionOption[]> {
    const response = await fetch(
        `/get-lead-sectors?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search employees.');
    }

    return response.json();
}

async function searchAreas(
    query: string,
    signal?: AbortSignal,
): Promise<SuggestionOption[]> {
    const response = await fetch(
        `/get-lead-area?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search employees.');
    }

    return response.json();
}

async function searchSources(
    query: string,
    signal?: AbortSignal,
): Promise<SuggestionOption[]> {
    const response = await fetch(
        `/get-lead-sources?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search employees.');
    }

    return response.json();
}

async function searchDesignations(
    query: string,
    signal?: AbortSignal,
): Promise<SuggestionOption[]> {
    const response = await fetch(
        `/get-lead-designations?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search employees.');
    }

    return response.json();
}

async function searchProfessions(
    query: string,
    signal?: AbortSignal,
): Promise<SuggestionOption[]> {
    const response = await fetch(
        `/get-lead-professions?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search employees.');
    }

    return response.json();
}

async function searchProducts(
    query: string,
    signal?: AbortSignal,
): Promise<SuggestionOption[]> {
    const response = await fetch(
        `/get-products?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search employees.');
    }

    return response.json();
}

export type LeadFilterValues = {
    sector: SuggestionOption | null;
    area: SuggestionOption | null;
    source: string | null;
    stage: string | null;
    profession: SuggestionOption | null;
    designation: SuggestionOption | null;
    lead: LeadSuggestion | null;
    user: EmployeeSuggestion | null;
    product: SuggestionOption | null;
    sorting: 'asc' | 'desc' | '';
    dates: string;
    priority: string;
    interest: string;
};

export type LeadFilterStage = {
    id: number;
    name: string;
};

type LeadFilterProps = {
    values: LeadFilterValues;
    stages: LeadFilterStage[];
    sources: LeadFilterStage[];

    onChange: <K extends keyof LeadFilterValues>(
        key: K,
        value: LeadFilterValues[K],
    ) => void;

    onSubmit: () => void;
    onReset: () => void;
};

const titleCase = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

export default function LeadFilter({
    values,
    stages,
    sources,
    onChange,
    onSubmit,
    onReset,
}: LeadFilterProps) {
    const dropdownButtonRef = useRef<HTMLButtonElement>(null);

    const closeDropdown = () => {
        const button = dropdownButtonRef.current;

        if (!button) {
            return;
        }

        const bootstrap = (
            window as Window & {
                bootstrap?: {
                    Dropdown: {
                        getInstance: (
                            element: Element,
                        ) => { hide: () => void } | null;
                    };
                };
            }
        ).bootstrap;

        bootstrap?.Dropdown.getInstance(button)?.hide();
    };

    const handleSubmit = () => {
        onSubmit();
        closeDropdown();
    };

    const handleReset = () => {
        onReset();
        closeDropdown();
    };

    return (
        <div className="btn-group">
            <button
                ref={dropdownButtonRef}
                className="btn btn-primary dropdown-toggle no-arrow"
                type="button"
                data-bs-toggle="dropdown"
                data-bs-auto-close="false"
                aria-expanded="false"
            >
                <Filter size={16} />
            </button>

            <form
                className="dropdown-menu p-4 form-wrapper mt-3"
                onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}
                style={{
                    zIndex: 2,
                    width: '480px',
                    maxWidth: 'calc(100vw - 50px)',
                }}
            >
                <div className="row g-3">
                    <div className="col-md-6">
                        <SuggestionSearchInput<SuggestionOption>
                            searchFn={searchSectors}
                            idKey="id"
                            labelKey="name"
                            placeholder="Sector"
                            showSearchIcon={false}
                            clearOnFocus
                            defaultSelectedItem={values.sector}
                            onSelect={(sector) => {
                                onChange('sector', sector);
                            }}
                            onClear={() => {
                                onChange('sector', null);
                            }}
                            className="form-control-sm"
                        />
                    </div>
                    <div className="col-md-6">
                        <SuggestionSearchInput<SuggestionOption>
                            searchFn={searchAreas}
                            idKey="id"
                            labelKey="name"
                            placeholder="Area"
                            showSearchIcon={false}
                            clearOnFocus
                            defaultSelectedItem={values.area}
                            onSelect={(area) => {
                                onChange('area', area);
                            }}
                            onClear={() => {
                                onChange('area', null);
                            }}
                            className="form-control-sm"
                        />
                    </div>
                    <div className="col-6">
                        <Select
                            value={values?.source ?? ''}
                            onChange={(event) =>
                                onChange('source', event.target.value)
                            }
                            className="form-control-sm"
                        >
                            <option value="">Source</option>

                            {sources.map((source) => (
                                <option key={source.id} value={source.id}>
                                    {titleCase(source.name)}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="col-6">
                        <Select
                            value={values?.stage ?? ''}
                            onChange={(event) =>
                                onChange('stage', event.target.value)
                            }
                            className="form-control-sm"
                        >
                            <option value="">Stage</option>

                            {stages.map((stage) => (
                                <option key={stage.id} value={stage.id}>
                                    {titleCase(stage.name)}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="col-6">
                        <SuggestionSearchInput<SuggestionOption>
                            searchFn={searchProfessions}
                            idKey="id"
                            labelKey="name"
                            placeholder="Profession"
                            showSearchIcon={false}
                            clearOnFocus
                            defaultSelectedItem={values.profession}
                            onSelect={(area) => {
                                onChange('profession', area);
                            }}
                            onClear={() => {
                                onChange('profession', null);
                            }}
                            className="form-control-sm"
                        />
                    </div>

                    <div className="col-6">
                        <SuggestionSearchInput<SuggestionOption>
                            searchFn={searchDesignations}
                            idKey="id"
                            labelKey="name"
                            placeholder="Designation"
                            showSearchIcon={false}
                            clearOnFocus
                            defaultSelectedItem={values.designation}
                            onSelect={(area) => {
                                onChange('designation', area);
                            }}
                            onClear={() => {
                                onChange('designation', null);
                            }}
                            className="form-control-sm"
                        />
                    </div>

                    <div className="col-6">
                        <SuggestionSearchInput<EmployeeSuggestion>
                            searchFn={searchEmployees}
                            idKey="id"
                            labelKey="name"
                            placeholder="Person"
                            showSearchIcon={false}
                            clearOnFocus
                            defaultSelectedItem={values.user}
                            onSelect={(area) => {
                                onChange('user', area);
                            }}
                            onClear={() => {
                                onChange('user', null);
                            }}
                            className="form-control-sm"
                        />
                    </div>

                    <div className="col-6">
                        <SuggestionSearchInput<EmployeeSuggestion>
                            searchFn={searchProducts}
                            idKey="id"
                            labelKey="name"
                            placeholder="Product"
                            showSearchIcon={false}
                            clearOnFocus
                            defaultSelectedItem={values.product}
                            onSelect={(area) => {
                                onChange('product', area);
                            }}
                            onClear={() => {
                                onChange('product', null);
                            }}
                            className="form-control-sm"
                        />
                    </div>

                    <div className="col-6">
                        <Select
                            value={values?.interest ?? ''}
                            onChange={(event) =>
                                onChange('interest', event.target.value)
                            }
                            className="form-control-sm"
                        >
                            <option value="">Interest Level</option>
                            <option value="cold">Cold</option>
                            <option value="warm">Warm</option>
                            <option value="hot">Hot</option>
                        </Select>
                    </div>

                    <div className="col-6">
                        <Select
                            value={values?.priority ?? ''}
                            onChange={(event) =>
                                onChange('priority', event.target.value)
                            }
                            className="form-control-sm"
                        >
                            <option value="">Priority Level</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </Select>
                    </div>

                    <div className="col-6">
                        <DatePicker
                            className="w-100 form-control-sm"
                            value={values.dates}
                            onChange={(value) => onChange('dates', value)}
                            dateFormat="Y-m-d"
                            placeholder="Date Range"
                            allowInput
                            mode="range"
                        />
                    </div>

                    <div className="col-6">
                        <Select
                            value={values.sorting}
                            onChange={(event) =>
                                onChange(
                                    'sorting',
                                    event.target
                                        .value as LeadFilterValues['sorting'],
                                )
                            }
                            className="form-control-sm"
                        >
                            <option value="">Sort</option>

                            <option value="asc">Oldest First</option>

                            <option value="desc">Newest First</option>
                        </Select>
                    </div>

                    <div className="col-12 d-flex gap-2">
                        <Button
                            size="sm"
                            type="button"
                            variant="secondary"
                            appearance="outline"
                            onClick={handleReset}
                            className="flex-fill"
                        >
                            Reset
                        </Button>
                        <Button
                            size="sm"
                            type="submit"
                            leftIcon={<Search size={16} />}
                            className="flex-fill"
                        >
                            Filter
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
