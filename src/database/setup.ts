import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Pool, PoolClient } from "pg";
import { sqlQuery } from ".";

export const setupDatabase = async (
  executor: Pool | PoolClient
): Promise<void> => {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");
    await executor.query(sql);
    console.log("Database schema applied.");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}

const toMaintenanceUrl = (databaseUrl: string) => {
  const url = new URL(databaseUrl);
  url.pathname = "/postgres";
  return url.toString();
};

const quoteIdent = (name: string) => `"${name.replaceAll('"', '""')}"`;

const isMissingDatabaseError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "3D000";

const createDatabase = async (databaseUrl: string, databaseName: string) => {
  const adminPool = new Pool({ connectionString: toMaintenanceUrl(databaseUrl) });
  try {
    console.log(`Creating database "${databaseName}"...`);
    await adminPool.query(`CREATE DATABASE ${quoteIdent(databaseName)}`);
    console.log(`Database "${databaseName}" created`);
  } finally {
    await adminPool.end();
  }
};

export const pingDatabase = async (databaseUrl: string, databaseName: string) => {
  try {
    console.log("Pinging database...");
    await sqlQuery("SELECT NOW()");
  } catch (error) {
    if (!isMissingDatabaseError(error)) {
      console.error("Error pinging database:", error);
      throw error;
    }
    await createDatabase(databaseUrl, databaseName);
    await sqlQuery("SELECT NOW()");
  }
};