import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, X, Shuffle } from 'react-feather';
import PageTitle from '@/components/page-title';

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
};

type Props = {
    floor: FloorData;
    allMachines: MachineData[];
    allFloors: FloorData[];
};

export default function FloorPlan({ floor, allMachines, allFloors }: Props) {
    const [draggingMachine, setDraggingMachine] = useState<number | null>(null);
    const [crossFloorMode, setCrossFloorMode] = useState(false);
    const [targetFloorId, setTargetFloorId] = useState<string>('');
    const [selectedMachineIds, setSelectedMachineIds] = useState<number[]>([]);
    const [showConfirmMove, setShowConfirmMove] = useState(false);

    // Filter machines for the current floor
    const currentMachines = allMachines
        .filter(m => m.floor_id === floor.id)
        .sort((a, b) => parseInt(a.sl_no) - parseInt(b.sl_no));

    // Filter machines for the target floor (in cross-floor mode)
    const targetMachines = allMachines
        .filter(m => m.floor_id === parseInt(targetFloorId))
        .sort((a, b) => parseInt(a.sl_no) - parseInt(b.sl_no));

    const targetFloor = allFloors.find(f => f.id === parseInt(targetFloorId));

    // --- Drag & Drop Logic (Same Floor) ---
    const handleDragStart = (e: React.DragEvent, machineId: number) => {
        e.dataTransfer.setData('machineId', String(machineId));
        setDraggingMachine(machineId);
    };

    const handleDrop = (e: React.DragEvent, targetMachineId: number) => {
        e.preventDefault();
        const draggedMachineId = parseInt(e.dataTransfer.getData('machineId'));
        
        if (draggedMachineId && draggedMachineId !== targetMachineId) {
            router.post('/machine-location/swap', {
                machine1_id: draggedMachineId,
                machine2_id: targetMachineId,
            }, { preserveScroll: true, preserveState: false });
        }
        setDraggingMachine(null);
    };

    // --- Cross-Floor Logic ---
    const toggleSelectMachine = (machineId: number) => {
        setSelectedMachineIds(prev => 
            prev.includes(machineId) ? prev.filter(id => id !== machineId) : [...prev, machineId]
        );
    };

    const handleCrossFloorDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (selectedMachineIds.length === 0 || !targetFloorId) return;
        setShowConfirmMove(true);
    };

    const confirmMove = () => {
        router.post('/machine-location/move', {
            machine_ids: selectedMachineIds,
            target_floor_id: targetFloorId,
        }, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setSelectedMachineIds([]);
                setShowConfirmMove(false);
                setCrossFloorMode(false);
            }
        });
    };

    const renderMachineCircle = (machine: MachineData, isTarget: boolean = false) => (
        <div 
            key={machine.id} 
            className={`col-4 col-md-3 col-lg-2 mb-3 ${crossFloorMode ? 'cursor-pointer' : ''}`}
            onClick={() => crossFloorMode && !isTarget && toggleSelectMachine(machine.id)}
        >
            <div
                draggable={!crossFloorMode}
                onDragStart={(e) => !crossFloorMode && handleDragStart(e, machine.id)}
                onDrop={(e) => !crossFloorMode && handleDrop(e, machine.id)}
                onDragOver={(e) => !crossFloorMode && e.preventDefault()}
                className={`d-flex flex-column align-items-center justify-content-center rounded-circle bg-light border border-2 p-2 transition-all ${
                    !crossFloorMode ? 'cursor-move hover-shadow' : ''
                } ${
                    selectedMachineIds.includes(machine.id) ? 'border-primary shadow-lg bg-info text-white' : 'border-secondary'
                }`}
                style={{ width: '100px', height: '100px' }}
            >
                <span className="badge bg-secondary mb-1">SL: {machine.sl_no}</span>
                <strong className="small text-center">{machine.machine_id}</strong>
                <small className="text-muted text-center" style={{ fontSize: '10px' }}>{machine.model_name}</small>
            </div>
        </div>
    );

    return (
        <>
            <Head title={`Floor ${floor.floor_number} Plan`} />
            <PageTitle title={`Floor ${floor.floor_number} Plan (${floor.building?.name})`} />

            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button onClick={() => window.history.back()} className="btn btn-outline-secondary btn-sm">
                        <ArrowLeft size={16} className="me-1" /> Back to Buildings
                    </button>

                    {!crossFloorMode ? (
                        <button onClick={() => setCrossFloorMode(true)} className="btn btn-primary btn-sm">
                            <Shuffle size={16} className="me-1" /> Change with other floor
                        </button>
                    ) : (
                        <button onClick={() => { setCrossFloorMode(false); setSelectedMachineIds([]); }} className="btn btn-danger btn-sm">
                            <X size={16} className="me-1" /> Exit Cross-Floor Mode
                        </button>
                    )}
                </div>

                {!crossFloorMode ? (
                    // --- SINGLE FLOOR VIEW (Drag & Drop to Swap) ---
                    <div className="card shadow-sm">
                        <div className="card-body" style={{ minHeight: '500px', backgroundColor: '#f8f9fa' }}>
                            <div className="row justify-content-center">
                                {currentMachines.length > 0 ? (
                                    currentMachines.map(m => renderMachineCircle(m))
                                ) : (
                                    <div className="text-center text-muted mt-5">No machines on this floor.</div>
                                )}
                            </div>
                            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                                <div className="alert alert-dark mb-0 px-4 py-1"><strong>GATE</strong></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- CROSS FLOOR VIEW (Side-by-Side) ---
                    <div className="row g-4">
                        {/* Left Side: Current Floor */}
                        <div className="col-12 col-lg-6">
                            <h5 className="mb-3 text-primary">
                                Source: {floor.building?.name} - Floor {floor.floor_number}
                                <small className="text-muted ms-2">(Click to select)</small>
                            </h5>
                            <div 
                                className="card shadow-sm border-primary" 
                                style={{ minHeight: '400px', backgroundColor: '#f8f9fa' }}
                            >
                                <div className="card-body">
                                    <div className="row justify-content-center">
                                        {currentMachines.map(m => renderMachineCircle(m, false))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Target Floor */}
                        <div className="col-12 col-lg-6">
                            <h5 className="mb-3 text-success">
                                Target Floor: 
                                <select 
                                    className="form-select form-select-sm d-inline-block w-auto ms-2" 
                                    value={targetFloorId} 
                                    onChange={(e) => setTargetFloorId(e.target.value)}
                                >
                                    <option value="">Select Floor...</option>
                                    {allFloors.filter(f => f.id !== floor.id).map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.building?.name} - Floor {f.floor_number}
                                        </option>
                                    ))}
                                </select>
                            </h5>
                            
                            <div 
                                className={`card shadow-sm border border-2 ${targetFloorId ? 'border-success' : 'border-dashed'}`}
                                style={{ minHeight: '400px', backgroundColor: '#e9ecef' }}
                                onDrop={handleCrossFloorDrop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <div className="card-body">
                                    {targetFloorId ? (
                                        <div className="row justify-content-center">
                                            {targetMachines.map(m => renderMachineCircle(m, true))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted mt-5">
                                            Select a target floor from the dropdown.
                                            <br/>
                                            <small>Drag selected machines here to move them.</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {selectedMachineIds.length > 0 && targetFloorId && (
                                <div className="mt-3 d-flex justify-content-between align-items-center">
                                    <span className="badge bg-info">{selectedMachineIds.length} Machine(s) Selected</span>
                                    <button className="btn btn-success btn-sm" onClick={() => setShowConfirmMove(true)}>
                                        <ArrowRight size={16} className="me-1" /> Move Selected
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Move Confirmation Modal */}
            {showConfirmMove && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Move Machines</h5>
                                <button type="button" className="btn-close" onClick={() => setShowConfirmMove(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to move <strong>{selectedMachineIds.length}</strong> machine(s) to:</p>
                                <h6 className="text-success">{targetFloor?.building?.name} - Floor {targetFloor?.floor_number}?</h6>
                                <small className="text-muted">They will be appended to the end of the floor's layout.</small>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-outline-secondary" onClick={() => setShowConfirmMove(false)}>Cancel</button>
                                <button className="btn btn-success" onClick={confirmMove}>Confirm Move</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}