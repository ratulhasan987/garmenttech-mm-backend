import {
    type ChangeEvent,
    type FormEvent,
    useState,
} from 'react';

import {
    Head,
    useForm,
} from '@inertiajs/react';

import {
    Edit3,
    Eye,
    EyeOff,
} from 'react-feather';

import { z } from 'zod';

import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardBody,
    CardHeader,
} from '@/components/ui/card';
import { AppModal } from '@/components/ui/modal/app-modal';
import { asset } from '@/lib/asset';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type User = {
    id: number;

    name: string;

    email: string;

    phone?: string | null;

    image?: string | null;

    image_url?: string | null;
};

type EditProfilePageProps = {
    user: User;
};

/*
|--------------------------------------------------------------------------
| Profile Information Validation
|--------------------------------------------------------------------------
*/

const profileInformationSchema =
    z.object({
        name: z
            .string()
            .trim()
            .min(
                1,
                'Name is required.',
            )
            .max(
                255,
                'Name must not exceed 255 characters.',
            ),

        phone: z
            .string()
            .trim()
            .min(
                1,
                'Phone is required.',
            )
            .max(
                255,
                'Phone must not exceed 255 characters.',
            ),
    });

/*
|--------------------------------------------------------------------------
| Password Validation
|--------------------------------------------------------------------------
*/

const passwordSchema =
    z
        .object({
            current_password:
                z
                    .string()
                    .min(
                        1,
                        'Current password is required.',
                    ),

            password:
                z
                    .string()
                    .min(
                        1,
                        'New password is required.',
                    )
                    .min(
                        8,
                        'Password must be at least 8 characters.',
                    ),

            password_confirmation:
                z
                    .string()
                    .min(
                        1,
                        'Password confirmation is required.',
                    ),
        })
        .refine(
            (data) =>
                data.password ===
                data.password_confirmation,
            {
                message:
                    'Password confirmation does not match.',
                path: [
                    'password_confirmation',
                ],
            },
        );

/*
|--------------------------------------------------------------------------
| Image Validation
|--------------------------------------------------------------------------
*/

const MAX_IMAGE_SIZE =
    2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
];

const imageSchema =
    z
        .custom<File>(
            (value) =>
                typeof File !==
                    'undefined' &&
                value instanceof File,
            {
                message:
                    'Please select an image.',
            },
        )
        .refine(
            (file) =>
                ALLOWED_IMAGE_TYPES.includes(
                    file.type,
                ),
            {
                message:
                    'Image must be JPG, PNG, GIF, or WebP.',
            },
        )
        .refine(
            (file) =>
                file.size <=
                MAX_IMAGE_SIZE,
            {
                message:
                    'Image must not exceed 2 MB.',
            },
        );

/*
|--------------------------------------------------------------------------
| Delete Account Validation
|--------------------------------------------------------------------------
*/

const deleteAccountSchema =
    z.object({
        password: z
            .string()
            .min(
                1,
                'Password is required.',
            ),
    });

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function EditProfilePage({
    user,
}: EditProfilePageProps) {

    console.log(user)
    /*
    |--------------------------------------------------------------------------
    | UI State
    |--------------------------------------------------------------------------
    */

    const [
        showCurrentPassword,
        setShowCurrentPassword,
    ] = useState(false);

    const [
        showNewPassword,
        setShowNewPassword,
    ] = useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);

    const [
        showDeletePassword,
        setShowDeletePassword,
    ] = useState(false);

    const [
        deleteModalOpen,
        setDeleteModalOpen,
    ] = useState(false);

    const existingImage =
        user.image_url ??
        (
            user.image
                ? `/${user.image}`
                : '/riho/assets/images/img-preview.png'
        );

    const [
        imagePreview,
        setImagePreview,
    ] =
        useState(
            existingImage,
        );

    /*
    |--------------------------------------------------------------------------
    | Profile Information Form
    |--------------------------------------------------------------------------
    */

    const profileForm =
        useForm({
            name:
                user.name ?? '',

            email:
                user.email ?? '',

            phone:
                user.phone ?? '',
        });

    /*
    |--------------------------------------------------------------------------
    | Image Form
    |--------------------------------------------------------------------------
    */

    const imageForm =
        useForm<{
            image:
                | File
                | null;
        }>({
            image: null,
        });

    /*
    |--------------------------------------------------------------------------
    | Password Form
    |--------------------------------------------------------------------------
    */

    const passwordForm =
        useForm({
            current_password:
                '',

            password:
                '',

            password_confirmation:
                '',
        });

    /*
    |--------------------------------------------------------------------------
    | Delete Form
    |--------------------------------------------------------------------------
    */

    const deleteForm =
        useForm({
            password: '',
        });

    /*
    |--------------------------------------------------------------------------
    | Profile Field Change
    |--------------------------------------------------------------------------
    */

    const updateProfileField = <
        K extends keyof typeof profileForm.data,
    >(
        field: K,
        value:
            (typeof profileForm.data)[K],
    ) => {
        profileForm.setData(
            (
                currentData,
            ) => ({
                ...currentData,

                [field]:
                    value,
            }),
        );

        profileForm.clearErrors(
            field,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Password Field Change
    |--------------------------------------------------------------------------
    */

    const updatePasswordField = <
        K extends keyof typeof passwordForm.data,
    >(
        field: K,
        value:
            (typeof passwordForm.data)[K],
    ) => {
        passwordForm.setData(
            (
                currentData,
            ) => ({
                ...currentData,

                [field]:
                    value,
            }),
        );

        passwordForm.clearErrors(
            field,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Profile Submit
    |--------------------------------------------------------------------------
    */

    const handleProfileSubmit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        profileForm.clearErrors();

        const result =
            profileInformationSchema.safeParse(
                {
                    name:
                        profileForm
                            .data
                            .name,

                    phone:
                        profileForm
                            .data
                            .phone,
                },
            );

        if (
            !result.success
        ) {
            result.error.issues.forEach(
                (issue) => {
                    const field =
                        issue
                            .path[0];

                    if (
                        field ===
                            'name' ||
                        field ===
                            'phone'
                    ) {
                        profileForm.setError(
                            field,
                            issue.message,
                        );
                    }
                },
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Change URL if your route is different
        |--------------------------------------------------------------------------
        */

        profileForm.patch(
            '/profile/update/information',
            {
                preserveScroll:
                    true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Image Change
    |--------------------------------------------------------------------------
    */

    const handleImageChange = (
        event:
            ChangeEvent<HTMLInputElement>,
    ) => {
        const file =
            event.target
                .files?.[0] ??
            null;

        imageForm.clearErrors(
            'image',
        );

        if (!file) {
            imageForm.setData(
                (
                    currentData,
                ) => ({
                    ...currentData,

                    image: null,
                }),
            );

            setImagePreview(
                existingImage,
            );

            return;
        }

        const result =
            imageSchema.safeParse(
                file,
            );

        if (
            !result.success
        ) {
            imageForm.setError(
                'image',
                result.error
                    .issues[0]
                    ?.message ??
                    'Invalid image.',
            );

            event.target.value =
                '';

            return;
        }

        imageForm.setData(
            (
                currentData,
            ) => ({
                ...currentData,

                image:
                    file,
            }),
        );

        const reader =
            new FileReader();

        reader.onload = () => {
            if (
                typeof reader.result ===
                'string'
            ) {
                setImagePreview(
                    reader.result,
                );
            }
        };

        reader.readAsDataURL(
            file,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Image Submit
    |--------------------------------------------------------------------------
    */

    const handleImageSubmit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        imageForm.clearErrors();

        const file =
            imageForm
                .data
                .image;

        if (!file) {
            imageForm.setError(
                'image',
                'Please select an image.',
            );

            return;
        }

        const result =
            imageSchema.safeParse(
                file,
            );

        if (
            !result.success
        ) {
            imageForm.setError(
                'image',
                result.error
                    .issues[0]
                    ?.message ??
                    'Invalid image.',
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | POST + method spoofing is safer for multipart file uploads
        |--------------------------------------------------------------------------
        */

        imageForm
            .transform(
                (data) => ({
                    ...data,

                    _method:
                        'patch',
                }),
            );

        imageForm.patch(
            '/profile/update/image',
            {
                preserveScroll:
                    true,

                forceFormData:
                    true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Password Submit
    |--------------------------------------------------------------------------
    */

    const handlePasswordSubmit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        passwordForm.clearErrors();

        const result =
            passwordSchema.safeParse(
                passwordForm.data,
            );

        if (
            !result.success
        ) {
            const fields =
                new Set<string>();

            result.error.issues.forEach(
                (issue) => {
                    const field =
                        issue.path[0];

                    if (
                        typeof field !==
                            'string' ||
                        fields.has(
                            field,
                        )
                    ) {
                        return;
                    }

                    fields.add(
                        field,
                    );

                    if (
                        field ===
                            'current_password' ||
                        field ===
                            'password' ||
                        field ===
                            'password_confirmation'
                    ) {
                        passwordForm.setError(
                            field,
                            issue.message,
                        );
                    }
                },
            );

            return;
        }

        passwordForm.patch(
            '/profile/update/password',
            {
                preserveScroll:
                    true,

                onSuccess:
                    () => {
                        passwordForm.reset();

                        setShowCurrentPassword(
                            false,
                        );

                        setShowNewPassword(
                            false,
                        );

                        setShowConfirmPassword(
                            false,
                        );
                    },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Account
    |--------------------------------------------------------------------------
    */

    const handleDeleteAccount =
        () => {
            deleteForm.clearErrors();

            const result =
                deleteAccountSchema.safeParse(
                    deleteForm.data,
                );

            if (
                !result.success
            ) {
                deleteForm.setError(
                    'password',
                    result.error
                        .issues[0]
                        ?.message ??
                        'Password is required.',
                );

                return;
            }

            deleteForm.delete(
                '/profile',
                {
                    preserveScroll:
                        true,

                    onSuccess:
                        () => {
                            setDeleteModalOpen(
                                false,
                            );

                            deleteForm.reset();
                        },
                },
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Close Delete Modal
    |--------------------------------------------------------------------------
    */

    const handleDeleteModalChange = (
        open: boolean,
    ) => {
        if (
            deleteForm.processing
        ) {
            return;
        }

        setDeleteModalOpen(
            open,
        );

        if (!open) {
            deleteForm.reset();

            deleteForm.clearErrors();

            setShowDeletePassword(
                false,
            );
        }
    };

    return (
        <>
            <Head title="Edit Profile" />

            <PageTitle title="Profile Update" />

            <style>{`
                .profile-image-wrapper {
                    position: relative;
                    width: 150px;
                    height: 150px;
                    margin-top: 10px;
                    padding: 5px;
                    border: 1px solid #ddd;
                    overflow: hidden;
                }

                .profile-image-wrapper.is-invalid {
                    border-color: #dc3545;
                }

                .profile-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .profile-image-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(14, 14, 14, 0.44);
                    opacity: 0;
                    cursor: pointer;
                    transition: opacity .2s ease;
                }

                .profile-image-wrapper:hover
                .profile-image-overlay {
                    opacity: 1;
                }

                .profile-image-overlay input {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    cursor: pointer;
                }

                .profile-image-edit {
                    color: #fff;
                }

                .profile-password-toggle {
                    cursor: pointer;
                }
            `}</style>

            <div className="container-fluid">
                <div className="row">
                    {/*
                    |--------------------------------------------------------------------------
                    | Left Column
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6 col-sm-12">
                        {/*
                        |--------------------------------------------------------------------------
                        | Profile Information
                        |--------------------------------------------------------------------------
                        */}

                        <form
                            onSubmit={
                                handleProfileSubmit
                            }
                            noValidate
                        >
                            <Card className="m-2">
                                <CardHeader>
                                    <h6 className="mb-0">
                                        Profile Information
                                    </h6>
                                </CardHeader>

                                <CardBody>
                                    {/* Name */}

                                    <div className="mb-3">
                                        <div className="form-group">
                                            <label
                                                htmlFor="name"
                                                className="text-gray form-label"
                                            >
                                                Name
                                            </label>

                                            <input
                                                id="name"
                                                type="text"
                                                className={`form-control ${
                                                    profileForm
                                                        .errors
                                                        .name
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                value={
                                                    profileForm
                                                        .data
                                                        .name
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateProfileField(
                                                        'name',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                            />
                                        </div>

                                        {profileForm
                                            .errors
                                            .name && (
                                            <div className="form-text text-danger">
                                                {
                                                    profileForm
                                                        .errors
                                                        .name
                                                }
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}

                                    <div className="mb-3">
                                        <div className="form-group">
                                            <label
                                                htmlFor="email"
                                                className="text-gray form-label"
                                            >
                                                Email
                                            </label>

                                            <input
                                                id="email"
                                                type="email"
                                                className="form-control"
                                                value={
                                                    profileForm
                                                        .data
                                                        .email
                                                }
                                                readOnly
                                            />
                                        </div>

                                        {profileForm
                                            .errors
                                            .email && (
                                            <div className="form-text text-danger">
                                                {
                                                    profileForm
                                                        .errors
                                                        .email
                                                }
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone */}

                                    <div className="mb-3">
                                        <div className="form-group">
                                            <label
                                                htmlFor="phone"
                                                className="text-gray form-label"
                                            >
                                                Phone
                                            </label>

                                            <input
                                                id="phone"
                                                type="text"
                                                className={`form-control ${
                                                    profileForm
                                                        .errors
                                                        .phone
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                value={
                                                    profileForm
                                                        .data
                                                        .phone
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateProfileField(
                                                        'phone',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                            />
                                        </div>

                                        {profileForm
                                            .errors
                                            .phone && (
                                            <div className="form-text text-danger">
                                                {
                                                    profileForm
                                                        .errors
                                                        .phone
                                                }
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        appearance="outline"
                                        disabled={
                                            profileForm.processing
                                        }
                                    >
                                        {profileForm.processing
                                            ? 'Saving...'
                                            : 'Save'}
                                    </Button>
                                </CardBody>
                            </Card>
                        </form>

                        {/*
                        |--------------------------------------------------------------------------
                        | Profile Picture
                        |--------------------------------------------------------------------------
                        */}

                        <Card className="m-2 mt-4">
                            <CardHeader>
                                <h6 className="mb-0">
                                    Profile Picture
                                </h6>
                            </CardHeader>

                            <CardBody>
                                <form
                                    onSubmit={
                                        handleImageSubmit
                                    }
                                    noValidate
                                >
                                    <div
                                        className={`profile-image-wrapper ${
                                            imageForm
                                                .errors
                                                .image
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                    >
                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Profile"
                                            onError={(
                                                event,
                                            ) => {
                                                event.currentTarget.src =
                                                    '/riho/assets/images/img-preview.png';
                                            }}
                                        />

                                        <label className="profile-image-overlay">
                                            <Edit3
                                                size={
                                                    35
                                                }
                                                className="profile-image-edit"
                                            />

                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                                                onChange={
                                                    handleImageChange
                                                }
                                            />
                                        </label>
                                    </div>

                                    {imageForm
                                        .errors
                                        .image && (
                                        <div className="form-text text-danger mt-2">
                                            {
                                                imageForm
                                                    .errors
                                                    .image
                                            }
                                        </div>
                                    )}

                                    <div className="mt-3">
                                        <Button
                                            type="submit"
                                            appearance="outline"
                                            disabled={
                                                imageForm.processing ||
                                                !imageForm
                                                    .data
                                                    .image
                                            }
                                        >
                                            {imageForm.processing
                                                ? 'Saving...'
                                                : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Right Column
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6 col-sm-12">
                        {/*
                        |--------------------------------------------------------------------------
                        | Update Password
                        |--------------------------------------------------------------------------
                        */}

                        <form
                            onSubmit={
                                handlePasswordSubmit
                            }
                            noValidate
                        >
                            <Card className="m-2">
                                <CardHeader>
                                    <h6 className="mb-0">
                                        Update Password
                                    </h6>
                                </CardHeader>

                                <CardBody>
                                    {/* Current Password */}

                                    <div className="mb-3">
                                        <label
                                            htmlFor="current_password"
                                            className="text-gray form-label"
                                        >
                                            Current Password
                                        </label>

                                        <div className="input-group">
                                            <input
                                                id="current_password"
                                                type={
                                                    showCurrentPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                className={`form-control ${
                                                    passwordForm
                                                        .errors
                                                        .current_password
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                value={
                                                    passwordForm
                                                        .data
                                                        .current_password
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updatePasswordField(
                                                        'current_password',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="input-group-text profile-password-toggle"
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        (
                                                            previous,
                                                        ) =>
                                                            !previous,
                                                    )
                                                }
                                            >
                                                {showCurrentPassword ? (
                                                    <Eye
                                                        size={
                                                            18
                                                        }
                                                    />
                                                ) : (
                                                    <EyeOff
                                                        size={
                                                            18
                                                        }
                                                    />
                                                )}
                                            </button>
                                        </div>

                                        {passwordForm
                                            .errors
                                            .current_password && (
                                            <div className="form-text text-danger">
                                                {
                                                    passwordForm
                                                        .errors
                                                        .current_password
                                                }
                                            </div>
                                        )}
                                    </div>

                                    {/* New Password */}

                                    <div className="mb-3">
                                        <label
                                            htmlFor="password"
                                            className="text-gray form-label"
                                        >
                                            New Password
                                        </label>

                                        <div className="input-group">
                                            <input
                                                id="password"
                                                type={
                                                    showNewPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                className={`form-control ${
                                                    passwordForm
                                                        .errors
                                                        .password
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                value={
                                                    passwordForm
                                                        .data
                                                        .password
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updatePasswordField(
                                                        'password',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="input-group-text profile-password-toggle"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        (
                                                            previous,
                                                        ) =>
                                                            !previous,
                                                    )
                                                }
                                            >
                                                {showNewPassword ? (
                                                    <Eye
                                                        size={
                                                            18
                                                        }
                                                    />
                                                ) : (
                                                    <EyeOff
                                                        size={
                                                            18
                                                        }
                                                    />
                                                )}
                                            </button>
                                        </div>

                                        {passwordForm
                                            .errors
                                            .password && (
                                            <div className="form-text text-danger">
                                                {
                                                    passwordForm
                                                        .errors
                                                        .password
                                                }
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirmation */}

                                    <div className="mb-3">
                                        <label
                                            htmlFor="password_confirmation"
                                            className="text-gray form-label"
                                        >
                                            Confirm Password
                                        </label>

                                        <div className="input-group">
                                            <input
                                                id="password_confirmation"
                                                type={
                                                    showConfirmPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                className={`form-control ${
                                                    passwordForm
                                                        .errors
                                                        .password_confirmation
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                value={
                                                    passwordForm
                                                        .data
                                                        .password_confirmation
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updatePasswordField(
                                                        'password_confirmation',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="input-group-text profile-password-toggle"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (
                                                            previous,
                                                        ) =>
                                                            !previous,
                                                    )
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <Eye
                                                        size={
                                                            18
                                                        }
                                                    />
                                                ) : (
                                                    <EyeOff
                                                        size={
                                                            18
                                                        }
                                                    />
                                                )}
                                            </button>
                                        </div>

                                        {passwordForm
                                            .errors
                                            .password_confirmation && (
                                            <div className="form-text text-danger">
                                                {
                                                    passwordForm
                                                        .errors
                                                        .password_confirmation
                                                }
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        appearance="outline"
                                        disabled={
                                            passwordForm.processing
                                        }
                                    >
                                        {passwordForm.processing
                                            ? 'Updating...'
                                            : 'Update Password'}
                                    </Button>
                                </CardBody>
                            </Card>
                        </form>

                        {/*
                        |--------------------------------------------------------------------------
                        | Delete Profile
                        |--------------------------------------------------------------------------
                        */}

                        <Card className="m-2 mt-4">
                            <CardHeader>
                                <h6 className="mb-0">
                                    Profile Delete
                                </h6>
                            </CardHeader>

                            <CardBody>
                                <p className="text-danger">
                                    Once your account is deleted,
                                    all of its resources and data
                                    will be permanently deleted.
                                    Before deleting your account,
                                    please download any data or
                                    information that you wish to
                                    retain.
                                </p>

                                <Button
                                    type="button"
                                    variant="danger"
                                    appearance="outline"
                                    onClick={() =>
                                        setDeleteModalOpen(
                                            true,
                                        )
                                    }
                                >
                                    Delete Account
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            {/*
            |--------------------------------------------------------------------------
            | Delete Account Modal
            |--------------------------------------------------------------------------
            */}

            <AppModal
                open={
                    deleteModalOpen
                }
                onOpenChange={
                    handleDeleteModalChange
                }
                centered
                busy={
                    deleteForm.processing
                }
                showCloseButton={
                    false
                }
                title="Delete Account"
                classNames={{
                    content:
                        'border-0 shadow',

                    body:
                        'border-0 p-4',
                }}
            >
                <p className="text-danger">
                    Once your account is deleted,
                    all of its resources and data
                    will be permanently deleted.
                    Please enter your password to
                    confirm you would like to
                    permanently delete your account.
                </p>

                <div className="mb-3">
                    <label
                        htmlFor="delete_password"
                        className="form-label"
                    >
                        Password
                    </label>

                    <div className="input-group">
                        <input
                            id="delete_password"
                            type={
                                showDeletePassword
                                    ? 'text'
                                    : 'password'
                            }
                            className={`form-control ${
                                deleteForm
                                    .errors
                                    .password
                                    ? 'is-invalid'
                                    : ''
                            }`}
                            placeholder="Password"
                            value={
                                deleteForm
                                    .data
                                    .password
                            }
                            onChange={(
                                event,
                            ) => {
                                deleteForm.setData(
                                    'password',
                                    event
                                        .target
                                        .value,
                                );

                                deleteForm.clearErrors(
                                    'password',
                                );
                            }}
                        />

                        <button
                            type="button"
                            className="input-group-text"
                            onClick={() =>
                                setShowDeletePassword(
                                    (
                                        previous,
                                    ) =>
                                        !previous,
                                )
                            }
                        >
                            {showDeletePassword ? (
                                <Eye
                                    size={
                                        18
                                    }
                                />
                            ) : (
                                <EyeOff
                                    size={
                                        18
                                    }
                                />
                            )}
                        </button>
                    </div>

                    {deleteForm
                        .errors
                        .password && (
                        <div className="form-text text-danger">
                            {
                                deleteForm
                                    .errors
                                    .password
                            }
                        </div>
                    )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        disabled={
                            deleteForm.processing
                        }
                        onClick={() =>
                            handleDeleteModalChange(
                                false,
                            )
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        variant="danger"
                        disabled={
                            deleteForm.processing
                        }
                        onClick={
                            handleDeleteAccount
                        }
                    >
                        {deleteForm.processing ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    aria-hidden="true"
                                />

                                Deleting...
                            </>
                        ) : (
                            'Delete Account'
                        )}
                    </Button>
                </div>
            </AppModal>
        </>
    );
}
