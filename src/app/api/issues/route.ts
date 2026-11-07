import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";
import { NextRequest } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, category, priority, partner_id } = body;

  if (!title || !description) {
    return fail("Title and description are required", 400);
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      subject: title,
      description,
      priority: priority || "medium",
      status: "open",
      created_by: partner_id,
    })
    .select()
    .single();

  if (error) return fail(error.message, 500);

  // Map to issue-like shape
  return ok({
    ...data,
    title: data.subject,
    category: category || "service",
  });
}
