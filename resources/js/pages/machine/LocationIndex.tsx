import { Head, Link } from '@inertiajs/react';
import PageTitle from '@/components/page-title';
import { Home, Layers } from 'react-feather';

type FloorData = {
    id: number;
    name: string;
    floor_number: number;
    active_machines_count: number;
};

type BuildingData = {
    id: number;
    name: string;
    code: string;
    floors: FloorData[];
};

type Props = {
    buildings: BuildingData[];
};

export default function MachineLocationIndex({ buildings }: Props) {
    return (
        <>
            <Head title="Machine Locations" />
            <PageTitle title="Machine Locations" />

            <div className="container-fluid">
                <div className="row g-4">
                    {buildings.map((building) => (
                        <div className="col-12 col-lg-6" key={building.id}>
                            <div className="card shadow-sm">
                                <div className="card-header bg-light d-flex align-items-center gap-2">
                                    <Home size={24} className="text-primary" />
                                    <h4 className="mb-0">{building.name}</h4>
                                    <span className="badge bg-secondary ms-auto">{building.code}</span>
                                </div>
                                <div className="card-body">
                                    {building.floors.length > 0 ? (
                                        <div className="row g-3">
                                            {building.floors.map((floor) => (
                                                <div className="col-12 col-md-6" key={floor.id}>
                                                    <Link 
                                                        href={`/machine-location/${floor.id}`} 
                                                        className="text-decoration-none text-dark"
                                                    >
                                                        <div className="border rounded p-3 h-100 hover-bg-light cursor-pointer transition-all">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Layers size={20} className="text-info" />
                                                                <h6 className="mb-0">Floor {floor.floor_number}</h6>
                                                            </div>
                                                            <small className="text-muted d-block mt-2">
                                                                Active Machines: <strong>{floor.active_machines_count}</strong>
                                                            </small>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted text-center mb-0">No floors in this building.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}