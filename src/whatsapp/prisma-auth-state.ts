import { AuthenticationCreds, AuthenticationState, SignalDataTypeMap, initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Custom Baileys auth state adapter that persists WhatsApp session keys & creds in PostgreSQL via Prisma.
 * Survived app restarts, redeployments, and ephemeral filesystem resets (Render/Railway).
 */
export async function usePrismaAuthState(prisma: PrismaService): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
  clearSession: () => Promise<void>;
}> {
  // 1. Load or initialize base credentials from DB
  const credsRecord = await prisma.whatsAppSession.findUnique({ where: { key: 'creds' } });
  let creds: AuthenticationCreds;

  if (credsRecord) {
    try {
      creds = JSON.parse(credsRecord.value, BufferJSON.reviver);
    } catch {
      creds = initAuthCreds();
    }
  } else {
    creds = initAuthCreds();
  }

  // 2. Helper functions for reading & writing keys
  const readKey = async (type: string, id: string) => {
    const keyName = `${type}-${id}`;
    const rec = await prisma.whatsAppSession.findUnique({ where: { key: keyName } });
    if (!rec) return null;
    try {
      return JSON.parse(rec.value, BufferJSON.reviver);
    } catch {
      return null;
    }
  };

  const writeKey = async (type: string, id: string, value: any) => {
    const keyName = `${type}-${id}`;
    if (value === null || value === undefined) {
      await prisma.whatsAppSession.deleteMany({ where: { key: keyName } });
    } else {
      const serialized = JSON.stringify(value, BufferJSON.replacer);
      await prisma.whatsAppSession.upsert({
        where: { key: keyName },
        create: { key: keyName, value: serialized },
        update: { value: serialized },
      });
    }
  };

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [id: string]: any } = {};
          await Promise.all(
            ids.map(async (id) => {
              const val = await readKey(type, id);
              if (val) {
                data[id] = val;
              }
            })
          );
          return data;
        },
        set: async (data: { [category in keyof SignalDataTypeMap]?: { [id: string]: any } }) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            const categoryMap = data[category as keyof SignalDataTypeMap];
            if (categoryMap) {
              for (const id in categoryMap) {
                const value = categoryMap[id];
                tasks.push(writeKey(category, id, value));
              }
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: async () => {
      const serialized = JSON.stringify(creds, BufferJSON.replacer);
      await prisma.whatsAppSession.upsert({
        where: { key: 'creds' },
        create: { key: 'creds', value: serialized },
        update: { value: serialized },
      });
    },
    clearSession: async () => {
      await prisma.whatsAppSession.deleteMany();
    },
  };
}
