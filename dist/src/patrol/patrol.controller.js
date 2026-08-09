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
exports.PatrolController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const patrol_logs_filter_dto_1 = require("./dto/patrol-logs-filter.dto");
const scan_dto_1 = require("./dto/scan.dto");
const patrol_service_1 = require("./patrol.service");
let PatrolController = class PatrolController {
    patrolService;
    constructor(patrolService) {
        this.patrolService = patrolService;
    }
    scan(dto, req) {
        return this.patrolService.scan(dto, req.user.id);
    }
    findLogs(filters) {
        return this.patrolService.findLogs(filters);
    }
    findOneLog(id) {
        return this.patrolService.findOneLog(id);
    }
    getDashboardStats() {
        return this.patrolService.getDashboardStats();
    }
};
exports.PatrolController = PatrolController;
__decorate([
    (0, common_1.Post)('scan'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.GUARD),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scan_dto_1.ScanDto, Object]),
    __metadata("design:returntype", void 0)
], PatrolController.prototype, "scan", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [patrol_logs_filter_dto_1.PatrolLogsFilterDto]),
    __metadata("design:returntype", void 0)
], PatrolController.prototype, "findLogs", null);
__decorate([
    (0, common_1.Get)('logs/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatrolController.prototype, "findOneLog", null);
__decorate([
    (0, common_1.Get)('dashboard-stats'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PatrolController.prototype, "getDashboardStats", null);
exports.PatrolController = PatrolController = __decorate([
    (0, common_1.Controller)('patrol'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [patrol_service_1.PatrolService])
], PatrolController);
//# sourceMappingURL=patrol.controller.js.map