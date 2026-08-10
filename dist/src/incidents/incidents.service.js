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
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let IncidentsService = class IncidentsService {
    prisma;
    whatsappService;
    constructor(prisma, whatsappService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    async create(dto, guardId) {
        const incident = await this.prisma.incident.create({
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
        setImmediate(async () => {
            try {
                const admins = await this.prisma.user.findMany({
                    where: { role: 'ADMIN', mobileNumber: { not: null }, whatsappAlertEnabled: true },
                });
                if (admins.length > 0) {
                    const timeStr = new Date(incident.createdAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                    });
                    const msg = `🚨 *INCIDENT REPORTED*\n\n` +
                        `*Title:* ${incident.title}\n` +
                        `*Reporter:* ${incident.guard?.name || 'Unknown'}\n` +
                        `*Location:* ${incident.checkpoint?.name || 'General (Not linked to checkpoint)'}\n` +
                        `*Description:* ${incident.description}\n` +
                        `*Time:* ${timeStr}`;
                    const imageUrls = incident.images.map((img) => img.imageUrl);
                    for (const admin of admins) {
                        if (admin.mobileNumber) {
                            await this.whatsappService.sendMessage(admin.mobileNumber, msg, imageUrls.length > 0 ? imageUrls : undefined);
                        }
                    }
                }
            }
            catch (err) {
                console.error('Error sending WhatsApp incident notification:', err);
            }
        });
        return incident;
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsAppService])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map