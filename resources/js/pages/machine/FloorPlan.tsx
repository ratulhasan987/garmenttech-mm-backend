import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, X, Shuffle, Trash2, AlertTriangle, PlusCircle, Cpu, MapPin, Info, CheckCircle, Layers } from 'react-feather';
import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';

type MachineData = {
    id: number;
    machine_id: string;
    model_name: string;
    status: string;
    sl_no: string;
    floor_id: number;
    building_name: string;
    floor_number: number;
};

type FloorData = {
    id: number;
    name: string;
    floor_number: number;
    building_id: number;
    building?: { id: number; name: string; };
    line_amount: number;
    max_machine_per_line: number;
};

type UnassignedMachineData = {
    id: number;
    machine_id: string;
    model_name: string;
    status: string;
};

type Props = {
    floor: FloorData;
    allMachines: MachineData[];
    allFloors: FloorData[];
    unassignedMachines: UnassignedMachineData[];
};

export default function FloorPlan({ floor, allMachines, allFloors, unassignedMachines }: Props) {
    const [draggingMachine, setDraggingMachine] = useState<number | null>(null);
    const [crossFloorMode, setCrossFloorMode] = useState(false);
    const [targetFloorId, setTargetFloorId] = useState<string>('');
    const [showConfirmMove, setShowConfirmMove] = useState(false);

    const [pendingCrossMove, setPendingCrossMove] = useState<{
        machineId: number;
        targetFloorId: number;
        slotNo: number;
    } | null>(null);

    const [unassignMachineIds, setUnassignMachineIds] = useState<number[]>([]);
    const [showUnassignModal, setShowUnassignModal] = useState(false);

    const [showCrossFloorAlert, setShowCrossFloorAlert] = useState(false);

    const [selectedEmptySlot, setSelectedEmptySlot] = useState<{ floorId: number; slotNo: number } | null>(null);
    const [showUnassignedMachinesModal, setShowUnassignedMachinesModal] = useState(false);
    const [hoveredUnassignedId, setHoveredUnassignedId] = useState<number | null>(null);
    const [pendingAddMachine, setPendingAddMachine] = useState<UnassignedMachineData | null>(null);

    const currentMachines = allMachines
        .filter(m => m.floor_id === floor.id)
        .sort((a, b) => parseInt(a.sl_no) - parseInt(b.sl_no));

    const targetMachines = allMachines
        .filter(m => m.floor_id === parseInt(targetFloorId))
        .sort((a, b) => parseInt(a.sl_no) - parseInt(b.sl_no));

    const targetFloor = allFloors.find(f => f.id === parseInt(targetFloorId));

    const machineBySlot: Record<number, MachineData> = {};
    currentMachines.forEach(m => {
        const slot = parseInt(m.sl_no);
        if (!isNaN(slot) && slot >= 1) machineBySlot[slot] = m;
    });

    const targetMachineBySlot: Record<number, MachineData> = {};
    targetMachines.forEach(m => {
        const slot = parseInt(m.sl_no);
        if (!isNaN(slot) && slot >= 1) targetMachineBySlot[slot] = m;
    });

    const totalSlots = (floor.line_amount || 0) * (floor.max_machine_per_line || 0);
    const targetLineAmount = targetFloor?.line_amount || floor.line_amount || 0;
    const targetMaxPerLine = targetFloor?.max_machine_per_line || floor.max_machine_per_line || 0;
    const targetTotalSlots = targetLineAmount * targetMaxPerLine;

    const selectedEmptySlotActive = selectedEmptySlot
        ? !allMachines.some(m =>
            m.floor_id === selectedEmptySlot.floorId
            && parseInt(m.sl_no) === selectedEmptySlot.slotNo
        )
        : false;

    // --- Drag start ---
    const handleDragStart = (e: React.DragEvent, machineId: number) => {
        e.dataTransfer.setData('machineId', String(machineId));
        setDraggingMachine(machineId);
    };

    const handleDropToSlot = (e: React.DragEvent, slotNo: number, floorId: number, slotMap: Record<number, MachineData>) => {
        e.preventDefault();
        const draggedMachineId = parseInt(e.dataTransfer.getData('machineId'));
        if (!draggedMachineId) { setDraggingMachine(null); return; }

        const machineAtSlot = slotMap[slotNo];
        const shouldPreserve = crossFloorMode;

        if (machineAtSlot && machineAtSlot.id !== draggedMachineId) {
            router.post('/machine-location/swap', {
                machine1_id: draggedMachineId,
                machine2_id: machineAtSlot.id,
            }, { preserveScroll: true, preserveState: shouldPreserve });
        } else if (!machineAtSlot) {
            router.post('/machine-location/move-to-slot', {
                machine_id: draggedMachineId,
                floor_id: floorId,
                sl_no: String(slotNo),
            }, { preserveScroll: true, preserveState: shouldPreserve });
        }
        setDraggingMachine(null);
    };

    const handleCrossFloorDrop = (e: React.DragEvent, slotNo: number, targetFloorIdNum: number, slotMap: Record<number, MachineData>) => {
        e.preventDefault();
        const draggedMachineId = parseInt(e.dataTransfer.getData('machineId'));
        if (!draggedMachineId) { setDraggingMachine(null); return; }

        const machineAtSlot = slotMap[slotNo];

        if (machineAtSlot) {
            setShowCrossFloorAlert(true);
            setDraggingMachine(null);
            return;
        }

        setPendingCrossMove({
            machineId: draggedMachineId,
            targetFloorId: targetFloorIdNum,
            slotNo,
        });
        setShowConfirmMove(true);
        setDraggingMachine(null);
    };

    const confirmCrossFloorMove = () => {
        if (!pendingCrossMove) return;
        router.post('/machine-location/move-to-slot', {
            machine_id: pendingCrossMove.machineId,
            floor_id: pendingCrossMove.targetFloorId,
            sl_no: String(pendingCrossMove.slotNo),
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowConfirmMove(false);
                setPendingCrossMove(null);
            }
        });
    };

    const toggleUnassignSelect = (machineId: number) => {
        setUnassignMachineIds(prev =>
            prev.includes(machineId) ? prev.filter(id => id !== machineId) : [...prev, machineId]
        );
    };

    const confirmUnassign = () => {
        if (unassignMachineIds.length === 0) return;
        router.post('/machine-location/bulk-remove', {
            machine_ids: unassignMachineIds,
        }, {
            preserveScroll: true,
            preserveState: crossFloorMode,
            onSuccess: () => {
                setShowUnassignModal(false);
                setUnassignMachineIds([]);
            }
        });
    };

    const confirmAddUnassigned = () => {
        if (!pendingAddMachine || !selectedEmptySlot) return;
        router.post('/machine-location/move-to-slot', {
            machine_id: pendingAddMachine.id,
            floor_id: selectedEmptySlot.floorId,
            sl_no: String(selectedEmptySlot.slotNo),
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowUnassignedMachinesModal(false);
                setPendingAddMachine(null);
                setSelectedEmptySlot(null);
                setHoveredUnassignedId(null);
            }
        });
    };

    // ===== STYLE HELPERS (visual only) =====
    const btnStyle = (variant: 'primary' | 'danger' | 'warning' | 'success' | 'outline' | 'dark', disabled = false): React.CSSProperties => {
        const colors: Record<string, { bg: string; fg: string; bd: string }> = {
            primary: { bg: '#4f46e5', fg: '#fff', bd: '#4f46e5' },
            danger:  { bg: '#dc2626', fg: '#fff', bd: '#dc2626' },
            warning: { bg: '#d97706', fg: '#fff', bd: '#d97706' },
            success: { bg: '#16a34a', fg: '#fff', bd: '#16a34a' },
            outline: { bg: '#fff', fg: '#475569', bd: '#cbd5e1' },
            dark:    { bg: '#1e293b', fg: '#fff', bd: '#1e293b' },
        };
        const c = colors[variant];
        return {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.42rem 0.85rem',
            borderRadius: '8px',
            fontSize: 'clamp(0.72rem, 2vw, 0.8rem)',
            fontWeight: 600,
            border: `1px solid ${c.bd}`,
            background: c.bg,
            color: c.fg,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            opacity: disabled ? 0.5 : 1,
        };
    };

    const cardStyle: React.CSSProperties = {
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.04)',
        overflow: 'hidden',
        background: '#fff',
    };

    const modalOverlay: React.CSSProperties = {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '1rem',
    };

    const modalContent = (maxWidth: string): React.CSSProperties => ({
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(15,23,42,0.25)',
        maxWidth,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
    });

    const modalHeaderStyle: React.CSSProperties = {
        padding: '0.85rem 1.1rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    };

    const modalBodyStyle: React.CSSProperties = {
        padding: '1.1rem',
    };

    const modalFooterStyle: React.CSSProperties = {
        padding: '0.85rem 1.1rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem',
    };

    const closeBtnStyle: React.CSSProperties = {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.25rem',
        borderRadius: '6px',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
    };

    const bannerStyle = (variant: 'info' | 'warning'): React.CSSProperties => {
        const styles = {
            info:    { bg: '#eff6ff', bd: '#bfdbfe', fg: '#1e40af' },
            warning: { bg: '#fffbeb', bd: '#fde68a', fg: '#92400e' },
        };
        const s = styles[variant];
        return {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.6rem 1rem',
            borderRadius: '10px',
            fontSize: 'clamp(0.72rem, 2.5vw, 0.82rem)',
            marginBottom: '0.75rem',
            background: s.bg,
            border: `1px solid ${s.bd}`,
            color: s.fg,
            lineHeight: 1.5,
        };
    };

    const iconChip = (bg: string, color: string, size = 28): React.CSSProperties => ({
        width: `${size}px`,
        height: `${size}px`,
        background: bg,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    });

    // ===== GRID STYLES =====
    const gridWrapperStyle: React.CSSProperties = {
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '4px',
    };

    const buildGridStyle = (lineAmount: number, maxPerLine: number, gap: string): React.CSSProperties => ({
        display: 'grid',
        gridTemplateColumns: `repeat(${lineAmount}, minmax(48px, 1fr))`,
        gridTemplateRows: `repeat(${maxPerLine}, minmax(48px, auto))`,
        gridAutoFlow: 'column',
        gap,
        minWidth: `${lineAmount * 50}px`,
        margin: '0 auto',
    });

    // ===== SLOT RENDERER (modernized visuals, same logic) =====
    const renderGridSlot = (
        slotNo: number,
        machine: MachineData | undefined,
        slotFloorId: number,
        slotMap: Record<number, MachineData>,
        lineAmount: number,
        maxPerLine: number
    ) => {
        const isSource = slotFloorId === floor.id;
        const inUnassignMode = !crossFloorMode && unassignMachineIds.length > 0;
        const isUnassignSelected = machine && unassignMachineIds.includes(machine.id);
        const isSelectedEmptySlot = !machine
            && selectedEmptySlot?.floorId === slotFloorId
            && selectedEmptySlot?.slotNo === slotNo;

        let slotBg = '#f8fafc';
        let slotBorder = '1.5px dashed #cbd5e1';
        let slotShadow = 'none';

        if (machine) {
            if (isUnassignSelected) {
                slotBg = '#fee2e2';
                slotBorder = '2px solid #ef4444';
                slotShadow = '0 0 0 3px rgba(239,68,68,0.12)';
            } else {
                slotBg = '#ffffff';
                slotBorder = '1.5px solid #e2e8f0';
                slotShadow = '0 1px 3px rgba(15,23,42,0.06)';
            }
        } else if (isSelectedEmptySlot) {
            slotBg = '#fffbeb';
            slotBorder = '2px solid #f59e0b';
            slotShadow = '0 0 0 3px rgba(245,158,11,0.12)';
        }

        return (
            <div
                key={slotNo}
                onClick={() => {
                    if (machine) {
                        toggleUnassignSelect(machine.id);
                    } else {
                        if (isSelectedEmptySlot) {
                            setSelectedEmptySlot(null);
                        } else {
                            setSelectedEmptySlot({ floorId: slotFloorId, slotNo });
                        }
                    }
                }}
                onDrop={(e) => {
                    if (crossFloorMode) {
                        const draggedMachineId = parseInt(e.dataTransfer.getData('machineId'));
                        const draggedMachine = allMachines.find(m => m.id === draggedMachineId);
                        const isSameFloor = draggedMachine?.floor_id === slotFloorId;

                        if (isSameFloor) {
                            handleDropToSlot(e, slotNo, slotFloorId, slotMap);
                        } else {
                            handleCrossFloorDrop(e, slotNo, slotFloorId, slotMap);
                        }
                    } else if (!inUnassignMode) {
                        handleDropToSlot(e, slotNo, floor.id, machineBySlot);
                    }
                }}
                onDragOver={(e) => {
                    if (crossFloorMode || (!crossFloorMode && !inUnassignMode)) {
                        e.preventDefault();
                    }
                }}
                className="d-flex flex-column align-items-center justify-content-center position-relative"
                style={{
                    minHeight: 'clamp(65px, 14vw, 110px)',
                    padding: 'clamp(2px, 0.6vw, 8px)',
                    cursor: machine
                        ? (crossFloorMode ? 'grab' : (inUnassignMode ? 'pointer' : 'grab'))
                        : 'pointer',
                    backgroundColor: slotBg,
                    border: slotBorder,
                    borderRadius: '10px',
                    boxShadow: slotShadow,
                    touchAction: 'manipulation',
                    transition: 'all 0.15s ease',
                }}
            >
                <small
                    className="position-absolute"
                    style={{
                        top: '3px',
                        left: '5px',
                        fontSize: 'clamp(0.5rem, 1.8vw, 0.65rem)',
                        color: '#94a3b8',
                        fontWeight: 600,
                    }}
                >
                    #{slotNo}
                </small>
             {machine ? (
    <div
        draggable={crossFloorMode ? true : (!inUnassignMode)}
        onDragStart={(e) => {
            if (crossFloorMode || (!crossFloorMode && !inUnassignMode)) {
                handleDragStart(e, machine.id);
            } else {
                e.preventDefault();
            }
        }}
        className="d-flex flex-column align-items-center justify-content-center w-100 h-100"
    >
        <Cpu
            size={14}
            style={{
                color: isUnassignSelected ? 'rgba(255,255,255,0.85)' : '#94a3b8',
                marginBottom: '2px',
                flexShrink: 0,
            }}
        />
        <span
            className="mb-1"
            style={{
                display: 'inline-block',
                fontSize: 'clamp(0.5rem, 1.6vw, 0.68rem)',
                fontWeight: 600,
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                background: isUnassignSelected ? 'rgba(255,255,255,0.25)' : '#eef2ff',
                color: isUnassignSelected ? '#fff' : '#4f46e5',
            }}
        >
            SL: {machine.sl_no}
        </span>
        <strong
            className="text-center"
            style={{
                fontSize: 'clamp(0.55rem, 2vw, 0.8rem)',
                color: isUnassignSelected ? '#fff' : '#0f172a',
                lineHeight: 1.2,
            }}
        >
            {machine.machine_id}
        </strong>
        <small
            className="text-center"
            style={{
                fontSize: 'clamp(6px, 1.5vw, 10px)',
                color: isUnassignSelected ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                marginTop: '1px',
            }}
        >
            {machine.model_name}
        </small>
    </div>
) : (
    <div style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)', color: '#cbd5e1', fontWeight: 500 }}>
        Empty
    </div>
)}
            </div>
        );
    };

    const renderGrid = (
        lineAmount: number,
        maxPerLine: number,
        total: number,
        slotFloorId: number,
        slotMap: Record<number, MachineData>,
        gap = 'clamp(3px, 0.8vw, 8px)'
    ) => {
        if (total <= 0) {
            return (
                <div className="text-center mt-5" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Grid not configured.
                </div>
            );
        }
        return (
            <div style={gridWrapperStyle}>
                <div style={buildGridStyle(lineAmount, maxPerLine, gap)}>
                    {Array.from({ length: total }).map((_, i) =>
                        renderGridSlot(i + 1, slotMap[i + 1], slotFloorId, slotMap, lineAmount, maxPerLine)
                    )}
                </div>
            </div>
        );
    };

    // ===== MAIN RENDER =====
    return (
        <>
            <Head title={`Floor ${floor.floor_number} Plan`} />
            <PageTitle title={`Floor ${floor.floor_number} Plan (${floor.building?.name})`} />

            <div className="container-fluid">
                {/* Header bar */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <button
                        onClick={() => window.history.back()}
                        style={btnStyle('outline')}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                    >
                        <ArrowLeft size={16} />
                        <span className="d-none d-sm-inline">Back to Buildings</span>
                        <span className="d-inline d-sm-none">Back</span>
                    </button>

                    <div className="d-flex gap-2 flex-wrap align-items-center">
                        <button
                            onClick={() => selectedEmptySlotActive && setShowUnassignedMachinesModal(true)}
                            disabled={!selectedEmptySlotActive}
                            style={btnStyle('warning', !selectedEmptySlotActive)}
                            title={selectedEmptySlotActive ? `Add to slot #${selectedEmptySlot?.slotNo}` : 'Click an empty slot first'}
                        >
                            <PlusCircle size={16} />
                            <span className="d-none d-sm-inline">Unassigned Machines</span>
                            <span className="d-inline d-sm-none">Unassigned</span>
                            {selectedEmptySlotActive && (
                                <span style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    color: '#fff',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    marginLeft: '0.2rem',
                                }}>
                                    #{selectedEmptySlot?.slotNo}
                                </span>
                            )}
                        </button>

                        {unassignMachineIds.length > 0 && (
                            <>
                                <button onClick={() => setShowUnassignModal(true)} style={btnStyle('danger')}>
                                    <Trash2 size={16} /> Unassign ({unassignMachineIds.length})
                                </button>
                                <button onClick={() => setUnassignMachineIds([])} style={btnStyle('outline')}>
                                    <X size={16} /> Clear
                                </button>
                            </>
                        )}

                        {!crossFloorMode ? (
                            <Button onClick={() => setCrossFloorMode(true)} style={btnStyle('primary')}>
                                <Shuffle size={16} />
                                <span className="d-none d-sm-inline">Change with other floor</span>
                                <span className="d-inline d-sm-none">Other Floor</span>
                            </Button>
                        ) : (
                            <button onClick={() => setCrossFloorMode(false)} style={btnStyle('danger')}>
                                <X size={16} />
                                <span className="d-none d-sm-inline">Exit Cross-Floor Mode</span>
                                <span className="d-inline d-sm-none">Exit</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                {!crossFloorMode && unassignMachineIds.length > 0 && (
                    <div style={bannerStyle('info')}>
                        <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span>
                            <strong>Unassign Mode:</strong> Click machines to select. Drag-drop is disabled until you clear selection.
                        </span>
                    </div>
                )}

                {crossFloorMode && (
                    <div style={bannerStyle('warning')}>
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span>
                            <strong>Cross-Floor Drag Mode:</strong> Drag machines to empty slots on either floor. Same-floor swaps are instant. Cross-floor moves ask for confirmation. Dropping onto an occupied slot on the other floor is not allowed.
                        </span>
                    </div>
                )}

                {selectedEmptySlotActive && (
                    <div style={{
                        ...bannerStyle('warning'),
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} style={{ flexShrink: 0 }} />
                            <span>
                                <strong>Add Mode:</strong> Empty slot #{selectedEmptySlot?.slotNo} selected. Click <em>Unassigned Machines</em> to pick a machine to place there.
                            </span>
                        </span>
                        <button style={btnStyle('outline')} onClick={() => setSelectedEmptySlot(null)}>
                            <X size={14} /> Clear selection
                        </button>
                    </div>
                )}

                {/* Main grid area */}
                {!crossFloorMode ? (
                    <div style={cardStyle}>
                        {/* Card header */}
                        <div style={{
                            padding: '0.85rem 1.1rem',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            background: '#f8fafc',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={iconChip('#eef2ff', '#4f46e5')}>
                                    <Layers size={16} style={{ color: '#4f46e5' }} />
                                </div>
                                <div>
                                    <strong style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: '#0f172a' }}>
                                        Floor Layout — {floor.line_amount} cols × {floor.max_machine_per_line} rows
                                    </strong>
                                    <small style={{ color: '#94a3b8', fontSize: '0.72rem', marginLeft: '0.5rem' }} className="d-none d-md-inline">
                                        ({totalSlots} slots)
                                    </small>
                                </div>
                            </div>
                            <small style={{ color: '#94a3b8', fontSize: 'clamp(0.68rem, 2vw, 0.75rem)' }} className="d-none d-md-inline">
                                Drag to empty slot to place • Drag onto a machine to swap • Click empty slot to add unassigned
                            </small>
                        </div>
                        {/* Grid body */}
                        <div
                            style={{
                                position: 'relative',
                                minHeight: 'clamp(300px, 70vh, 500px)',
                                backgroundColor: '#f8fafc',
                                padding: 'clamp(8px, 2vw, 20px)',
                            }}
                        >
                            {totalSlots > 0 ? (
                                renderGrid(floor.line_amount, floor.max_machine_per_line, totalSlots, floor.id, machineBySlot, 'clamp(4px, 1vw, 10px)')
                            ) : (
                                <div className="text-center mt-5" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                    Floor grid not configured (line_amount / max_machine_per_line missing).
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="row g-3 g-lg-4">
                        {/* Source floor */}
                        <div className="col-12 col-lg-6">
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.6rem',
                            }}>
                                <div style={iconChip('#eef2ff', '#4f46e5', 28)}>
                                    <Layers size={14} style={{ color: '#4f46e5' }} />
                                </div>
                                <span style={{
                                    fontSize: 'clamp(0.82rem, 3vw, 1rem)',
                                    fontWeight: 700,
                                    color: '#4f46e5',
                                }}>
                                    Source: {floor.building?.name} - Floor {floor.floor_number}
                                </span>
                            </div>
                            <div style={{
                                ...cardStyle,
                                borderTop: '3px solid #4f46e5',
                            }}>
                                <div style={{ padding: 'clamp(6px, 1.5vw, 16px)', backgroundColor: '#f8fafc' }}>
                                    {renderGrid(floor.line_amount, floor.max_machine_per_line, totalSlots, floor.id, machineBySlot)}
                                </div>
                            </div>
                        </div>

                        {/* Target floor */}
                        <div className="col-12 col-lg-6">
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.6rem',
                                flexWrap: 'wrap',
                            }}>
                                <div style={iconChip('#dcfce7', '#16a34a', 28)}>
                                    <MapPin size={14} style={{ color: '#16a34a' }} />
                                </div>
                                <span style={{
                                    fontSize: 'clamp(0.82rem, 3vw, 1rem)',
                                    fontWeight: 700,
                                    color: '#16a34a',
                                }}>
                                    Target:
                                </span>
                                <select
                                    style={{
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: 'clamp(0.72rem, 2.5vw, 0.82rem)',
                                        minWidth: '150px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        backgroundColor: '#fff',
                                        color: '#0f172a',
                                    }}
                                    value={targetFloorId}
                                    onChange={(e) => setTargetFloorId(e.target.value)}
                                >
                                    <option value="">Select...</option>
                                    {allFloors.filter(f => f.id !== floor.id).map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.building?.name} - Fl {f.floor_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{
                                ...cardStyle,
                                borderTop: '3px solid #16a34a',
                            }}>
                                <div style={{ padding: 'clamp(6px, 1.5vw, 16px)', backgroundColor: '#f0fdf4' }}>
                                    {targetFloorId ? (
                                        renderGrid(targetLineAmount, targetMaxPerLine, targetTotalSlots, parseInt(targetFloorId), targetMachineBySlot)
                                    ) : (
                                        <div className="text-center mt-5" style={{ color: '#94a3b8', fontSize: 'clamp(0.72rem, 2.5vw, 0.85rem)' }}>
                                            Select a target floor from the dropdown.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== MODALS ===== */}

            {/* Cross-Floor Move Confirmation Modal */}
            {showConfirmMove && pendingCrossMove && (
                <div style={modalOverlay} tabIndex={-1}>
                    <div style={modalContent('400px')}>
                        <div style={modalHeaderStyle}>
                            <h5 style={{
                                margin: 0,
                                fontSize: 'clamp(0.85rem, 3vw, 1.05rem)',
                                fontWeight: 700,
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <div style={iconChip('#dcfce7', '#16a34a', 28)}>
                                    <CheckCircle size={16} style={{ color: '#16a34a' }} />
                                </div>
                                Confirm Move
                            </h5>
                            <button
                                style={closeBtnStyle}
                                onClick={() => { setShowConfirmMove(false); setPendingCrossMove(null); }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={modalBodyStyle}>
                            <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', color: '#475569', margin: '0 0 0.5rem' }}>Move machine to:</p>
                            <h6 style={{
                                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                                fontWeight: 700,
                                color: '#16a34a',
                                margin: '0 0 0.5rem',
                            }}>
                                {targetFloor?.building?.name} - Fl {targetFloor?.floor_number} (Slot #{pendingCrossMove.slotNo})
                            </h6>
                            <small style={{ color: '#94a3b8', fontSize: 'clamp(0.7rem, 2vw, 0.78rem)' }}>
                                The machine will be placed at this slot on the target floor.
                            </small>
                        </div>
                        <div style={modalFooterStyle}>
                            <button style={btnStyle('outline')} onClick={() => { setShowConfirmMove(false); setPendingCrossMove(null); }}>Cancel</button>
                            <button style={btnStyle('success')} onClick={confirmCrossFloorMove}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cross-Floor Alert Modal */}
            {showCrossFloorAlert && (
                <div style={modalOverlay} tabIndex={-1}>
                    <div style={modalContent('400px')}>
                        <div style={modalHeaderStyle}>
                            <h5 style={{
                                margin: 0,
                                fontSize: 'clamp(0.85rem, 3vw, 1.05rem)',
                                fontWeight: 700,
                                color: '#d97706',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <div style={iconChip('#fef3c7', '#d97706', 28)}>
                                    <AlertTriangle size={16} style={{ color: '#d97706' }} />
                                </div>
                                Swap Not Allowed
                            </h5>
                            <button
                                style={closeBtnStyle}
                                onClick={() => setShowCrossFloorAlert(false)}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={modalBodyStyle}>
                            <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                                You cannot swap machines across different floors.<br />
                                Please drop the machine on an <strong style={{ color: '#16a34a' }}>empty slot</strong> instead.
                            </p>
                        </div>
                        <div style={modalFooterStyle}>
                            <button style={btnStyle('warning')} onClick={() => setShowCrossFloorAlert(false)}>Got it</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unassign Confirmation Modal */}
            {showUnassignModal && unassignMachineIds.length > 0 && (
                <div style={modalOverlay} tabIndex={-1}>
                    <div style={modalContent('400px')}>
                        <div style={modalHeaderStyle}>
                            <h5 style={{
                                margin: 0,
                                fontSize: 'clamp(0.85rem, 3vw, 1.05rem)',
                                fontWeight: 700,
                                color: '#dc2626',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <div style={iconChip('#fee2e2', '#dc2626', 28)}>
                                    <Trash2 size={16} style={{ color: '#dc2626' }} />
                                </div>
                                Confirm Unassign
                            </h5>
                            <button
                                style={closeBtnStyle}
                                onClick={() => setShowUnassignModal(false)}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={modalBodyStyle}>
                            <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', color: '#475569', margin: '0 0 0.75rem' }}>
                                Unassign <strong style={{ color: '#dc2626' }}>{unassignMachineIds.length}</strong> machine(s)?
                            </p>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: '0 0 0.75rem',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                fontSize: 'clamp(0.72rem, 2.2vw, 0.82rem)',
                            }}>
                                {unassignMachineIds.map(id => {
                                    const m = allMachines.find(x => x.id === id);
                                    return m ? (
                                        <li key={id} style={{
                                            padding: '0.4rem 0.6rem',
                                            borderBottom: '1px solid #f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                        }}>
                                            <Cpu size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                            <span>
                                                <strong style={{ color: '#0f172a' }}>{m.machine_id}</strong>
                                                <span style={{ color: '#94a3b8' }}> — {m.model_name} (SL: {m.sl_no})</span>
                                            </span>
                                        </li>
                                    ) : null;
                                })}
                            </ul>
                            <small style={{ color: '#94a3b8', fontSize: 'clamp(0.7rem, 2vw, 0.78rem)', display: 'block' }}>
                                Location history will be retained.
                            </small>
                        </div>
                        <div style={modalFooterStyle}>
                            <button style={btnStyle('outline')} onClick={() => setShowUnassignModal(false)}>Cancel</button>
                            <button style={btnStyle('danger')} onClick={confirmUnassign}>
                                Yes ({unassignMachineIds.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unassigned Machines Picker Modal */}
            {showUnassignedMachinesModal && selectedEmptySlot && selectedEmptySlotActive && (
                <div style={modalOverlay} tabIndex={-1}>
                    <div style={modalContent('800px')}>
                        <div style={modalHeaderStyle}>
                            <h5 style={{
                                margin: 0,
                                fontSize: 'clamp(0.85rem, 3vw, 1.05rem)',
                                fontWeight: 700,
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <div style={iconChip('#eef2ff', '#4f46e5', 28)}>
                                    <PlusCircle size={16} style={{ color: '#4f46e5' }} />
                                </div>
                                Unassigned Machines
                            </h5>
                            <button
                                style={closeBtnStyle}
                                onClick={() => setShowUnassignedMachinesModal(false)}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={modalBodyStyle}>
                            {/* Target slot info banner */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                padding: '0.6rem 1rem',
                                borderRadius: '10px',
                                marginBottom: '0.75rem',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1e40af',
                                fontSize: 'clamp(0.72rem, 2.5vw, 0.82rem)',
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <MapPin size={14} style={{ flexShrink: 0 }} />
                                    <span><strong>Target slot:</strong> Floor ID {selectedEmptySlot.floorId} • Slot #{selectedEmptySlot.slotNo}</span>
                                </span>
                                <button style={btnStyle('outline')} onClick={() => {
                                    setShowUnassignedMachinesModal(false);
                                    setSelectedEmptySlot(null);
                                }}>
                                    <X size={14} /> Cancel
                                </button>
                            </div>

                            {unassignedMachines.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '2rem 1rem',
                                    color: '#94a3b8',
                                    fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
                                }}>
                                    <Cpu size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                                    <p style={{ margin: 0 }}>No unassigned machines available.</p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0.25rem' }}>
                                    <div className="row g-2 g-md-3">
                                        {unassignedMachines.map(m => (
                                            <div key={m.id} className="col-6 col-md-4 col-lg-3">
                                                <div
                                                    style={{
                                                        cursor: 'pointer',
                                                        minHeight: '130px',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        background: '#fff',
                                                        transition: 'all 0.15s ease',
                                                        position: 'relative',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = '#4f46e5';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.12)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                    onMouseMove={() => setHoveredUnassignedId(m.id)}
                                                    onClick={() => setPendingAddMachine(m)}
                                                >
                                                    <div
                                                        style={{
                                                            padding: '0.85rem',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            height: '100%',
                                                            filter: hoveredUnassignedId === m.id ? 'blur(2px)' : 'none',
                                                            transition: 'filter 0.15s ease',
                                                        }}
                                                    >
                                                        <Cpu size={22} style={{ color: '#94a3b8', marginBottom: '0.35rem' }} />
                                                        <strong style={{
                                                            fontSize: 'clamp(0.72rem, 2vw, 0.88rem)',
                                                            color: '#0f172a',
                                                            textAlign: 'center',
                                                            lineHeight: 1.2,
                                                        }}>
                                                            {m.machine_id}
                                                        </strong>
                                                        <small style={{
                                                            color: '#94a3b8',
                                                            fontSize: 'clamp(0.6rem, 1.8vw, 0.72rem)',
                                                            textAlign: 'center',
                                                            marginTop: '2px',
                                                        }}>
                                                            {m.model_name}
                                                        </small>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            marginTop: '0.4rem',
                                                            fontSize: 'clamp(0.55rem, 1.5vw, 0.68rem)',
                                                            fontWeight: 600,
                                                            padding: '0.1rem 0.45rem',
                                                            borderRadius: '4px',
                                                            background: m.status === 'active' ? '#dcfce7' : '#f1f5f9',
                                                            color: m.status === 'active' ? '#16a34a' : '#64748b',
                                                            textTransform: 'capitalize',
                                                        }}>
                                                            {m.status}
                                                        </span>
                                                    </div>
                                                    {/* Hover overlay */}
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0, left: 0,
                                                            width: '100%', height: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'rgba(79,70,229,0.88)',
                                                            color: 'white',
                                                            opacity: hoveredUnassignedId === m.id ? 1 : 0,
                                                            transition: 'opacity 0.15s ease',
                                                            pointerEvents: 'none',
                                                            borderRadius: '12px',
                                                        }}
                                                    >
                                                        <span style={{
                                                            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                                                            fontWeight: 700,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.3rem',
                                                        }}>
                                                            <PlusCircle size={20} /> Add
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Unassigned Machine Confirmation Modal */}
            {pendingAddMachine && selectedEmptySlot && (
                <div style={{ ...modalOverlay, zIndex: 1080 }} tabIndex={-1}>
                    <div style={modalContent('400px')}>
                        <div style={modalHeaderStyle}>
                            <h5 style={{
                                margin: 0,
                                fontSize: 'clamp(0.85rem, 3vw, 1.05rem)',
                                fontWeight: 700,
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <div style={iconChip('#dcfce7', '#16a34a', 28)}>
                                    <CheckCircle size={16} style={{ color: '#16a34a' }} />
                                </div>
                                Confirm Add
                            </h5>
                            <button
                                style={closeBtnStyle}
                                onClick={() => setPendingAddMachine(null)}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={modalBodyStyle}>
                            <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', color: '#475569', margin: '0 0 0.5rem' }}>
                                Add this machine to slot?
                            </p>
                            <h6 style={{
                                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                                fontWeight: 700,
                                color: '#16a34a',
                                margin: '0 0 0.3rem',
                            }}>
                                {pendingAddMachine.machine_id}
                            </h6>
                            <small style={{ color: '#94a3b8', fontSize: 'clamp(0.7rem, 2vw, 0.78rem)', display: 'block' }}>
                                {pendingAddMachine.model_name} — Slot #{selectedEmptySlot.slotNo}
                            </small>
                        </div>
                        <div style={modalFooterStyle}>
                            <button style={btnStyle('outline')} onClick={() => setPendingAddMachine(null)}>Cancel</button>
                            <button style={btnStyle('success')} onClick={confirmAddUnassigned}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}









// import { Head, router } from '@inertiajs/react';
// import { useState } from 'react';
// import { ArrowLeft, ArrowRight, X, Shuffle, Trash2, AlertTriangle, PlusCircle } from 'react-feather';
// import PageTitle from '@/components/page-title';

// type MachineData = {
//     id: number;
//     machine_id: string;
//     model_name: string;
//     status: string;
//     sl_no: string;
//     floor_id: number;
//     building_name: string;
//     floor_number: number;
// };

// type FloorData = {
//     id: number;
//     name: string;
//     floor_number: number;
//     building_id: number;
//     building?: { id: number; name: string; };
//     line_amount: number;
//     max_machine_per_line: number;
// };

// type UnassignedMachineData = {
//     id: number;
//     machine_id: string;
//     model_name: string;
//     status: string;
// };

// type Props = {
//     floor: FloorData;
//     allMachines: MachineData[];
//     allFloors: FloorData[];
//     unassignedMachines: UnassignedMachineData[];
// };

// export default function FloorPlan({ floor, allMachines, allFloors, unassignedMachines }: Props) {
//     const [draggingMachine, setDraggingMachine] = useState<number | null>(null);
//     const [crossFloorMode, setCrossFloorMode] = useState(false);
//     const [targetFloorId, setTargetFloorId] = useState<string>('');
//     const [showConfirmMove, setShowConfirmMove] = useState(false);

//     const [pendingCrossMove, setPendingCrossMove] = useState<{
//         machineId: number;
//         targetFloorId: number;
//         slotNo: number;
//     } | null>(null);

//     const [unassignMachineIds, setUnassignMachineIds] = useState<number[]>([]);
//     const [showUnassignModal, setShowUnassignModal] = useState(false);

//     const [showCrossFloorAlert, setShowCrossFloorAlert] = useState(false);

//     // NEW state: "add unassigned machine to empty slot" feature
//     const [selectedEmptySlot, setSelectedEmptySlot] = useState<{ floorId: number; slotNo: number } | null>(null);
//     const [showUnassignedMachinesModal, setShowUnassignedMachinesModal] = useState(false);
//     const [hoveredUnassignedId, setHoveredUnassignedId] = useState<number | null>(null);
//     const [pendingAddMachine, setPendingAddMachine] = useState<UnassignedMachineData | null>(null);

//     const currentMachines = allMachines
//         .filter(m => m.floor_id === floor.id)
//         .sort((a, b) => parseInt(a.sl_no) - parseInt(b.sl_no));

//     const targetMachines = allMachines
//         .filter(m => m.floor_id === parseInt(targetFloorId))
//         .sort((a, b) => parseInt(a.sl_no) - parseInt(b.sl_no));

//     const targetFloor = allFloors.find(f => f.id === parseInt(targetFloorId));

//     const machineBySlot: Record<number, MachineData> = {};
//     currentMachines.forEach(m => {
//         const slot = parseInt(m.sl_no);
//         if (!isNaN(slot) && slot >= 1) machineBySlot[slot] = m;
//     });

//     const targetMachineBySlot: Record<number, MachineData> = {};
//     targetMachines.forEach(m => {
//         const slot = parseInt(m.sl_no);
//         if (!isNaN(slot) && slot >= 1) targetMachineBySlot[slot] = m;
//     });

//     const totalSlots = (floor.line_amount || 0) * (floor.max_machine_per_line || 0);
//     const targetLineAmount = targetFloor?.line_amount || floor.line_amount || 0;
//     const targetMaxPerLine = targetFloor?.max_machine_per_line || floor.max_machine_per_line || 0;
//     const targetTotalSlots = targetLineAmount * targetMaxPerLine;

//     // NEW: derived — is the selected empty slot still empty? (handles data refreshes after moves)
//     const selectedEmptySlotActive = selectedEmptySlot
//         ? !allMachines.some(m =>
//             m.floor_id === selectedEmptySlot.floorId
//             && parseInt(m.sl_no) === selectedEmptySlot.slotNo
//         )
//         : false;

//     // --- Drag start ---
//     const handleDragStart = (e: React.DragEvent, machineId: number) => {
//         e.dataTransfer.setData('machineId', String(machineId));
//         setDraggingMachine(machineId);
//     };

//     const handleDropToSlot = (e: React.DragEvent, slotNo: number, floorId: number, slotMap: Record<number, MachineData>) => {
//         e.preventDefault();
//         const draggedMachineId = parseInt(e.dataTransfer.getData('machineId'));
//         if (!draggedMachineId) { setDraggingMachine(null); return; }

//         const machineAtSlot = slotMap[slotNo];
//         const shouldPreserve = crossFloorMode;

//         if (machineAtSlot && machineAtSlot.id !== draggedMachineId) {
//             router.post('/machine-location/swap', {
//                 machine1_id: draggedMachineId,
//                 machine2_id: machineAtSlot.id,
//             }, { preserveScroll: true, preserveState: shouldPreserve });
//         } else if (!machineAtSlot) {
//             router.post('/machine-location/move-to-slot', {
//                 machine_id: draggedMachineId,
//                 floor_id: floorId,
//                 sl_no: String(slotNo),
//             }, { preserveScroll: true, preserveState: shouldPreserve });
//         }
//         setDraggingMachine(null);
//     };

//     const handleCrossFloorDrop = (e: React.DragEvent, slotNo: number, targetFloorIdNum: number, slotMap: Record<number, MachineData>) => {
//         e.preventDefault();
//         const draggedMachineId = parseInt(e.dataTransfer.getData('machineId'));
//         if (!draggedMachineId) { setDraggingMachine(null); return; }

//         const machineAtSlot = slotMap[slotNo];

//         if (machineAtSlot) {
//             setShowCrossFloorAlert(true);
//             setDraggingMachine(null);
//             return;
//         }

//         setPendingCrossMove({
//             machineId: draggedMachineId,
//             targetFloorId: targetFloorIdNum,
//             slotNo,
//         });
//         setShowConfirmMove(true);
//         setDraggingMachine(null);
//     };

//     const confirmCrossFloorMove = () => {
//         if (!pendingCrossMove) return;
//         router.post('/machine-location/move-to-slot', {
//             machine_id: pendingCrossMove.machineId,
//             floor_id: pendingCrossMove.targetFloorId,
//             sl_no: String(pendingCrossMove.slotNo),
//         }, {
//             preserveScroll: true,
//             preserveState: true,
//             onSuccess: () => {
//                 setShowConfirmMove(false);
//                 setPendingCrossMove(null);
//             }
//         });
//     };

//     const toggleUnassignSelect = (machineId: number) => {
//         setUnassignMachineIds(prev =>
//             prev.includes(machineId) ? prev.filter(id => id !== machineId) : [...prev, machineId]
//         );
//     };

// const confirmUnassign = () => {
//     if (unassignMachineIds.length === 0) return;
//     router.post('/machine-location/bulk-remove', {
//         machine_ids: unassignMachineIds,
//     }, {
//         preserveScroll: true,
//         preserveState: crossFloorMode, // unchanged when false; preserves cross-floor view when true
//         onSuccess: () => {
//             setShowUnassignModal(false);
//             setUnassignMachineIds([]);
//         }
//     });
// };

//     // NEW: confirm adding an unassigned machine into the selected empty slot
//     const confirmAddUnassigned = () => {
//         if (!pendingAddMachine || !selectedEmptySlot) return;
//         router.post('/machine-location/move-to-slot', {
//             machine_id: pendingAddMachine.id,
//             floor_id: selectedEmptySlot.floorId,
//             sl_no: String(selectedEmptySlot.slotNo),
//         }, {
//             preserveScroll: true,
//             preserveState: true,
//             onSuccess: () => {
//                 setShowUnassignedMachinesModal(false);
//                 setPendingAddMachine(null);
//                 setSelectedEmptySlot(null);
//                 setHoveredUnassignedId(null);
//             }
//         });
//     };

//     // [RESPONSIVE] shared scrollable wrapper + grid style builder
//     const gridWrapperStyle: React.CSSProperties = {
//         overflowX: 'auto',
//         overflowY: 'hidden',
//         WebkitOverflowScrolling: 'touch',
//         paddingBottom: '4px',
//     };

//     const buildGridStyle = (lineAmount: number, maxPerLine: number, gap: string): React.CSSProperties => ({
//         display: 'grid',
//         gridTemplateColumns: `repeat(${lineAmount}, minmax(48px, 1fr))`,
//         gridTemplateRows: `repeat(${maxPerLine}, minmax(48px, auto))`,
//         gridAutoFlow: 'column',
//         gap,
//         minWidth: `${lineAmount * 50}px`,
//         margin: '0 auto',
//     });

//     // [RESPONSIVE] slot styles with clamp() for all breakpoints
//     const renderGridSlot = (
//         slotNo: number,
//         machine: MachineData | undefined,
//         slotFloorId: number,
//         slotMap: Record<number, MachineData>,
//         lineAmount: number,
//         maxPerLine: number
//     ) => {
//         const isSource = slotFloorId === floor.id;
//         const inUnassignMode = !crossFloorMode && unassignMachineIds.length > 0;
//         const isUnassignSelected = machine && unassignMachineIds.includes(machine.id);
//         const isSelectedEmptySlot = !machine
//             && selectedEmptySlot?.floorId === slotFloorId
//             && selectedEmptySlot?.slotNo === slotNo;

//         return (
//             <div
//                 key={slotNo}
//                 // onClick={() => {
//                 //     if (machine) {
//                 //         if (!crossFloorMode) {
//                 //             toggleUnassignSelect(machine.id);
//                 //         }
//                 //     } else {
//                 //         // Empty slot clicked -> select/deselect for the "add unassigned" flow
//                 //         if (isSelectedEmptySlot) {
//                 //             setSelectedEmptySlot(null);
//                 //         } else {
//                 //             setSelectedEmptySlot({ floorId: slotFloorId, slotNo });
//                 //         }
//                 //     }
//                 // }}

//                 onClick={() => {
//     if (machine) {
//         // Allow machine selection for unassign in BOTH modes (cross-floor + non-cross-floor)
//         toggleUnassignSelect(machine.id);
//     } else {
//         // Empty slot clicked -> select/deselect for the "add unassigned" flow
//         if (isSelectedEmptySlot) {
//             setSelectedEmptySlot(null);
//         } else {
//             setSelectedEmptySlot({ floorId: slotFloorId, slotNo });
//         }
//     }
// }}
//                 onDrop={(e) => {
//                     if (crossFloorMode) {
//                         const draggedMachineId = parseInt(e.dataTransfer.getData('machineId'));
//                         const draggedMachine = allMachines.find(m => m.id === draggedMachineId);
//                         const isSameFloor = draggedMachine?.floor_id === slotFloorId;

//                         if (isSameFloor) {
//                             handleDropToSlot(e, slotNo, slotFloorId, slotMap);
//                         } else {
//                             handleCrossFloorDrop(e, slotNo, slotFloorId, slotMap);
//                         }
//                     } else if (!inUnassignMode) {
//                         handleDropToSlot(e, slotNo, floor.id, machineBySlot);
//                     }
//                 }}
//                 onDragOver={(e) => {
//                     if (crossFloorMode || (!crossFloorMode && !inUnassignMode)) {
//                         e.preventDefault();
//                     }
//                 }}
//                 className={`d-flex flex-column align-items-center justify-content-center rounded border border-2 position-relative ${
//                     machine
//                         ? (isUnassignSelected ? 'border-primary bg-info text-white' : 'border-secondary bg-light')
//                         : (isSelectedEmptySlot ? 'border-primary border-dashed' : 'border-dashed')
//                 }`}
//                 style={{
//                     minHeight: 'clamp(65px, 14vw, 110px)',
//                     padding: 'clamp(2px, 0.6vw, 8px)',
//                     cursor: machine
//                         ? (crossFloorMode ? 'grab' : (inUnassignMode ? 'pointer' : 'grab'))
//                         : 'pointer',
//                     backgroundColor: machine
//                         ? undefined
//                         : (isSelectedEmptySlot ? '#fff3cd' : '#f1f3f5'),
//                     touchAction: 'manipulation',
//                 }}
//             >
//                 <small
//                     className="position-absolute top-0 start-0 m-1 text-muted"
//                     style={{ fontSize: 'clamp(0.5rem, 1.8vw, 0.65rem)' }}
//                 >
//                     #{slotNo}
//                 </small>
//                 {machine ? (
//                     <div
//                         draggable={crossFloorMode ? true : (!inUnassignMode)}
//                         onDragStart={(e) => {
//                             if (crossFloorMode || (!crossFloorMode && !inUnassignMode)) {
//                                 handleDragStart(e, machine.id);
//                             } else {
//                                 e.preventDefault();
//                             }
//                         }}
//                         className="d-flex flex-column align-items-center justify-content-center w-100 h-100"
//                     >
//                         <span
//                             className="badge bg-secondary mb-1"
//                             style={{ fontSize: 'clamp(0.5rem, 1.6vw, 0.7rem)' }}
//                         >
//                             SL: {machine.sl_no}
//                         </span>
//                         <strong
//                             className="text-center"
//                             style={{ fontSize: 'clamp(0.55rem, 2vw, 0.8rem)' }}
//                         >
//                             {machine.machine_id}
//                         </strong>
//                         <small
//                             className="text-muted text-center"
//                             style={{ fontSize: 'clamp(6px, 1.5vw, 10px)' }}
//                         >
//                             {machine.model_name}
//                         </small>
//                     </div>
//                 ) : (
//                     <div className="text-muted" style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)' }}>
//                         Empty
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     // [RESPONSIVE] responsive grid wrapper for both single & cross-floor
//     const renderGrid = (
//         lineAmount: number,
//         maxPerLine: number,
//         total: number,
//         slotFloorId: number,
//         slotMap: Record<number, MachineData>,
//         gap = 'clamp(3px, 0.8vw, 8px)'
//     ) => {
//         if (total <= 0) {
//             return <div className="text-center text-muted mt-5">Grid not configured.</div>;
//         }
//         return (
//             <div style={gridWrapperStyle}>
//                 <div style={buildGridStyle(lineAmount, maxPerLine, gap)}>
//                     {Array.from({ length: total }).map((_, i) =>
//                         renderGridSlot(i + 1, slotMap[i + 1], slotFloorId, slotMap, lineAmount, maxPerLine)
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <>
//             <Head title={`Floor ${floor.floor_number} Plan`} />
//             <PageTitle title={`Floor ${floor.floor_number} Plan (${floor.building?.name})`} />

//             <div className="container-fluid">
//                 {/* [RESPONSIVE] header wraps on small screens */}
//                 <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
//                     <button onClick={() => window.history.back()} className="btn btn-outline-secondary btn-sm">
//                         <ArrowLeft size={16} className="me-1" /> <span className="d-none d-sm-inline">Back to Buildings</span>
//                         <span className="d-inline d-sm-none">Back</span>
//                     </button>

//                 <div className="d-flex gap-2 flex-wrap align-items-center">
//     {/* "Unassigned Machines" button */}
//     <button
//         onClick={() => selectedEmptySlotActive && setShowUnassignedMachinesModal(true)}
//         disabled={!selectedEmptySlotActive}
//         className="btn btn-warning btn-sm"
//         title={selectedEmptySlotActive ? `Add to slot #${selectedEmptySlot?.slotNo}` : 'Click an empty slot first'}
//     >
//         <PlusCircle size={16} className="me-1" />
//         <span className="d-none d-sm-inline">Unassigned Machines</span>
//         <span className="d-inline d-sm-none">Unassigned</span>
//         {selectedEmptySlotActive && (
//             <span className="badge bg-dark ms-1">#{selectedEmptySlot?.slotNo}</span>
//         )}
//     </button>

//     {/* Unassign / Clear buttons — now visible in BOTH modes whenever machines are selected */}
//     {unassignMachineIds.length > 0 && (
//         <>
//             <button onClick={() => setShowUnassignModal(true)} className="btn btn-danger btn-sm">
//                 <Trash2 size={16} className="me-1" /> Unassign ({unassignMachineIds.length})
//             </button>
//             <button onClick={() => setUnassignMachineIds([])} className="btn btn-outline-secondary btn-sm">
//                 <X size={16} className="me-1" /> Clear
//             </button>
//         </>
//     )}

//     {!crossFloorMode ? (
//         <button onClick={() => setCrossFloorMode(true)} className="btn btn-primary btn-sm">
//             <Shuffle size={16} className="me-1" /> <span className="d-none d-sm-inline">Change with other floor</span>
//             <span className="d-inline d-sm-none">Other Floor</span>
//         </button>
//     ) : (
//         <button onClick={() => setCrossFloorMode(false)} className="btn btn-danger btn-sm">
//             <X size={16} className="me-1" /> <span className="d-none d-sm-inline">Exit Cross-Floor Mode</span>
//             <span className="d-inline d-sm-none">Exit</span>
//         </button>
//     )}
// </div>
//                 </div>

//                 {!crossFloorMode && unassignMachineIds.length > 0 && (
//                     <div className="alert alert-info py-2 mb-3" style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)' }}>
//                         <strong>Unassign Mode:</strong> Click machines to select. Drag-drop is disabled until you clear selection.
//                     </div>
//                 )}

//                 {crossFloorMode && (
//                     <div className="alert alert-warning py-2 mb-3" style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)' }}>
//                         <strong>Cross-Floor Drag Mode:</strong> Drag machines to empty slots on either floor.
//                         Same-floor swaps are instant. Cross-floor moves ask for confirmation.
//                         Dropping onto an occupied slot on the other floor is not allowed.
//                     </div>
//                 )}

//                 {/* NEW: hint when an empty slot is selected for the add flow */}
//                 {selectedEmptySlotActive && (
//                     <div className="alert alert-warning py-2 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)' }}>
//                         <span>
//                             <strong>Add Mode:</strong> Empty slot #{selectedEmptySlot?.slotNo} selected.
//                             Click <em>Unassigned Machines</em> to pick a machine to place there.
//                         </span>
//                         <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedEmptySlot(null)}>
//                             <X size={14} className="me-1" /> Clear selection
//                         </button>
//                     </div>
//                 )}

//                 {!crossFloorMode ? (
//                     <div className="card shadow-sm">
//                         <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
//                             <strong style={{ fontSize: 'clamp(0.8rem, 3vw, 1rem)' }}>
//                                 Floor Layout — {floor.line_amount} cols × {floor.max_machine_per_line} rows
//                                 <small className="text-muted ms-2 d-none d-md-inline">({totalSlots} slots)</small>
//                             </strong>
//                             <small className="text-muted d-none d-md-inline">Drag to empty slot to place • Drag onto a machine to swap • Click empty slot to add unassigned</small>
//                         </div>
//                         <div
//                             className="card-body position-relative"
//                             style={{
//                                 minHeight: 'clamp(300px, 70vh, 500px)',
//                                 backgroundColor: '#f8f9fa',
//                                 padding: 'clamp(8px, 2vw, 20px)',
//                             }}
//                         >
//                             {totalSlots > 0 ? (
//                                 renderGrid(floor.line_amount, floor.max_machine_per_line, totalSlots, floor.id, machineBySlot, 'clamp(4px, 1vw, 10px)')
//                             ) : (
//                                 <div className="text-center text-muted mt-5">
//                                     Floor grid not configured (line_amount / max_machine_per_line missing).
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="row g-3 g-lg-4">
//                         {/* Source (Current Floor) */}
//                         <div className="col-12 col-lg-6">
//                             <h5
//                                 className="mb-2 mb-lg-3 text-primary"
//                                 style={{ fontSize: 'clamp(0.85rem, 3vw, 1.25rem)' }}
//                             >
//                                 Source: {floor.building?.name} - Floor {floor.floor_number}
//                             </h5>
//                             <div className="card shadow-sm border-primary" style={{ backgroundColor: '#f8f9fa' }}>
//                                 <div className="card-body" style={{ padding: 'clamp(6px, 1.5vw, 16px)' }}>
//                                     {renderGrid(floor.line_amount, floor.max_machine_per_line, totalSlots, floor.id, machineBySlot)}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Target Floor */}
//                         <div className="col-12 col-lg-6">
//                             <h5
//                                 className="mb-2 mb-lg-3 text-success d-flex align-items-center gap-2 flex-wrap"
//                                 style={{ fontSize: 'clamp(0.85rem, 3vw, 1.25rem)' }}
//                             >
//                                 <span>Target:</span>
//                                 <select
//                                     className="form-select form-select-sm"
//                                     style={{ width: 'auto', minWidth: '150px', fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}
//                                     value={targetFloorId}
//                                     onChange={(e) => setTargetFloorId(e.target.value)}
//                                 >
//                                     <option value="">Select...</option>
//                                     {allFloors.filter(f => f.id !== floor.id).map(f => (
//                                         <option key={f.id} value={f.id}>
//                                             {f.building?.name} - Fl {f.floor_number}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </h5>
//                             <div className="card shadow-sm border-success" style={{ backgroundColor: '#e9ecef' }}>
//                                 <div className="card-body" style={{ padding: 'clamp(6px, 1.5vw, 16px)' }}>
//                                     {targetFloorId ? (
//                                         renderGrid(targetLineAmount, targetMaxPerLine, targetTotalSlots, parseInt(targetFloorId), targetMachineBySlot)
//                                     ) : (
//                                         <div className="text-center text-muted mt-5" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
//                                             Select a target floor from the dropdown.
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Cross-Floor Move Confirmation Modal */}
//             {showConfirmMove && pendingCrossMove && (
//                 <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                     <div className="modal-dialog modal-dialog-centered modal-sm">
//                         <div className="modal-content">
//                             <div className="modal-header p-2 p-md-3">
//                                 <h5 className="modal-title" style={{ fontSize: 'clamp(0.85rem, 3vw, 1.25rem)' }}>
//                                     Confirm Move
//                                 </h5>
//                                 <button type="button" className="btn-close" onClick={() => { setShowConfirmMove(false); setPendingCrossMove(null); }}></button>
//                             </div>
//                             <div className="modal-body p-2 p-md-3">
//                                 <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>Move machine to:</p>
//                                 <h6 className="text-success" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1.1rem)' }}>
//                                     {targetFloor?.building?.name} - Fl {targetFloor?.floor_number} (Slot #{pendingCrossMove.slotNo})
//                                 </h6>
//                                 <small className="text-muted" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)' }}>
//                                     The machine will be placed at this slot on the target floor.
//                                 </small>
//                             </div>
//                             <div className="modal-footer p-2 p-md-3">
//                                 <button className="btn btn-outline-secondary btn-sm" onClick={() => { setShowConfirmMove(false); setPendingCrossMove(null); }}>Cancel</button>
//                                 <button className="btn btn-success btn-sm" onClick={confirmCrossFloorMove}>Confirm</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Cross-Floor Alert Modal */}
//             {showCrossFloorAlert && (
//                 <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                     <div className="modal-dialog modal-dialog-centered modal-sm">
//                         <div className="modal-content">
//                             <div className="modal-header p-2 p-md-3">
//                                 <h5 className="modal-title text-warning d-flex align-items-center gap-2" style={{ fontSize: 'clamp(0.85rem, 3vw, 1.25rem)' }}>
//                                     <AlertTriangle size={18} /> Swap Not Allowed
//                                 </h5>
//                                 <button type="button" className="btn-close" onClick={() => setShowCrossFloorAlert(false)}></button>
//                             </div>
//                             <div className="modal-body p-2 p-md-3">
//                                 <p className="mb-0" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>
//                                     You cannot swap machines across different floors.
//                                     <br />
//                                     Please drop the machine on an <strong>empty slot</strong> instead.
//                                 </p>
//                             </div>
//                             <div className="modal-footer p-2 p-md-3">
//                                 <button className="btn btn-warning btn-sm" onClick={() => setShowCrossFloorAlert(false)}>Got it</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Unassign Confirmation Modal */}
//             {showUnassignModal && unassignMachineIds.length > 0 && (
//                 <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                     <div className="modal-dialog modal-dialog-centered modal-sm">
//                         <div className="modal-content">
//                             <div className="modal-header p-2 p-md-3">
//                                 <h5 className="modal-title text-danger" style={{ fontSize: 'clamp(0.85rem, 3vw, 1.25rem)' }}>
//                                     Confirm Unassign
//                                 </h5>
//                                 <button type="button" className="btn-close" onClick={() => setShowUnassignModal(false)}></button>
//                             </div>
//                             <div className="modal-body p-2 p-md-3">
//                                 <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>
//                                     Unassign <strong>{unassignMachineIds.length}</strong> machine(s)?
//                                 </p>
//                                 <ul className="list-unstyled" style={{ maxHeight: '200px', overflowY: 'auto', fontSize: 'clamp(0.75rem, 2.2vw, 0.875rem)' }}>
//                                     {unassignMachineIds.map(id => {
//                                         const m = allMachines.find(x => x.id === id);
//                                         return m ? (
//                                             <li key={id} className="py-1 border-bottom small">
//                                                 <strong>{m.machine_id}</strong> — {m.model_name} (SL: {m.sl_no})
//                                             </li>
//                                         ) : null;
//                                     })}
//                                 </ul>
//                                 <small className="text-muted d-block mt-2" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)' }}>
//                                     Location history will be retained.
//                                 </small>
//                             </div>
//                             <div className="modal-footer p-2 p-md-3">
//                                 <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowUnassignModal(false)}>Cancel</button>
//                                 <button className="btn btn-danger btn-sm" onClick={confirmUnassign}>
//                                     Yes ({unassignMachineIds.length})
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* NEW: Unassigned Machines Picker Modal */}
//             {showUnassignedMachinesModal && selectedEmptySlot && selectedEmptySlotActive && (
//                 <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                     <div className="modal-dialog modal-dialog-centered modal-lg">
//                         <div className="modal-content">
//                             <div className="modal-header p-2 p-md-3">
//                                 <h5 className="modal-title d-flex align-items-center gap-2" style={{ fontSize: 'clamp(0.85rem, 3vw, 1.25rem)' }}>
//                                     <PlusCircle size={18} /> Unassigned Machines
//                                 </h5>
//                                 <button type="button" className="btn-close" onClick={() => setShowUnassignedMachinesModal(false)}></button>
//                             </div>
//                             <div className="modal-body p-2 p-md-3">
//                                 <div className="alert alert-info py-2 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
//                                     <span>
//                                         <strong>Target slot:</strong> Floor ID {selectedEmptySlot.floorId} • Slot #{selectedEmptySlot.slotNo}
//                                     </span>
//                                     <button className="btn btn-sm btn-outline-secondary" onClick={() => {
//                                         setShowUnassignedMachinesModal(false);
//                                         setSelectedEmptySlot(null);
//                                     }}>
//                                         <X size={14} className="me-1" /> Cancel
//                                     </button>
//                                 </div>

//                                 {unassignedMachines.length === 0 ? (
//                                     <p className="text-center text-muted my-4" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>
//                                         No unassigned machines available.
//                                     </p>
//                                 ) : (
//                                     <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
//                                         <div className="row g-2 g-md-3">
//                                             {unassignedMachines.map(m => (
//                                                 <div key={m.id} className="col-6 col-md-4 col-lg-3">
//                                                     <div
//                                                         className="card h-100 text-center position-relative overflow-hidden"
//                                                         style={{ cursor: 'pointer', minHeight: '120px' }}
//                                                         onMouseEnter={() => setHoveredUnassignedId(m.id)}
//                                                         onMouseLeave={() => setHoveredUnassignedId(null)}
//                                                         onClick={() => setPendingAddMachine(m)}
//                                                     >
//                                                         <div
//                                                             className="card-body p-2 d-flex flex-column align-items-center justify-content-center"
//                                                             style={{
//                                                                 filter: hoveredUnassignedId === m.id ? 'blur(2px)' : 'none',
//                                                                 transition: 'filter 0.15s ease',
//                                                             }}
//                                                         >
//                                                             <strong style={{ fontSize: 'clamp(0.7rem, 2vw, 0.9rem)' }}>
//                                                                 {m.machine_id}
//                                                             </strong>
//                                                             <small className="text-muted" style={{ fontSize: 'clamp(0.6rem, 1.8vw, 0.75rem)' }}>
//                                                                 {m.model_name}
//                                                             </small>
//                                                             <span className="badge bg-secondary mt-1" style={{ fontSize: 'clamp(0.55rem, 1.5vw, 0.7rem)' }}>
//                                                                 {m.status}
//                                                             </span>
//                                                         </div>
//                                                         {/* Hover overlay with "+ Add" text */}
//                                                         <div
//                                                             className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
//                                                             style={{
//                                                                 background: 'rgba(0,0,0,0.55)',
//                                                                 color: 'white',
//                                                                 opacity: hoveredUnassignedId === m.id ? 1 : 0,
//                                                                 transition: 'opacity 0.15s ease',
//                                                                 pointerEvents: 'none',
//                                                             }}
//                                                         >
//                                                             <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)', fontWeight: 'bold' }}>
//                                                                 + Add
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* NEW: Add Unassigned Machine Confirmation Modal (stacks on top of picker) */}
//             {pendingAddMachine && selectedEmptySlot && (
//                 <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1080 }}>
//                     <div className="modal-dialog modal-dialog-centered modal-sm">
//                         <div className="modal-content">
//                             <div className="modal-header p-2 p-md-3">
//                                 <h5 className="modal-title" style={{ fontSize: 'clamp(0.85rem, 3vw, 1.25rem)' }}>
//                                     Confirm Add
//                                 </h5>
//                                 <button type="button" className="btn-close" onClick={() => setPendingAddMachine(null)}></button>
//                             </div>
//                             <div className="modal-body p-2 p-md-3">
//                                 <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>
//                                     Add this machine to slot?
//                                 </p>
//                                 <h6 className="text-success" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1.1rem)' }}>
//                                     {pendingAddMachine.machine_id}
//                                 </h6>
//                                 <small className="text-muted d-block" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)' }}>
//                                     {pendingAddMachine.model_name} — Slot #{selectedEmptySlot.slotNo}
//                                 </small>
//                             </div>
//                             <div className="modal-footer p-2 p-md-3">
//                                 <button className="btn btn-outline-secondary btn-sm" onClick={() => setPendingAddMachine(null)}>Cancel</button>
//                                 <button className="btn btn-success btn-sm" onClick={confirmAddUnassigned}>Confirm</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }