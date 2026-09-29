import { type DragEvent, type FormEvent, useRef, useState } from 'react';

import { Head, useForm } from '@inertiajs/react';
import { Download, Trash2, UploadCloud } from 'react-feather';
import { FileSpreadsheet } from 'lucide-react';
import PageTitle from '@/components/page-title';

type ImportForm = {
    file: File | null;
};

export default function LeadImport() {
    const inputRef = useRef<HTMLInputElement>(null);

    const [isDragging, setIsDragging] = useState(false);

    const { data, setData, post, processing, errors, reset } =
        useForm<ImportForm>({
            file: null,
        });

    const selectFile = (file?: File) => {
        if (!file) {
            return;
        }

        const allowedExtensions = ['.xlsx', '.xls'];
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

        if (!allowedExtensions.includes(fileExtension)) {
            return;
        }

        setData('file', file);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        selectFile(event.target.files?.[0]);
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        selectFile(event.dataTransfer.files?.[0]);
    };

    const removeFile = () => {
        reset('file');

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/lead.bulk-import', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            },
        });
    };

    return (
        <>
            <Head title="Import Leads" />

            <PageTitle title="Import Leads" />

            <div className="container-fluid">
                <div className="card">
                    <div className="card-header">
                        <p className="mb-3">
                            Hello,
                            <br />
                            <br />
                            If you want to upload your <b>Leads</b> from Excel,
                            please download the sample file provided. Ensure
                            that your data follows the format specified in the
                            sample file before uploading.
                            <br />
                            <br />
                            Thank you!
                        </p>

                        <a
                            href="/lead-sample.xlsx"
                            className="btn btn-primary d-inline-flex align-items-center gap-2"
                            download
                        >
                            Download Sample
                            <Download size={16} />
                        </a>
                    </div>

                    <div className="card-body">
                        {errors.file && (
                            <div className="alert alert-danger">
                                {errors.file}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="mb-3">
                                <label className="form-label">
                                    Choose Your Excel File
                                </label>

                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="d-none"
                                    onChange={handleInputChange}
                                    disabled={processing}
                                />

                                <div
                                    role="button"
                                    tabIndex={0}
                                    className={`border rounded p-5 text-center ${
                                        isDragging
                                            ? 'border-primary bg-light'
                                            : 'border-dashed'
                                    }`}
                                    style={{
                                        cursor: processing
                                            ? 'not-allowed'
                                            : 'pointer',
                                        minHeight: 220,
                                    }}
                                    onClick={() => {
                                        if (!processing) {
                                            inputRef.current?.click();
                                        }
                                    }}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === 'Enter' ||
                                            event.key === ' '
                                        ) {
                                            inputRef.current?.click();
                                        }
                                    }}
                                >
                                    {data.file ? (
                                        <div>
                                            <FileSpreadsheet
                                                size={64}
                                                className="text-success mb-3"
                                            />

                                            <h6 className="fw-semibold mb-1">
                                                {data.file.name}
                                            </h6>

                                            <small className="text-muted">
                                                {(
                                                    data.file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{' '}
                                                MB
                                            </small>

                                            <div className="mt-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        removeFile();
                                                    }}
                                                    disabled={processing}
                                                >
                                                    <Trash2 size={15} />
                                                    Remove File
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud
                                                size={50}
                                                className="text-primary mb-3"
                                            />

                                            <h6 className="fw-semibold">
                                                Drop Excel here or click to
                                                select.
                                            </h6>

                                            <span className="text-muted">
                                                File will be uploaded when the
                                                form is submitted.
                                            </span>
                                        </>
                                    )}
                                </div>

                                <small className="text-muted d-block mt-2">
                                    Supported files: .xlsx, .xls
                                </small>
                            </div>

                            <div className="text-end mt-3">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!data.file || processing}
                                >
                                    {processing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Importing...
                                        </>
                                    ) : (
                                        'Bulk Import'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
