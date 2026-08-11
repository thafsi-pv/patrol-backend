"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePrismaAuthState = usePrismaAuthState;
const baileys_1 = require("@whiskeysockets/baileys");
async function usePrismaAuthState(prisma) {
    const credsRecord = await prisma.whatsAppSession.findUnique({ where: { key: 'creds' } });
    let creds;
    if (credsRecord) {
        try {
            creds = JSON.parse(credsRecord.value, baileys_1.BufferJSON.reviver);
        }
        catch {
            creds = (0, baileys_1.initAuthCreds)();
        }
    }
    else {
        creds = (0, baileys_1.initAuthCreds)();
    }
    const readKey = async (type, id) => {
        const keyName = `${type}-${id}`;
        const rec = await prisma.whatsAppSession.findUnique({ where: { key: keyName } });
        if (!rec)
            return null;
        try {
            return JSON.parse(rec.value, baileys_1.BufferJSON.reviver);
        }
        catch {
            return null;
        }
    };
    const writeKey = async (type, id, value) => {
        const keyName = `${type}-${id}`;
        if (value === null || value === undefined) {
            await prisma.whatsAppSession.deleteMany({ where: { key: keyName } });
        }
        else {
            const serialized = JSON.stringify(value, baileys_1.BufferJSON.replacer);
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
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        const val = await readKey(type, id);
                        if (val) {
                            data[id] = val;
                        }
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        const categoryMap = data[category];
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
            const serialized = JSON.stringify(creds, baileys_1.BufferJSON.replacer);
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
//# sourceMappingURL=prisma-auth-state.js.map