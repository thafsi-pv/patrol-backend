import { IncidentsService } from './incidents.service';
import { R2StorageService } from './r2-storage.service';
import { CreateIncidentDto, GetPresignedUrlDto } from './dto/incident.dto';
export declare class IncidentsController {
    private readonly incidentsService;
    private readonly r2StorageService;
    constructor(incidentsService: IncidentsService, r2StorageService: R2StorageService);
    getPresignedUrl(dto: GetPresignedUrlDto): Promise<import("./r2-storage.service").PresignedUrlResponse>;
    createIncident(dto: CreateIncidentDto, req: any): Promise<{
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
            mediaType: string;
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
    getIncidents(): Promise<(({
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
            mediaType: string;
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
    }) | {
        id: string;
        title: string;
        description: string;
        checkpointId: string;
        patrolSessionLogId: string;
        createdAt: Date;
        guard: {
            id: string;
            email: string;
            name: string;
        };
        checkpoint: {
            id: string;
            name: string;
        };
        images: {
            id: string;
            createdAt: Date;
            patrolSessionLogId: string | null;
            imageUrl: string;
            r2Key: string;
            mediaType: string;
            incidentId: string | null;
        }[];
    })[]>;
    getIncident(id: string): Promise<{
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
            mediaType: string;
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
