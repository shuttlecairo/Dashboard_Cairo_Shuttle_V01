import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: "dashboard_2" },
});

// Helper: typed query builder
export function db<T = Record<string, unknown>>(table: string) {
  return supabase.from(table) as ReturnType<typeof supabase.from> & {
    select: (...args: Parameters<ReturnType<typeof supabase.from>["select"]>) => Promise<{ data: T[] | null; error: Error | null }>;
  };
}
