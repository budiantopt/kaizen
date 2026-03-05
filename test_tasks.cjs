const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: q1, error: err1 } = await supabase.from('tasks').select('*').limit(1);
    console.log("Tasks row:", JSON.stringify(q1, null, 2));
    console.log("Error:", err1);
}
run();
