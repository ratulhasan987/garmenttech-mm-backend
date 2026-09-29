import {
    type FormEvent,
    useEffect,
} from 'react';

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

type SalesTeam = {
    id: number;
    code: string;
    name: string;
    status: 'active' | 'inactive';
    description: string | null;
};

type EditSalesTeamModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    team: SalesTeam | null;
};

type SalesTeamForm = {
    id: number;
    code: string;
    name: string;
    status: 'active' | 'inactive';
    description: string;
};

export default function EditSalesTeamModal({
    open,
    onOpenChange,
    team,
}: EditSalesTeamModalProps) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<SalesTeamForm>({
        id: 0,
        code: '',
        name: '',
        status: 'active',
        description: '',
    });

    useEffect(() => {
        if (!team || !open) {
            return;
        }

        setData({
            id: team.id,
            code: team.code ?? '',
            name: team.name ?? '',
            status: team.status ?? 'active',
            description: team.description ?? '',
        });

        clearErrors();
    }, [team, open, setData, clearErrors]);

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

        if (!team) {
            return;
        }

        put(`/sales-teams/${team.id}`, {
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
            title="Edit Sales Team"
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
                        form="edit-sales-team-form"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update Team'}
                    </Button>
                </>
            }
        >
            <form id="edit-sales-team-form" onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-sales-team-code" required>
                                Team Code
                            </FormLabel>

                            <Input
                                id="edit-sales-team-code"
                                name="code"
                                value={data.code}
                                placeholder="ST-001"
                                disabled={processing}
                                className={cn(errors.code && 'is-invalid')}
                                onChange={(event) =>
                                    setData('code', event.target.value)
                                }
                            />

                            <FormError error={errors.code} />
                        </FormField>

                        <FormField>
                            <FormLabel htmlFor="edit-sales-team-name" required>
                                Team Name
                            </FormLabel>

                            <Input
                                id="edit-sales-team-name"
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
                    </div>

                    <div className="col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-sales-team-status">
                                Status
                            </FormLabel>

                            <select
                                id="edit-sales-team-status"
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
                                            | 'active'
                                            | 'inactive',
                                    )
                                }
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <FormError error={errors.status} />
                        </FormField>

                        <FormField>
                            <FormLabel htmlFor="edit-sales-team-description">
                                Description
                            </FormLabel>

                            <textarea
                                id="edit-sales-team-description"
                                name="description"
                                rows={5}
                                value={data.description}
                                placeholder="Team responsibilities and objectives..."
                                disabled={processing}
                                className={cn(
                                    'form-control',
                                    errors.description && 'is-invalid',
                                )}
                                onChange={(event) =>
                                    setData(
                                        'description',
                                        event.target.value,
                                    )
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