import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { FileDropzone } from '@/components/ui/form/file-dropzone';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { asset } from '@/lib/asset';

type Configure = {
    id: number;
    name: string;
    logo: string | null;
    primary_logo: string | null;
    secondary_logo: string | null;
    phone: string;
    email: string;
    address: string;
    created_at: string;
    updated_at: string;
};

type ConfigureFormData = {
    name: string;
    phone: string;
    email: string;
    address: string;

    logo: File | null;
    primary_logo: File | null;
    secondary_logo: File | null;

    remove_logo: boolean;
    remove_primary_logo: boolean;
    remove_secondary_logo: boolean;
};

type ConfigureIndexProps = {
    data: Configure;
};

const imageAccept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
};

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default function ConfigureIndex({ data }: ConfigureIndexProps) {
    const [removedExisting, setRemovedExisting] = useState({
        logo: false,
        primary_logo: false,
        secondary_logo: false,
    });

    const {
        data: formData,
        setData,
        post,
        processing,
        errors,
        clearErrors,
    } = useForm<ConfigureFormData>({
        // _method: 'PUT',

        name: data?.name ?? '',
        phone: data?.phone ?? '',
        email: data?.email ?? '',
        address: data?.address ?? '',

        // Do NOT put database image paths here.
        // FileDropzone accepts File | File[] | null.
        logo: null,
        primary_logo: null,
        secondary_logo: null,

        remove_logo: false,
        remove_primary_logo: false,
        remove_secondary_logo: false,
    });

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        post('configure/update', {
            preserveScroll: true,
            forceFormData: true,
        });
    }

    return (
        <>
        <Head title="Configuration" />
            <PageTitle title="Configuration" />

            <div className="container-fluid">
                <Card>
                    <CardBody>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="row">
                                {/* Name */}
                                <div className="col-md-12">
                                    <FormField>
                                        <FormLabel htmlFor="name" required>
                                            Name
                                        </FormLabel>

                                        <Input
                                            id="name"
                                            value={formData.name}
                                            error={errors.name}
                                            disabled={processing}
                                            onChange={(e) => {
                                                setData('name', e.target.value);

                                                if (errors.name) {
                                                    clearErrors('name');
                                                }
                                            }}
                                        />

                                        <FormError error={errors.name} />
                                    </FormField>
                                </div>

                                {/* Short Logo */}
                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel>Short Logo</FormLabel>

                                        <FileDropzone
                                            className="mt-0.5"
                                            value={formData.logo}
                                            existingFiles={
                                                !formData.logo &&
                                                !removedExisting.logo &&
                                                data.logo
                                                    ? [
                                                          {
                                                              path: data.logo,
                                                              url: asset(
                                                                  data.logo,
                                                              ) as string,
                                                          },
                                                      ]
                                                    : []
                                            }
                                            onRemoveExisting={() => {
                                                setRemovedExisting((prev) => ({
                                                    ...prev,
                                                    logo: true,
                                                }));

                                                setData('logo', null);
                                                setData('remove_logo', true);
                                            }}
                                            disabled={processing}
                                            error={errors.logo}
                                            accept={imageAccept}
                                            maxSize={MAX_IMAGE_SIZE}
                                            multiple={false}
                                            showFileList={false}
                                            showImagePreview
                                            previewInsideDropzone
                                            previewHeight={180}
                                            description="JPG, PNG or WebP. Maximum 2MB."
                                            onChange={(file) => {
                                                setData(
                                                    'logo',
                                                    file as File | null,
                                                );

                                                if (file) {
                                                    setData(
                                                        'remove_logo',
                                                        false,
                                                    );

                                                    setRemovedExisting(
                                                        (prev) => ({
                                                            ...prev,
                                                            logo: true,
                                                        }),
                                                    );
                                                }

                                                if (errors.logo) {
                                                    clearErrors('logo');
                                                }
                                            }}
                                        />

                                        <FormError error={errors.logo} />
                                    </FormField>
                                </div>

                                {/* Primary Logo */}
                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel>Primary Logo</FormLabel>

                                        <FileDropzone
                                            className="mt-0.5"
                                            value={formData.primary_logo}
                                            existingFiles={
                                                !formData.primary_logo &&
                                                !removedExisting.primary_logo &&
                                                data.primary_logo
                                                    ? [
                                                          {
                                                              path: data.primary_logo,
                                                              url: asset(
                                                                  data.primary_logo,
                                                              ) as string,
                                                          },
                                                      ]
                                                    : []
                                            }
                                            onRemoveExisting={() => {
                                                setRemovedExisting((prev) => ({
                                                    ...prev,
                                                    primary_logo: true,
                                                }));

                                                setData('primary_logo', null);
                                                setData('remove_logo', true);
                                            }}
                                            disabled={processing}
                                            error={errors.primary_logo}
                                            accept={imageAccept}
                                            maxSize={MAX_IMAGE_SIZE}
                                            multiple={false}
                                            showFileList={false}
                                            showImagePreview
                                            previewInsideDropzone
                                            previewHeight={180}
                                            description="JPG, PNG or WebP. Maximum 2MB."
                                            onChange={(file) => {
                                                setData(
                                                    'primary_logo',
                                                    file as File | null,
                                                );

                                                if (file) {
                                                    setData(
                                                        'remove_primary_logo',
                                                        false,
                                                    );

                                                    setRemovedExisting(
                                                        (prev) => ({
                                                            ...prev,
                                                            primary_logo: true,
                                                        }),
                                                    );
                                                }

                                                if (errors.primary_logo) {
                                                    clearErrors('primary_logo');
                                                }
                                            }}
                                        />

                                        <FormError
                                            error={errors.primary_logo}
                                        />
                                    </FormField>
                                </div>

                                {/* Secondary Logo */}
                                <div className="col-md-4">
                                    <FormField>
                                        <FormLabel>Secondary Logo</FormLabel>

                                        <FileDropzone
                                            className="mt-0.5"
                                            value={formData.secondary_logo}
                                            existingFiles={
                                                !formData.secondary_logo &&
                                                !removedExisting.secondary_logo &&
                                                data.secondary_logo
                                                    ? [
                                                          {
                                                              path: data.secondary_logo,
                                                              url: asset(
                                                                  data.secondary_logo,
                                                              ) as string,
                                                          },
                                                      ]
                                                    : []
                                            }
                                            onRemoveExisting={() => {
                                                setRemovedExisting((prev) => ({
                                                    ...prev,
                                                    secondary_logo: true,
                                                }));

                                                setData('secondary_logo', null);
                                                setData('remove_logo', true);
                                            }}
                                            disabled={processing}
                                            error={errors.secondary_logo}
                                            accept={imageAccept}
                                            maxSize={MAX_IMAGE_SIZE}
                                            multiple={false}
                                            showFileList={false}
                                            showImagePreview
                                            previewInsideDropzone
                                            previewHeight={180}
                                            description="JPG, PNG or WebP. Maximum 2MB."
                                            onChange={(file) => {
                                                setData(
                                                    'secondary_logo',
                                                    file as File | null,
                                                );

                                                if (file) {
                                                    setData(
                                                        'remove_secondary_logo',
                                                        false,
                                                    );

                                                    setRemovedExisting(
                                                        (prev) => ({
                                                            ...prev,
                                                            secondary_logo: true,
                                                        }),
                                                    );
                                                }

                                                if (errors.secondary_logo) {
                                                    clearErrors(
                                                        'secondary_logo',
                                                    );
                                                }
                                            }}
                                        />

                                        <FormError
                                            error={errors.secondary_logo}
                                        />
                                    </FormField>
                                </div>

                                {/* Email */}
                                <div className="col-md-12">
                                    <FormField>
                                        <FormLabel htmlFor="email" required>
                                            Email
                                        </FormLabel>

                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            error={errors.email}
                                            disabled={processing}
                                            onChange={(e) => {
                                                setData(
                                                    'email',
                                                    e.target.value,
                                                );

                                                if (errors.email) {
                                                    clearErrors('email');
                                                }
                                            }}
                                        />

                                        <FormError error={errors.email} />
                                    </FormField>
                                </div>

                                {/* Phone */}
                                <div className="col-md-12">
                                    <FormField>
                                        <FormLabel htmlFor="phone" required>
                                            Phone
                                        </FormLabel>

                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            error={errors.phone}
                                            disabled={processing}
                                            onChange={(e) => {
                                                setData(
                                                    'phone',
                                                    e.target.value,
                                                );

                                                if (errors.phone) {
                                                    clearErrors('phone');
                                                }
                                            }}
                                        />

                                        <FormError error={errors.phone} />
                                    </FormField>
                                </div>

                                {/* Address */}
                                <div className="col-md-12">
                                    <FormField>
                                        <FormLabel htmlFor="address" required>
                                            Address
                                        </FormLabel>

                                        <Input
                                            id="address"
                                            value={formData.address}
                                            error={errors.address}
                                            disabled={processing}
                                            onChange={(e) => {
                                                setData(
                                                    'address',
                                                    e.target.value,
                                                );

                                                if (errors.address) {
                                                    clearErrors('address');
                                                }
                                            }}
                                        />

                                        <FormError error={errors.address} />
                                    </FormField>
                                </div>

                                {/* Submit */}
                                <div className="d-flex justify-content-end gap-2">
                                    <Button
                                        type="submit"
                                        loading={processing}
                                        loadingText="Saving..."
                                    >
                                        Update
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
