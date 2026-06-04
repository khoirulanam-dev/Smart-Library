import { toast } from "sonner";

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Terjadi error saat mengakses Supabase";
}

export function reportSupabaseError(context: string, error: unknown) {
  if (!error) return;

  console.error(`[Supabase] ${context}`, error);
  toast.error(context, {
    description: getErrorMessage(error),
  });
}
