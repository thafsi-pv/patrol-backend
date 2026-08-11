export declare class StartPatrolDto {
    routeId: string;
    shift?: string;
    deviceId?: string;
}
export declare class ScanCheckpointDto {
    qrCode: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    severity?: 'NORMAL' | 'ISSUE_FOUND' | 'EMERGENCY';
    remarks?: string;
    images?: {
        imageUrl: string;
        r2Key: string;
        mediaType?: string;
    }[];
    deviceId?: string;
}
export declare class FilterSessionsDto {
    guardId?: string;
    routeId?: string;
    status?: string;
    shift?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}
