import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

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

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;
  private isConfigured = false;

  constructor(private readonly config: ConfigService) {
    this.cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME') || '';
    this.apiKey = this.config.get<string>('CLOUDINARY_API_KEY') || '';
    this.apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET') || '';

    if (this.cloudName && this.apiKey && this.apiSecret) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        secure: true,
      });
      this.isConfigured = true;
    } else {
      this.logger.warn(
        'Cloudinary credentials not configured in environment. Presigned URLs will fallback to mock mode.',
      );
    }
  }

  /**
   * Generates a signed upload signature for direct browser-to-Cloudinary image upload
   */
  async generatePresignedUrl(
    contentType: string,
    fileExtension = 'jpg',
  ): Promise<PresignedUrlResponse> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'patrol_issues';
    const publicId = `${folder}/${uuidv4()}`;

    if (this.isConfigured) {
      // Create Cloudinary signed upload parameters
      const paramsToSign = {
        timestamp,
        folder,
      };

      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        this.apiSecret,
      );

      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
      const imageUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload/v${timestamp}/${publicId}`;

      return {
        uploadUrl,
        imageUrl,
        r2Key: publicId,
        timestamp,
        signature,
        apiKey: this.apiKey,
        cloudName: this.cloudName,
        publicId,
      };
    }

    // Fallback/Mock mode if Cloudinary keys are not supplied in .env yet
    const fallbackBaseUrl = 'https://res.cloudinary.com/demo/image/upload';
    return {
      uploadUrl: `${fallbackBaseUrl}/mock-upload/${publicId}?mock=true`,
      imageUrl: `${fallbackBaseUrl}/${publicId}`,
      r2Key: publicId,
    };
  }
}
