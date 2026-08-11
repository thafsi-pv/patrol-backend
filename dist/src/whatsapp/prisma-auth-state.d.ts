import { AuthenticationState } from '@whiskeysockets/baileys';
import { PrismaService } from '../prisma/prisma.service';
export declare function usePrismaAuthState(prisma: PrismaService): Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
    clearSession: () => Promise<void>;
}>;
