"use server";
import { Client } from 'pg';
import dotenv from 'dotenv';

// load environment variables
dotenv.config();

// initialize PostgreSQL client
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

// connect to the database
client.connect().catch((err: any) => {
    console.error("Database connection error:", err);
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(Request: Request) {
    try {
        const requestBody = await Request.json(); // Parse the request body as JSON
        const { ultrasonicValue, status, LDR } = requestBody;

        const result = await client.query(
            'UPDATE "RTW024" SET ultrasonic = $1, status = $2, "LDR" = $3 WHERE id = $4',
            [ultrasonicValue, status, LDR, 1]
        );

        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            },
        });
    } catch (error) {
        console.error("Error updating data:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}
