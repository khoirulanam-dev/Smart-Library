"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BookPlus,
  Trash2,
  Database,
  UserPlus,
  Fingerprint,
} from "lucide-react";

export default function InventoryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"books" | "students">("books");

  const fetchData = async () => {
    const { data: b } = await supabase
      .from("buku")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: s } = await supabase
      .from("mahasiswa")
      .select("*")
      .order("created_at", { ascending: false });
    if (b) setBooks(b);
    if (s) setStudents(s);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-zinc-400 font-mono p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-end border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-white text-3xl font-black tracking-tighter uppercase italic">
              Registry_Sector
            </h1>
            <p className="text-[10px] text-zinc-600 tracking-[0.3em] mt-1">
              Manage entity identifiers and stock records
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("books")}
              className={`px-4 py-2 text-[10px] font-bold rounded-t-lg transition ${activeTab === "books" ? "bg-zinc-800 text-cyan-400 border-b-2 border-cyan-500" : "text-zinc-600"}`}
            >
              [ BOOKS_DB ]
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 text-[10px] font-bold rounded-t-lg transition ${activeTab === "students" ? "bg-zinc-800 text-cyan-400 border-b-2 border-cyan-500" : "text-zinc-600"}`}
            >
              [ STUDENTS_DB ]
            </button>
          </div>
        </header>

        {activeTab === "books" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Tambah Buku */}
            <div className="bg-[#111113] border border-zinc-800 p-6 rounded-2xl h-fit">
              <h3 className="flex items-center gap-2 text-white text-xs font-bold mb-6 uppercase tracking-widest">
                <BookPlus size={16} className="text-cyan-500" /> Insert_New_Book
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="BOOK_TITLE"
                  className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs outline-none focus:border-cyan-500 transition"
                />
                <input
                  type="text"
                  placeholder="RFID_UID_TAG"
                  className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs outline-none focus:border-cyan-500 transition"
                />
                <button className="w-full py-3 bg-cyan-500 text-black font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-cyan-400 transition">
                  Execute_Commit
                </button>
              </div>
            </div>

            {/* Tabel Buku */}
            <div className="lg:col-span-2 bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 text-[10px] text-zinc-600 uppercase">
                  <tr>
                    <th className="p-4">UID</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-[11px]">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-800/30 transition">
                      <td className="p-4 font-mono text-zinc-500">
                        {b.uid_buku}
                      </td>
                      <td className="p-4 text-zinc-200">{b.judul}</td>
                      <td className="p-4">{b.stok}</td>
                      <td className="p-4 text-right">
                        <Trash2
                          size={14}
                          className="inline cursor-pointer hover:text-red-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Tambah Mahasiswa */}
            <div className="bg-[#111113] border border-zinc-800 p-6 rounded-2xl h-fit">
              <h3 className="flex items-center gap-2 text-white text-xs font-bold mb-6 uppercase tracking-widest">
                <UserPlus size={16} className="text-emerald-500" />{" "}
                Register_Member
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="FULL_NAME"
                  className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                />
                <input
                  type="text"
                  placeholder="NIM_NUMBER"
                  className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                />
                <input
                  type="text"
                  placeholder="CARD_UID"
                  className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                />
                <button className="w-full py-3 bg-emerald-500 text-black font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-emerald-400 transition">
                  Register_Node
                </button>
              </div>
            </div>

            {/* Tabel Mahasiswa */}
            <div className="lg:col-span-2 bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 text-[10px] text-zinc-600 uppercase">
                  <tr>
                    <th className="p-4">CARD_ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-[11px]">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-800/30 transition">
                      <td className="p-4 font-mono text-zinc-500">
                        {s.uid_kartu}
                      </td>
                      <td className="p-4 text-zinc-200 font-bold">{s.nama}</td>
                      <td className="p-4 text-right text-emerald-500 uppercase text-[9px]">
                        Verified
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
