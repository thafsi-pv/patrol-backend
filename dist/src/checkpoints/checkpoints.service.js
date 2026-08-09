"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointsService = void 0;
const common_1 = require("@nestjs/common");
const QRCode = __importStar(require("qrcode"));
const uuid_1 = require("uuid");
const prisma_service_1 = require("../prisma/prisma.service");
let CheckpointsService = class CheckpointsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const qrCode = (0, uuid_1.v4)();
        return this.prisma.checkpoint.create({
            data: {
                ...dto,
                qrCode,
                createdById: userId,
            },
        });
    }
    async findAll() {
        return this.prisma.checkpoint.findMany({
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                _count: { select: { patrolLogs: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const checkpoint = await this.prisma.checkpoint.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        if (!checkpoint)
            throw new common_1.NotFoundException('Checkpoint not found');
        return checkpoint;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.checkpoint.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.checkpoint.delete({ where: { id } });
    }
    async getQrImage(id) {
        const checkpoint = await this.findOne(id);
        const buffer = await QRCode.toBuffer(checkpoint.qrCode, {
            type: 'png',
            width: 512,
            margin: 2,
            errorCorrectionLevel: 'H',
        });
        return buffer;
    }
};
exports.CheckpointsService = CheckpointsService;
exports.CheckpointsService = CheckpointsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckpointsService);
//# sourceMappingURL=checkpoints.service.js.map