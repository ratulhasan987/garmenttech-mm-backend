export type DesignationStatus = "default" | 'actionable'

export type Designation = {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
    status: DesignationStatus
};
