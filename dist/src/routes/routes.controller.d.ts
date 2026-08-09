import { RoutesService } from './routes.service';
import { CreateRouteDto, UpdateRouteDto } from './dto/route.dto';
export declare class RoutesController {
    private readonly routesService;
    constructor(routesService: RoutesService);
    create(dto: CreateRouteDto): Promise<{
        checkpoints: ({
            checkpoint: {
                id: string;
                name: string;
                createdAt: Date;
                qrCode: string;
                description: string | null;
                latitude: number;
                longitude: number;
                radiusMeters: number;
                active: boolean;
                createdById: string;
            };
        } & {
            id: string;
            orderIndex: number;
            checkpointId: string;
            routeId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        active: boolean;
    }>;
    findAll(): Promise<({
        _count: {
            sessions: number;
        };
        checkpoints: ({
            checkpoint: {
                id: string;
                name: string;
                createdAt: Date;
                qrCode: string;
                description: string | null;
                latitude: number;
                longitude: number;
                radiusMeters: number;
                active: boolean;
                createdById: string;
            };
        } & {
            id: string;
            orderIndex: number;
            checkpointId: string;
            routeId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        active: boolean;
    })[]>;
    findOne(id: string): Promise<{
        checkpoints: ({
            checkpoint: {
                id: string;
                name: string;
                createdAt: Date;
                qrCode: string;
                description: string | null;
                latitude: number;
                longitude: number;
                radiusMeters: number;
                active: boolean;
                createdById: string;
            };
        } & {
            id: string;
            orderIndex: number;
            checkpointId: string;
            routeId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        active: boolean;
    }>;
    update(id: string, dto: UpdateRouteDto): Promise<{
        checkpoints: ({
            checkpoint: {
                id: string;
                name: string;
                createdAt: Date;
                qrCode: string;
                description: string | null;
                latitude: number;
                longitude: number;
                radiusMeters: number;
                active: boolean;
                createdById: string;
            };
        } & {
            id: string;
            orderIndex: number;
            checkpointId: string;
            routeId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        active: boolean;
    }>;
    deactivate(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        active: boolean;
    }>;
}
