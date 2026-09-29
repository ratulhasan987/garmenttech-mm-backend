import { useEffect, useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ChevronDown, Edit, Eye } from 'react-feather';
import PageTitle from '@/components/page-title';
import {
    Card,
    CardBody,
    CardHeader,
} from '@/components/ui/card';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/
interface User {
    id: number;
    name: string;
    employee_id: string;
    image: string | null;
    status: string;
    department: { id: number; name: string } | null;
    designation: { id: number; name: string } | null;
}

interface DocumentData {
    id: number;
    user: User;
    [key: string]: any;
}

interface Props {
    document: DocumentData;
    errors?: Record<string, string>;
}

/*
|--------------------------------------------------------------------------
| Reusable Accordion Item Component
|--------------------------------------------------------------------------
*/
type AccordionItemProps = {
    id: string;
    title: string;
    fieldName: string;
    fileUrl: string | null;
};

function DocumentAccordionItem({ id, title, fieldName, fileUrl }: AccordionItemProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(fileUrl ? `/${fileUrl}` : null);
    const [isPdf, setIsPdf] = useState<boolean>(fileUrl ? fileUrl.endsWith('.pdf') : false);
    const [localError, setLocalError] = useState<string | null>(null);
    
    // Reference for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync preview when backend updates the fileUrl prop
    useEffect(() => {
        if (fileUrl) {
            setPreviewUrl(`/${fileUrl}`);
            setIsPdf(fileUrl.endsWith('.pdf'));
        } else {
            setPreviewUrl(null);
            setIsPdf(false);
        }
    }, [fileUrl]);

    const form = useForm({
        file: null as File | null,
        field: fieldName,
    });

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Clear errors when a new file is selected
        setLocalError(null);
        form.clearErrors('file');

        // Validate file type client-side
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setLocalError('Invalid file type. Allowed: png, jpg, jpeg, pdf.');
            form.setData('file', null);
            return;
        }

        // Update form data
        form.setData('file', file);

        // Update local preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setIsPdf(file.type === 'application/pdf');
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        
        // If no file is selected, show red error text under input
        if (!form.data.file) {
            if (!localError) {
                setLocalError('File is required. Please upload an image (png, jpg, jpeg) or PDF.');
            }
            return;
        }

        form.post('/document/update', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                form.reset('file');
            },
        });
    };

    return (
        <div className="accordion-item accordion-wrapper">
            <h2 className="accordion-header" id={`heading-${id}`}>
                <button
                    className="accordion-button collapsed accordion-light-primary txt-primary"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${id}`}
                    aria-expanded="false"
                    aria-controls={`collapse-${id}`}
                    style={{ backgroundColor: 'transparent' }}
                >
                    {title}
                    <ChevronDown className="svg-color ms-auto" size={16} />
                </button>
            </h2>
            <div
                id={`collapse-${id}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading-${id}`}
                data-bs-parent="#basic-accordion"
            >
                <div className="accordion-body">
                    <form onSubmit={handleSubmit}>
                        <div className="file-upload-container">
                            <div
                                className="position-relative border"
                                style={{ padding: '5px', width: '100%', height: '200px', marginTop: '10px', cursor: 'pointer' }}
                                onClick={openFilePicker}
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && openFilePicker()}
                            >
                                <div className="file-preview" style={{ width: '100%', height: '100%' }}>
                                    {previewUrl ? (
                                        isPdf ? (
                                            <iframe src={previewUrl} style={{ width: '100%', height: '100%' }} frameBorder="0" title="PDF Preview" />
                                        ) : (
                                            <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Image Preview" />
                                        )
                                    ) : (
                                        <img 
                                            src="/riho/assets/images/defaultPreview.png" 
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                            alt="Default Preview" 
                                        />
                                    )}
                                </div>

                                {/* Hover Action Overlay */}
                                <div className="file-upload-overlay">
                                    <div className="file-upload-actions">
                                        <div className="file-upload-icon-btn text-white" title="Upload New">
                                            <Edit size={35} />
                                        </div>

                                        {fileUrl && (
                                            <a 
                                                href={`/${fileUrl}`} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="file-upload-icon-btn text-white" 
                                                title="View File"
                                                // Stop propagation so clicking the eye doesn't trigger the file picker
                                                onClick={(e) => e.stopPropagation()} 
                                            >
                                                <Eye size={35} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    name={fieldName}
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                                    hidden
                                />
                            </div>
                        </div>

                        {/* Display Local or Inertia Validation Errors */}
                        {(localError || form.errors.file) && (
                            <div className="form-text text-danger mt-2" style={{ fontSize: '14px' }}>
                                {localError || form.errors.file}
                            </div>
                        )}

                        <div className="mt-3">
                            <button 
                                type="submit" 
                                className="btn btn-outline-primary" 
                                disabled={form.processing}
                            >
                                {form.processing ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Main Page Component
|--------------------------------------------------------------------------
*/
export default function DocumentEdit({ document: doc, errors = {} }: Props) {
    // Configuration for the Left Column (Basic Information)
    const basicInfoItems = [
        { title: 'NID Card', field: 'nid_card' },
        { title: 'Father NID Card', field: 'father_nid' },
        { title: 'Mother NID Card', field: 'mother_nid' },
        { title: 'Primary Relative NID Card', field: 'relative_nid_primary' },
        { title: 'Secondary Relative NID Card', field: 'relative_nid_secondary' },
        { title: 'Primary Non-Relative NID Card', field: 'non_relative_nid_primary' },
        { title: 'Secondary Non-Relative NID Card', field: 'non_relative_nid_secondary' },
    ];

    // Configuration for the Right Column (Professional Information)
    const professionalItems = [
        { title: 'Resume / Cv', field: 'resume' },
        { title: 'Professional Image', field: 'as_per_nid_image' },
        { title: 'Educational Certificate', field: 'educational_certificate' },
        { title: 'Professional Certificate', field: 'professional_certificate' },
        { title: 'Training Certificate', field: 'training_certificate' },
        { title: 'Primary Professional Referance', field: 'professional_referance_primary' },
        { title: 'Secondary Professional Referance', field: 'professional_referance_secondary' },
    ];

    return (
        <>
            <Head title="Document Update" />
            <PageTitle title="Document Update" />

            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <Card>
                            <CardHeader>
                                <h6 className="mb-0">Basic Information</h6>
                            </CardHeader>
                            <CardBody>
                                <div className="accordion dark-accordion" id="basic-accordion">
                                    {basicInfoItems.map((item, index) => (
                                        <DocumentAccordionItem
                                            key={item.field}
                                            id={`basic-${index}`}
                                            title={item.title}
                                            fieldName={item.field}
                                            fileUrl={doc[item.field]}
                                        />
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <div className="col-md-6 col-sm-12">
                        <Card>
                            <CardHeader>
                                <h6 className="mb-0">Professional Information</h6>
                            </CardHeader>
                            <CardBody>
                                <div className="accordion dark-accordion" id="professional-accordion">
                                    {professionalItems.map((item, index) => (
                                        <DocumentAccordionItem
                                            key={item.field}
                                            id={`prof-${index}`}
                                            title={item.title}
                                            fieldName={item.field}
                                            fileUrl={doc[item.field]}
                                        />
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            <style>{`
                .file-upload-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(14, 14, 14, 0.4);
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    cursor: pointer;
                }
                .file-upload-overlay:hover {
                    opacity: 1;
                }
                .file-upload-actions {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 1.5rem;
                }
                .file-upload-icon-btn {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    text-decoration: none;
                }
                .accordion-button.collapsed {
                    box-shadow: none;
                }
                .accordion-button:focus {
                    box-shadow: none;
                    border-color: transparent;
                }
            `}</style>
        </>
    );
}