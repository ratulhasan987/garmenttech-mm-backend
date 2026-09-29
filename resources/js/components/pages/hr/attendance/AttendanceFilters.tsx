import {
    CalendarDays,
    Filter,
    RotateCcw,
    Search,
} from 'lucide-react';

type Department = {
    id: number;
    name: string;
};

type Shift = {
    id: number;
    name: string;
};

type AttendanceFiltersProps = {
    month: string;
    department: string;
    shift: string;

    departments: Department[];
    shifts: Shift[];

    processing?: boolean;

    onMonthChange: (value: string) => void;
    onDepartmentChange: (value: string) => void;
    onShiftChange: (value: string) => void;

    onApply: () => void;
    onReset: () => void;
};

export default function AttendanceFilters({
    month,
    department,
    shift,
    departments,
    shifts,
    processing = false,
    onMonthChange,
    onDepartmentChange,
    onShiftChange,
    onApply,
    onReset,
}: AttendanceFiltersProps) {
    return (
        <div className="space-y-4">
            {/* FILTER HEADER */}

            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Filter className="h-4 w-4 text-primary" />
                </div>

                <div>
                    <h2 className="text-sm font-semibold">
                        Attendance Filters
                    </h2>

                    <p className="text-xs text-muted-foreground">
                        Select month, department and shift.
                    </p>
                </div>
            </div>

            {/* FILTER FIELDS */}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* MONTH */}

                <div>
                    <label
                        htmlFor="attendance-month"
                        className="mb-1.5 block text-xs font-medium"
                    >
                        Month
                    </label>

                    <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            id="attendance-month"
                            type="month"
                            value={month}
                            onChange={(event) =>
                                onMonthChange(
                                    event.target.value,
                                )
                            }
                            className="form-control w-full pl-9"
                        />
                    </div>
                </div>

                {/* DEPARTMENT */}

                <div>
                    <label
                        htmlFor="attendance-department"
                        className="mb-1.5 block text-xs font-medium"
                    >
                        Department
                    </label>

                    <select
                        id="attendance-department"
                        value={department}
                        onChange={(event) =>
                            onDepartmentChange(
                                event.target.value,
                            )
                        }
                        className="form-select w-full"
                    >
                        <option value="">
                            All Departments
                        </option>

                        {departments.map(
                            (item) => (
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.name}
                                </option>
                            ),
                        )}
                    </select>
                </div>

                {/* SHIFT */}

                <div>
                    <label
                        htmlFor="attendance-shift"
                        className="mb-1.5 block text-xs font-medium"
                    >
                        Shift
                    </label>

                    <select
                        id="attendance-shift"
                        value={shift}
                        onChange={(event) =>
                            onShiftChange(
                                event.target.value,
                            )
                        }
                        className="form-select w-full"
                    >
                        <option value="">
                            All Shifts
                        </option>

                        {shifts.map(
                            (item) => (
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.name}
                                </option>
                            ),
                        )}
                    </select>
                </div>

                {/* ACTIONS */}

                <div className="flex items-end gap-2">
                    <button
                        type="button"
                        onClick={onApply}
                        disabled={
                            processing ||
                            !month
                        }
                        className="btn btn-primary flex-1"
                    >
                        {processing ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                />

                                Loading...
                            </>
                        ) : (
                            <>
                                <Search className="me-1 h-4 w-4" />

                                Apply
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onReset}
                        disabled={processing}
                        className="btn btn-light"
                        title="Reset filters"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}