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
exports.CheckpointsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const checkpoints_service_1 = require("./checkpoints.service");
const checkpoint_dto_1 = require("./dto/checkpoint.dto");
let CheckpointsController = class CheckpointsController {
    checkpointsService;
    constructor(checkpointsService) {
        this.checkpointsService = checkpointsService;
    }
    create(dto, req) {
        return this.checkpointsService.create(dto, req.user.id);
    }
    findAll() {
        return this.checkpointsService.findAll();
    }
    findOne(id) {
        return this.checkpointsService.findOne(id);
    }
    update(id, dto) {
        return this.checkpointsService.update(id, dto);
    }
    remove(id) {
        return this.checkpointsService.remove(id);
    }
    async getQrImage(id, res) {
        const buffer = await this.checkpointsService.getQrImage(id);
        res.set({
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="checkpoint-${id}.png"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
};
exports.CheckpointsController = CheckpointsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checkpoint_dto_1.CreateCheckpointDto, Object]),
    __metadata("design:returntype", void 0)
], CheckpointsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.GUARD),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CheckpointsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.GUARD),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CheckpointsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, checkpoint_dto_1.UpdateCheckpointDto]),
    __metadata("design:returntype", void 0)
], CheckpointsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CheckpointsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/qr-image'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CheckpointsController.prototype, "getQrImage", null);
exports.CheckpointsController = CheckpointsController = __decorate([
    (0, common_1.Controller)('checkpoints'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [checkpoints_service_1.CheckpointsService])
], CheckpointsController);
//# sourceMappingURL=checkpoints.controller.js.map