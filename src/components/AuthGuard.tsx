"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Jika di halaman login, jangan dicek (biar nggak looping)
      if (pathname === "/login") {
        setLoading(false);
        return;
      }

      if (!session) {
        router.replace("/login");
      } else {
        setAuthorized(true);
        setLoading(false);
      }
    };

    checkUser();
  }, [pathname, router]);

  // Tampilkan loading screen biar nggak ada "flash" konten dashboard
  if (loading && pathname !== "/login") {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center font-mono">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-cyan-500 mx-auto" size={40} />
          <p className="text-zinc-500 text-xs tracking-widest uppercase">
            Verifying_Session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
