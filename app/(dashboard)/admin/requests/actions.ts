"use server";

import { deleteClientRequest } from "@/src/server/repositories/request-repository";
import { revalidatePath } from "next/cache";

export async function deleteRequestAction(id: string) {
  try {
    await deleteClientRequest(id);
    revalidatePath("/admin/requests");
    return { success: true };
  } catch (error) {
    console.error("Error deleting request:", error);
    return { success: false, error: "Impossibile eliminare la richiesta." };
  }
}
