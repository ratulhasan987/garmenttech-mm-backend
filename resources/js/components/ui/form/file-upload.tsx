
// import {
//     type ReactNode,
//     useMemo,
// } from 'react';

// import {
//     FilePond,
//     registerPlugin,
// } from 'react-filepond';

// import type {
//     FilePondFile,
// } from 'filepond';

// import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

// import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

// import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';

// import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

// import { cn } from '@/lib/utils';

// /*
// |--------------------------------------------------------------------------
// | Register FilePond Plugins
// |--------------------------------------------------------------------------
// */

// registerPlugin(
//     FilePondPluginFileValidateType,
//     FilePondPluginFileValidateSize,
//     FilePondPluginImageExifOrientation,
//     FilePondPluginImagePreview,
// );

// /*
// |--------------------------------------------------------------------------
// | Types
// |--------------------------------------------------------------------------
// */

// export type FileUploadValue =
//     | File
//     | File[]
//     | null;

// export type FileUploadClassNames = {
//     root?: string;

//     label?: string;

//     wrapper?: string;

//     pond?: string;

//     hint?: string;

//     error?: string;
// };

// export interface FileUploadProps {
//     /**
//      * Controlled file value.
//      */
//     value?: FileUploadValue;

//     /**
//      * Returns either:
//      *
//      * single:
//      * File | null
//      *
//      * multiple:
//      * File[]
//      */
//     onChange: (
//         value: FileUploadValue,
//     ) => void;

//     label?: ReactNode;

//     required?: boolean;

//     error?: string;

//     hint?: ReactNode;

//     disabled?: boolean;

//     multiple?: boolean;

//     /**
//      * FilePond accepted MIME types.
//      *
//      * Example:
//      *
//      * [
//      *   'image/jpeg',
//      *   'image/png',
//      * ]
//      */
//     acceptedFileTypes?: string[];

//     /**
//      * Example:
//      *
//      * "2MB"
//      * "10MB"
//      */
//     maxFileSize?: string;

//     /**
//      * Only relevant when multiple=true.
//      */
//     maxFiles?: number;

//     /**
//      * Enables image preview for image files.
//      */
//     allowImagePreview?: boolean;

//     /**
//      * Allow drag/drop.
//      */
//     allowDrop?: boolean;

//     /**
//      * Allow click/browse.
//      */
//     allowBrowse?: boolean;

//     /**
//      * Allow removing selected files.
//      */
//     allowRemove?: boolean;

//     /**
//      * Allow reordering multiple files.
//      */
//     allowReorder?: boolean;

//     /**
//      * File input field name.
//      *
//      * FilePond itself is not submitting
//      * this to Laravel in our architecture,
//      * but useful for semantics.
//      */
//     name?: string;

//     /**
//      * FilePond idle HTML.
//      */
//     labelIdle?: string;

//     /**
//      * Custom labels.
//      */
//     labelFileTypeNotAllowed?: string;

//     fileValidateTypeLabelExpectedTypes?: string;

//     labelMaxFileSizeExceeded?: string;

//     labelMaxFileSize?: string;

//     /**
//      * Called after FilePond's file list
//      * changes.
//      */
//     onFilesUpdate?: (
//         files: File[],
//     ) => void;

//     className?: string;

//     classNames?: FileUploadClassNames;
// }

// /*
// |--------------------------------------------------------------------------
// | Component
// |--------------------------------------------------------------------------
// */

// export function FileUpload({
//     value = null,

//     onChange,

//     label,

//     required = false,

//     error,

//     hint,

//     disabled = false,

//     multiple = false,

//     acceptedFileTypes,

//     maxFileSize = '10MB',

//     maxFiles = 10,

//     allowImagePreview = true,

//     allowDrop = true,

//     allowBrowse = true,

//     allowRemove = true,

//     allowReorder = false,

//     name = 'file',

//     labelIdle =
//         'Drag & Drop your file or <span class="filepond--label-action">Browse</span>',

//     labelFileTypeNotAllowed =
//         'File type is not allowed',

//     fileValidateTypeLabelExpectedTypes =
//         'Expected {allButLastType} or {lastType}',

//     labelMaxFileSizeExceeded =
//         'File is too large',

//     labelMaxFileSize =
//         'Maximum file size is {filesize}',

//     onFilesUpdate,

//     className,

//     classNames,
// }: FileUploadProps) {
//     /*
//     |--------------------------------------------------------------------------
//     | Normalize controlled value
//     |--------------------------------------------------------------------------
//     */

//     const files =
//         useMemo<File[]>(
//             () => {
//                 if (!value) {
//                     return [];
//                 }

//                 if (
//                     Array.isArray(
//                         value,
//                     )
//                 ) {
//                     return value;
//                 }

//                 return [
//                     value,
//                 ];
//             },
//             [value],
//         );

//     /*
//     |--------------------------------------------------------------------------
//     | File update
//     |--------------------------------------------------------------------------
//     */

//     function handleUpdateFiles(
//         fileItems: FilePondFile[],
//     ) {
//         const nextFiles =
//             fileItems
//                 .map(
//                     (
//                         fileItem,
//                     ) =>
//                         fileItem.file,
//                 )
//                 .filter(
//                     (
//                         file,
//                     ): file is File =>
//                         file instanceof
//                         File,
//                 );

//         onFilesUpdate?.(
//             nextFiles,
//         );

//         if (
//             multiple
//         ) {
//             onChange(
//                 nextFiles,
//             );

//             return;
//         }

//         onChange(
//             nextFiles[0] ??
//                 null,
//         );
//     }

//     return (
//         <div
//             className={cn(
//                 className,
//                 classNames?.root,
//             )}
//         >
//             {/* Label */}

//             {label && (
//                 <label
//                     className={cn(
//                         'form-label',

//                         classNames?.label,
//                     )}
//                 >
//                     {label}

//                     {required && (
//                         <span className="text-danger ms-1">
//                             *
//                         </span>
//                     )}
//                 </label>
//             )}

//             {/* FilePond */}

//             <div
//                 className={cn(
//                     error &&
//                         'file-upload-invalid',

//                     disabled &&
//                         'opacity-75',

//                     classNames?.wrapper,
//                 )}
//             >
//                 <div
//                     className={
//                         classNames?.pond
//                     }
//                 >
//                     <FilePond
//                         files={
//                             files
//                         }
//                         name={
//                             name
//                         }
//                         disabled={
//                             disabled
//                         }
//                         allowMultiple={
//                             multiple
//                         }
//                         maxFiles={
//                             multiple
//                                 ? maxFiles
//                                 : 1
//                         }
//                         acceptedFileTypes={
//                             acceptedFileTypes
//                         }
//                         maxFileSize={
//                             maxFileSize
//                         }
//                         allowImagePreview={
//                             allowImagePreview
//                         }
//                         allowDrop={
//                             allowDrop
//                         }
//                         allowBrowse={
//                             allowBrowse
//                         }
//                         allowRemove={
//                             allowRemove
//                         }
//                         allowReorder={
//                             multiple &&
//                             allowReorder
//                         }
//                         labelIdle={
//                             labelIdle
//                         }
//                         labelFileTypeNotAllowed={
//                             labelFileTypeNotAllowed
//                         }
//                         fileValidateTypeLabelExpectedTypes={
//                             fileValidateTypeLabelExpectedTypes
//                         }
//                         labelMaxFileSizeExceeded={
//                             labelMaxFileSizeExceeded
//                         }
//                         labelMaxFileSize={
//                             labelMaxFileSize
//                         }
//                         credits={
//                             false
//                         }
//                         onupdatefiles={
//                             handleUpdateFiles
//                         }
//                     />
//                 </div>
//             </div>

//             {/* Hint */}

//             {hint &&
//                 !error && (
//                     <div
//                         className={cn(
//                             'form-text',

//                             classNames?.hint,
//                         )}
//                     >
//                         {hint}
//                     </div>
//                 )}

//             {/* Laravel Error */}

//             {error && (
//                 <div
//                     className={cn(
//                         'invalid-feedback d-block',

//                         classNames?.error,
//                     )}
//                 >
//                     {error}
//                 </div>
//             )}
//         </div>
//     );
// }
