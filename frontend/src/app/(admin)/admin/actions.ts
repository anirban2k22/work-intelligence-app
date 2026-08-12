"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
}

export async function deleteUserAction(userId: string) {
  try {
    await verifyAdmin();
    
    const adminAuthClient = await createAdminClient();
    
    // Deleting from auth.users will cascade delete their profile, work_entries, etc.
    const { error } = await adminAuthClient.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error("Failed to delete user:", error);
      return { success: false, error: error.message };
    }
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete user" };
  }
}

export async function updateUserRoleAction(userId: string, role: string) {
  try {
    await verifyAdmin();
    
    const adminClient = await createAdminClient();
    
    const { error } = await adminClient
      .from("profiles")
      .update({ role })
      .eq("user_id", userId);
      
    if (error) {
      console.error("Failed to update role:", error);
      return { success: false, error: error.message };
    }
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update role" };
  }
}

export async function updateUserStatusAction(userId: string, status: string) {
  try {
    await verifyAdmin();
    
    const adminClient = await createAdminClient();
    
    const { error } = await adminClient
      .from("profiles")
      .update({ status })
      .eq("user_id", userId);
      
    if (error) {
      console.error("Failed to update status:", error);
      return { success: false, error: error.message };
    }
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update status" };
  }
}
