import { Head } from '@inertiajs/react';

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
    Smartphone,
    User as UserIcon,
} from 'react-feather';

import PageTitle from '@/components/page-title';
import { rihoAsset } from '@/lib/riho';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Department = {
    id: number;
    name: string;
};

type Designation = {
    id: number;
    name: string;
};

type Shift = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
};

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

type ShowUserPageProps = {
    user: User;
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function displayValue(
    value:
        | string
        | number
        | null
        | undefined,
) {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return 'Not defined';
    }

    return String(value);
}

function capitalize(
    value:
        | string
        | null
        | undefined,
) {
    if (!value) {
        return 'Not defined';
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

/*
|--------------------------------------------------------------------------
| Info Item
|--------------------------------------------------------------------------
*/

type InfoItemProps = {
    icon: React.ReactNode;

    label: string;

    value:
    | string
    | number
    | null
    | undefined;

    fullWidth?: boolean;
};

function InfoItem({
    icon,
    label,
    value,
    fullWidth = false,
}: InfoItemProps) {
    return (
        <div
            className={`info-item ${fullWidth
                ? 'full-width'
                : ''
                }`}
        >
            <div className="info-icon">
                {icon}
            </div>

            <div className="info-content">
                <h6>
                    {label}
                </h6>

                <p>
                    {displayValue(
                        value,
                    )}
                </p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ShowUserPage({
    user,
}: ShowUserPageProps) {
    const profileImage =
        user.image_url ||
        (
            user.image
                ? `/${user.image}`
                : '/avatar.png'
        );

    const role =
        user.roles?.[0]?.name ??
        null;

    return (
        <>
            <Head title="View Profile" />

            <PageTitle title="View Profile" />

            <style>{`
                .profile-body {
                    padding: 30px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(
                            auto-fill,
                            minmax(300px, 1fr)
                        );
                    gap: 25px;
                }

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    padding: 15px;
                    border-radius: 10px;
                    background: #f8f9fa;
                    transition:
                        all 0.3s ease;
                }

                .info-item:hover {
                    background: #f1f3f5;
                    transform:
                        translateY(-3px);
                }

                .info-item.full-width {
                    grid-column:
                        1 / -1;
                }

                .info-icon {
                    width: 45px;
                    height: 45px;
                    border-radius: 10px;
                    background:
                        linear-gradient(
                            135deg,
                            #6a11cb 0%,
                            #2575fc 100%
                        );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 15px;
                    color: #fff;
                    flex-shrink: 0;
                }

                .info-content {
                    min-width: 0;
                }

                .info-content h6 {
                    margin: 0 0 5px;
                    font-size: 14px;
                    color: #6c757d;
                    text-transform:
                        uppercase;
                    letter-spacing:
                        0.5px;
                }

                .info-content p {
                    margin: 0;
                    font-size: 16px;
                    color: #495057;
                    font-weight: 500;
                    word-break:
                        break-word;
                }

                .show-user-profile
                .hovercard {
                    overflow: hidden;
                }

                .show-user-profile
                .cardheader {
                    min-height: 200px;
                    background-position:
                        center;
                    background-repeat:
                        no-repeat;
                    background-size:
                        cover;
                }

                .show-user-profile
                .user-image {
                    position: relative;
                    margin-top: -50px;
                }

                .show-user-profile
                .avatar {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto;
                    overflow: hidden;
                    border-radius: 50%;
                    border:
                        4px solid #fff;
                    background: #fff;
                }

                .show-user-profile
                .avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .show-user-profile
                .info {
                    padding:
                        15px 20px 25px;
                }

                .show-user-profile
                .user-designation {
                    margin-bottom:
                        15px;
                }

                .show-user-profile
                .user-designation
                .title {
                    font-size: 22px;
                    font-weight: 600;
                }

                .show-user-profile
                .user-designation
                .title span {
                    color: inherit;
                }

                .show-user-profile
                .user-designation
                .desc {
                    margin-top: 5px;
                    color: #6c757d;
                }

                .show-user-profile
                .ttl-info {
                    margin-bottom: 10px;
                }

                .show-user-profile
                .ttl-info h6 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 5px;
                }

                .show-user-profile
                .ttl-info span {
                    word-break:
                        break-word;
                }

                @media (
                    max-width: 768px
                ) {
                    .profile-body {
                        padding: 20px;
                    }

                    .info-grid {
                        grid-template-columns:
                            1fr;
                        gap: 15px;
                    }

                    .show-user-profile
                    .cardheader {
                        min-height:
                            150px;
                    }
                }
            `}</style>

            <div className="container-fluid">
                <div className="user-profile show-user-profile">
                    <div className="row">
                        {/*
                        |--------------------------------------------------------------------------
                        | Profile Header
                        |--------------------------------------------------------------------------
                        */}

                        <div className="col-sm-12">
                            <div className="card hovercard text-center">
                                <div
                                    className="cardheader"
                                    style={{
                                        backgroundImage:
                                            "url('/riho/assets/images/bg-profile.png')",
                                    }}
                                />

                                <div className="user-image">
                                    <div className="avatar">
                                        <img
                                            src={
                                                profileImage
                                            }
                                            alt={
                                                user.name
                                            }
                                            onError={(
                                                event,
                                            ) => {
                                                event.currentTarget.src =
                                                    rihoAsset("/images/avatar.png")
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="info">
                                    <div className="row align-items-center">
                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Email / DOB
                                        |--------------------------------------------------------------------------
                                        */}

                                        <div className="col-sm-6 col-lg-4 order-sm-1 order-xl-0">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="ttl-info text-start">
                                                        <h6>
                                                            <Mail
                                                                size={
                                                                    16
                                                                }
                                                            />

                                                            Email
                                                        </h6>

                                                        <span>
                                                            {displayValue(
                                                                user.email,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="ttl-info text-start">
                                                        <h6>
                                                            <Calendar
                                                                size={
                                                                    16
                                                                }
                                                            />

                                                            BOD
                                                        </h6>

                                                        <span>
                                                            {displayValue(
                                                                user.date_of_birth,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Name / Designation
                                        |--------------------------------------------------------------------------
                                        */}

                                        <div className="col-sm-12 col-lg-4 order-sm-0 order-xl-1">
                                            <div className="user-designation">
                                                <div className="title">
                                                    <span>
                                                        {capitalize(
                                                            user.name,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="desc">
                                                    {capitalize(
                                                        user
                                                            .designation
                                                            ?.name,
                                                    )}
                                                </div>

                                                {role && (
                                                    <div className="mt-1">
                                                        <span className="badge badge-light-primary">
                                                            {
                                                                role
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Contact / Location
                                        |--------------------------------------------------------------------------
                                        */}

                                        <div className="col-sm-6 col-lg-4 order-sm-2 order-xl-2">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="ttl-info text-start">
                                                        <h6>
                                                            <Phone
                                                                size={
                                                                    16
                                                                }
                                                            />

                                                            Contact
                                                            Us
                                                        </h6>

                                                        <span>
                                                            {displayValue(
                                                                user.phone,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="ttl-info text-start">
                                                        <h6>
                                                            <MapPin
                                                                size={
                                                                    16
                                                                }
                                                            />

                                                            Location
                                                        </h6>

                                                        <span>
                                                            {displayValue(
                                                                user.address,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*
                        |--------------------------------------------------------------------------
                        | Employee Details
                        |--------------------------------------------------------------------------
                        */}

                        <div className="col-sm-12">
                            <div className="card">
                                <div className="profile-body">
                                    <div className="info-grid">
                                        <InfoItem
                                            icon={
                                                <UserIcon
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Employee ID"
                                            value={
                                                user.employee_id
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Home
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Department"
                                            value={
                                                user
                                                    .department
                                                    ?.name
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Briefcase
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Designation"
                                            value={
                                                user
                                                    .designation
                                                    ?.name
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Clock
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Shift"
                                            value={
                                                user
                                                    .shift
                                                    ?.name
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Mail
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Email"
                                            value={
                                                user.email
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Phone
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Phone"
                                            value={
                                                user.phone
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Smartphone
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Mobile"
                                            value={
                                                user.mobile
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Phone
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Emergency Contact"
                                            value={
                                                user.emergency_contact
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <UserIcon
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Gender"
                                            value={
                                                user.gender
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Heart
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Marital Status"
                                            value={
                                                user.marital_status
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Calendar
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Joining Date"
                                            value={
                                                user.joining_date
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Calendar
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Probation End Date"
                                            value={
                                                user.probation_period_end_date
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Droplet
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Blood Group"
                                            value={
                                                user.blood_group
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Heart
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Health Condition"
                                            value={
                                                user.health_condition
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <MapPin
                                                    size={
                                                        20
                                                    }
                                                />
                                            }
                                            label="Address"
                                            value={
                                                user.address
                                            }
                                            fullWidth
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}