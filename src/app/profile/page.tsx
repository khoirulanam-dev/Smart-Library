"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      email: formData.email || undefined,
      password: formData.password || undefined,
      data: { full_name: formData.name },
    });

    if (error) toast.error(error.message);
    else toast.success("Profile Updated Successfully!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] p-10 font-mono">
      <div className="max-w-md mx-auto bg-[#111113] border border-zinc-800 p-8 rounded-2xl">
        <h2 className="text-white font-bold mb-6 italic tracking-tighter text-xl">
          Profile Settings
        </h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs outline-none focus:border-cyan-500"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="New Email"
            className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs outline-none focus:border-cyan-500"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs outline-none focus:border-cyan-500"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            disabled={loading}
            className="w-full py-3 bg-cyan-500 text-black font-bold rounded-lg text-xs uppercase hover:bg-cyan-400 transition"
          >
            {loading ? "Processing..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
