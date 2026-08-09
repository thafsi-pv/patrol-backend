export declare class CreateCheckpointDto {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    radiusMeters?: number;
}
export declare class UpdateCheckpointDto {
    name?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    radiusMeters?: number;
    active?: boolean;
}
