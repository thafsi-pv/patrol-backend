import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface PresignedUrlResponse {
  uploadUrl: string;
  imageUrl: string;
  r2Key: string;
}

@Injectable()
export class R2StorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private publicUrl: string;
  private readonly logger = new Logger(R2StorageService.name);

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.config.get<string>('R2_BUCKET_NAME') || 'patrol-issue-images';
    this.publicUrl = this.config.get<string>('R2_PUBLIC_URL') || '';

    if (accountId && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      this.logger.warn(
        'Cloudflare R2 credentials not fully configured in environment. Presigned URLs will fallback to mock/local mode.',
      );
    }
  }

  /**
   * Generates a signed PUT URL for client-side direct upload to Cloudflare R2
   */
  async generatePresignedUrl(
    contentType: string,
    fileExtension = 'jpg',
  ): Promise<PresignedUrlResponse> {
    const ext = fileExtension.replace(/^\./, '') || 'jpg';
    const r2Key = `issues/${new Date().toISOString().slice(0, 10)}/${uuidv4()}.${ext}`;

    // If R2 is properly configured
    if (this.s3Client && this.bucketName) {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: r2Key,
        ContentType: contentType,
      });

      // Presigned URL valid for 15 minutes (900 seconds)
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
      
      const baseUrl = this.publicUrl ? this.publicUrl.replace(/\/$/, '') : `https://${this.bucketName}.r2.cloudflarestorage.com`;
      const imageUrl = `${baseUrl}/${r2Key}`;

      return {
        uploadUrl,
        imageUrl,
        r2Key,
      };
    }

    // Fallback/Mock mode if R2 keys are not supplied yet
    const fallbackBaseUrl = this.publicUrl || 'https://pub-r2.patrol.local';
    return {
      uploadUrl: `${fallbackBaseUrl}/mock-upload/${r2Key}?mock=true`,
      imageUrl: `${fallbackBaseUrl}/${r2Key}`,
      r2Key,
    };
  }
}
