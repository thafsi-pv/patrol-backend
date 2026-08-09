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
exports.RoutesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RoutesService = class RoutesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.route.create({
            data: {
                name: dto.name,
                description: dto.description,
                checkpoints: {
                    create: dto.checkpointIds.map((cpId, idx) => ({
                        checkpointId: cpId,
                        orderIndex: idx + 1,
                    })),
                },
            },
            include: { checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } } },
        });
    }
    async findAll() {
        return this.prisma.route.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
            include: {
                checkpoints: {
                    include: { checkpoint: true },
                    orderBy: { orderIndex: 'asc' },
                },
                _count: { select: { sessions: true } },
            },
        });
    }
    async findOne(id) {
        const route = await this.prisma.route.findUnique({
            where: { id },
            include: {
                checkpoints: {
                    include: { checkpoint: true },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
        if (!route)
            throw new common_1.NotFoundException('Route not found');
        return route;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.checkpointIds !== undefined) {
            await this.prisma.routeCheckpoint.deleteMany({ where: { routeId: id } });
            await this.prisma.routeCheckpoint.createMany({
                data: dto.checkpointIds.map((cpId, idx) => ({
                    routeId: id,
                    checkpointId: cpId,
                    orderIndex: idx + 1,
                })),
            });
        }
        return this.prisma.route.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.active !== undefined && { active: dto.active }),
            },
            include: {
                checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } },
            },
        });
    }
    async deactivate(id) {
        await this.findOne(id);
        return this.prisma.route.update({ where: { id }, data: { active: false } });
    }
};
exports.RoutesService = RoutesService;
exports.RoutesService = RoutesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoutesService);
//# sourceMappingURL=routes.service.js.map