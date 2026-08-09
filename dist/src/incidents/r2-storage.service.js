"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var R2StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const uuid_1 = require("uuid");
let R2StorageService = R2StorageService_1 = class R2StorageService {
    config;
    logger = new common_1.Logger(R2StorageService_1.name);
    cloudName;
    apiKey;
    apiSecret;
    isConfigured = false;
    constructor(config) {
        this.config = config;
        this.cloudName = this.config.get('CLOUDINARY_CLOUD_NAME') || '';
        this.apiKey = this.config.get('CLOUDINARY_API_KEY') || '';
        this.apiSecret = this.config.get('CLOUDINARY_API_SECRET') || '';
        if (this.cloudName && this.apiKey && this.apiSecret) {
            cloudinary_1.v2.config({
                cloud_name: this.cloudName,
                api_key: this.apiKey,
                api_secret: this.apiSecret,
                secure: true,
            });
            this.isConfigured = true;
        }
        else {
            this.logger.warn('Cloudinary credentials not configured in environment. Presigned URLs will fallback to mock mode.');
        }
    }
    async generatePresignedUrl(contentType, fileExtension = 'jpg') {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = 'patrol_issues';
        const publicId = `${folder}/${(0, uuid_1.v4)()}`;
        if (this.isConfigured) {
            const paramsToSign = {
                timestamp,
                folder,
            };
            const signature = cloudinary_1.v2.utils.api_sign_request(paramsToSign, this.apiSecret);
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
        const fallbackBaseUrl = 'https://res.cloudinary.com/demo/image/upload';
        return {
            uploadUrl: `${fallbackBaseUrl}/mock-upload/${publicId}?mock=true`,
            imageUrl: `${fallbackBaseUrl}/${publicId}`,
            r2Key: publicId,
        };
    }
};
exports.R2StorageService = R2StorageService;
exports.R2StorageService = R2StorageService = R2StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], R2StorageService);
//# sourceMappingURL=r2-storage.service.js.map