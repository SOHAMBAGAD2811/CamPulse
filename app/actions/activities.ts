"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabaseServer } from "@/lib/supabase-server";

// 1. Create Activity (Student or Staff)
export async function createActivity(table: "group_activities" | "staff_activities", payload: any, participants: any[], mentors: any[]) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const uid = (session.user as any).uid;

  // Insert main activity
  if (table === "group_activities") {
    payload.uid = uid; // Enforce owner
  } else {
    payload.suid = uid; // Enforce owner
  }

  const { data: activity, error } = await supabaseServer.from(table).insert([payload]).select().single();
  if (error) throw new Error(error.message);

  const activityId = activity.activity_id;

  // Insert participants
  if (participants.length > 0) {
    const partTable = table === "group_activities" ? "activity_participants" : "staff_activity_participants";
    const pPayload = participants.map(p => ({
      ...p,
      activity_id: activityId
    }));
    await supabaseServer.from(partTable).insert(pPayload);
  }

  // Insert mentors
  if (mentors.length > 0) {
    const menTable = table === "group_activities" ? "activity_mentors" : "staff_activity_comentors";
    const mPayload = mentors.map(m => ({
      ...m,
      activity_id: activityId
    }));
    await supabaseServer.from(menTable).insert(mPayload);
  }

  return { success: true, data: activity };
}

// 2. Delete Activity
export async function deleteActivity(table: "group_activities" | "staff_activities", activityId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const uid = (session.user as any).uid;
  const pk = table === "group_activities" ? "uid" : "suid";

  // Enforce ownership
  const { data } = await supabaseServer.from(table).select(pk).eq("activity_id", activityId).single();
  if (data && (data as any)[pk] !== uid) {
    throw new Error("Unauthorized to delete this activity.");
  }

  const { error } = await supabaseServer.from(table).delete().eq("activity_id", activityId);
  if (error) throw new Error(error.message);
  return { success: true };
}

// 3. Update Activity Status (Staff only)
export async function updateActivityStatus(activityId: string, status: string, feedback?: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "staff") throw new Error("Unauthorized");

  const updatePayload: any = { status };
  // Only add feedback if the column actually exists in their schema. 
  // Let's assume it does if passed.
  if (feedback !== undefined) updatePayload.feedback = feedback;

  const { error } = await supabaseServer.from("group_activities").update(updatePayload).eq("activity_id", activityId);
  if (error) throw new Error(error.message);
  return { success: true };
}

// 4. Update Participant/Legacy Activity Status (Staff Only)
export async function approveStudentActivity(
  isNewArchitecture: boolean | undefined,
  activityId: string | number,
  studentUid: string,
  pkColumn: string,
  status: string,
  feedback?: string | null
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "staff") throw new Error("Unauthorized");

  if (isNewArchitecture) {
    const { error } = await supabaseServer
      .from("activity_participants")
      .update({ status })
      .match({ activity_id: activityId, student_uid: studentUid });
    if (error) throw new Error(error.message);
  } else {
    const updatePayload: any = { status };
    if (feedback) updatePayload.feedback = feedback;
    const { error } = await supabaseServer
      .from("student_activities")
      .update(updatePayload)
      .eq(pkColumn, activityId);
    if (error) throw new Error(error.message);
  }
  return { success: true };
}
