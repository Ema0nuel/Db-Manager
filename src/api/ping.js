/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
    runtime: 'edge', // Use edge runtime for better performance
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Get databases that need pinging
        const { data: databases, error: dbError } = await supabase
            .from('databases')
            .select('*')
            .lte('next_ping_at', new Date().toISOString());

        if (dbError) throw dbError;

        const results = [];

        // Process each database
        for (const db of databases) {
            try {
                // Create client for the target database
                const projectClient = createClient(
                    db.project_url,
                    db.service_role_key
                );

                // Check auth system
                const { error: authError } = await projectClient.auth.admin.listUsers({
                    page: 1,
                    perPage: 1
                });

                if (authError) {
                    throw new Error(`Auth check failed: ${authError.message}`);
                }

                // Check specified table if provided
                if (db.query_table) {
                    const { error: tableError } = await projectClient
                        .from(db.query_table)
                        .select('count')
                        .limit(1)
                        .single();

                    if (tableError && !tableError.message.includes('does not exist')) {
                        throw new Error(`Table check failed: ${tableError.message}`);
                    }
                }

                // Calculate next ping date
                const nextPingDate = new Date();
                nextPingDate.setDate(nextPingDate.getDate() + db.ping_interval_days);

                // Update ping status
                const { error: updateError } = await supabase
                    .from('databases')
                    .update({
                        last_ping_at: new Date().toISOString(),
                        next_ping_at: nextPingDate.toISOString(),
                        last_ping_status: 'success',
                        last_error: null
                    })
                    .eq('id', db.id);

                if (updateError) throw updateError;

                results.push({
                    project: db.project_name,
                    status: 'success',
                    next_ping: nextPingDate
                });

            } catch (error) {
                // Update error status
                await supabase
                    .from('databases')
                    .update({
                        last_ping_status: 'failed',
                        last_error: error.message
                    })
                    .eq('id', db.id);

                results.push({
                    project: db.project_name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Processed ${databases.length} databases`,
            results
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}