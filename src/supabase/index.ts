import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
  process.env.SUPABASE_SERVICE_ROLE,
);

export default admin;
