import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/incident.dto';
export declare class IncidentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateIncidentDto, guardId: string): Promise<{
        checkpoint: {
            id: string;
            name: string;
        } | null;
        guard: {
            id: string;
            email: string;
            name: string;
        };
        images: {
            id: string;
            createdAt: Date;
            patrolSessionLogId: string | null;
            imageUrl: string;
            r2Key: string;
            incidentId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        checkpointId: string | null;
        guardId: string;
        title: string;
        patrolLogId: string | null;
        patrolSessionLogId: string | null;
    }>;
    findAll(): Promise<({
        checkpoint: {
            id: string;
            name: string;
        } | null;
        guard: {
            id: string;
            email: string;
            name: string;
        };
        images: {
            id: string;
            createdAt: Date;
            patrolSessionLogId: string | null;
            imageUrl: string;
            r2Key: string;
            incidentId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        checkpointId: string | null;
        guardId: string;
        title: string;
        patrolLogId: string | null;
        patrolSessionLogId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        checkpoint: {
            id: string;
            name: string;
        } | null;
        guard: {
            id: string;
            email: string;
            name: string;
        };
        images: {
            id: string;
            createdAt: Date;
            patrolSessionLogId: string | null;
            imageUrl: string;
            r2Key: string;
            incidentId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        checkpointId: string | null;
        guardId: string;
        title: string;
        patrolLogId: string | null;
        patrolSessionLogId: string | null;
    }>;
}
