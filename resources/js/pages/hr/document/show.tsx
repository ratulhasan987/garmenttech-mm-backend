import { useEffect, useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Download, Eye, Upload } from 'react-feather';
import PageTitle from '@/components/page-title';
import {
    Card,
    CardBody,
    CardHeader,
} from '@/components/ui/card';
import { rihoAsset } from '@/lib/riho';
import { usePermission } from '@/hooks/use-permission';

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
    resume: string | null;
    nid_card: string | null;
    as_per_nid_image: string | null;
    father_nid: string | null;
    mother_nid: string | null;
    relative_nid_primary: string | null;
    relative_nid_secondary: string | null;
    non_relative_nid_primary: string | null;
    non_relative_nid_secondary: string | null;
    educational_certificate: string | null;
    professional_certificate: string | null;
    training_certificate: string | null;
    professional_referance_primary: string | null;
    professional_referance_secondary: string | null;
    [key: string]: any;
}

interface Props {
    document: DocumentData;
}

/*
|--------------------------------------------------------------------------
| Reusable Document Card with Upload Feature
|--------------------------------------------------------------------------
*/
type DocumentCardItemProps = {
    label: string;
    fieldName: string;
    fileUrl: string | null;
    userId: number;
};

function DocumentCardItem({ label, fieldName, fileUrl, userId }: DocumentCardItemProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(fileUrl ? `/${fileUrl}` : null);
    const [isPdf, setIsPdf] = useState<boolean>(fileUrl ? fileUrl.endsWith('.pdf') : false);
    const [localError, setLocalError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        user_id: userId, // Send this so backend knows whose document to update
    });

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLocalError(null);
        form.clearErrors('file');

        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setLocalError('Invalid file type. Allowed: png, jpg, jpeg, pdf.');
            form.setData('file', null);
            return;
        }

        form.setData('file', file);
        setSelectedFile(file);

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setIsPdf(file.type === 'application/pdf');
    };

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!form.data.file) {
            if (!localError) {
                setLocalError('File is required. Please upload an image (png, jpg, jpeg) or PDF.');
            }
            return;
        }

        form.post('/document/update', { // Uses the exact same route
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                form.reset('file');
                setSelectedFile(null);
            },
        });
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setLocalError(null);
        form.clearErrors('file');
        form.reset('file');
        
        if (fileUrl) {
            setPreviewUrl(`/${fileUrl}`);
            setIsPdf(fileUrl.endsWith('.pdf'));
        } else {
            setPreviewUrl(null);
            setIsPdf(false);
        }
    };

    return (
        <div className="border rounded p-3 h-100 d-flex flex-column">
            <div className="d-flex align-items-center w-100 mb-2">
                <strong>{label}</strong>
                <span className={`badge ms-auto ${fileUrl ? "bg-success" : "bg-danger"}`}>
                    {fileUrl ? "Uploaded" : "Missing"}
                </span>
            </div>

            {selectedFile && (
                <div className="position-relative border mb-3 w-100" style={{ padding: '5px', height: '150px' }}>
                    <div className="file-preview w-100 h-100">
                        {previewUrl ? (
                            isPdf ? (
                                <iframe src={previewUrl} className="w-100 h-100" frameBorder="0" title="PDF Preview" />
                            ) : (
                                <img src={previewUrl} className="w-100 h-100" style={{ objectFit: 'contain' }} alt="Image Preview" />
                            )
                        ) : (
                            <img 
                                src="/riho/assets/images/defaultPreview.png" 
                                className="w-100 h-100" 
                                style={{ objectFit: 'contain' }} 
                                alt="Default Preview" 
                            />
                        )}
                    </div>
                </div>
            )}

            {(localError || form.errors.file) && (
                <div className="form-text text-danger mb-2" style={{ fontSize: '14px' }}>
                    {localError || form.errors.file}
                </div>
            )}

            <div className="d-flex flex-wrap gap-2 mt-auto justify-content-center justify-content-sm-between align-items-center">
                {!selectedFile ? (
                    <>
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            {fileUrl ? (
                                <>
                                    <a
                                        href={`/${fileUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                    >
                                        <Eye size={14} /> View
                                    </a>
                                    <a
                                        href={`/${fileUrl}`}
                                        download
                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                </>
                            ) : (
                                <small className="text-muted align-self-center">No document uploaded</small>
                            )}
                        </div>
                        
                        <button 
                            type="button" 
                            onClick={openFilePicker} 
                            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                        >
                            <Upload size={14} /> Upload
                        </button>
                    </>
                ) : (
                    <div className="d-flex gap-2 w-100 justify-content-center">
                        <button 
                            type="button" 
                            onClick={handleSubmit} 
                            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                            disabled={form.processing}
                        >
                            {form.processing ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleCancel} 
                            className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                            disabled={form.processing}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <input
                type="file"
                name={fieldName}
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                hidden
            />
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Main Page Component
|--------------------------------------------------------------------------
*/
export default function DocumentShow({ document }: Props) {
    // Using the permission hook
    const { can } = usePermission();
    const canEditUser = can('user.edit'); // If true, backend will skip same-day validation

    const documentFields = [
        { label: 'Resume', field: 'resume' },
        { label: 'NID Card', field: 'nid_card' },
        { label: 'Photo (As per NID)', field: 'as_per_nid_image' },
        { label: 'Father NID', field: 'father_nid' },
        { label: 'Mother NID', field: 'mother_nid' },
        { label: 'Relative NID (Primary)', field: 'relative_nid_primary' },
        { label: 'Relative NID (Secondary)', field: 'relative_nid_secondary' },
        { label: 'Non-Relative NID (Primary)', field: 'non_relative_nid_primary' },
        { label: 'Non-Relative NID (Secondary)', field: 'non_relative_nid_secondary' },
        { label: 'Educational Certificate', field: 'educational_certificate' },
        { label: 'Professional Certificate', field: 'professional_certificate' },
        { label: 'Training Certificate', field: 'training_certificate' },
        { label: 'Professional Reference (Primary)', field: 'professional_referance_primary' },
        { label: 'Professional Reference (Secondary)', field: 'professional_referance_secondary' },
    ];

    const completed = documentFields.filter((item) => document[item.field]).length;
    const progress = Math.round((completed / documentFields.length) * 100);

    const progressColor = (p: number) => {
        if (p < 40) return 'bg-danger';
        if (p < 70) return 'bg-warning';
        return 'bg-success';
    };

    return (
        <>
            <Head title="Show Document" />
            <PageTitle title="Show Document" />

            <div className="container-fluid">
                <Card className="mb-4">
                    <CardBody>
                        <div className="d-flex flex-column flex-sm-row align-items-center gap-3 text-center text-sm-start">
                            <img
                                src={
                                    document.user?.image
                                        ? `/${document.user.image}`
                                        : rihoAsset('/images/avtar/3.jpg')
                                }
                                className="rounded-circle border"
                                style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                alt={document.user?.name}
                            />

                            <div className="mt-2 mt-sm-0">
                                <h5 className="mb-0">{document.user?.name}</h5>
                                <small className="text-muted d-block mb-2">
                                    Employee ID: #{document.user?.employee_id}
                                </small>
                                <div className="d-flex gap-2 justify-content-center justify-content-sm-start">
                                    {document.user?.department && (
                                        <span className="badge bg-secondary">{document.user.department.name}</span>
                                    )}
                                    {document.user?.designation && (
                                        <span className="badge bg-info">{document.user.designation.name}</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 mt-sm-0 ms-sm-auto text-center text-sm-end">
                                <span className={`status-badge ${document.user?.status === 'active' ? 'active' : 'inactive'}`}>
                                    {document.user?.status
                                        ? document.user.status.charAt(0).toUpperCase() + document.user.status.slice(1)
                                        : ''}
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="mb-4">
                    <CardBody>
                        <h6 className="mb-2">Document Completion</h6>
                        <div className="progress" style={{ height: '22px' }}>
                            <div
                                className={`progress-bar ${progressColor(progress)}`}
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                                aria-valuenow={progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                {progress}%
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h6 className="mb-0">Employee Documents</h6>
                    </CardHeader>
                    <CardBody>
                        <div className="row g-3">
                            {documentFields.map((item, index) => (
                                <div className="col-12 col-sm-6 col-xl-4" key={index}>
                                    <DocumentCardItem
                                        label={item.label}
                                        fieldName={item.field}
                                        fileUrl={document[item.field]}
                                        userId={document.user.id}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            <style>{`
                .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 13px; font-weight: 500; color: #fff; }
                .status-badge.active { background-color: #28a745; }
                .status-badge.inactive { background-color: #dc3545; }
                .progress { background-color: #e9ecef; border-radius: 0.25rem; }
                .progress-bar.bg-danger { background-color: #dc3545 !important; }
                .progress-bar.bg-warning { background-color: #ffc107 !important; }
                .progress-bar.bg-success { background-color: #28a745 !important; }
            `}</style>
        </>
    );
}


// import { useEffect, useRef, useState } from 'react';
// import { Head, useForm } from '@inertiajs/react';
// import { Download, Eye, Upload } from 'react-feather';
// import PageTitle from '@/components/page-title';
// import {
//     Card,
//     CardBody,
//     CardHeader,
// } from '@/components/ui/card';
// import { rihoAsset } from '@/lib/riho';

// /*
// |--------------------------------------------------------------------------
// | Types
// |--------------------------------------------------------------------------
// */

// interface User {
//     id: number;
//     name: string;
//     employee_id: string;
//     image: string | null;
//     status: string;
//     department: { id: number; name: string } | null;
//     designation: { id: number; name: string } | null;
// }

// interface DocumentData {
//     id: number;
//     user: User;
//     resume: string | null;
//     nid_card: string | null;
//     as_per_nid_image: string | null;
//     father_nid: string | null;
//     mother_nid: string | null;
//     relative_nid_primary: string | null;
//     relative_nid_secondary: string | null;
//     non_relative_nid_primary: string | null;
//     non_relative_nid_secondary: string | null;
//     educational_certificate: string | null;
//     professional_certificate: string | null;
//     training_certificate: string | null;
//     professional_referance_primary: string | null;
//     professional_referance_secondary: string | null;
//     [key: string]: any; // Allows dynamic access by field name
// }

// interface Props {
//     document: DocumentData;
// }

// /*
// |--------------------------------------------------------------------------
// | Reusable Document Card with Upload Feature
// |--------------------------------------------------------------------------
// */
// type DocumentCardItemProps = {
//     label: string;
//     fieldName: string;
//     fileUrl: string | null;
// };

// function DocumentCardItem({ label, fieldName, fileUrl }: DocumentCardItemProps) {
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [previewUrl, setPreviewUrl] = useState<string | null>(fileUrl ? `/${fileUrl}` : null);
//     const [isPdf, setIsPdf] = useState<boolean>(fileUrl ? fileUrl.endsWith('.pdf') : false);
//     const [localError, setLocalError] = useState<string | null>(null);
    
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     // Sync preview if backend data changes (e.g., after successful upload)
//     useEffect(() => {
//         if (fileUrl) {
//             setPreviewUrl(`/${fileUrl}`);
//             setIsPdf(fileUrl.endsWith('.pdf'));
//         } else {
//             setPreviewUrl(null);
//             setIsPdf(false);
//         }
//     }, [fileUrl]);

//     const form = useForm({
//         file: null as File | null,
//         field: fieldName,
//     });

//     const openFilePicker = () => {
//         fileInputRef.current?.click();
//     };

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         setLocalError(null);
//         form.clearErrors('file');

//         const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
//         if (!allowedTypes.includes(file.type)) {
//             setLocalError('Invalid file type. Allowed: png, jpg, jpeg, pdf.');
//             form.setData('file', null);
//             return;
//         }

//         form.setData('file', file);
//         setSelectedFile(file);

//         const objectUrl = URL.createObjectURL(file);
//         setPreviewUrl(objectUrl);
//         setIsPdf(file.type === 'application/pdf');
//     };

//     const handleSubmit = (e: React.MouseEvent) => {
//         e.preventDefault();
        
//         if (!form.data.file) {
//             if (!localError) {
//                 setLocalError('File is required. Please upload an image (png, jpg, jpeg) or PDF.');
//             }
//             return;
//         }

//         form.post('/document/update', {
//             preserveScroll: true,
//             preserveState: true,
//             onSuccess: () => {
//                 form.reset('file');
//                 setSelectedFile(null);
//             },
//         });
//     };

//     const handleCancel = () => {
//         setSelectedFile(null);
//         setLocalError(null);
//         form.clearErrors('file');
//         form.reset('file');
        
//         if (fileUrl) {
//             setPreviewUrl(`/${fileUrl}`);
//             setIsPdf(fileUrl.endsWith('.pdf'));
//         } else {
//             setPreviewUrl(null);
//             setIsPdf(false);
//         }
//     };

//     return (
//         <div className="border rounded p-3 h-100 d-flex flex-column">
//             <div className="d-flex align-items-center w-100 mb-2">
//                 <strong>{label}</strong>
//                 <span className={`badge ms-auto ${fileUrl ? "bg-success" : "bg-danger"}`}>
//                     {fileUrl ? "Uploaded" : "Missing"}
//                 </span>
//             </div>

//             {/* Preview Area (Visible only when a new file is selected) */}
//             {selectedFile && (
//                 <div className="position-relative border mb-3 w-100" style={{ padding: '5px', height: '150px' }}>
//                     <div className="file-preview w-100 h-100">
//                         {previewUrl ? (
//                             isPdf ? (
//                                 <iframe src={previewUrl} className="w-100 h-100" frameBorder="0" title="PDF Preview" />
//                             ) : (
//                                 <img src={previewUrl} className="w-100 h-100" style={{ objectFit: 'contain' }} alt="Image Preview" />
//                             )
//                         ) : (
//                             <img 
//                                 src="/riho/assets/images/defaultPreview.png" 
//                                 className="w-100 h-100" 
//                                 style={{ objectFit: 'contain' }} 
//                                 alt="Default Preview" 
//                             />
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Error Display */}
//             {(localError || form.errors.file) && (
//                 <div className="form-text text-danger mb-2" style={{ fontSize: '14px' }}>
//                     {localError || form.errors.file}
//                 </div>
//             )}

//             {/* Action Buttons - Responsive Flexbox */}
//             <div className="d-flex flex-wrap gap-2 mt-auto justify-content-center justify-content-sm-between align-items-center">
//                 {!selectedFile ? (
//                     <>
//                         <div className="d-flex flex-wrap gap-2 justify-content-center">
//                             {fileUrl ? (
//                                 <>
//                                     <a
//                                         href={`/${fileUrl}`}
//                                         target="_blank"
//                                         rel="noreferrer"
//                                         className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
//                                     >
//                                         <Eye size={14} /> View
//                                     </a>
//                                     <a
//                                         href={`/${fileUrl}`}
//                                         download
//                                         className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
//                                     >
//                                         <Download size={14} /> Download
//                                     </a>
//                                 </>
//                             ) : (
//                                 <small className="text-muted align-self-center">No document uploaded</small>
//                             )}
//                         </div>
                        
//                         <button 
//                             type="button" 
//                             onClick={openFilePicker} 
//                             className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
//                         >
//                             <Upload size={14} /> Upload
//                         </button>
//                     </>
//                 ) : (
//                     <div className="d-flex gap-2 w-100 justify-content-center">
//                         <button 
//                             type="button" 
//                             onClick={handleSubmit} 
//                             className="btn btn-sm btn-primary d-flex align-items-center gap-1"
//                             disabled={form.processing}
//                         >
//                             {form.processing ? 'Saving...' : 'Save'}
//                         </button>
//                         <button 
//                             type="button" 
//                             onClick={handleCancel} 
//                             className="btn btn-sm btn-danger d-flex align-items-center gap-1"
//                             disabled={form.processing}
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 )}
//             </div>

//             {/* Hidden File Input */}
//             <input
//                 type="file"
//                 name={fieldName}
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/png,image/jpeg,image/jpg,application/pdf"
//                 hidden
//             />
//         </div>
//     );
// }

// /*
// |--------------------------------------------------------------------------
// | Main Page Component
// |--------------------------------------------------------------------------
// */
// export default function DocumentShow({ document }: Props) {
//     /*
//     |--------------------------------------------------------------------------
//     | Document Configuration & Progress Calculation
//     |--------------------------------------------------------------------------
//     */
//     const documentFields = [
//         { label: 'Resume', field: 'resume' },
//         { label: 'NID Card', field: 'nid_card' },
//         { label: 'Photo (As per NID)', field: 'as_per_nid_image' },
//         { label: 'Father NID', field: 'father_nid' },
//         { label: 'Mother NID', field: 'mother_nid' },
//         { label: 'Relative NID (Primary)', field: 'relative_nid_primary' },
//         { label: 'Relative NID (Secondary)', field: 'relative_nid_secondary' },
//         { label: 'Non-Relative NID (Primary)', field: 'non_relative_nid_primary' },
//         { label: 'Non-Relative NID (Secondary)', field: 'non_relative_nid_secondary' },
//         { label: 'Educational Certificate', field: 'educational_certificate' },
//         { label: 'Professional Certificate', field: 'professional_certificate' },
//         { label: 'Training Certificate', field: 'training_certificate' },
//         { label: 'Professional Reference (Primary)', field: 'professional_referance_primary' },
//         { label: 'Professional Reference (Secondary)', field: 'professional_referance_secondary' },
//     ];

//     const completed = documentFields.filter((item) => document[item.field]).length;
//     const progress = Math.round((completed / documentFields.length) * 100);

//     const progressColor = (p: number) => {
//         if (p < 40) return 'bg-danger';
//         if (p < 70) return 'bg-warning';
//         return 'bg-success';
//     };

//     return (
//         <>
//             <Head title="Show Document" />
//             <PageTitle title="Show Document" />

//             <div className="container-fluid">
//                 {/* 
//                 |--------------------------------------------------------------------------
//                 | User Info Card (Responsive)
//                 |--------------------------------------------------------------------------
//                 */}
//                 <Card className="mb-4">
//                     <CardBody>
//                         <div className="d-flex flex-column flex-sm-row align-items-center gap-3 text-center text-sm-start">
//                             <img
//                                 src={
//                                     document.user?.image
//                                         ? `/${document.user.image}`
//                                         : rihoAsset('/images/avtar/3.jpg')
//                                 }
//                                 className="rounded-circle border"
//                                 style={{
//                                     width: '70px',
//                                     height: '70px',
//                                     objectFit: 'cover',
//                                 }}
//                                 alt={document.user?.name}
//                             />

//                             <div className="mt-2 mt-sm-0">
//                                 <h5 className="mb-0">{document.user?.name}</h5>
//                                 <small className="text-muted d-block mb-2">
//                                     Employee ID: #{document.user?.employee_id}
//                                 </small>
//                                 <div className="d-flex gap-2 justify-content-center justify-content-sm-start">
//                                     {document.user?.department && (
//                                         <span className="badge bg-secondary">
//                                             {document.user.department.name}
//                                         </span>
//                                     )}
//                                     {document.user?.designation && (
//                                         <span className="badge bg-info">
//                                             {document.user.designation.name}
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="mt-3 mt-sm-0 ms-sm-auto text-center text-sm-end">
//                                 <span
//                                     className={`status-badge ${document.user?.status === 'active' ? 'active' : 'inactive'}`}
//                                 >
//                                     {document.user?.status
//                                         ? document.user.status.charAt(0).toUpperCase() + document.user.status.slice(1)
//                                         : ''}
//                                 </span>
//                             </div>
//                         </div>
//                     </CardBody>
//                 </Card>

//                 {/* 
//                 |--------------------------------------------------------------------------
//                 | Progress Card
//                 |--------------------------------------------------------------------------
//                 */}
//                 <Card className="mb-4">
//                     <CardBody>
//                         <h6 className="mb-2">Document Completion</h6>
//                         <div className="progress" style={{ height: '22px' }}>
//                             <div
//                                 className={`progress-bar ${progressColor(progress)}`}
//                                 role="progressbar"
//                                 style={{ width: `${progress}%` }}
//                                 aria-valuenow={progress}
//                                 aria-valuemin={0}
//                                 aria-valuemax={100}
//                             >
//                                 {progress}%
//                             </div>
//                         </div>
//                     </CardBody>
//                 </Card>

//                 {/* 
//                 |--------------------------------------------------------------------------
//                 | Documents Grid Card (Responsive Grid)
//                 |--------------------------------------------------------------------------
//                 */}
//                 <Card>
//                     <CardHeader>
//                         <h6 className="mb-0">Employee Documents</h6>
//                     </CardHeader>
//                     <CardBody>
//                         <div className="row g-3">
//                             {documentFields.map((item, index) => (
//                                 // 1 column on mobile, 2 columns on small tablets, 3 columns on large screens
//                                 <div className="col-12 col-sm-6 col-xl-4" key={index}>
//                                     <DocumentCardItem
//                                         label={item.label}
//                                         fieldName={item.field}
//                                         fileUrl={document[item.field]}
//                                     />
//                                 </div>
//                             ))}
//                         </div>
//                     </CardBody>
//                 </Card>
//             </div>

//             {/* Scoped Styles */}
//             <style>{`
//                 .status-badge {
//                     display: inline-block;
//                     padding: 4px 8px;
//                     border-radius: 4px;
//                     font-size: 13px;
//                     font-weight: 500;
//                     color: #fff;
//                 }
//                 .status-badge.active {
//                     background-color: #28a745;
//                 }
//                 .status-badge.inactive {
//                     background-color: #dc3545;
//                 }
//                 .progress {
//                     background-color: #e9ecef;
//                     border-radius: 0.25rem;
//                 }
//                 .progress-bar.bg-danger {
//                     background-color: #dc3545 !important;
//                 }
//                 .progress-bar.bg-warning {
//                     background-color: #ffc107 !important;
//                 }
//                 .progress-bar.bg-success {
//                     background-color: #28a745 !important;
//                 }
//             `}</style>
//         </>
//     );
// }

