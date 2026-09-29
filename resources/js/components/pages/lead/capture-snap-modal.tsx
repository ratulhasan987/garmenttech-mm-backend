import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { Camera, Check, Plus, RotateCcw, RotateCw, X } from 'react-feather';

import { Button } from '@/components/ui/button';
import { AppModal } from '@/components/ui/modal/app-modal';

type Side = 'front' | 'back';

type PhoneNumbers = {
    bd_phone_numbers?: string[] | null;
    foreign_phone_numbers?: string[] | null;
    corporate_phone_numbers?: string[] | null;
};

type VisitingCardData = {
    name?: string | null;
    designation?: string | null;
    company?: string | null;
    phone_numbers?: PhoneNumbers | null;
    emails?: string[] | null;
    website?: string | null;
    addresses?: string[] | null;
    social_profiles?: string[] | null;
};

type ImageState = {
    file: File | null;
    previewUrl: string | null;
    rotation: number;
    scale: number;
    translateX: number;
    translateY: number;
};

type CaptureSnapModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onExtracted: (data: VisitingCardData) => Promise<void> | void;
};

function createImageState(): ImageState {
    return {
        file: null,
        previewUrl: null,
        rotation: 0,
        scale: 1,
        translateX: 0,
        translateY: 0,
    };
}

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Could not read the image.'));
        };

        image.src = url;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Could not prepare the image.'));

                    return;
                }

                resolve(blob);
            },
            'image/jpeg',
            0.9,
        );
    });
}

async function prepareImage(
    side: Side,
    imageState: ImageState,
): Promise<File | null> {
    if (!imageState.file) {
        return null;
    }

    if (imageState.rotation === 0) {
        return imageState.file;
    }

    const image = await loadImage(imageState.file);

    const swapDimensions =
        imageState.rotation === 90 || imageState.rotation === 270;

    const canvas = document.createElement('canvas');

    canvas.width = swapDimensions ? image.naturalHeight : image.naturalWidth;

    canvas.height = swapDimensions ? image.naturalWidth : image.naturalHeight;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Image rotation is not supported.');
    }

    context.translate(canvas.width / 2, canvas.height / 2);

    context.rotate((imageState.rotation * Math.PI) / 180);

    context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

    const blob = await canvasToBlob(canvas);

    return new File([blob], `${side}-visiting-card.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
    });
}

export function CaptureSnapModal({
    open,
    onOpenChange,
    onExtracted,
}: CaptureSnapModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const viewerRef = useRef<HTMLDivElement>(null);

    const pointersRef = useRef(new Map<number, { x: number; y: number }>());

    const gestureRef = useRef({
        previousX: 0,
        previousY: 0,
        initialDistance: 0,
        initialScale: 1,
        previousCenterX: 0,
        previousCenterY: 0,
    });

    const [isDragging, setIsDragging] = useState(false);

    const [activeSide, setActiveSide] = useState<Side>('front');

    const [front, setFront] = useState<ImageState>(createImageState());

    const [back, setBack] = useState<ImageState>(createImageState());

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const activeImage = activeSide === 'front' ? front : back;

    const setActiveImage = (updater: (current: ImageState) => ImageState) => {
        if (activeSide === 'front') {
            setFront(updater);

            return;
        }

        setBack(updater);
    };

    const resetScanner = () => {
        if (front.previewUrl) {
            URL.revokeObjectURL(front.previewUrl);
        }

        if (back.previewUrl) {
            URL.revokeObjectURL(back.previewUrl);
        }

        setFront(createImageState());
        setBack(createImageState());
        setActiveSide('front');
        setError('');
    };

    useEffect(() => {
        if (!open) {
            resetScanner();
        }
    }, [open]);

    const previewUrlsRef = useRef<{
        front: string | null;
        back: string | null;
    }>({
        front: null,
        back: null,
    });

    useEffect(() => {
        previewUrlsRef.current = {
            front: front.previewUrl,
            back: back.previewUrl,
        };
    }, [front.previewUrl, back.previewUrl]);

    useEffect(() => {
        return () => {
            if (previewUrlsRef.current.front) {
                URL.revokeObjectURL(previewUrlsRef.current.front);
            }

            if (previewUrlsRef.current.back) {
                URL.revokeObjectURL(previewUrlsRef.current.back);
            }
        };
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        event.target.value = '';

        if (!file) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            setError('Please select a JPEG, PNG, or WEBP image.');

            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Maximum image size is 10 MB.');

            return;
        }

        setError('');

        setActiveImage((current) => {
            if (current.previewUrl) {
                URL.revokeObjectURL(current.previewUrl);
            }

            return {
                file,
                previewUrl: URL.createObjectURL(file),
                rotation: 0,
                scale: 1,
                translateX: 0,
                translateY: 0,
            };
        });
    };

    const rotateImage = (amount: number) => {
        setActiveImage((current) => ({
            ...current,
            rotation: (current.rotation + amount + 360) % 360,
            translateX: 0,
            translateY: 0,
        }));
    };

    const clampScale = (value: number) => {
        return Math.min(Math.max(value, 0.5), 5);
    };

    const getDistance = (
        first: { x: number; y: number },
        second: { x: number; y: number },
    ) => {
        return Math.hypot(second.x - first.x, second.y - first.y);
    };

    const getCenter = (
        first: { x: number; y: number },
        second: { x: number; y: number },
    ) => {
        return {
            x: (first.x + second.x) / 2,
            y: (first.y + second.y) / 2,
        };
    };

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!activeImage.file || processing) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);

        pointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        const pointers = Array.from(pointersRef.current.values());

        if (pointers.length === 1) {
            gestureRef.current.previousX = event.clientX;
            gestureRef.current.previousY = event.clientY;

            setIsDragging(true);
        }

        if (pointers.length === 2) {
            const [first, second] = pointers;
            const center = getCenter(first, second);

            gestureRef.current.initialDistance = getDistance(first, second);

            gestureRef.current.initialScale = activeImage.scale;
            gestureRef.current.previousCenterX = center.x;
            gestureRef.current.previousCenterY = center.y;

            setIsDragging(true);
        }
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!activeImage.file || !pointersRef.current.has(event.pointerId)) {
            return;
        }

        pointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        const pointers = Array.from(pointersRef.current.values());

        if (pointers.length === 1) {
            const deltaX = event.clientX - gestureRef.current.previousX;

            const deltaY = event.clientY - gestureRef.current.previousY;

            setActiveImage((current) => ({
                ...current,
                translateX: current.translateX + deltaX,
                translateY: current.translateY + deltaY,
            }));

            gestureRef.current.previousX = event.clientX;
            gestureRef.current.previousY = event.clientY;

            return;
        }

        if (pointers.length === 2) {
            const [first, second] = pointers;

            const distance = getDistance(first, second);
            const center = getCenter(first, second);

            const zoomRatio = distance / gestureRef.current.initialDistance;

            const nextScale = clampScale(
                gestureRef.current.initialScale * zoomRatio,
            );

            const deltaX = center.x - gestureRef.current.previousCenterX;

            const deltaY = center.y - gestureRef.current.previousCenterY;

            setActiveImage((current) => ({
                ...current,
                scale: nextScale,
                translateX: current.translateX + deltaX,
                translateY: current.translateY + deltaY,
            }));

            gestureRef.current.previousCenterX = center.x;
            gestureRef.current.previousCenterY = center.y;
        }
    };

    const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
        pointersRef.current.delete(event.pointerId);

        const pointers = Array.from(pointersRef.current.values());

        if (pointers.length === 1) {
            gestureRef.current.previousX = pointers[0].x;
            gestureRef.current.previousY = pointers[0].y;

            return;
        }

        if (pointers.length === 0) {
            setIsDragging(false);
        }
    };

    const resetImageView = () => {
        setActiveImage((current) => ({
            ...current,
            rotation: 0,
            scale: 1,
            translateX: 0,
            translateY: 0,
        }));
    };

    const handleCapture = () => {
        inputRef.current?.click();
    };

    const handleAddBack = () => {
        setActiveSide('back');

        window.setTimeout(() => {
            inputRef.current?.click();
        }, 100);
    };

    const handleExtract = async () => {
        if (!front.file) {
            setError('Please capture the front side first.');

            return;
        }

        setProcessing(true);
        setError('');

        try {
            const frontImage = await prepareImage('front', front);

            const backImage = await prepareImage('back', back);

            if (!frontImage) {
                throw new Error('Please capture the front side first.');
            }

            const formData = new FormData();

            formData.append('image', frontImage, frontImage.name);

            if (backImage) {
                formData.append('back_image', backImage, backImage.name);
            }

            const response = await fetch('/lead/parse-card', {
                method: 'POST',
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok || !responseData.success) {
                throw new Error(
                    responseData.message || 'Unable to extract information.',
                );
            }

            await onExtracted(responseData.data);

            onOpenChange(false);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Unable to extract information.',
            );
        } finally {
            setProcessing(false);
        }
    };

    const hasFrontImage = Boolean(front.file);
    const hasBackImage = Boolean(back.file);

    useEffect(() => {
        const viewer = viewerRef.current;

        if (!viewer) {
            return;
        }

        const handleNativeWheel = (event: WheelEvent) => {
            if (!activeImage.file || processing) {
                return;
            }

            /*
        |--------------------------------------------------------------------------
        | Prevent the browser/page from scrolling while zooming the image
        |--------------------------------------------------------------------------
        */

            event.preventDefault();

            const zoomAmount = event.deltaY < 0 ? 0.15 : -0.15;

            setActiveImage((current) => ({
                ...current,
                scale: clampScale(current.scale + zoomAmount),
            }));
        };

        viewer.addEventListener('wheel', handleNativeWheel, {
            passive: false,
        });

        return () => {
            viewer.removeEventListener('wheel', handleNativeWheel);
        };
    }, [activeImage.file, activeSide, processing]);

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Card Scanner"
            closeOnBackdropClick={false}
        >
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                <div>
                    <div className="fw-semibold">
                        Capture and save contact information
                    </div>

                    <small className="text-muted">
                        Capture the front side first. Back side is optional.
                    </small>
                </div>

                {(hasFrontImage || hasBackImage) && (
                    <Button
                        type="button"
                        variant="light"
                        size="sm"
                        onClick={resetScanner}
                        disabled={processing}
                    >
                        <X size={15} className="me-1" />
                        New scan
                    </Button>
                )}
            </div>

            <div className="d-flex rounded p-1 bg-light mb-3">
                <button
                    type="button"
                    onClick={() => setActiveSide('front')}
                    className={`btn flex-fill btn-sm ${
                        activeSide === 'front'
                            ? 'btn-white shadow-sm fw-semibold bg-white text-muted'
                            : 'text-muted'
                    }`}
                    disabled={processing}
                >
                    Front
                    {hasFrontImage && (
                        <Check size={15} className="ms-1 text-success" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSide('back')}
                    className={`btn flex-fill btn-sm ${
                        activeSide === 'back'
                            ? 'btn-white shadow-sm fw-semibold bg-white text-muted'
                            : 'text-muted'
                    }`}
                    disabled={processing}
                >
                    Back
                    <small className="ms-1">(Optional)</small>
                    {hasBackImage && (
                        <Check size={15} className="ms-1 text-success" />
                    )}
                </button>
            </div>

            <div
                ref={viewerRef}
                className="position-relative d-flex align-items-center justify-content-center overflow-hidden rounded border bg-light"
                style={{
                    height: 330,
                    touchAction: 'none',
                    cursor: activeImage.file
                        ? isDragging
                            ? 'grabbing'
                            : 'grab'
                        : 'default',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                // onWheel={handleWheel}
            >
                {activeImage.previewUrl ? (
                    <>
                        <img
                            src={activeImage.previewUrl}
                            alt={`${activeSide} side visiting card`}
                            draggable={false}
                            className="mw-100 mh-100 object-fit-contain user-select-none"
                            style={{
                                transform: `
                        translate3d(
                            ${activeImage.translateX}px,
                            ${activeImage.translateY}px,
                            0
                        )
                        rotate(${activeImage.rotation}deg)
                        scale(${activeImage.scale})
                    `,
                                transformOrigin: 'center',
                                transition: isDragging
                                    ? 'none'
                                    : 'transform 150ms ease',
                                pointerEvents: 'none',
                            }}
                        />

                        <span className="position-absolute top-0 start-0 m-3 badge bg-dark text-uppercase">
                            {activeSide}
                        </span>
                    </>
                ) : (
                    <div className="text-center px-4">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary mb-3">
                            <Camera size={30} />
                        </div>

                        <h6 className="mb-1">Capture {activeSide} side</h6>

                        <small className="text-muted">
                            {activeSide === 'front'
                                ? 'Keep the complete visiting card visible.'
                                : 'Capture any additional information.'}
                        </small>
                    </div>
                )}

                {processing && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
                        <div className="text-center">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            />

                            <p className="fw-semibold mt-3 mb-0">
                                Reading your card
                            </p>

                            <small className="text-muted">
                                This may take a moment.
                            </small>
                        </div>
                    </div>
                )}
            </div>

            {activeImage.file && (
                <div className="d-flex align-items-center justify-content-between mt-2">
                    <small className="text-muted">
                        Pinch to zoom · Drag to move · Use mouse wheel to zoom
                    </small>

                    <div className="d-flex align-items-center gap-1">
                        <button
                            className="btn btn-link"
                            type="button"
                            onClick={() => rotateImage(-90)}
                            disabled={processing}
                            style={{
                                padding: '8px 4px',
                            }}
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            className="btn btn-link"
                            type="button"
                            onClick={() => rotateImage(90)}
                            disabled={processing}
                            style={{
                                padding: '8px 4px',
                            }}
                        >
                            <RotateCw size={16} />
                        </button>
                        {/* <Button
                            type="button"
                            variant="light"
                            size="sm"
                            title="Rotate left"
                            onClick={() => rotateImage(-90)}
                            disabled={processing}
                        >
                            <RotateCcw size={16} />
                        </Button> */}

                        {/* <Button
                            type="button"
                            variant="light"
                            size="sm"
                            title="Rotate right"
                            onClick={() => rotateImage(90)}
                            disabled={processing}
                        >
                            <RotateCw size={16} />
                        </Button> */}

                        <Button
                            type="button"
                            variant="light"
                            size="sm"
                            onClick={resetImageView}
                            disabled={processing}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="d-none"
                onChange={handleFileChange}
            />

            {error && (
                <div className="alert alert-danger py-2 mt-3 mb-0">{error}</div>
            )}

            <div className="d-flex flex-column gap-2 mt-3">
                <Button
                    type="button"
                    variant="primary"
                    onClick={handleCapture}
                    disabled={processing}
                    className="w-100"
                    leftIcon={<Camera size={16} />}
                >
                    {activeImage.file
                        ? `Retake ${activeSide} side`
                        : `Capture ${activeSide} side`}
                </Button>

                {hasFrontImage && !hasBackImage && activeSide === 'front' && (
                    <Button
                        type="button"
                        variant="light"
                        onClick={handleAddBack}
                        disabled={processing}
                        leftIcon={<Plus size={16} />}
                        className="w-100"
                    >
                        Add back side
                    </Button>
                )}

                <Button
                    type="button"
                    variant="dark"
                    onClick={handleExtract}
                    disabled={!hasFrontImage || processing}
                    className="w-100"
                >
                    {processing ? 'Extracting...' : 'Extract information'}
                </Button>
            </div>
        </AppModal>
    );
}
