import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import { Button } from '@/components/ui/button';

import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Trash } from 'react-feather';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { FormField, FormLabel } from '@/components/ui/form/form-field';
import { AppModal } from '@/components/ui/modal/app-modal';
import { Pill } from '@/components/ui/badge';

type TeamMember = {
    user_id: number;
    role: 'manager' | 'team_member';
    user: {
        id: number;
        name: string;
        email: string;
        employee_id: string | null;
    };
};

type UserSuggestion = {
    id: number;
    name: string;
    employee_id: string | null;
};

type SalesTeam = {
    id: number;
    name: string;
    code: string;
    description: string;
    status: 'active' | 'inactive';
    members_count: number;
    created_at: string;
    updated_at: string;
};

type ManageSalesTeamMembersModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    team: SalesTeam | null;
};

export default function ManageSalesTeamMembersModal({
    open,
    onOpenChange,
    team,
}: ManageSalesTeamMembersModalProps) {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(
        null,
    );

    const [role, setRole] = useState<'manager' | 'team_member'>('team_member');

    const [loadingMembers, setLoadingMembers] = useState(false);
    const [addingMember, setAddingMember] = useState(false);
    const [removingMember, setRemovingMember] = useState(false);

    const [selectedMemberForDelete, setSelectedMemberForDelete] =
        useState<TeamMember | null>(null);

    const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
    const [error, setError] = useState('');
    const [searchKey, setSearchKey] = useState(0);

    const getCsrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '';

    const loadMembers = async () => {
        if (!team) {
            return;
        }

        try {
            setLoadingMembers(true);
            setError('');

            const response = await fetch(`/sales-teams/${team.id}/members`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load team members.');
            }

            const result: TeamMember[] = await response.json();

            setMembers(result);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Failed to load team members.',
            );
        } finally {
            setLoadingMembers(false);
        }
    };

    useEffect(() => {
        if (!open || !team) {
            return;
        }

        setSelectedUser(null);
        setRole('team_member');
        setError('');
        setSearchKey((current) => current + 1);

        void loadMembers();
    }, [open, team?.id]);

    const searchAvailableUsers = async (
        query: string,
        signal?: AbortSignal,
    ): Promise<UserSuggestion[]> => {
        if (!team) {
            return [];
        }

        const response = await fetch(
            `/get-available-users/${team.id}?keyword=${encodeURIComponent(
                query,
            )}`,
            {
                signal,
                headers: {
                    Accept: 'application/json',
                },
            },
        );

        if (!response.ok) {
            throw new Error('Failed to search available users.');
        }

        return response.json();
    };

    const handleAddMember = async () => {
        if (!team || !selectedUser || addingMember) {
            return;
        }

        try {
            setAddingMember(true);
            setError('');

            const response = await fetch(`/sales-teams/${team.id}/members`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    user_id: selectedUser.id,
                    role,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message ?? 'Failed to add team member.');
            }

            setSelectedUser(null);
            setRole('team_member');
            setSearchKey((current) => current + 1);

            await loadMembers();

            router.reload({
                only: ['data'],
            });
        } catch (addError) {
            setError(
                addError instanceof Error
                    ? addError.message
                    : 'Failed to add team member.',
            );
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveClick = (member: TeamMember) => {
        setSelectedMemberForDelete(member);
        setRemoveConfirmOpen(true);
    };

    const confirmRemoveMember = async () => {
        if (!team || !selectedMemberForDelete || removingMember) {
            return;
        }

        try {
            setRemovingMember(true);
            setError('');

            const response = await fetch(
                `/sales-teams/${team.id}/members/${selectedMemberForDelete.user_id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ?? 'Failed to remove team member.',
                );
            }

            setRemoveConfirmOpen(false);
            setSelectedMemberForDelete(null);

            await loadMembers();

            router.reload({
                only: ['data'],
            });
        } catch (removeError) {
            setError(
                removeError instanceof Error
                    ? removeError.message
                    : 'Failed to remove team member.',
            );
        } finally {
            setRemovingMember(false);
        }
    };

    return (
        <>
            <AppModal
                open={open}
                onOpenChange={onOpenChange}
                title={`Manage Team: ${team?.name ?? ''}`}
                size="xl"
                busy={addingMember || loadingMembers}
                footer={
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        disabled={addingMember || removingMember}
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                }
                classNames={{
                    title: 'fw-semibold',
                }}
            >
                <div className="row align-items-center g-3">
                    <div className="col-md-6">
                        <FormField>
                            <FormLabel>Search Employee</FormLabel>

                            <SuggestionSearchInput<UserSuggestion>
                                key={searchKey}
                                searchFn={searchAvailableUsers}
                                idKey="id"
                                labelKey="name"
                                placeholder="Type name or employee ID..."
                                showSearchIcon
                                clearOnFocus
                                onSelect={(user) => {
                                    setSelectedUser(user);
                                }}
                                onClear={() => {
                                    setSelectedUser(null);
                                }}
                            />
                        </FormField>
                    </div>

                    <div className="col-md-3">
                        <FormField>
                            <FormLabel htmlFor="member-role">Role</FormLabel>

                            <select
                                id="member-role"
                                value={role}
                                disabled={addingMember}
                                className="form-select"
                                onChange={(event) =>
                                    setRole(
                                        event.target.value as
                                            'manager' | 'team_member',
                                    )
                                }
                            >
                                <option value="team_member">Team Member</option>

                                <option value="manager">Manager</option>
                            </select>
                        </FormField>
                    </div>

                    <div className="col-md-3">
                        <Button
                            className="mt-2"
                            type="button"
                            variant="success"
                            disabled={!selectedUser || addingMember}
                            onClick={handleAddMember}
                        >
                            {addingMember ? 'Adding...' : 'Add Member'}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger mt-3 mb-0">{error}</div>
                )}

                <hr />

                <h6 className="mb-3">Current Team Members</h6>

                <div className="list-group list-group-flush border rounded">
                    {loadingMembers ? (
                        <div className="list-group-item text-muted">
                            Loading members...
                        </div>
                    ) : members.length === 0 ? (
                        <div className="list-group-item text-muted">
                            No members added yet.
                        </div>
                    ) : (
                        members.map((member) => (
                            <div
                                key={member.user_id}
                                className="list-group-item d-flex align-items-center justify-content-between gap-3"
                            >
                                <div className="d-flex align-items-start gap-3">
                                    <div>
                                        <div className="fw-semibold">
                                            {member.user.name}
                                        </div>

                                        <small className="text-muted">
                                            {member.user.employee_id ||
                                                member.user.email}
                                        </small>
                                    </div>
                                    <Pill
                                        className="text-capitalize"
                                        variant={
                                            member.role === 'manager'
                                                ? 'primary'
                                                : 'info'
                                        }
                                    >
                                        {member.role.replace('_', ' ')}
                                    </Pill>
                                </div>

                                <div className="">
                                    <button
                                        type="button"
                                        title="Remove Member"
                                        disabled={removingMember}
                                        className="btn btn-link text-danger p-0 border-0"
                                        onClick={() =>
                                            handleRemoveClick(member)
                                        }
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </AppModal>

            <DeleteConfirmModal
                open={removeConfirmOpen}
                onOpenChange={(nextOpen) => {
                    if (removingMember) {
                        return;
                    }

                    setRemoveConfirmOpen(nextOpen);

                    if (!nextOpen) {
                        setSelectedMemberForDelete(null);
                    }
                }}
                processing={removingMember}
                onConfirm={confirmRemoveMember}
            />
        </>
    );
}
