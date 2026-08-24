import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { pingDatabase, setupDatabase } from "./setup";

export let postgresql: Pool

export async function sqlQuery<R extends QueryResultRow = QueryResultRow>(
    query: string,
    params?: unknown[],
    executor: Pool | PoolClient = postgresql
): Promise<QueryResult<R>> {
    return executor.query<R>(query, params);
}

export async function withConnection<T>(
    fn: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await postgresql.connect();
    try {
        return await fn(client);
    } finally {
        client.release();
    }
}

export const connectDatabase = async (databaseUrl: string, databaseName: string) => {
    try {
        console.log("Connecting to database...");
        postgresql = new Pool({ connectionString: databaseUrl });
        await pingDatabase(databaseUrl, databaseName);
        await setupDatabase(postgresql);
        console.log("Database connected and setup");
    } catch (error) {
        console.error(error);
        throw error;
    }
};
