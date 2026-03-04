import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const EnvSchema = z.object({
  SUPABASE_URL: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const env = EnvSchema.parse(process.env);

/** Service-role Supabase client — server-side only, bypasses RLS */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
