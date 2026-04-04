import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getDirectDatasourceUrl() {
  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;

  if (!host || !user || !password || !database) {
    return null;
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${encodeURIComponent(database)}?sslmode=require`;
}

function getConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    getDirectDatasourceUrl() ||
    ""
  );
}

function getPgConfig() {
  // In production, always use the pooler connection string (port 6543).
  // Direct host:5432 connections are blocked by Vercel (IPv6 unreachable).
  const poolerUrl = getConnectionString();
  if (poolerUrl && process.env.NODE_ENV === "production") {
    return {
      connectionString: poolerUrl,
      max: 2,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;

  if (!host || !user || !password || !database) {
    return {
      connectionString: poolerUrl,
      max: process.env.NODE_ENV === "development" ? 5 : 2,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  return {
    host,
    user,
    password,
    database,
    port: 5432,
    max: 5,
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(getPgConfig()),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
