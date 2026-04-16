"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Book,
  Users,
  LayoutDashboard,
  UserCircle,
  LogOut,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Gagal Logout");
      setIsLoggingOut(false);
    } else {
      toast.success("Berhasil Logout!");
      // Pakai window.location agar browser melakukan refresh total
      window.location.href = "/login";
    }
  };

  const menu = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Data Buku", path: "/manage-books", icon: Book },
    { name: "Data Mahasiswa", path: "/manage-students", icon: Users },
  ];

  return (
    <nav className="bg-[#111113] border-b border-zinc-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50 font-mono">
      <div className="flex items-center gap-8">
        <h1 className="text-white font-black italic tracking-tighter text-lg">
          SMART_LIB
        </h1>
        <div className="hidden md:flex gap-6">
          {menu.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition ${
                pathname === item.path
                  ? "text-cyan-400"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <item.icon size={14} /> {item.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Profile Link */}
        <Link
          href="/profile"
          className={`p-2 rounded-full border transition ${
            pathname === "/profile"
              ? "border-cyan-500 text-cyan-500"
              : "border-zinc-800 text-zinc-500 hover:text-white"
          }`}
        >
          <UserCircle size={20} />
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="p-2 rounded-full border border-zinc-800 text-zinc-500 hover:border-red-500 hover:text-red-500 transition-all flex items-center gap-2 group"
        >
          {isLoggingOut ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LogOut size={18} />
          )}
          <span className="text-[10px] font-bold uppercase hidden group-hover:inline pr-2">
            Exit_System
          </span>
        </button>
      </div>
    </nav>
  );
}
