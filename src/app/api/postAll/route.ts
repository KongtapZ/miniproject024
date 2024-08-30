"use server";
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize PostgreSQL client
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

// Connect to the database
client.connect().catch((err: any) => {
    console.error("Database connection error:", err);
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request:Request){
    try{
        const requestBody = await request.json(); // Parse the request body as JSON
        const { temperature, humidity, ultrasonic, button, ldr } = requestBody;

        const result = await client.query(
            // RTW024 แก้
            'UPDATE "RTW024" SET temperature = $1, humidity = $2, ultrasonic = $3, status = $4, "LDR" = $5 WHERE id = 1',
            [temperature, humidity, ultrasonic, button, ldr]
        );

        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            },
        });
    } catch (error){
        console.error("Error updating data:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}