const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase.rpc('exec_sql', { query: "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachment_link TEXT;" });
    console.log("data:", data, "error:", error);
}
run();
