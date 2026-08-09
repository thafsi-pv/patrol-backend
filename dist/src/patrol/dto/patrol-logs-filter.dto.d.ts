import { PatrolStatus } from '@prisma/client';
export declare class PatrolLogsFilterDto {
    checkpointId?: string;
    guardId?: string;
    status?: PatrolStatus;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}
