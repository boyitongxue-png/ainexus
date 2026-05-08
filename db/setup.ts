import "dotenv/config";
import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

async function setup() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const connection = await createConnection(databaseUrl);
  console.log("Connected to database");

  // Read and execute schema SQL
  const schemaPath = join(__dirname, "schema.sql");
  const schemaSql = readFileSync(schemaPath, "utf-8");

  // Split by semicolon and execute each statement
  const statements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await connection.execute(statement + ";");
      console.log("Executed:", statement.substring(0, 50) + "...");
    } catch (err: any) {
      if (err.message && err.message.includes("already exists")) {
        console.log("Table already exists, skipping");
      } else {
        console.error("Error executing statement:", err.message);
      }
    }
  }

  console.log("Schema setup complete!");
  await connection.end();
}

setup().catch(console.error);
