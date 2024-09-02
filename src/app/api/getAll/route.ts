// app/api/route.ts
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

export async function GET() {
    try {
        // RTW024 แก้
        const result = await client.query('SELECT temperature,humidity,blue,yellow,ultrasonic,status,"LDR" FROM "NUT006"');
        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}

export async function POST(request:Request) {
    try{
        const requestBody = await request.json(); // Parse the request body as JSON
        const { temperature, humidity } = requestBody;

        const result = await client.query(
            'UPDATE pn014 SET temperature = $1, humidity = $2 WHERE id = 1',
            [temperature, humidity]
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
