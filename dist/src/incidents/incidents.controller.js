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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const incidents_service_1 = require("./incidents.service");
const r2_storage_service_1 = require("./r2-storage.service");
const incident_dto_1 = require("./dto/incident.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let IncidentsController = class IncidentsController {
    incidentsService;
    r2StorageService;
    constructor(incidentsService, r2StorageService) {
        this.incidentsService = incidentsService;
        this.r2StorageService = r2StorageService;
    }
    async getPresignedUrl(dto) {
        return this.r2StorageService.generatePresignedUrl(dto.contentType, dto.fileExtension, dto.resourceType);
    }
    async createIncident(dto, req) {
        return this.incidentsService.create(dto, req.user.id);
    }
    async getIncidents() {
        return this.incidentsService.findAll();
    }
    async getIncident(id) {
        return this.incidentsService.findOne(id);
    }
};
exports.IncidentsController = IncidentsController;
__decorate([
    (0, common_1.Post)('upload-url'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.GUARD),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [incident_dto_1.GetPresignedUrlDto]),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "getPresignedUrl", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.GUARD),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [incident_dto_1.CreateIncidentDto, Object]),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "createIncident", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "getIncidents", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "getIncident", null);
exports.IncidentsController = IncidentsController = __decorate([
    (0, common_1.Controller)('incidents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [incidents_service_1.IncidentsService,
        r2_storage_service_1.R2StorageService])
], IncidentsController);
//# sourceMappingURL=incidents.controller.js.map