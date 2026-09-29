import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, Trash } from 'react-feather';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import {
    FormError,
    FormField,
    FormHint,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { AppModal } from '@/components/ui/modal/app-modal';

type ApiKey = {
    id: number;
    last_four: string;
};

type AddKeyModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function AddKeyModal({ open, onOpenChange }: AddKeyModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({ key: '' });

    const close = () => {
        if (processing) {
            return;
        }

        reset();
        clearErrors();
        onOpenChange(false);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/settings/ai-config', {
            preserveScroll: true,
            onSuccess: close,
        });
    };

    return (
        <AppModal
            open={open}
            title="Add Groq API key"
            busy={processing}
            onOpenChange={(nextOpen) => {
                if (nextOpen) {
                    onOpenChange(true);
                } else {
                    close();
                }
            }}
        >
            <form onSubmit={submit} noValidate>
                <FormField>
                    <FormLabel htmlFor="groq-api-key" required>
                        API key
                    </FormLabel>
                    <Input
                        id="groq-api-key"
                        type="password"
                        autoComplete="off"
                        value={data.key}
                        error={errors.key}
                        disabled={processing}
                        autoFocus
                        onChange={(event) => setData('key', event.target.value)}
                    />
                    <FormHint>
                        The key will be encrypted and hidden after it is saved.
                    </FormHint>
                    <FormError error={errors.key} />
                </FormField>

                <div className="d-flex justify-content-end gap-2">
                    <Button
                        type="button"
                        appearance="outline"
                        disabled={processing}
                        onClick={close}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing || !data.key.trim()}
                    >
                        {processing ? 'Adding...' : 'Add key'}
                    </Button>
                </div>
            </form>
        </AppModal>
    );
}

export default function AiConfigIndex({ keys }: { keys: ApiKey[] }) {
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState<Record<number, string>>({});
    const [revealingKeyId, setRevealingKeyId] = useState<number | null>(null);
    const [revealError, setRevealError] = useState<string | null>(null);

    const toggleKeyVisibility = async (key: ApiKey) => {
        if (visibleKeys[key.id]) {
            setVisibleKeys((current) => {
                const next = { ...current };
                delete next[key.id];

                return next;
            });

            return;
        }

        setRevealError(null);
        setRevealingKeyId(key.id);

        try {
            const response = await fetch(
                `/settings/ai-config/${key.id}/reveal`,
                {
                    headers: { Accept: 'application/json' },
                    cache: 'no-store',
                },
            );

            if (!response.ok) {
                throw new Error('Unable to reveal the API key.');
            }

            const result = (await response.json()) as { key: string };
            setVisibleKeys((current) => ({
                ...current,
                [key.id]: result.key,
            }));
        } catch {
            setRevealError('Unable to reveal the API key.');
        } finally {
            setRevealingKeyId(null);
        }
    };

    const deleteKey = () => {
        if (!selectedKey) {
            return;
        }

        router.delete(`/settings/ai-config/${selectedKey.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setVisibleKeys((current) => {
                    const next = { ...current };
                    delete next[selectedKey.id];

                    return next;
                });
                setSelectedKey(null);
            },
        });
    };

    return (
        <>
           <Head title="AI Config" />
            <PageTitle title="AI Config" />
            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex align-items-center justify-content-between gap-3">
                            <h5 className="mb-0">Groq API keys</h5>
                            <Button
                                type="button"
                                onClick={() => setAddModalOpen(true)}
                            >
                                Add key
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {revealError && (
                            <div className="alert alert-danger" role="alert">
                                {revealError}
                            </div>
                        )}

                        {keys.length === 0 ? (
                            <p className="text-muted mb-0">
                                No API keys configured. Card parsing will be
                                unavailable.
                            </p>
                        ) : (
                            <ul className="list-group">
                                {keys.map((key) => {
                                    const visibleKey = visibleKeys[key.id];
                                    const isRevealing =
                                        revealingKeyId === key.id;

                                    return (
                                        <li
                                            key={key.id}
                                            className="list-group-item d-flex justify-content-between align-items-center gap-3"
                                        >
                                            <code className="text-break">
                                                {visibleKey ??
                                                    `********${key.last_four}`}
                                            </code>
                                            <div className="d-flex align-items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0"
                                                    title={
                                                        visibleKey
                                                            ? 'Hide key'
                                                            : 'Show key'
                                                    }
                                                    aria-label={
                                                        visibleKey
                                                            ? `Hide key ending in ${key.last_four}`
                                                            : `Show key ending in ${key.last_four}`
                                                    }
                                                    disabled={isRevealing}
                                                    onClick={() =>
                                                        void toggleKeyVisibility(
                                                            key,
                                                        )
                                                    }
                                                >
                                                    {visibleKey ? (
                                                        <EyeOff size={20} />
                                                    ) : (
                                                        <Eye size={20} />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-danger p-0"
                                                    title="Delete key"
                                                    aria-label={`Delete key ending in ${key.last_four}`}
                                                    onClick={() =>
                                                        setSelectedKey(key)
                                                    }
                                                >
                                                    <Trash size={20} />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </CardBody>
                </Card>
            </div>

            <AddKeyModal open={addModalOpen} onOpenChange={setAddModalOpen} />

            <DeleteConfirmModal
                open={selectedKey !== null}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setSelectedKey(null);
                    }
                }}
                processing={deleting}
                onConfirm={deleteKey}
            />
        </>
    );
}
