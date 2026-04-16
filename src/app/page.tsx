"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Book,
  Users,
  Clock,
  List,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react";
import { Toaster, toast } from "sonner";

export default function LibraryDashboard() {
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    members: 0,
    borrowed: 0,
    available: 0,
  });

  const fetchData = async () => {
    // 1. Ambil Data Master & Mahasiswa (Tetap sama)
    const { data: masters } = await supabase.from("buku_master").select("*");
    const { count: sCount } = await supabase
      .from("mahasiswa")
      .select("*", { count: "exact", head: true });

    // 2. QUERY PERBAIKAN: Ambil judul melalui buku_item
    const { data: borrowed } = await supabase
      .from("transaksi")
      .select(
        `
    id,
    waktu,
    status,
    mahasiswa (nama),
    buku_item:buku_item_id (
      uid_buku,
      buku_master (judul)
    )
  `,
      )
      .eq("status", "pinjam")
      .order("waktu", { ascending: false });

    if (masters) {
      const totalBuku = masters.reduce((acc, curr) => acc + curr.total_stok, 0);
      const tersediaBuku = masters.reduce(
        (acc, curr) => acc + curr.stok_tersedia,
        0,
      );
      setStats({
        total: totalBuku,
        members: sCount || 0,
        borrowed: totalBuku - tersediaBuku,
        available: tersediaBuku,
      });
      setCatalog(masters);
    }

    if (borrowed) {
      console.log("Data Peminjaman:", borrowed); // Untuk cek di console log browser
      setBorrowedBooks(borrowed);
    }
  };
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("library_main_system")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transaksi" },
        () => {
          fetchData();
          toast.success("Database Updated", {
            description: "Stok buku berhasil diperbarui",
            icon: <Activity size={16} className="text-emerald-500" />,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "logs" },
        (p) => {
          if (p.new.tipe === "error") {
            toast.error("SECURITY_ALERT", {
              description: p.new.pesan,
              icon: <AlertTriangle size={16} />,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-zinc-300 font-mono p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-white text-2xl font-black tracking-tighter italic uppercase">
            Smart Library
          </h1>
          <p className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase">
            Monitoring Perpustakaan
          </p>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Buku",
              val: stats.total,
              color: "text-zinc-100",
              icon: Book,
              iconCol: "text-zinc-500",
            },
            {
              label: "Jumlah Mahasiswa Terdaftar",
              val: stats.members,
              color: "text-emerald-400",
              icon: Users,
              iconCol: "text-emerald-500/50",
            },
            {
              label: "Sedang Dipinjam",
              val: stats.borrowed,
              color: "text-amber-400",
              icon: Clock,
              iconCol: "text-amber-500/50",
            },
            {
              label: "Tersedia",
              val: stats.available,
              color: "text-cyan-400",
              icon: CheckCircle,
              iconCol: "text-cyan-500/50",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-[#111113] border border-zinc-800 p-5 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all shadow-lg"
            >
              <s.icon
                size={60}
                className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${s.iconCol}`}
              />
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 ${s.iconCol}`}
                >
                  <s.icon size={16} />
                </div>
                <div className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest">
                  {s.label}
                </div>
              </div>
              <div
                className={`text-3xl font-black tracking-tighter ${s.color}`}
              >
                {s.val}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TABEL PEMINJAMAN AKTIF */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-200 flex items-center gap-2 px-2 uppercase tracking-widest">
              <Clock size={14} className="text-amber-500" /> Live Circulation
            </h2>
            <div className="bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-zinc-900/50 text-zinc-600 border-b border-zinc-800 uppercase font-bold text-[9px]">
                  <tr>
                    <th className="p-4">Waktu</th>
                    <th className="p-4">Peminjam</th>
                    <th className="p-4">Judul Buku</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {borrowedBooks.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-amber-500/[0.02] transition"
                    >
                      <td className="p-4 text-zinc-500 italic">
                        [{new Date(log.waktu).toLocaleTimeString()}]
                      </td>
                      <td className="p-4 text-white font-bold uppercase">
                        {log.mahasiswa?.nama}
                      </td>
                      <td className="p-4 text-amber-500 font-medium italic">
                        {/* PATH PERBAIKAN: pastikan pakai tanda tanya (?) untuk menghindari error null */}
                        {log.buku_item?.buku_master?.judul ||
                          "Judul Tidak Ditemukan"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {borrowedBooks.length === 0 && (
                <div className="p-10 text-center text-zinc-700 italic text-xs">
                  No active loans found.
                </div>
              )}
            </div>
          </section>

          {/* KATALOG MASTER & STOK */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-200 flex items-center gap-2 px-2 uppercase tracking-widest">
              <List size={14} className="text-cyan-500" /> Book Inventory
              (Master)
            </h2>
            <div className="bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-zinc-900/50 text-zinc-600 border-b border-zinc-800 uppercase font-bold text-[9px]">
                  <tr>
                    <th className="p-4 w-12">No.</th>
                    <th className="p-4">Judul Buku</th>
                    <th className="p-4 text-center">Stok (Tersedia/Total)</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {catalog.map((master, index) => (
                    <tr
                      key={master.id}
                      className="hover:bg-zinc-800/30 transition"
                    >
                      <td className="p-4 text-zinc-600">{index + 1}.</td>
                      <td className="p-4 text-zinc-100 font-medium">
                        {master.judul}
                      </td>
                      <td className="p-4 text-center text-zinc-400 font-bold">
                        {master.stok_tersedia} / {master.total_stok}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                            master.stok_tersedia === 0
                              ? "border-red-500/20 bg-red-500/5 text-red-500"
                              : "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
                          }`}
                        >
                          {master.stok_tersedia === 0
                            ? "OUT_OF_STOCK"
                            : "AVAILABLE"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
      <Toaster theme="dark" position="top-right" richColors />
    </div>
  );
}
