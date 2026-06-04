"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { exportSectionsToPdf } from "@/lib/export-pdf";
import { reportSupabaseError } from "@/lib/supabase-error";
import InteractiveParticlesRing from "@/components/InteractiveParticlesRing";
import {
  Book,
  Users,
  Clock,
  List,
  AlertTriangle,
  CheckCircle,
  Activity,
  Download,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type CatalogItem = {
  id: number | string;
  judul: string;
  total_stok: number;
  stok_tersedia: number;
};

type BorrowedBook = {
  id: number | string;
  waktu: string;
  mahasiswa?: {
    nama: string;
  } | null;
  buku_item?: {
    uid_buku: string;
    buku_master?: {
      judul: string;
    } | null;
  } | null;
};

type Student = {
  id: number | string;
  nama: string;
  nim: string;
  uid_kartu: string;
};

export default function LibraryDashboard() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    members: 0,
    borrowed: 0,
    available: 0,
  });

  const fetchData = async () => {
    // 1. Ambil Data Master & Mahasiswa (Tetap sama)
    const { data: masters, error: mastersError } = await supabase
      .from("buku_master")
      .select("*");
    if (mastersError) {
      reportSupabaseError("Gagal mengambil data buku", mastersError);
    }

    const { count: sCount, error: studentsError } = await supabase
      .from("mahasiswa")
      .select("*", { count: "exact", head: true });
    if (studentsError) {
      reportSupabaseError("Gagal menghitung data mahasiswa", studentsError);
    }

    const { data: studentRows, error: studentRowsError } = await supabase
      .from("mahasiswa")
      .select("id, nama, nim, uid_kartu")
      .order("id", { ascending: false });
    if (studentRowsError) {
      reportSupabaseError("Gagal mengambil daftar mahasiswa", studentRowsError);
    }

    // 2. QUERY PERBAIKAN: Ambil judul melalui buku_item
    const { data: borrowed, error: borrowedError } = await supabase
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
    if (borrowedError) {
      reportSupabaseError("Gagal mengambil data peminjaman", borrowedError);
    }

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
      setCatalog(masters as CatalogItem[]);
    }

    if (studentRows) {
      setStudents(studentRows as Student[]);
    }

    if (borrowed) {
      setBorrowedBooks(borrowed as unknown as BorrowedBook[]);
    }
  };

  const recentBorrowed = borrowedBooks[0];
  const availablePercent =
    stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0;
  const borrowedPercent =
    stats.total > 0 ? Math.round((stats.borrowed / stats.total) * 100) : 0;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  }, []);

  const activityTimeline = useMemo(
    () =>
      borrowedBooks.slice(0, 5).map((log) => ({
        id: log.id,
        time: new Date(log.waktu).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        title: log.buku_item?.buku_master?.judul || "Judul Tidak Ditemukan",
        description: `${log.mahasiswa?.nama || "Mahasiswa"} sedang meminjam buku`,
      })),
    [borrowedBooks],
  );

  const searchResults = useMemo(() => {
    const keyword = globalSearch.trim().toLowerCase();
    if (!keyword) return [];

    const books = catalog
      .filter((book) => book.judul.toLowerCase().includes(keyword))
      .slice(0, 4)
      .map((book) => ({
        id: `book-${book.id}`,
        type: "Buku",
        title: book.judul,
        meta: `${book.stok_tersedia}/${book.total_stok} tersedia`,
        href: "/manage-books",
      }));

    const members = students
      .filter(
        (student) =>
          student.nama.toLowerCase().includes(keyword) ||
          student.nim.toLowerCase().includes(keyword) ||
          student.uid_kartu.toLowerCase().includes(keyword),
      )
      .slice(0, 4)
      .map((student) => ({
        id: `student-${student.id}`,
        type: "Mahasiswa",
        title: student.nama,
        meta: `${student.nim} - ${student.uid_kartu}`,
        href: "/manage-students",
      }));

    return [...books, ...members].slice(0, 6);
  }, [catalog, globalSearch, students]);

  const handleExportPdf = () => {
    exportSectionsToPdf("Smart Library Report", [
      {
        title: "Ringkasan",
        headers: ["Metric", "Nilai"],
        rows: [
          ["Total Buku", stats.total],
          ["Mahasiswa", stats.members],
          ["Sedang Dipinjam", stats.borrowed],
          ["Tersedia", stats.available],
        ],
      },
      {
        title: "Katalog Buku",
        headers: ["Judul", "Tersedia", "Total", "Status"],
        rows: catalog.map((book) => [
          book.judul,
          book.stok_tersedia,
          book.total_stok,
          book.stok_tersedia === 0 ? "OUT_OF_STOCK" : "AVAILABLE",
        ]),
      },
      {
        title: "Peminjaman Aktif",
        headers: ["Waktu", "Peminjam", "Judul Buku", "UID Buku"],
        rows: borrowedBooks.map((item) => [
          new Date(item.waktu).toLocaleString("id-ID"),
          item.mahasiswa?.nama || "-",
          item.buku_item?.buku_master?.judul || "-",
          item.buku_item?.uid_buku || "-",
        ]),
      },
      {
        title: "Mahasiswa",
        headers: ["Nama", "NIM", "UID Kartu"],
        rows: students.map((student) => [
          student.nama,
          student.nim,
          student.uid_kartu,
        ]),
      },
    ]);
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchData();
    });

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
        <header className="relative mb-8 overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#111113]/45 p-6 shadow-lg lg:p-8">
          <InteractiveParticlesRing />
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 uppercase tracking-[0.3em] mb-3">
              <Sparkles size={14} /> {greeting}, Admin
            </div>
            <h1 className="text-white text-3xl md:text-4xl font-black tracking-tighter italic uppercase">
              Smart Library
            </h1>
            <p className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase mt-2">
              Monitoring Perpustakaan
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-3 text-zinc-600"
              />
              <input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Cari buku, nama, NIM..."
                className="w-full bg-[#111113] border border-zinc-800 p-3 pl-10 rounded-xl text-xs outline-none focus:border-cyan-500"
              />
              {globalSearch && (
                <div className="absolute right-0 top-12 z-40 w-full rounded-xl border border-zinc-800 bg-[#111113] shadow-2xl overflow-hidden">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        className="block p-3 border-b border-zinc-800/60 hover:bg-zinc-900 transition"
                      >
                        <div className="flex justify-between gap-3">
                          <span className="text-zinc-100 text-xs font-bold">
                            {result.title}
                          </span>
                          <span className="text-[9px] text-cyan-500 uppercase">
                            {result.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1">
                          {result.meta}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-[10px] text-zinc-600 italic">
                      Tidak ada hasil ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleExportPdf}
              className="flex items-center justify-center gap-2 bg-white text-black px-4 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-cyan-400 transition"
            >
              <Download size={15} /> Export PDF
            </button>
          </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <section className="lg:col-span-2 bg-[#111113] border border-zinc-800 p-5 rounded-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2">
                  Recent Borrowed
                </p>
                <h2 className="text-white text-xl font-black tracking-tighter">
                  {recentBorrowed?.buku_item?.buku_master?.judul ||
                    "Belum ada peminjaman aktif"}
                </h2>
                <p className="text-xs text-zinc-500 mt-2">
                  {recentBorrowed
                    ? `Dipinjam oleh ${recentBorrowed.mahasiswa?.nama || "Mahasiswa"} pada ${new Date(recentBorrowed.waktu).toLocaleString("id-ID")}`
                    : "Saat ini tidak ada aktivitas peminjaman terbaru."}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock size={22} />
              </div>
            </div>
          </section>

          <section className="bg-[#111113] border border-zinc-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest">
                  Storage Chart
                </p>
                <h2 className="text-white text-sm font-black mt-1">
                  Buku tersedia vs dipinjam
                </h2>
              </div>
              <FileText size={18} className="text-cyan-500" />
            </div>
            <div className="h-3 bg-zinc-900 rounded-full overflow-hidden flex">
              <div
                className="bg-cyan-500"
                style={{ width: `${availablePercent}%` }}
              />
              <div
                className="bg-amber-500"
                style={{ width: `${borrowedPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-[10px]">
              <div className="border border-cyan-500/20 bg-cyan-500/5 p-3 rounded-xl">
                <div className="text-cyan-400 font-black">
                  {availablePercent}%
                </div>
                <div className="text-zinc-600 uppercase mt-1">Tersedia</div>
              </div>
              <div className="border border-amber-500/20 bg-amber-500/5 p-3 rounded-xl">
                <div className="text-amber-400 font-black">
                  {borrowedPercent}%
                </div>
                <div className="text-zinc-600 uppercase mt-1">Dipinjam</div>
              </div>
            </div>
          </section>
        </div>

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

        <section className="space-y-4 mb-10">
          <h2 className="text-xs font-bold text-zinc-200 flex items-center gap-2 px-2 uppercase tracking-widest">
            <Activity size={14} className="text-emerald-500" /> Activity
            Timeline
          </h2>
          <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-5">
            {activityTimeline.length > 0 ? (
              <div className="space-y-4">
                {activityTimeline.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-zinc-800/60 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="w-14 shrink-0 text-[10px] text-zinc-600 font-bold">
                      {item.time}
                    </div>
                    <div className="relative pl-5">
                      <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                      <h3 className="text-sm text-white font-bold">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-zinc-600 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-zinc-700 italic text-xs">
                Belum ada aktivitas peminjaman aktif
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TABEL PEMINJAMAN AKTIF */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-200 flex items-center gap-2 px-2 uppercase tracking-widest">
              <Clock size={14} className="text-amber-500" /> Buku Dipinjam
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
                  Tidak ada buku dipinjam
                </div>
              )}
            </div>
          </section>

          {/* KATALOG MASTER & STOK */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-200 flex items-center gap-2 px-2 uppercase tracking-widest">
              <List size={14} className="text-cyan-500" /> Storage Buku
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
    </div>
  );
}
