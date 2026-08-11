export declare class GetPresignedUrlDto {
    contentType: string;
    fileExtension?: string;
    resourceType?: string;
}
export declare class CreateIncidentDto {
    title: string;
    description?: string;
    checkpointId?: string;
    patrolLogId?: string;
    images?: {
        imageUrl: string;
        r2Key: string;
    }[];
}
