const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, status, full_name, display_name, created_at, users(email)");
  
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
