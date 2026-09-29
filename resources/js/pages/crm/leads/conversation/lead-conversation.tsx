import { FormEvent, useMemo, useState } from 'react';

import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    Flag,
    Info,
    MessageSquare,
    Phone,
    PhoneCall,
    PlusCircle,
    Thermometer,
    User,
    XCircle,
    Edit,
} from 'react-feather';
import { ArrowLeftRight, CalendarCheck } from 'lucide-react';
import PageTitle from '@/components/page-title';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Select } from '@/components/ui/form/select';
import { Textarea } from '@/components/ui/form/textarea';
import { DatePicker } from '@/components/ui/form/date-picker';
import EditLeadModal from './edit-lead-modal';

type Option = {
    id: number;
    name: string;
    color?: string | null;
};

type Conversation = {
    id: number;
    channel: string;
    message: string;
    created_at: string;
    next_follow_up_at?: string | null;
    outcome?: string | null;
    call_duration?: number | null;
    call_direction?: string | null;
    priority?: 'low' | 'medium' | 'high' | null;
    interest_level?: 'cold' | 'warm' | 'hot' | null;
    lost_reason?: string | null;
    user?: {
        id: number;
        name: string;
    } | null;
};

type Lead = {
    id: number;
    lead_code: string;
    name: string;
    company_name?: string | null;

    phone: string;
    phone_secondary?: string | null;
    phone_foreign?: string | null;
    email?: string | null;

    area_id?: number | null;
    sector_id?: number | null;
    profession_id?: number | null;
    designation_id?: number | null;
    source_id?: number | null;
    stage_id?: number | null;

    assigned_to?: number | null;

    priority?: 'low' | 'medium' | 'high' | null;
    interest_level?: 'cold' | 'warm' | 'hot' | null;

    last_contacted_at?: string | null;
    next_follow_up_at?: string | null;

    remarks?: string | null;

    is_converted: boolean;
    converted_at?: string | null;
    customer_id?: number | null;

    address?: string | null;

    created_by?: number | null;
    updated_by?: number | null;

    created_at: string;
    updated_at: string;

    profession?: {
        id: number;
        name: string;
    } | null;

    designation?: {
        id: number;
        name: string;
    } | null;

    area?: {
        id: number;
        name: string;
    } | null;

    sector?: {
        id: number;
        name: string;
    } | null;

    lead_stage?: {
        id: number;
        name: string;
        color: string;
    } | null;

    lead_source?: {
        id: number;
        name: string;
    } | null;

    assigned_user?: {
        id: number;
        name: string;
    } | null;

    lead_conversations?: Conversation[];
};

type Props = {
    lead: Lead;
    sources: Option[];
    stages: Option[];
    sectors: Option[];
    areas: Option[];
    professions: Option[];
    designations: Option[];
};

const CHANNELS = ['call', 'whatsapp', 'email', 'sms', 'meeting', 'note'];

const getTomorrowDateTime = () => {
    const date = new Date();

    date.setDate(date.getDate() + 1);
    date.setHours(11, 0, 0, 0);

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
};

const formatLabel = (value?: string | null) =>
    value
        ? value
              .replaceAll('_', ' ')
              .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : '-';

const formatDateTime = (value?: string | null) => {
    if (!value) return '';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(value));
};

const badgeClass = (
    value?: string | null,
    type?: 'priority' | 'interest' | 'outcome',
) => {
    if (type === 'priority') {
        return value === 'high'
            ? 'bg-danger'
            : value === 'medium'
              ? 'bg-warning text-dark'
              : 'bg-secondary';
    }

    if (type === 'interest') {
        return value === 'hot'
            ? 'bg-danger'
            : value === 'warm'
              ? 'bg-warning text-dark'
              : 'bg-secondary';
    }

    if (type === 'outcome') {
        return value === 'lost'
            ? 'bg-danger'
            : value === 'converted'
              ? 'bg-success'
              : 'bg-primary';
    }

    return 'bg-secondary';
};

export default function LeadConversation({ lead, stages }: Props) {
    const phoneNumbers = [
        {
            label: 'Primary',
            number: lead.phone,
        },
        {
            label: 'Secondary',
            number: lead.phone_secondary,
        },
        {
            label: 'Foreign',
            number: lead.phone_foreign,
        },
    ].filter((phone): phone is { label: string; number: string } =>
        Boolean(phone.number),
    );

    const [editModalOpen, setEditModalOpen] = useState(false);

    const [requiresFollowUp, setRequiresFollowUp] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            channel: '',
            call_direction: '',
            call_duration: '',
            message: '',
            requires_follow_up: false,
            next_follow_up_at: getTomorrowDateTime(),
            stage: lead.stage_id?.toString() ?? '',
            priority: lead.priority ?? 'medium',
            interest_level: lead.interest_level ?? 'cold',
        });

    const conversations = useMemo(
        () =>
            [...(lead.lead_conversations ?? [])].sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
            ),
        [lead.lead_conversations],
    );

    const isCall = data.channel === 'call';

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (requiresFollowUp && !data.next_follow_up_at) {
            return;
        }

        post(`/lead-conversation/${lead.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset(
                    'channel',
                    'call_direction',
                    'call_duration',
                    'message',
                    'requires_follow_up',
                    'next_follow_up_at',
                );

                setRequiresFollowUp(false);
            },
        });
    };

    const openLeadEditPage = () => {
        router.visit(`/lead/${lead.id}/edit`);
    };

    const now = new Date();
    const minDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return (
        <>
            <Head title={`Conversation - ${lead.name}`} />

            <PageTitle title="Lead Conversation" />

            <div className="container-fluid">
                <div className="row g-4">
                    <div
                        className={
                            lead?.is_converted ? 'col-lg-12' : 'col-lg-8'
                        }
                    >
                        <div
                            className="card mb-4"
                            style={{
                                background:
                                    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            }}
                        >
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                                    <div>
                                        <h2 className="h3 fw-bold mb-0">
                                            {lead.name}
                                        </h2>

                                        <h5 className="h5 mb-2 text-dark">
                                            {lead.company_name}
                                        </h5>

                                        <div className="d-flex flex-wrap gap-3">
                                            <div className="d-flex align-items-center text-muted">
                                                <User
                                                    size={16}
                                                    className="me-2"
                                                />
                                                Assigned to:{' '}
                                                {lead.assigned_user?.name ??
                                                    '-'}
                                            </div>

                                            <div className="d-flex align-items-center text-muted">
                                                <Info
                                                    size={16}
                                                    className="me-2"
                                                />
                                                Source:{' '}
                                                {formatLabel(
                                                    lead.lead_source?.name,
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2">
                                        {lead.lead_stage && (
                                            <span
                                                className="badge text-white"
                                                style={{
                                                    backgroundColor:
                                                        lead.lead_stage.color ??
                                                        '#6c757d',
                                                }}
                                            >
                                                {formatLabel(
                                                    lead.lead_stage.name,
                                                )}
                                            </span>
                                        )}

                                        {lead.priority && (
                                            <span
                                                className={`badge ${badgeClass(
                                                    lead.priority,
                                                    'priority',
                                                )}`}
                                            >
                                                {formatLabel(lead.priority)}
                                            </span>
                                        )}

                                        {lead.interest_level && (
                                            <span
                                                className={`badge ${badgeClass(
                                                    lead.interest_level,
                                                    'interest',
                                                )}`}
                                            >
                                                {formatLabel(
                                                    lead.interest_level,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header bg-white py-3">
                                <div className="d-flex justify-content-between align-items-center gap-2">
                                    <h5 className="mb-0 fw-semibold">
                                        <Clock size={18} className="me-2" />
                                        Conversation History
                                    </h5>

                                    {!lead?.is_converted && (
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm px-3"
                                            onClick={() =>
                                                setEditModalOpen(true)
                                            }
                                            title="Edit Lead"
                                        >
                                            <Edit size={24} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div
                                className="card-body"
                                style={{
                                    maxHeight: 600,
                                    overflowY: 'auto',
                                }}
                            >
                                {conversations.length > 0 ? (
                                    <div className="position-relative ps-4">
                                        {conversations.map(
                                            (conversation, index) => (
                                                <div
                                                    key={conversation.id}
                                                    className="position-relative mb-3"
                                                >
                                                    <span
                                                        className="position-absolute bg-primary rounded-circle"
                                                        style={{
                                                            width: 12,
                                                            height: 12,
                                                            left: -22,
                                                            top: 12,
                                                        }}
                                                    />

                                                    {index !==
                                                        conversations.length -
                                                            1 && (
                                                        <span
                                                            className="position-absolute bg-light border"
                                                            style={{
                                                                width: 2,
                                                                height: 'calc(100% + 12px)',
                                                                left: -17,
                                                                top: 24,
                                                            }}
                                                        />
                                                    )}

                                                    <div className="card border conversation-card">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-center gap-2 mb-2 flex-wrap">
                                                                <div>
                                                                    <span className="fw-medium">
                                                                        {conversation
                                                                            .user
                                                                            ?.name ??
                                                                            'Unknown user'}
                                                                    </span>
                                                                    <span className="badge bg-light text-dark ms-2">
                                                                        {formatLabel(
                                                                            conversation.channel,
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                <small className="text-muted">
                                                                    {formatDateTime(
                                                                        conversation.created_at,
                                                                    )}
                                                                </small>
                                                            </div>

                                                            <p className="mb-3">
                                                                {
                                                                    conversation.message
                                                                }
                                                            </p>

                                                            <div className="d-flex flex-wrap gap-2">
                                                                {conversation.next_follow_up_at && (
                                                                    <span className="badge bg-info">
                                                                        <CalendarCheck
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="me-1"
                                                                        />
                                                                        Follow-up:{' '}
                                                                        {formatDateTime(
                                                                            conversation.next_follow_up_at,
                                                                        )}
                                                                    </span>
                                                                )}

                                                                {conversation.outcome && (
                                                                    <span
                                                                        className={`badge ${badgeClass(
                                                                            conversation.outcome,
                                                                            'outcome',
                                                                        )}`}
                                                                    >
                                                                        {conversation.outcome ===
                                                                        'lost' ? (
                                                                            <XCircle
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className="me-1"
                                                                            />
                                                                        ) : conversation.outcome ===
                                                                          'converted' ? (
                                                                            <CheckCircle
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className="me-1"
                                                                            />
                                                                        ) : (
                                                                            <Info
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className="me-1"
                                                                            />
                                                                        )}
                                                                        {formatLabel(
                                                                            conversation.outcome,
                                                                        )}
                                                                    </span>
                                                                )}

                                                                {conversation.call_duration !==
                                                                    null &&
                                                                    conversation.call_duration !==
                                                                        undefined && (
                                                                        <span className="badge bg-secondary">
                                                                            <Phone
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className="me-1"
                                                                            />
                                                                            {
                                                                                conversation.call_duration
                                                                            }
                                                                            s
                                                                        </span>
                                                                    )}

                                                                {conversation.call_direction && (
                                                                    <span className="badge bg-light text-dark">
                                                                        <ArrowLeftRight
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="me-1"
                                                                        />
                                                                        {formatLabel(
                                                                            conversation.call_direction,
                                                                        )}
                                                                    </span>
                                                                )}

                                                                {conversation.priority && (
                                                                    <span
                                                                        className={`badge ${badgeClass(
                                                                            conversation.priority,
                                                                            'priority',
                                                                        )}`}
                                                                    >
                                                                        <Flag
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="me-1"
                                                                        />
                                                                        Priority:{' '}
                                                                        {formatLabel(
                                                                            conversation.priority,
                                                                        )}
                                                                    </span>
                                                                )}

                                                                {conversation.interest_level && (
                                                                    <span
                                                                        className={`badge ${badgeClass(
                                                                            conversation.interest_level,
                                                                            'interest',
                                                                        )}`}
                                                                    >
                                                                        <Thermometer
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="me-1"
                                                                        />
                                                                        Interest:{' '}
                                                                        {formatLabel(
                                                                            conversation.interest_level,
                                                                        )}
                                                                    </span>
                                                                )}

                                                                {conversation.lost_reason && (
                                                                    <span className="badge bg-danger">
                                                                        Lost
                                                                        reason:{' '}
                                                                        {
                                                                            conversation.lost_reason
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <MessageSquare
                                            size={56}
                                            className="text-muted"
                                        />
                                        <p className="text-muted mt-3 mb-0">
                                            No conversations yet. Add a new
                                            conversation on the right.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {!lead?.is_converted && (
                        <div className="col-lg-4">
                            <Card
                                className="sticky-top"
                                style={{ top: 20, zIndex: 2 }}
                            >
                                <CardHeader className="bg-primary d-flex justify-content-between align-items-center gap-2">
                                    <h5 className="mb-0 d-flex align-items-center text-white">
                                        <PlusCircle
                                            size={18}
                                            className="me-2"
                                        />
                                        New Conversation
                                    </h5>

                                    {phoneNumbers.length === 1 ? (
                                        <a
                                            href={`tel:${phoneNumbers[0].number}`}
                                            className="text-white"
                                            title={`Call ${phoneNumbers[0].label}`}
                                        >
                                            <PhoneCall size={18} />
                                        </a>
                                    ) : (
                                        <div className="dropdown">
                                            <button
                                                type="button"
                                                className="btn btn-link text-white p-0"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                title="Choose phone number"
                                            >
                                                <PhoneCall size={18} />
                                            </button>

                                            <ul className="dropdown-menu dropdown-menu-end">
                                                {phoneNumbers.map((phone) => (
                                                    <li key={phone.label}>
                                                        <a
                                                            href={`tel:${phone.number}`}
                                                            className="dropdown-item d-flex justify-content-between gap-3"
                                                        >
                                                            <span>
                                                                {phone.label}
                                                            </span>
                                                            <span className="text-muted">
                                                                {phone.number}
                                                            </span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardHeader>

                                <CardBody>
                                    <form onSubmit={submit}>
                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel
                                                    required
                                                    htmlFor="channel"
                                                >
                                                    Channel
                                                </FormLabel>
                                                <Select
                                                    id="channel"
                                                    name="channel"
                                                    value={data.channel}
                                                    error={errors.channel}
                                                    onChange={(event) => {
                                                        setData(
                                                            'channel',
                                                            event.target.value,
                                                        );
                                                        clearErrors('channel');
                                                    }}
                                                >
                                                    <option value="">
                                                        Select Channel
                                                    </option>
                                                    {CHANNELS.map((channel) => (
                                                        <option
                                                            key={channel}
                                                            value={channel}
                                                        >
                                                            {formatLabel(
                                                                channel,
                                                            )}
                                                        </option>
                                                    ))}
                                                </Select>

                                                <FormError
                                                    error={errors.channel}
                                                />
                                            </FormField>
                                        </div>

                                        {isCall && (
                                            <>
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold">
                                                        Call Direction
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={
                                                            data.call_direction
                                                        }
                                                        onChange={(event) =>
                                                            setData(
                                                                'call_direction',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Select Direction
                                                        </option>
                                                        <option value="inbound">
                                                            Inbound
                                                        </option>
                                                        <option value="outbound">
                                                            Outbound
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold">
                                                        Call Duration (seconds)
                                                    </label>
                                                    <div className="input-group">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="form-control"
                                                            placeholder="Enter duration"
                                                            value={
                                                                data.call_duration
                                                            }
                                                            onChange={(event) =>
                                                                setData(
                                                                    'call_duration',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <span className="input-group-text">
                                                            seconds
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel
                                                    required
                                                    htmlFor="message"
                                                >
                                                    Message
                                                </FormLabel>
                                                <Textarea
                                                    id="message"
                                                    name="message"
                                                    rows={4}
                                                    placeholder="Enter your message..."
                                                    value={data.message}
                                                    error={errors.message}
                                                    onChange={(event) => {
                                                        setData(
                                                            'message',
                                                            event.target.value,
                                                        );
                                                        clearErrors('message');
                                                    }}
                                                />

                                                <FormError
                                                    error={errors.message}
                                                />
                                            </FormField>
                                        </div>

                                        <div className="mb-3 form-check form-switch">
                                            <input
                                                id="requires_follow_up"
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={requiresFollowUp}
                                                onChange={(event) => {
                                                    const checked =
                                                        event.target.checked;

                                                    setRequiresFollowUp(
                                                        checked,
                                                    );
                                                    setData(
                                                        'requires_follow_up',
                                                        checked,
                                                    );

                                                    if (!checked) {
                                                        setData(
                                                            'next_follow_up_at',
                                                            '',
                                                        );
                                                    }
                                                }}
                                            />
                                            <label
                                                className="form-check-label fw-semibold"
                                                htmlFor="requires_follow_up"
                                            >
                                                Requires Follow-up
                                            </label>
                                        </div>

                                        {requiresFollowUp && (
                                            <div className="mb-3">
                                                <FormField>
                                                    <FormLabel>
                                                        Next Follow-up Date &
                                                        Time
                                                    </FormLabel>
                                                    <DatePicker
                                                        id="required_date"
                                                        mode="single"
                                                        enableTime
                                                        time24hr={false}
                                                        minDate={minDate}
                                                        value={
                                                            data.next_follow_up_at
                                                        }
                                                        placeholder="Select required date"
                                                        disabled={processing}
                                                        error={
                                                            errors.next_follow_up_at
                                                        }
                                                        onChange={(value) => {
                                                            setData(
                                                                'next_follow_up_at',
                                                                value,
                                                            );
                                                        }}
                                                    />

                                                    <FormError
                                                        error={
                                                            errors.next_follow_up_at
                                                        }
                                                    />
                                                </FormField>
                                                {/* <label className="form-label fw-semibold">
                                                    Next Follow-up Date & Time
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    min={new Date()
                                                        .toISOString()
                                                        .slice(0, 16)}
                                                    value={
                                                        data.next_follow_up_at
                                                    }
                                                    onChange={(event) =>
                                                        setData(
                                                            'next_follow_up_at',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.next_follow_up_at && (
                                                    <div className="text-danger small mt-1">
                                                        {
                                                            errors.next_follow_up_at
                                                        }
                                                    </div>
                                                )} */}
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Stage
                                            </label>
                                            <select
                                                className="form-select"
                                                value={data.stage}
                                                onChange={(event) =>
                                                    setData(
                                                        'stage',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select Stage
                                                </option>
                                                {stages.map((stage) => (
                                                    <option
                                                        key={stage.id}
                                                        value={stage.id}
                                                    >
                                                        {formatLabel(
                                                            stage.name,
                                                        )}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                <Flag
                                                    size={15}
                                                    className="me-1"
                                                />
                                                Priority
                                            </label>
                                            <select
                                                className="form-select"
                                                value={data.priority}
                                                onChange={(event) =>
                                                    setData(
                                                        'priority',
                                                        event.target.value as
                                                            | 'low'
                                                            | 'medium'
                                                            | 'high',
                                                    )
                                                }
                                            >
                                                <option value="medium">
                                                    Medium
                                                </option>
                                                <option value="low">Low</option>
                                                <option value="high">
                                                    High
                                                </option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                <Thermometer
                                                    size={15}
                                                    className="me-1"
                                                />
                                                Interest Level
                                            </label>
                                            <select
                                                className="form-select"
                                                value={data.interest_level}
                                                onChange={(event) =>
                                                    setData(
                                                        'interest_level',
                                                        event.target.value as
                                                            | 'cold'
                                                            | 'warm'
                                                            | 'hot',
                                                    )
                                                }
                                            >
                                                <option value="cold">
                                                    Cold
                                                </option>
                                                <option value="warm">
                                                    Warm
                                                </option>
                                                <option value="hot">Hot</option>
                                            </select>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <PlusCircle
                                                        size={17}
                                                        className="me-2"
                                                    />
                                                    Add Conversation
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
            <EditLeadModal
                isOpen={editModalOpen}
                setIsOpen={(status) => setEditModalOpen(status)}
                lead={lead}
            />
        </>
    );
}
