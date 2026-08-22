"use client";

import { useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export function usePhotoUpload(userId: string | null, bucket: string) {
  const uploadPhoto = useCallback(
    async (file: File) => {
      if (!userId) return { url: null, error: "Not signed in" };
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await getSupabaseClient()
        .storage.from(bucket)
        .upload(path, file);
      if (error) return { url: null, error: error.message };
      const { data } = getSupabaseClient().storage.from(bucket).getPublicUrl(path);
      return { url: data.publicUrl, error: null };
    },
    [userId, bucket]
  );

  return { uploadPhoto };
}
