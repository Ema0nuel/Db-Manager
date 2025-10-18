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
        // Get active databases that need pinging
        const { data: databases, error: fetchError } = await supabase
            .from('databases')
            .select('*')
            .eq('is_active', true)
            .lte('next_ping_at', new Date().toISOString());

        if (fetchError) {
            throw new Error(`Failed to fetch databases: ${fetchError.message}`);
        }

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
                    results.push({
                        project: db.project_name,
                        status: 'failed',
                        error: `Auth check failed: ${authError.message}`
                    });
                    continue;
                }

                // Calculate next ping based on interval
                const now = new Date();
                const nextPing = new Date();
                nextPing.setDate(now.getDate() + (db.ping_interval_days || 7));

                // Update ping times
                const { error: updateError } = await supabase
                    .from('databases')
                    .update({
                        last_ping_at: now.toISOString(),
                        next_ping_at: nextPing.toISOString(),
                    })
                    .eq('id', db.id);

                if (updateError) {
                    throw updateError;
                }

                results.push({
                    project: db.project_name,
                    status: 'success'
                });

            } catch (error) {
                results.push({
                    project: db.project_name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Processed ${databases.length} databases`,
                results
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}