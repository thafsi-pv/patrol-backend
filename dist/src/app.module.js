"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const auth_module_1 = require("./auth/auth.module");
const checkpoints_module_1 = require("./checkpoints/checkpoints.module");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const patrol_module_1 = require("./patrol/patrol.module");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const incidents_module_1 = require("./incidents/incidents.module");
const routes_module_1 = require("./routes/routes.module");
const patrol_sessions_module_1 = require("./patrol-sessions/patrol-sessions.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            checkpoints_module_1.CheckpointsModule,
            patrol_module_1.PatrolModule,
            incidents_module_1.IncidentsModule,
            routes_module_1.RoutesModule,
            patrol_sessions_module_1.PatrolSessionsModule,
            whatsapp_module_1.WhatsAppModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map