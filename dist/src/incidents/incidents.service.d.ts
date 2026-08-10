import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/incident.dto';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
export declare class IncidentsService {
    private readonly prisma;
    private readonly whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsAppService);
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
