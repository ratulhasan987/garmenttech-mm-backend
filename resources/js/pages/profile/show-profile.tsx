import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    Briefcase,
    Calendar,
    Clock,
    Droplet,
    Heart,
    Home,
    Mail,
    MapPin,
    Phone,
    Shield,
    Smartphone,
    User as UserIcon,
    Users,
} from 'react-feather';

import PageTitle from '@/components/page-title';
import { rihoAsset } from '@/lib/riho';

type Department = { id: number; name: string };
type Designation = { id: number; name: string };
type Shift = { id: number; name: string };
type Role = { id: number; name: string };

type User = {
    id: number;
    employee_id?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    mobile?: string | null;
    emergency_contact?: string | null;
    address?: string | null;
    national_id?: string | null;
    date_of_birth?: string | null;
    joining_date?: string | null;
    probation_period_end_date?: string | null;
    gender?: string | null;
    marital_status?: string | null;
    blood_group?: string | null;
    health_condition?: string | null;
    image?: string | null;
    image_url?: string | null;
    attendance_type?: string | null;
    pay_frequency?: string | null;
    basic_salary?: number | string | null;
    transport_allowance?: number | string | null;
    family_allowance?: number | string | null;
    others_allowance?: number | string | null;
    department?: Department | null;
    designation?: Designation | null;
    shift?: Shift | null;
    roles?: Role[];
};

type ShowUserPageProps = { user: User };
type Displayable = string | number | null | undefined;

function displayValue(value: Displayable): string {
    return value === null || value === undefined || value === ''
        ? 'Not defined'
        : String(value);
}

function titleValue(value: string | null | undefined): string {
    if (!value) return 'Not defined';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null | undefined): string {
    if (!value) return 'Not defined';
    const datePart = value.slice(0, 10);
    const parsed = new Date(`${datePart}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function InfoItem({
    icon,
    label,
    value,
    fullWidth = false,
}: {
    icon: ReactNode;
    label: string;
    value: Displayable;
    fullWidth?: boolean;
}) {
    const isEmpty = value === null || value === undefined || value === '' || value === 'Not defined';

    return (
        <div className={`profile-info-item${fullWidth ? ' profile-info-wide' : ''}`}>
            <span className="profile-info-icon" aria-hidden="true">{icon}</span>
            <div className="profile-info-text">
                <span className="profile-info-label">{label}</span>
                <span className={`profile-info-value${isEmpty ? ' is-empty' : ''}`}>
                    {displayValue(value)}
                </span>
            </div>
        </div>
    );
}

function ProfileSection({
    icon,
    title,
    subtitle,
    children,
}: {
    icon: ReactNode;
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <section className="card profile-section-card">
            <div className="profile-section-header">
                <span className="profile-section-icon" aria-hidden="true">{icon}</span>
                <div>
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
            </div>
            <div className="profile-section-body">
                <div className="profile-info-grid">{children}</div>
            </div>
        </section>
    );
}

export default function ShowProfilePage({ user }: ShowUserPageProps) {
    const fallbackAvatar = rihoAsset('/images/avatar.png');
    const imageFromUser = user.image
        ? /^(?:https?:\/\/|\/)/i.test(user.image)
            ? user.image
            : `/${user.image}`
        : null;
    const profileImage = user.image_url || imageFromUser || fallbackAvatar;

    return (
        <>
            <Head title="View Profile" />
            <PageTitle title="View Profile" />

            <div className="container-fluid profile-page">
                <div className="card profile-hero-card">
                    <div
                        className="profile-cover"
                        style={{
                            backgroundImage: `linear-gradient(105deg, rgba(9, 48, 61, .72), rgba(0, 102, 102, .2)), url("${rihoAsset('/images/bg-profile.png')}")`,
                        }}
                    >
                        <div className="profile-cover-label">
                            <Shield size={15} /> Employee profile
                        </div>
                    </div>

                    <div className="profile-identity">
                        <div className="profile-avatar">
                            <img
                                src={profileImage}
                                alt={`${user.name}'s profile`}
                                onError={(event) => {
                                    if (event.currentTarget.src !== new URL(fallbackAvatar, window.location.href).href) {
                                        event.currentTarget.src = fallbackAvatar;
                                    }
                                }}
                            />
                        </div>
                        <div className="profile-person">
                            <h1>{displayValue(user.name)}</h1>
                            <p>
                                {displayValue(user.designation?.name)}
                                {user.department?.name ? ` · ${user.department.name}` : ''}
                            </p>
                            <div className="profile-tags">
                                {user.employee_id && (
                                    <span className="profile-tag profile-tag-outline">
                                        <UserIcon size={13} /> {user.employee_id}
                                    </span>
                                )}
                                {user.roles?.map((role) => (
                                    <span className="profile-tag" key={role.id}>
                                        {role.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="profile-quick-grid">
                        <div className="profile-quick-item">
                            <Mail size={17} aria-hidden="true" />
                            <div><span>Email address</span><strong>{displayValue(user.email)}</strong></div>
                        </div>
                        <div className="profile-quick-item">
                            <Calendar size={17} aria-hidden="true" />
                            <div><span>Date of birth</span><strong>{formatDate(user.date_of_birth)}</strong></div>
                        </div>
                        <div className="profile-quick-item">
                            <Phone size={17} aria-hidden="true" />
                            <div><span>Contact number</span><strong>{displayValue(user.phone || user.mobile)}</strong></div>
                        </div>
                        <div className="profile-quick-item">
                            <MapPin size={17} aria-hidden="true" />
                            <div><span>Location</span><strong>{displayValue(user.address)}</strong></div>
                        </div>
                    </div>
                </div>

                <div className="profile-sections">
                    <ProfileSection
                        icon={<Briefcase size={19} />}
                        title="Employment Information"
                        subtitle="Work details and assignment"
                    >
                        <InfoItem icon={<UserIcon size={19} />} label="Employee ID" value={user.employee_id} />
                        <InfoItem icon={<Home size={19} />} label="Department" value={user.department?.name} />
                        <InfoItem icon={<Briefcase size={19} />} label="Designation" value={user.designation?.name} />
                        <InfoItem icon={<Clock size={19} />} label="Shift" value={user.shift?.name} />
                        <InfoItem icon={<Calendar size={19} />} label="Joining Date" value={formatDate(user.joining_date)} />
                        <InfoItem icon={<Calendar size={19} />} label="Probation End Date" value={formatDate(user.probation_period_end_date)} />
                        <InfoItem icon={<Clock size={19} />} label="Attendance Type" value={user.attendance_type ? titleValue(user.attendance_type) : null} />
                        <InfoItem icon={<Calendar size={19} />} label="Pay Frequency" value={user.pay_frequency ? titleValue(user.pay_frequency) : null} />
                    </ProfileSection>

                    <ProfileSection
                        icon={<Phone size={19} />}
                        title="Contact Information"
                        subtitle="Contact and address details"
                    >
                        <InfoItem icon={<Mail size={19} />} label="Email" value={user.email} />
                        <InfoItem icon={<Phone size={19} />} label="Phone" value={user.phone} />
                        <InfoItem icon={<Smartphone size={19} />} label="Mobile" value={user.mobile} />
                        <InfoItem icon={<Phone size={19} />} label="Emergency Contact" value={user.emergency_contact} />
                        <InfoItem icon={<MapPin size={19} />} label="Address" value={user.address} fullWidth />
                    </ProfileSection>

                    <ProfileSection
                        icon={<Users size={19} />}
                        title="Personal Information"
                        subtitle="Personal and additional details"
                    >
                        <InfoItem icon={<Calendar size={19} />} label="Date of Birth" value={formatDate(user.date_of_birth)} />
                        <InfoItem icon={<UserIcon size={19} />} label="Gender" value={user.gender ? titleValue(user.gender) : null} />
                        <InfoItem icon={<Heart size={19} />} label="Marital Status" value={user.marital_status ? titleValue(user.marital_status) : null} />
                        <InfoItem icon={<Droplet size={19} />} label="Blood Group" value={user.blood_group} />
                        <InfoItem icon={<Heart size={19} />} label="Health Condition" value={user.health_condition} fullWidth />
                    </ProfileSection>
                </div>
            </div>

            <style>{`
                .profile-page {
                    --profile-surface: #fff;
                    --profile-muted-surface: #f7fafb;
                    --profile-border: #e5ebf1;
                    --profile-text: #182d3e;
                    --profile-muted: #718092;
                    --profile-accent: #006666;
                    --profile-accent-soft: #e5f3f2;
                    padding-bottom: 28px;
                    color: var(--profile-text);
                }
                body.dark-only .profile-page {
                    --profile-surface: #1b2433;
                    --profile-muted-surface: #253145;
                    --profile-border: #354359;
                    --profile-text: #edf3fa;
                    --profile-muted: #afbdd0;
                    --profile-accent: #66d4c9;
                    --profile-accent-soft: #254a4b;
                }
                .profile-page .profile-hero-card,
                .profile-page .profile-section-card {
                    background: var(--profile-surface);
                    color: var(--profile-text);
                    border: 1px solid var(--profile-border);
                    border-radius: 13px;
                    box-shadow: 0 7px 24px rgba(19, 42, 61, .045);
                    overflow: hidden;
                }
                .profile-cover {
                    min-height: 185px;
                    background-size: cover;
                    background-position: center 47%;
                    position: relative;
                }
                .profile-cover-label {
                    position: absolute;
                    top: 18px;
                    left: 24px;
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    color: #fff;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: .035em;
                    background: rgba(9, 42, 54, .36);
                    border: 1px solid rgba(255,255,255,.35);
                    border-radius: 30px;
                    padding: 7px 12px;
                }
                .profile-identity {
                    display: flex;
                    align-items: flex-start;
                    gap: 20px;
                    position: relative;
                    padding: 0 26px 24px;
                    min-height: 115px;
                }
                .profile-avatar {
                    margin-top: -48px;
                    width: 104px;
                    height: 104px;
                    flex: 0 0 104px;
                    border-radius: 50%;
                    padding: 5px;
                    background: var(--profile-surface);
                    box-shadow: 0 5px 20px rgba(12, 34, 48, .14);
                    position: relative;
                    z-index: 1;
                }
                .profile-avatar img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: var(--profile-muted-surface);
                    object-fit: cover;
                }
                .profile-person { min-width: 0; padding-top: 13px; }
                .profile-person h1 {
                    margin: 0 0 4px;
                    color: var(--profile-text);
                    font-size: clamp(19px, 2vw, 25px);
                    font-weight: 700;
                    line-height: 1.3;
                    overflow-wrap: anywhere;
                }
                .profile-person p { margin: 0 0 11px; color: var(--profile-muted); font-size: 13px; }
                .profile-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
                .profile-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 10px;
                    border-radius: 6px;
                    background: var(--profile-accent-soft);
                    color: var(--profile-accent);
                    font-size: 12px;
                    font-weight: 600;
                    line-height: 1.35;
                }
                .profile-tag-outline {
                    border: 1px solid var(--profile-border);
                    background: var(--profile-muted-surface);
                    color: var(--profile-text);
                }
                .profile-quick-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    border-top: 1px solid var(--profile-border);
                    padding: 16px 8px;
                }
                .profile-quick-item {
                    min-width: 0;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 7px 17px;
                    border-right: 1px solid var(--profile-border);
                }
                .profile-quick-item:last-child { border-right: 0; }
                .profile-quick-item > svg { flex-shrink: 0; margin-top: 2px; color: var(--profile-accent); }
                .profile-quick-item > div { min-width: 0; }
                .profile-quick-item span {
                    display: block;
                    margin-bottom: 4px;
                    font-size: 11px;
                    color: var(--profile-muted);
                }
                .profile-quick-item strong {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--profile-text);
                    line-height: 1.5;
                    overflow-wrap: anywhere;
                }
                .profile-sections { display: grid; gap: 18px; margin-top: 18px; }
                .profile-section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 17px 22px;
                    border-bottom: 1px solid var(--profile-border);
                }
                .profile-section-icon {
                    width: 38px;
                    height: 38px;
                    flex: 0 0 38px;
                    display: grid;
                    place-items: center;
                    border-radius: 9px;
                    background: var(--profile-accent-soft);
                    color: var(--profile-accent);
                }
                .profile-section-header h2 {
                    margin: 0 0 3px;
                    font-size: 16px;
                    font-weight: 700;
                    line-height: 1.3;
                    color: var(--profile-text);
                }
                .profile-section-header p {
                    margin: 0;
                    color: var(--profile-muted);
                    font-size: 12px;
                }
                .profile-section-body { padding: 20px 22px 22px; }
                .profile-info-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; }
                .profile-info-item {
                    display: flex;
                    align-items: flex-start;
                    min-width: 0;
                    min-height: 80px;
                    gap: 12px;
                    padding: 16px 14px;
                    border: 1px solid var(--profile-border);
                    border-radius: 9px;
                    background: var(--profile-muted-surface);
                    transition: border-color .18s ease, box-shadow .18s ease;
                }
                .profile-info-item:hover {
                    border-color: var(--profile-accent);
                    box-shadow: 0 4px 12px rgba(0, 102, 102, .045);
                }
                .profile-info-wide { grid-column: 1 / -1; }
                .profile-info-icon {
                    width: 34px;
                    height: 34px;
                    flex: 0 0 34px;
                    display: grid;
                    place-items: center;
                    border-radius: 8px;
                    background: var(--profile-accent-soft);
                    color: var(--profile-accent);
                }
                .profile-info-text { min-width: 0; padding-top: 1px; }
                .profile-info-label {
                    display: block;
                    margin-bottom: 5px;
                    color: var(--profile-muted);
                    font-size: 11px;
                    font-weight: 600;
                    line-height: 1.35;
                    text-transform: uppercase;
                    letter-spacing: .025em;
                }
                .profile-info-value {
                    display: block;
                    color: var(--profile-text);
                    font-size: 13px;
                    font-weight: 600;
                    line-height: 1.5;
                    overflow-wrap: anywhere;
                }
                .profile-info-value.is-empty { color: var(--profile-muted); font-weight: 400; }
                @media (max-width: 1199px) {
                    .profile-info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .profile-quick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .profile-quick-item:nth-child(2) { border-right: 0; }
                    .profile-quick-item:nth-child(-n+2) { border-bottom: 1px solid var(--profile-border); }
                }
                @media (max-width: 575px) {
                    .profile-cover { min-height: 150px; background-position: center; }
                    .profile-cover-label { top: 12px; left: 13px; font-size: 11px; }
                    .profile-identity {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        gap: 0;
                        padding: 0 14px 20px;
                    }
                    .profile-avatar { margin-top: -44px; width: 94px; height: 94px; flex-basis: 94px; }
                    .profile-person { padding-top: 10px; }
                    .profile-tags { justify-content: center; }
                    .profile-quick-grid { grid-template-columns: 1fr; padding: 4px 15px 12px; }
                    .profile-quick-item, .profile-quick-item:nth-child(2) {
                        padding: 12px 4px;
                        border-right: 0;
                        border-bottom: 1px solid var(--profile-border);
                    }
                    .profile-quick-item:last-child { border-bottom: 0; }
                    .profile-section-header { padding: 15px; }
                    .profile-section-body { padding: 14px; }
                    .profile-info-grid { grid-template-columns: 1fr; gap: 10px; }
                    .profile-info-item { min-height: 72px; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .profile-page * { transition: none !important; }
                }
            `}</style>
        </>
    );
}
