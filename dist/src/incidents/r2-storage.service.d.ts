import { ConfigService } from '@nestjs/config';
export interface PresignedUrlResponse {
    uploadUrl: string;
    imageUrl: string;
    r2Key: string;
    timestamp?: number;
    signature?: string;
    apiKey?: string;
    cloudName?: string;
    publicId?: string;
}
export declare class R2StorageService {
    private readonly config;
    private readonly logger;
    private cloudName;
    private apiKey;
    private apiSecret;
    private isConfigured;
    constructor(config: ConfigService);
    generatePresignedUrl(contentType: string, fileExtension?: string, resourceType?: string): Promise<PresignedUrlResponse>;
}
