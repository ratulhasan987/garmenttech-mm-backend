import { type FormEvent } from 'react';

import { useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

type CreateSalesTeamModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type SalesTeamForm = {
    code: string;
    name: string;
    status: 'active' | 'inactive';
    manager_id: string;
    description: string;
};

type Employee = {
    id: number;
    name: string;
    employee_id: string;
};

const searchEmployees = async (keyword: string): Promise<Employee[]> => {


    const response = await fetch(
        `/get-employees?keyword=${encodeURIComponent(keyword)}`,
        {
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        return [];
    }

    const result = await response.json();

    return Array.isArray(result) ? result : (result.data ?? []);
};

export default function CreateSalesTeamModal({
    open,
    onOpenChange,
}: CreateSalesTeamModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<SalesTeamForm>({
            code: '',
            name: '',
            status: 'active',
            manager_id: '',
            description: '',
        });


    const handleClose = () => {
        if (processing) {
            return;
        }

        reset();
        clearErrors();
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/sales-teams', {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);
            },
        });
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    handleClose();

                    return;
                }

                onOpenChange(nextOpen);
            }}
            title="Create New Sales Team"
            size="lg"
            busy={processing}
            centered
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        disabled={processing}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="create-sales-team-form"
                        disabled={processing}
                    >
                        {processing ? 'Creating...' : 'Create Team'}
                    </Button>
                </>
            }
        >
            <form id="create-sales-team-form" onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <FormField>
                            <FormLabel htmlFor="code" required>
                                Team Code
                            </FormLabel>

                            <Input
                                id="code"
                                name="code"
                                value={data.code}
                                placeholder="ST-001"
                                disabled={processing}
                                className={cn(errors.code && 'is-invalid')}
                                onChange={(event) =>
                                    setData('code', event.target.value)
                                }
                            />

                            <small className="text-muted">
                                Unique identifier for the team.
                            </small>

                            <FormError error={errors.code} />
                        </FormField>

                        <FormField>
                            <FormLabel htmlFor="name" required>
                                Team Name
                            </FormLabel>

                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="Enterprise Sales Team"
                                disabled={processing}
                                className={cn(errors.name && 'is-invalid')}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                            />

                            <FormError error={errors.name} />
                        </FormField>

                        <FormField>
                            <FormLabel htmlFor="status">Status</FormLabel>

                            <select
                                id="status"
                                name="status"
                                value={data.status}
                                disabled={processing}
                                className={cn(
                                    'form-select',
                                    errors.status && 'is-invalid',
                                )}
                                onChange={(event) =>
                                    setData(
                                        'status',
                                        event.target.value as
                                            'active' | 'inactive',
                                    )
                                }
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <FormError error={errors.status} />
                        </FormField>
                    </div>

                    <div className="col-md-6">
                        <FormField>
                            <FormLabel htmlFor="manager_search" required>
                                First Manager
                            </FormLabel>

                            <SuggestionSearchInput<Employee>
                                searchFn={searchEmployees}
                                idKey="id"
                                labelKey="name"
                                placeholder="Search manager by name or employee ID..."
                                showSearchIcon
                                clearOnFocus
                                onSelect={(employee) => {
                                    setData('manager_id', String(employee.id));
                                }}
                                onClear={() => {
                                    setData('manager_id', '');
                                }}
                            />

                            <FormError error={errors.manager_id} />
                        </FormField>

                        <FormField>
                            <FormLabel htmlFor="description">
                                Description
                            </FormLabel>

                            <textarea
                                id="description"
                                name="description"
                                rows={7}
                                value={data.description}
                                placeholder="Team responsibilities and objectives..."
                                disabled={processing}
                                className={cn(
                                    'form-control',
                                    errors.description && 'is-invalid',
                                )}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                            />

                            <FormError error={errors.description} />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
