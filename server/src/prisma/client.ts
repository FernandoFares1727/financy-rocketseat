import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

// Provide the connection URL at runtime to the Prisma client.
// Prisma's schema no longer supports `url` in the datasource for migrations;
// we pass the DB URL here so the client knows how to connect locally.
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
