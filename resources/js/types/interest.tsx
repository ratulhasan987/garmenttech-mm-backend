import { Designation } from "./designation";

export type InterestStatus = "active" | 'inactive'

export type Interest = {
    "id": number,
    "designation_id": number,
    "rate": string,
    "status": InterestStatus,
    "created_by": {
        "id": number,
        "employee_id": string,
        "name": string
    },
    "created_at": string,
    "updated_at": string,
    "designation": Pick<Designation, 'id' | 'name' | 'code'>
};
