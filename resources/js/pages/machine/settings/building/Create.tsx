import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface BuildingForm {
    name: string;
    code: string;
    description: string;
}

export default function BuildingCreatePage() {
    const { data, setData, post, processing, errors, reset } = useForm<BuildingForm>({
        name: '',
        code: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/building', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleCancel = () => {
        router.get('/building');
    };

    return (
        <>
            <Head title="Create Building" />
            <PageTitle title="Create Building" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex align-items-center justify-content-between">
                            <h5 className="mb-0 font-semibold text-gray-800">
                                Add New Building
                            </h5>
                            <Button variant="outline" onClick={handleCancel}>
                                Back to List
                            </Button>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardBody className="space-y-4">
                            <div className="row g-3">
                                {/* Building Name */}
                                <div className="col-12 col-md-6">
                                    <Label htmlFor="name" className="required">
                                        Building Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="e.g. Building A"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-danger">{errors.name}</p>
                                    )}
                                </div>

                                {/* Building Code */}
                                <div className="col-12 col-md-6">
                                    <Label htmlFor="code">Building Code</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        placeholder="e.g. BLD-01"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        error={errors.code}
                                    />
                                    {errors.code && (
                                        <p className="mt-1 text-sm text-danger">{errors.code}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="col-12">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        rows={3}
                                        placeholder="Enter optional description..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-danger">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardBody>

                        <CardFooter>
                            <div className="d-flex align-items-center justify-content-end gap-2 w-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Building'}
                                </Button>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}