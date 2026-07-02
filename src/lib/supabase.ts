import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = "https://tgscziwfhmkkcswjsibs.supabase.co";
  const supabaseAnonKey = "sb_publishable_pNp-OpuwzRXFcUnTQGd69g_-Ogm3UfX";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials missing.");
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}
