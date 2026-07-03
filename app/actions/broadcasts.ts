"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabase-server";

// 1. Create Broadcast (HOD ONLY)
export async function createBroadcast(payload: any) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "hod") throw new Error("Unauthorized: Only HODs can broadcast.");

  payload.sender_id = (session.user as any).uid;

  const { data, error } = await supabaseServer.from("broadcasts").insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return { success: true, data };
}

// 2. Mark Broadcast as Read (Any User)
export async function markBroadcastRead(broadcastId: string, currentReceipts: string[]) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const uid = (session.user as any).uid;
  if (!currentReceipts.includes(uid)) {
    const newReceipts = [...currentReceipts, uid];
    const { error } = await supabaseServer.from("broadcasts").update({ read_receipts: newReceipts }).eq("id", broadcastId);
    if (error) throw new Error(error.message);
  }
  return { success: true };
}

// 3. Submit RSVP (Any User)
export async function submitRsvp(broadcastId: string, response: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const uid = (session.user as any).uid;

  const { error } = await supabaseServer
    .from("broadcast_rsvps")
    .upsert({
      broadcast_id: broadcastId,
      user_id: uid,
      response: response
    }, { onConflict: 'broadcast_id, user_id' });

  if (error) throw new Error(error.message);
  return { success: true };
}
