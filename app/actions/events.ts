"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabase-server";

// 1. Create a new event proposal
export async function createEventProposal(payload: any) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  // Force the submitted_by/organizer_id to be the securely logged-in user
  payload.submitted_by = (session.user as any).uid;
  // If the payload has organizer_id (legacy), set that too just in case
  if (payload.organizer_id) {
    payload.organizer_id = (session.user as any).uid;
  }
  
  const { data, error } = await supabaseServer.from("event_proposals").insert([payload]);
  
  if (error) throw new Error(error.message);
  return { success: true, data };
}

// 2. Delete an event proposal (Only if Pending and owned by the user)
export async function deleteEventProposal(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const uid = (session.user as any).uid;
  const role = (session.user as any).role;
  
  // Ensure the user actually owns this proposal before deleting, unless they are HOD
  let query = supabaseServer.from("event_proposals").delete().eq("id", id).eq("status", "Pending");
  
  if (role !== "hod") {
    // Only delete if submitted_by matches (using submitted_by or organizer_id depending on schema)
    // We will just do a check first to be safe since it might use either column
    const { data: prop } = await supabaseServer.from("event_proposals").select("submitted_by").eq("id", id).single();
    if (prop && prop.submitted_by !== uid) {
       throw new Error("You can only delete your own proposals.");
    }
  }
  
  const { error } = await query;
  if (error) throw new Error(error.message);
  return { success: true };
}

// 3. Update Event Status (HOD ONLY)
export async function updateEventStatus(id: string, newStatus: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  // CRITICAL: Only HODs are allowed to approve/reject events!
  if ((session.user as any).role !== "hod") {
    throw new Error("Security Violation: Only HODs can approve events.");
  }

  const { data, error } = await supabaseServer
    .from("event_proposals")
    .update({ status: newStatus })
    .eq("id", id);
    
  if (error) throw new Error(error.message);
  return { success: true, data };
}
