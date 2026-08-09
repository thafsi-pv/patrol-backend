"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatrolSessionsModule = void 0;
const common_1 = require("@nestjs/common");
const patrol_sessions_controller_1 = require("./patrol-sessions.controller");
const patrol_sessions_service_1 = require("./patrol-sessions.service");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
let PatrolSessionsModule = class PatrolSessionsModule {
};
exports.PatrolSessionsModule = PatrolSessionsModule;
exports.PatrolSessionsModule = PatrolSessionsModule = __decorate([
    (0, common_1.Module)({
        imports: [whatsapp_module_1.WhatsAppModule],
        controllers: [patrol_sessions_controller_1.PatrolSessionsController],
        providers: [patrol_sessions_service_1.PatrolSessionsService],
        exports: [patrol_sessions_service_1.PatrolSessionsService],
    })
], PatrolSessionsModule);
//# sourceMappingURL=patrol-sessions.module.js.map