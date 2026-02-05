/**
 * Prisma config for local development.
 *
 * Prisma moved connection URLs out of schema files. Place your DATABASE_URL
 * in the environment and use this file to provide configuration for Migrate
 * and for the PrismaClient constructor if needed.
 *
 * Example usage (migrations):
 *   // prisma.config.ts
 *   import 'dotenv/config'
 *   export default {
 *     migrations: {
 *       connectionUrl: process.env.DATABASE_URL,
 *     },
 *   }
 *
 * See: https://pris.ly/d/config-datasource
 */

import 'dotenv/config';

export default {
  migrations: {
    connectionUrl: process.env.DATABASE_URL,
  },
};
