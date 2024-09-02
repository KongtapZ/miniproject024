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

export async function POST(req: Request) {
    try {
        const { led, state } = await req.json();
        
        // Validate 'led' and 'state' values
        if (!led || !state) {
            return new Response(JSON.stringify({ error: 'LED and state values are required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Get the column name based on the LED color
        const column = led === "blue" ? "blue" : led === "yellow" ? "yellow" : null;

        if (column) {
            // Update the latest record's column with the new state
            await client.query(
                // RTW024 แก้
                `UPDATE "RTW024"
                 SET ${column} = $1
                 WHERE id = (SELECT id FROM "RTW024" ORDER BY id DESC LIMIT 1)`,
                [state] // Update the state value (e.g., "on" or "off")
            );

            return new Response(JSON.stringify({ message: 'LED value updated successfully' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        } else {
            return new Response(JSON.stringify({ error: 'Invalid LED value' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        console.error("Error updating data:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}

export async function GET() {
    try {
        // RTW024 แก้
        const result = await client.query('SELECT blue,yellow FROM "RTW024"');
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
