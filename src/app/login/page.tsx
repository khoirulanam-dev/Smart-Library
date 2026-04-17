"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User } from "lucide-react";



export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("ACCESS_DENIED: Credentials Invalid");
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-sm bg-[#111113] border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-cyan-500/10 text-cyan-400 rounded-xl mb-4 border border-cyan-500/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-white text-xl font-black tracking-tighter">
            Smart Library Login
          </h1>
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest mt-2">
            Authorization Required
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-zinc-600" size={16} />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-black border border-zinc-800 p-3 pl-10 rounded-lg text-sm outline-none focus:border-cyan-500 transition"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-zinc-600" size={16} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-black border border-zinc-800 p-3 pl-10 rounded-lg text-sm outline-none focus:border-cyan-500 transition"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            className="w-full py-3 bg-cyan-500 text-black font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-cyan-400 transition"
          >
            {loading ? "AUTHENTICATING..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
