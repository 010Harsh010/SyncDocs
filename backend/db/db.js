import pg from "pg";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "admin",
    database: process.env.DB_NAME || "multidoc",
});

const createInitialize_DB = async () => {
    try {
        const sql = await fs.readFile(
            path.join(__dirname, "./schema.txt"),
            "utf8"
        );

        await pool.query(sql);

        console.log("Database initialized.");
    } catch (err) {
        console.error("Failed to initialize database:", err);
        throw err;
    }
};

export const connectDB = async () => {
    try {
        await pool.query("SELECT 1");

        console.log("PostgreSQL connected");

        await createInitialize_DB();
    } catch (error) {
        console.error("PostgreSQL connection error:", error);
        throw error;
    }
};
