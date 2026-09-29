import {
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    File,
    FileText,
    Image as ImageIcon,
    UploadCloud,
} from 'react-feather';

import {
    type Accept,
    type FileRejection,
    useDropzone,
} from 'react-dropzone';

import { cn } from '@/lib/utils';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type FileDropzoneValue =
    | File
    | File[]
    | null;

/*
|--------------------------------------------------------------------------
| Existing File
|--------------------------------------------------------------------------
|
| Used for files already saved on the server.
|
*/

export type FileDropzoneExistingFile = {
    path: string;

    url: string;

    extension?: string | null;

    mimeType?: string | null;

    size?: number | null;
};

export type FileDropzoneClassNames = {
    root?: string;

    label?: string;

    dropzone?: string;
    dropzoneActive?: string;
    dropzoneReject?: string;
    dropzoneDisabled?: string;

    content?: string;
    uploadIcon?: string;
    title?: string;
    description?: string;

    /*
    |--------------------------------------------------------------------------
    | Preview
    |--------------------------------------------------------------------------
    */

    previewGrid?: string;
    previewCard?: string;
    previewThumbnail?: string;
    previewImage?: string;
    previewFileIcon?: string;
    previewMeta?: string;
    removeButton?: string;

    /*
    |--------------------------------------------------------------------------
    | External File List
    |--------------------------------------------------------------------------
    */

    fileList?: string;
    fileItem?: string;

    preview?: string;
    fileIcon?: string;
    fileInfo?: string;
    fileName?: string;
    fileMeta?: string;

    hint?: string;

    rejectionWrapper?: string;
    rejectionText?: string;

    error?: string;
};

export type FileRenderContext = {
    index: number;

    remove: () => void;

    formatSize: (
        bytes: number,
    ) => string;

    isImage: boolean;
};

export interface FileDropzoneProps {
    /*
    |--------------------------------------------------------------------------
    | New Files
    |--------------------------------------------------------------------------
    */

    value?: FileDropzoneValue;

    onChange: (
        value: FileDropzoneValue,
    ) => void;

    /*
    |--------------------------------------------------------------------------
    | Existing Server Files
    |--------------------------------------------------------------------------
    */

    existingFiles?:
        FileDropzoneExistingFile[];

    onRemoveExisting?: (
        file: FileDropzoneExistingFile,
    ) => void;

    /*
    |--------------------------------------------------------------------------
    | Existing Single Preview - Backward Compatibility
    |--------------------------------------------------------------------------
    */

    initialPreviewUrl?:
        | string
        | null;

    /*
    |--------------------------------------------------------------------------
    | Display
    |--------------------------------------------------------------------------
    */

    label?: ReactNode;

    required?: boolean;

    placeholder?: string;

    description?: ReactNode;

    hint?: ReactNode;

    error?: string;

    disabled?: boolean;

    /*
    |--------------------------------------------------------------------------
    | File Behavior
    |--------------------------------------------------------------------------
    */

    multiple?: boolean;

    accept?: Accept;

    maxFiles?: number;

    maxSize?: number;

    minSize?: number;

    /*
    |--------------------------------------------------------------------------
    | Preview
    |--------------------------------------------------------------------------
    */

    showFileList?: boolean;

    showImagePreview?: boolean;

    previewInsideDropzone?: boolean;

    previewHeight?:
        | number
        | string;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    renderFile?: (
        file: File,
        context: FileRenderContext,
    ) => ReactNode;

    /*
    |--------------------------------------------------------------------------
    | Events
    |--------------------------------------------------------------------------
    */

    onAccepted?: (
        files: File[],
    ) => void;

    onRejected?: (
        rejections:
            FileRejection[],
    ) => void;

    onRemove?: (
        file: File,
    ) => void;

    /*
    |--------------------------------------------------------------------------
    | Styling
    |--------------------------------------------------------------------------
    */

    className?: string;

    classNames?:
        FileDropzoneClassNames;
}

/*
|--------------------------------------------------------------------------
| Format File Size
|--------------------------------------------------------------------------
*/

function formatFileSize(
    bytes: number,
): string {
    if (
        bytes ===
        0
    ) {
        return '0 Bytes';
    }

    const unit =
        1024;

    const sizes = [
        'Bytes',
        'KB',
        'MB',
        'GB',
        'TB',
    ];

    const index =
        Math.floor(
            Math.log(
                bytes,
            ) /
                Math.log(
                    unit,
                ),
        );

    return `${parseFloat(
        (
            bytes /
            Math.pow(
                unit,
                index,
            )
        ).toFixed(
            2,
        ),
    )} ${sizes[index]}`;
}

/*
|--------------------------------------------------------------------------
| Format MB
|--------------------------------------------------------------------------
*/

function formatFileSizeMB(
    bytes: number,
): string {
    const size =
        bytes /
        (1024 * 1024);

    return `${parseFloat(
        size.toFixed(
            2,
        ),
    )} MB`;
}

/*
|--------------------------------------------------------------------------
| New File Image Check
|--------------------------------------------------------------------------
*/

function isImageFile(
    file: File,
): boolean {
    return file.type.startsWith(
        'image/',
    );
}

/*
|--------------------------------------------------------------------------
| New File Extension
|--------------------------------------------------------------------------
*/

function getFileExtension(
    file: File,
): string {
    const parts =
        file.name.split(
            '.',
        );

    if (
        parts.length <=
        1
    ) {
        return '';
    }

    return (
        parts
            .pop()
            ?.toUpperCase() ??
        ''
    );
}

/*
|--------------------------------------------------------------------------
| Existing File Extension
|--------------------------------------------------------------------------
*/

function getExistingFileExtension(
    file:
        FileDropzoneExistingFile,
): string {
    if (
        file.extension
    ) {
        return file.extension
            .replace(
                '.',
                '',
            )
            .toUpperCase();
    }

    const cleanPath =
        file.path.split(
            '?',
        )[0];

    const parts =
        cleanPath.split(
            '.',
        );

    if (
        parts.length <=
        1
    ) {
        return '';
    }

    return (
        parts
            .pop()
            ?.toUpperCase() ??
        ''
    );
}

/*
|--------------------------------------------------------------------------
| Existing File Image Check
|--------------------------------------------------------------------------
*/

function isExistingImageFile(
    file:
        FileDropzoneExistingFile,
): boolean {
    if (
        file.mimeType
            ?.startsWith(
                'image/',
            )
    ) {
        return true;
    }

    return [
        'JPG',
        'JPEG',
        'PNG',
        'GIF',
        'WEBP',
        'BMP',
        'SVG',
    ].includes(
        getExistingFileExtension(
            file,
        ),
    );
}

/*
|--------------------------------------------------------------------------
| File Key
|--------------------------------------------------------------------------
*/

function getFileKey(
    file: File,
): string {
    return [
        file.name,
        file.size,
        file.lastModified,
    ].join(
        '-',
    );
}

/*
|--------------------------------------------------------------------------
| Unique Files
|--------------------------------------------------------------------------
*/

function getUniqueFiles(
    files: File[],
): File[] {
    const map =
        new Map<
            string,
            File
        >();

    files.forEach(
        (
            file,
        ) => {
            map.set(
                getFileKey(
                    file,
                ),
                file,
            );
        },
    );

    return Array.from(
        map.values(),
    );
}

/*
|--------------------------------------------------------------------------
| Selected Image Preview
|--------------------------------------------------------------------------
*/

function ImagePreview({
    file,
    className,
}: {
    file: File;

    className?: string;
}) {
    const [
        previewUrl,
        setPreviewUrl,
    ] =
        useState<
            string | null
        >(null);

    useEffect(
        () => {
            const url =
                URL.createObjectURL(
                    file,
                );

            setPreviewUrl(
                url,
            );

            return () => {
                URL.revokeObjectURL(
                    url,
                );
            };
        },
        [
            file,
        ],
    );

    if (
        !previewUrl
    ) {
        return null;
    }

    return (
        <img
            src={
                previewUrl
            }
            alt="Preview"
            className={cn(
                className,
            )}
            style={{
                width:
                    '100%',

                height:
                    '100%',

                objectFit:
                    'contain',

                display:
                    'block',
            }}
        />
    );
}

/*
|--------------------------------------------------------------------------
| Selected File Type Preview
|--------------------------------------------------------------------------
*/

function FileTypePreview({
    file,
    className,
}: {
    file: File;

    className?: string;
}) {
    const extension =
        getFileExtension(
            file,
        );

    /*
    |--------------------------------------------------------------------------
    | PDF
    |--------------------------------------------------------------------------
    */

    if (
        extension ===
        'PDF'
    ) {
        return (
            <div
                className={cn(
                    'w-100 h-100',
                    'd-flex flex-column',
                    'align-items-center',
                    'justify-content-center',
                    className,
                )}
            >
                <FileText
                    size={54}
                    className="text-danger mb-2"
                />

                <span className="badge bg-danger">
                    PDF
                </span>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Excel
    |--------------------------------------------------------------------------
    */

    if (
        extension ===
            'XLS' ||
        extension ===
            'XLSX'
    ) {
        return (
            <div
                className={cn(
                    'w-100 h-100',
                    'd-flex flex-column',
                    'align-items-center',
                    'justify-content-center',
                    className,
                )}
            >
                <FileText
                    size={54}
                    className="text-success mb-2"
                />

                <span className="badge bg-success">
                    {
                        extension
                    }
                </span>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Word
    |--------------------------------------------------------------------------
    */

    if (
        extension ===
            'DOC' ||
        extension ===
            'DOCX'
    ) {
        return (
            <div
                className={cn(
                    'w-100 h-100',
                    'd-flex flex-column',
                    'align-items-center',
                    'justify-content-center',
                    className,
                )}
            >
                <FileText
                    size={54}
                    className="text-primary mb-2"
                />

                <span className="badge bg-primary">
                    {
                        extension
                    }
                </span>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Generic
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className={cn(
                'w-100 h-100',
                'd-flex flex-column',
                'align-items-center',
                'justify-content-center',
                className,
            )}
        >
            <File
                size={54}
                className="text-secondary mb-2"
            />

            <span className="badge bg-secondary">
                {extension ||
                    'FILE'}
            </span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Existing File Type Preview
|--------------------------------------------------------------------------
*/

function ExistingFileTypePreview({
    file,
    className,
}: {
    file:
        FileDropzoneExistingFile;

    className?: string;
}) {
    const extension =
        getExistingFileExtension(
            file,
        );

    /*
    |--------------------------------------------------------------------------
    | PDF
    |--------------------------------------------------------------------------
    */

    if (
        extension ===
        'PDF'
    ) {
        return (
            <div
                className={cn(
                    'w-100 h-100',
                    'd-flex flex-column',
                    'align-items-center',
                    'justify-content-center',
                    className,
                )}
            >
                <FileText
                    size={54}
                    className="text-danger mb-2"
                />

                <span className="badge bg-danger">
                    PDF
                </span>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Excel
    |--------------------------------------------------------------------------
    */

    if (
        extension ===
            'XLS' ||
        extension ===
            'XLSX'
    ) {
        return (
            <div
                className={cn(
                    'w-100 h-100',
                    'd-flex flex-column',
                    'align-items-center',
                    'justify-content-center',
                    className,
                )}
            >
                <FileText
                    size={54}
                    className="text-success mb-2"
                />

                <span className="badge bg-success">
                    {
                        extension
                    }
                </span>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Word
    |--------------------------------------------------------------------------
    */

    if (
        extension ===
            'DOC' ||
        extension ===
            'DOCX'
    ) {
        return (
            <div
                className={cn(
                    'w-100 h-100',
                    'd-flex flex-column',
                    'align-items-center',
                    'justify-content-center',
                    className,
                )}
            >
                <FileText
                    size={54}
                    className="text-primary mb-2"
                />

                <span className="badge bg-primary">
                    {
                        extension
                    }
                </span>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Generic
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className={cn(
                'w-100 h-100',
                'd-flex flex-column',
                'align-items-center',
                'justify-content-center',
                className,
            )}
        >
            <File
                size={54}
                className="text-secondary mb-2"
            />

            <span className="badge bg-secondary">
                {extension ||
                    'FILE'}
            </span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

export function FileDropzone({
    value = null,

    onChange,

    existingFiles = [],

    onRemoveExisting,

    initialPreviewUrl,

    label,

    required = false,

    placeholder =
        'Drop files here or click to select.',

    description,

    hint,

    error,

    disabled = false,

    multiple = false,

    accept,

    maxFiles = 10,

    maxSize,

    minSize,

    showFileList =
        true,

    showImagePreview =
        true,

    previewInsideDropzone =
        true,

    previewHeight =
        120,

    renderFile,

    onAccepted,

    onRejected,

    onRemove,

    className,

    classNames,
}: FileDropzoneProps) {
    /*
    |--------------------------------------------------------------------------
    | Normalize Selected Files
    |--------------------------------------------------------------------------
    */

    const selectedFiles =
        useMemo<
            File[]
        >(
            () => {
                if (
                    !value
                ) {
                    return [];
                }

                if (
                    Array.isArray(
                        value,
                    )
                ) {
                    return value;
                }

                return [
                    value,
                ];
            },
            [
                value,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Total Preview Count
    |--------------------------------------------------------------------------
    */

    const totalFiles =
        existingFiles.length +
        selectedFiles.length;

    const hasFiles =
        totalFiles >
        0;

    /*
    |--------------------------------------------------------------------------
    | Rejection Messages
    |--------------------------------------------------------------------------
    */

    const [
        rejectionMessages,
        setRejectionMessages,
    ] =
        useState<
            string[]
        >([]);

    /*
    |--------------------------------------------------------------------------
    | Accepted Files
    |--------------------------------------------------------------------------
    */

    const handleAccepted =
        useCallback(
            (
                acceptedFiles:
                    File[],
            ) => {
                setRejectionMessages(
                    [],
                );

                if (
                    !acceptedFiles.length
                ) {
                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | Single
                |--------------------------------------------------------------------------
                */

                if (
                    !multiple
                ) {
                    const file =
                        acceptedFiles[
                            0
                        ] ??
                        null;

                    /*
                    |--------------------------------------------------------------------------
                    | Existing File Counts Too
                    |--------------------------------------------------------------------------
                    */

                    if (
                        existingFiles.length +
                            (file
                                ? 1
                                : 0) >
                        maxFiles
                    ) {
                        setRejectionMessages(
                            [
                                `You can upload a maximum of ${maxFiles} files.`,
                            ],
                        );

                        return;
                    }

                    onChange(
                        file,
                    );

                    if (
                        file
                    ) {
                        onAccepted?.(
                            [
                                file,
                            ],
                        );
                    }

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | Multiple
                |--------------------------------------------------------------------------
                */

                const merged =
                    getUniqueFiles(
                        [
                            ...selectedFiles,
                            ...acceptedFiles,
                        ],
                    );

                /*
                |--------------------------------------------------------------------------
                | Existing + New Maximum
                |--------------------------------------------------------------------------
                */

                if (
                    existingFiles.length +
                        merged.length >
                    maxFiles
                ) {
                    setRejectionMessages(
                        [
                            `You can upload a maximum of ${maxFiles} files.`,
                        ],
                    );

                    return;
                }

                onChange(
                    merged,
                );

                onAccepted?.(
                    acceptedFiles,
                );
            },
            [
                existingFiles.length,
                maxFiles,
                multiple,
                onAccepted,
                onChange,
                selectedFiles,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Rejected Files
    |--------------------------------------------------------------------------
    */

    const handleRejected =
        useCallback(
            (
                rejections:
                    FileRejection[],
            ) => {
                const messages =
                    rejections.flatMap(
                        (
                            rejection,
                        ) =>
                            rejection.errors.map(
                                (
                                    rejectionError,
                                ) => {
                                    switch (
                                        rejectionError.code
                                    ) {
                                        case 'file-too-large':
                                            return maxSize
                                                ? `${rejection.file.name}: maximum allowed size is ${formatFileSize(
                                                      maxSize,
                                                  )}.`
                                                : `${rejection.file.name}: file is too large.`;

                                        case 'file-too-small':
                                            return minSize
                                                ? `${rejection.file.name}: minimum file size is ${formatFileSize(
                                                      minSize,
                                                  )}.`
                                                : `${rejection.file.name}: file is too small.`;

                                        case 'file-invalid-type':
                                            return `${rejection.file.name}: this file type is not allowed.`;

                                        case 'too-many-files':
                                            return `You can upload a maximum of ${maxFiles} files.`;

                                        default:
                                            return `${rejection.file.name}: ${rejectionError.message}`;
                                    }
                                },
                            ),
                    );

                setRejectionMessages(
                    Array.from(
                        new Set(
                            messages,
                        ),
                    ),
                );

                onRejected?.(
                    rejections,
                );
            },
            [
                maxFiles,
                maxSize,
                minSize,
                onRejected,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Dropzone
    |--------------------------------------------------------------------------
    */

    const {
        getRootProps,
        getInputProps,

        isDragActive,
        isDragAccept,
        isDragReject,
    } =
        useDropzone({
            accept,

            multiple,

            disabled,

            maxFiles:
                multiple
                    ? maxFiles
                    : 1,

            maxSize,

            minSize,

            onDropAccepted:
                handleAccepted,

            onDropRejected:
                handleRejected,
        });

    /*
    |--------------------------------------------------------------------------
    | Remove New File
    |--------------------------------------------------------------------------
    */

    const removeFile =
        (
            file: File,
        ) => {
            if (
                disabled
            ) {
                return;
            }

            if (
                multiple
            ) {
                const nextFiles =
                    selectedFiles.filter(
                        (
                            selectedFile,
                        ) =>
                            getFileKey(
                                selectedFile,
                            ) !==
                            getFileKey(
                                file,
                            ),
                    );

                onChange(
                    nextFiles,
                );
            } else {
                onChange(
                    null,
                );
            }

            onRemove?.(
                file,
            );

            setRejectionMessages(
                [],
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Remove Existing File
    |--------------------------------------------------------------------------
    */

    const removeExistingFile =
        (
            file:
                FileDropzoneExistingFile,
        ) => {
            if (
                disabled
            ) {
                return;
            }

            onRemoveExisting?.(
                file,
            );

            setRejectionMessages(
                [],
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Preview Height
    |--------------------------------------------------------------------------
    */

    const resolvedPreviewHeight =
        typeof previewHeight ===
        'number'
            ? `${previewHeight}px`
            : previewHeight;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className={cn(
                className,
                classNames?.root,
            )}
        >
            {/*
            |--------------------------------------------------------------------------
            | Label
            |--------------------------------------------------------------------------
            */}

            {label && (
                <label
                    className={cn(
                        'form-label',
                        classNames?.label,
                    )}
                >
                    {
                        label
                    }

                    {required && (
                        <span className="text-danger ms-1">
                            *
                        </span>
                    )}
                </label>
            )}

            {/*
            |--------------------------------------------------------------------------
            | Main Dropzone
            |--------------------------------------------------------------------------
            */}

            <div
                {...getRootProps({
                    className:
                        cn(
                            'dropzone',
                            'position-relative',
                            'bg-transparent',
                            'p-3',

                            isDragActive &&
                                'border-primary',

                            isDragAccept &&
                                'border-success',

                            isDragReject &&
                                'border-danger',

                            error &&
                                'border-danger',

                            disabled &&
                                'opacity-50',

                            classNames?.dropzone,

                            isDragActive &&
                                classNames?.dropzoneActive,

                            isDragReject &&
                                classNames?.dropzoneReject,

                            disabled &&
                                classNames?.dropzoneDisabled,
                        ),
                })}
                style={{
                    minHeight:
                        '220px',

                    cursor:
                        disabled
                            ? 'not-allowed'
                            : 'pointer',
                }}
            >
                <input
                    {...getInputProps()}
                />

                {/*
                |--------------------------------------------------------------------------
                | Preview Grid
                |--------------------------------------------------------------------------
                |
                | Existing server files and newly selected browser files are
                | rendered together inside this exact same grid.
                |
                */}

                {previewInsideDropzone &&
                hasFiles ? (
                    <div
                        className={cn(
                            'd-flex flex-wrap gap-3 justify-content-center',

                            classNames?.previewGrid,
                        )}
                    >
                        {/*
                        |--------------------------------------------------------------------------
                        | Existing Server Files
                        |--------------------------------------------------------------------------
                        */}

                        {existingFiles.map(
                            (
                                file,
                            ) => {
                                const image =
                                    isExistingImageFile(
                                        file,
                                    );

                                return (
                                    <div
                                        key={
                                            file.path
                                        }
                                        className={cn(
                                            'text-center',
                                            !multiple && 'w-100 h-100',
                                            classNames?.previewCard,
                                        )}
                                         style={{
        width: multiple
            ? '140px'
            : '100%',
        cursor: disabled
            ? 'not-allowed'
            : 'pointer',
    }}
                                    >
                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Existing Thumbnail
                                        |--------------------------------------------------------------------------
                                        */}

                                        <div
                                            className={cn(
                                                'border rounded bg-light overflow-hidden',

                                                'd-flex align-items-center justify-content-center',
 !multiple && 'w-100',
                                                classNames?.previewThumbnail,
                                            )}
                                            style={{
                                                width: multiple
            ? '140px'
            : '100%',

                                                height:
                                                    resolvedPreviewHeight,
                                            }}
                                        >
                                            {image &&
                                            showImagePreview ? (
                                                <img
                                                    src={
                                                        file.url
                                                    }
                                                    alt="Preview"
                                                    className={cn(
                                                        classNames?.previewImage,
                                                    )}
                                                    style={{
                                                        width:
                                                            '100%',

                                                        height:
                                                            '100%',

                                                        objectFit:
                                                            'contain',

                                                        display:
                                                            'block',
                                                    }}
                                                />
                                            ) : image ? (
                                                <ImageIcon
                                                    size={
                                                        54
                                                    }
                                                    className="text-primary"
                                                />
                                            ) : (
                                                <ExistingFileTypePreview
                                                    file={
                                                        file
                                                    }
                                                    className={
                                                        classNames?.previewFileIcon
                                                    }
                                                />
                                            )}
                                        </div>

                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Existing File Size
                                        |--------------------------------------------------------------------------
                                        */}

                                        {typeof file.size ===
                                            'number' && (
                                            <div
                                                className={cn(
                                                    'text-muted small mt-2',

                                                    classNames?.previewMeta,
                                                )}
                                            >
                                                {formatFileSizeMB(
                                                    file.size,
                                                )}
                                            </div>
                                        )}

                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Remove Existing File
                                        |--------------------------------------------------------------------------
                                        */}

                                        <button
                                            type="button"
                                            className={cn(
                                                'btn btn-link btn-sm',

                                                'text-danger text-decoration-none',

                                                'p-0 mt-1',

                                                classNames?.removeButton,
                                            )}
                                            disabled={
                                                disabled
                                            }
                                            onClick={(
                                                event,
                                            ) => {
                                                event.stopPropagation();

                                                removeExistingFile(
                                                    file,
                                                );
                                            }}
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                );
                            },
                        )}

                        {/*
                        |--------------------------------------------------------------------------
                        | Newly Selected Files
                        |--------------------------------------------------------------------------
                        */}

                        {selectedFiles.map(
                            (
                                file,
                                index,
                            ) => {
                                const image =
                                    isImageFile(
                                        file,
                                    );

                                const remove =
                                    () =>
                                        removeFile(
                                            file,
                                        );

                                /*
                                |--------------------------------------------------------------------------
                                | Custom Renderer
                                |--------------------------------------------------------------------------
                                */

                                if (
                                    renderFile
                                ) {
                                    return (
                                        <div
                                            key={getFileKey(
                                                file,
                                            )}
                                            onClick={(
                                                event,
                                            ) => {
                                                event.stopPropagation();
                                            }}
                                        >
                                            {renderFile(
                                                file,
                                                {
                                                    index,

                                                    remove,

                                                    formatSize:
                                                        formatFileSize,

                                                    isImage:
                                                        image,
                                                },
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={getFileKey(
                                            file,
                                        )}
                                        className={cn(
                                            'text-center',
  !multiple && 'w-100',
                                            classNames?.previewCard,
                                        )}
                                         style={{
        width: multiple
            ? '140px'
            : '100%',
        cursor: disabled
            ? 'not-allowed'
            : 'pointer',
    }}
                                    >
                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Thumbnail
                                        |--------------------------------------------------------------------------
                                        */}

                                        <div
                                            className={cn(
                                                'border rounded bg-light overflow-hidden',

                                                'd-flex align-items-center justify-content-center',
                                                !multiple && 'w-100',

                                                classNames?.previewThumbnail,
                                            )}
                                            style={{
                                                width:
                                                    multiple ? '140px':'100%',

                                                height:
                                                    resolvedPreviewHeight,
                                            }}
                                        >
                                            {image &&
                                            showImagePreview ? (
                                                <ImagePreview
                                                    file={
                                                        file
                                                    }
                                                    className={
                                                        classNames?.previewImage
                                                    }
                                                />
                                            ) : image ? (
                                                <ImageIcon
                                                    size={
                                                        54
                                                    }
                                                    className="text-primary"
                                                />
                                            ) : (
                                                <FileTypePreview
                                                    file={
                                                        file
                                                    }
                                                    className={
                                                        classNames?.previewFileIcon
                                                    }
                                                />
                                            )}
                                        </div>

                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Size
                                        |--------------------------------------------------------------------------
                                        */}

                                        <div
                                            className={cn(
                                                'text-muted small mt-2',

                                                classNames?.previewMeta,
                                            )}
                                        >
                                            {formatFileSizeMB(
                                                file.size,
                                            )}
                                        </div>

                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Remove New File
                                        |--------------------------------------------------------------------------
                                        */}

                                        <button
                                            type="button"
                                            className={cn(
                                                'btn btn-link btn-sm',

                                                'text-danger text-decoration-none',

                                                'p-0 mt-1',

                                                classNames?.removeButton,
                                            )}
                                            disabled={
                                                disabled
                                            }
                                            onClick={(
                                                event,
                                            ) => {
                                                event.stopPropagation();

                                                remove();
                                            }}
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                );
                            },
                        )}
                    </div>
                ) : (
                    /*
                    |--------------------------------------------------------------------------
                    | Empty Message
                    |--------------------------------------------------------------------------
                    |
                    | Only visible when there are NO existing files and NO
                    | newly selected files.
                    |
                    */

                    <div
                        className={cn(
                            'dz-message needsclick',

                            'd-flex flex-column align-items-center justify-content-center',

                            classNames?.content,
                        )}
                        style={{
                            minHeight:
                                '180px',
                        }}
                    >
                        <UploadCloud
                            size={
                                42
                            }
                            className={cn(
                                'mb-2 text-success',

                                classNames?.uploadIcon,
                            )}
                        />

                        <h6
                            className={cn(
                                'f-w-600 mb-1 text-center',

                                classNames?.title,
                            )}
                        >
                            {isDragActive
                                ? isDragReject
                                    ? 'Some files cannot be accepted.'
                                    : 'Drop the files here.'
                                : placeholder}
                        </h6>

                        {description ? (
                            <div
                                className={cn(
                                    'f-10 text-center',

                                    classNames?.description,
                                )}
                            >
                                {
                                    description
                                }
                            </div>
                        ) : (
                            <span
                                className={cn(
                                    'f-10 text-center',

                                    classNames?.description,
                                )}
                            >
                                {multiple
                                    ? `You can select up to ${maxFiles} files.`
                                    : 'Select one file.'}

                                {maxSize
                                    ? ` Maximum ${formatFileSize(
                                          maxSize,
                                      )} per file.`
                                    : ''}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/*
            |--------------------------------------------------------------------------
            | Rejection Errors
            |--------------------------------------------------------------------------
            */}

            {rejectionMessages.length >
                0 && (
                <div
                    className={cn(
                        'mt-2',

                        classNames?.rejectionWrapper,
                    )}
                >
                    {rejectionMessages.map(
                        (
                            message,
                            index,
                        ) => (
                            <div
                                key={`${message}-${index}`}
                                className={cn(
                                    'text-danger f-12',

                                    classNames?.rejectionText,
                                )}
                            >
                                {
                                    message
                                }
                            </div>
                        ),
                    )}
                </div>
            )}

            {/*
            |--------------------------------------------------------------------------
            | Optional Outside New File List
            |--------------------------------------------------------------------------
            */}

            {showFileList &&
                !previewInsideDropzone &&
                selectedFiles.length >
                    0 && (
                    <div
                        className={cn(
                            'd-flex flex-column gap-2 mt-3',

                            classNames?.fileList,
                        )}
                    >
                        {selectedFiles.map(
                            (
                                file,
                            ) => (
                                <div
                                    key={getFileKey(
                                        file,
                                    )}
                                    className={cn(
                                        'd-flex align-items-center gap-3',
                                        'border rounded p-2',

                                        classNames?.fileItem,
                                    )}
                                >
                                    <File
                                        size={
                                            32
                                        }
                                        className={cn(
                                            'text-primary',

                                            classNames?.fileIcon,
                                        )}
                                    />

                                    <div
                                        className={cn(
                                            'flex-grow-1',

                                            classNames?.fileInfo,
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'text-muted small',

                                                classNames?.fileMeta,
                                            )}
                                        >
                                            {formatFileSizeMB(
                                                file.size,
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className={cn(
                                            'btn btn-link btn-sm',

                                            'text-danger text-decoration-none',

                                            classNames?.removeButton,
                                        )}
                                        disabled={
                                            disabled
                                        }
                                        onClick={() =>
                                            removeFile(
                                                file,
                                            )
                                        }
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ),
                        )}
                    </div>
                )}

            {/*
            |--------------------------------------------------------------------------
            | Old Single Preview Compatibility
            |--------------------------------------------------------------------------
            */}

            {!hasFiles &&
                initialPreviewUrl &&
                !multiple && (
                    <div className="mt-3 text-center">
                        <img
                            src={
                                initialPreviewUrl
                            }
                            alt="Current preview"
                            style={{
                                width:
                                    '140px',

                                height:
                                    resolvedPreviewHeight,

                                objectFit:
                                    'contain',
                            }}
                            className="border rounded"
                        />
                    </div>
                )}

            {/*
            |--------------------------------------------------------------------------
            | Hint
            |--------------------------------------------------------------------------
            */}

            {hint &&
                !error && (
                <div
                    className={cn(
                        'form-text mt-2',

                        classNames?.hint,
                    )}
                >
                    {
                        hint
                    }
                </div>
            )}

            {/*
            |--------------------------------------------------------------------------
            | Error
            |--------------------------------------------------------------------------
            */}

            {error && (
                <div
                    className={cn(
                        'invalid-feedback d-block',

                        classNames?.error,
                    )}
                >
                    {
                        error
                    }
                </div>
            )}
        </div>
    );
}
