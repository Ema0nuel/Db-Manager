import { createClient } from '@supabase/supabase-js';
import { supabase } from "../Service/supabase/supabaseClient";

export const pingService = {
    // Check if any databases need pinging
    checkDatabases: async () => {
        try {
            const { data: databases, error } = await supabase
                .from("databases")
                .select("*");

            if (error) throw error;

            const today = new Date();
            const dueProjects = databases.filter(db => {
                const nextPingDate = new Date(db.next_ping_at);
                return today >= nextPingDate;
            });

            console.log(`Found ${dueProjects.length} projects due for ping`);
            return dueProjects;
        } catch (error) {
            console.error("Error checking databases:", error);
            return [];
        }
    },

    // Ping a specific database
    pingDatabase: async (database) => {
        try {
            // Simulate ping request
            console.log(`Pinging database: ${database.project_name}`);

            // Create temporary client with service role key for admin operations
            const projectClient = createClient(
                database.project_url,
                database.service_role_key // Use service role key instead of anon key for admin access
            );

            // Check authentication users
            const { error: authError } = await projectClient.auth.admin.listUsers({
                page: 1,
                perPage: 1
            });

            if (authError) {
                throw new Error(`Failed to query auth users: ${authError.message}`);
            }

            // Check specified table if provided
            if (database.query_table) {
                const { error: tableError } = await projectClient
                    .from(database.query_table)
                    .select('count')
                    .limit(1)
                    .single();

                if (tableError && !tableError.message.includes('does not exist')) {
                    throw new Error(`Failed to query ${database.query_table}: ${tableError.message}`);
                }
            }

            // Update ping timestamps
            const nextPingDate = new Date();
            nextPingDate.setDate(nextPingDate.getDate() + database.ping_interval_days);

            const { error: updateError } = await supabase
                .from("databases")
                .update({
                    last_ping_at: new Date().toISOString(),
                    next_ping_at: nextPingDate.toISOString()
                })
                .eq("id", database.id);

            if (updateError) throw updateError;

            return {
                success: true,
                message: `Successfully pinged ${database.project_name}`
            };
        } catch (error) {
            console.error(`Error pinging database ${database.project_name}:`, error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Manual test function
    testPingSystem: async () => {
        console.log("Starting ping system test...");
        const dueDatabases = await pingService.checkDatabases();

        for (const db of dueDatabases) {
            const result = await pingService.pingDatabase(db);
            console.log(result.message);
        }
    }
};