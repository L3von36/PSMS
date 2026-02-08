import { PrismaClient } from '@/lib/generated-prisma';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function listPhones() {
    const parents = await prisma.parent.findMany({
        select: {
            firstName: true,
            lastName: true,
            phone: true
        }
    });

    console.log('--- Database Parent Phone Numbers ---');
    parents.forEach(p => {
        console.log(`${p.firstName} ${p.lastName}: "${p.phone}"`);
    });
}

listPhones()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
