import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

function getDatabasePath(): string {
  const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const cleanPath = dbUrl.replace(/^file:/, "");

  // If already an absolute path
  if (path.isAbsolute(cleanPath)) {
    return cleanPath;
  }

  // Priority 1: bundled production database if present
  const bundledProdDb = path.join(process.cwd(), "prisma", "data", "prod.db");
  const defaultDevDb = path.join(process.cwd(), cleanPath);

  // In production serverless, check if bundled prod.db exists
  if (process.env.NODE_ENV === "production") {
    try {
      const fs = require("fs");
      if (fs.existsSync(bundledProdDb)) {
        return bundledProdDb;
      }
    } catch {
      // fallback
    }
  }

  return defaultDevDb;
}

function createPrismaClient() {
  const resolvedPath = getDatabasePath();

  const sqlite = new Database(resolvedPath);
  // Enable WAL mode for concurrent reads
  try {
    sqlite.pragma("journal_mode = WAL");
  } catch {
    // Read-only filesystem gracefully handles non-WAL mode
  }
  const adapter = new PrismaBetterSqlite3({ url: resolvedPath });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
