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
exports.PatrolSessionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const patrol_sessions_service_1 = require("./patrol-sessions.service");
const patrol_session_dto_1 = require("./dto/patrol-session.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let PatrolSessionsController = class PatrolSessionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    start(dto, req) {
        const ip = req.ip || req.connection?.remoteAddress;
        return this.service.start(dto, req.user.id, ip);
    }
    scan(id, dto, req) {
        const ip = req.ip || req.connection?.remoteAddress;
        return this.service.scanCheckpoint(id, dto, req.user.id, ip);
    }
    end(id, req) {
        const ip = req.ip || req.connection?.remoteAddress;
        return this.service.end(id, req.user.id, ip);
    }
    getMyActive(req) {
        return this.service.getMyActiveSession(req.user.id);
    }
    getActive() {
        return this.service.getActiveSessions();
    }
    getStats() {
        return this.service.getStats();
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
};
exports.PatrolSessionsController = PatrolSessionsController;
__decorate([
    (0, common_1.Post)('start'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.GUARD),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [patrol_session_dto_1.StartPatrolDto, Object]),
    __metadata("design:returntype", void 0)
], PatrolSessionsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/scan'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.GUARD),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, patrol_session_dto_1.ScanCheckpointDto, Object]),
    __metadata("design:returntype", void 0)
], PatrolSessionsController.prototype, "scan", null);
__decorate([
    (0, common_1.Post)(':id/end'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.GUARD),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PatrolSessionsController.prototype, "end", null);
__decorate([
    (0, common_1.Get)('my-active'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.GUARD),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PatrolSessionsController.prototype, "getMyActive", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PatrolSessionsController.prototype, "getActive", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PatrolSessionsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [patrol_session_dto_1.FilterSessionsDto]),
    __metadata("design:returntype", void 0)
], PatrolSessionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.GUARD),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatrolSessionsController.prototype, "findOne", null);
exports.PatrolSessionsController = PatrolSessionsController = __decorate([
    (0, common_1.Controller)('patrol-sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [patrol_sessions_service_1.PatrolSessionsService])
], PatrolSessionsController);
//# sourceMappingURL=patrol-sessions.controller.js.map