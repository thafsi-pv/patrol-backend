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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IncidentsService = class IncidentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, guardId) {
        return this.prisma.incident.create({
            data: {
                title: dto.title,
                description: dto.description,
                checkpointId: dto.checkpointId || null,
                patrolLogId: dto.patrolLogId || null,
                guardId,
                images: {
                    create: dto.images.map((img) => ({
                        imageUrl: img.imageUrl,
                        r2Key: img.r2Key,
                    })),
                },
            },
            include: {
                images: true,
                guard: {
                    select: { id: true, name: true, email: true },
                },
                checkpoint: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async findAll() {
        return this.prisma.incident.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                images: true,
                guard: {
                    select: { id: true, name: true, email: true },
                },
                checkpoint: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async findOne(id) {
        const incident = await this.prisma.incident.findUnique({
            where: { id },
            include: {
                images: true,
                guard: {
                    select: { id: true, name: true, email: true },
                },
                checkpoint: {
                    select: { id: true, name: true },
                },
            },
        });
        if (!incident)
            throw new common_1.NotFoundException('Incident report not found');
        return incident;
    }
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map