export declare class CreateRouteDto {
    name: string;
    description?: string;
    checkpointIds: string[];
}
export declare class UpdateRouteDto {
    name?: string;
    description?: string;
    checkpointIds?: string[];
    active?: boolean;
}
