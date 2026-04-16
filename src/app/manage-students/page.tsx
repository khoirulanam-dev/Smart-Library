"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  UserPlus,
  Hash,
  User,
  IdCard,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
  Search,
} from "lucide-react";

export default function ManageStudents() {
  const [mhs, setMhs] = useState({ uid: "", nama: "", nim: "" });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // State untuk Edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ uid: "", nama: "", nim: "" });

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("mahasiswa")
      .select("*")
      .order("id", { ascending: false });

    if (data) setStudents(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("mahasiswa").insert([
        {
          uid_kartu: mhs.uid.toUpperCase(),
          nama: mhs.nama,
          nim: mhs.nim,
        },
      ]);

      if (error) throw error;

      toast.success("Mahasiswa Berhasil Terdaftar!");
      setMhs({ uid: "", nama: "", nim: "" });
      fetchData();
    } catch (error: any) {
      toast.error("Gagal mendaftar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data mahasiswa ini?")) return;

    try {
      const { error } = await supabase.from("mahasiswa").delete().eq("id", id);
      if (error) throw error;

      toast.success("Data Mahasiswa Berhasil Dihapus");
      fetchData();
    } catch (error: any) {
      toast.error("Gagal menghapus data");
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const { error } = await supabase
        .from("mahasiswa")
        .update({
          uid_kartu: editData.uid.toUpperCase(),
          nama: editData.nama,
          nim: editData.nim,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Data Berhasil Diperbarui");
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error("Gagal memperbarui data");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nim.toLowerCase().includes(search.toLowerCase()) ||
      s.uid_kartu.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0d0d0f] p-6 md:p-12 font-mono text-zinc-300">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* FORM REGISTER MAHASISWA */}
        <section className="max-w-lg mx-auto bg-[#111113] border border-zinc-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <h2 className="text-white font-bold mb-8 italic tracking-tighter text-2xl flex items-center gap-3">
            <UserPlus className="text-emerald-500" /> Tambah Mahasiswa
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Hash size={12} /> UID Kartu
              </label>
              <input
                type="text"
                required
                value={mhs.uid}
                placeholder="SCAN_CARD_NOW"
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-emerald-500 text-emerald-400 outline-none transition-all"
                onChange={(e) => setMhs({ ...mhs, uid: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={mhs.nama}
                  placeholder="NAMA LENGKAP"
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-emerald-500 text-white outline-none transition-all"
                  onChange={(e) => setMhs({ ...mhs, nama: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <IdCard size={12} /> NIM
                </label>
                <input
                  type="text"
                  required
                  value={mhs.nim}
                  placeholder="NIM"
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-emerald-500 text-white outline-none transition-all"
                  onChange={(e) => setMhs({ ...mhs, nim: e.target.value })}
                />
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full py-4 bg-emerald-500 text-black font-black rounded-xl text-xs uppercase hover:bg-emerald-400 transition-all flex justify-center items-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Submit Mahasiswa"
              )}
            </button>
          </form>
        </section>

        {/* STUDENT TABLE MANAGEMENT */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
            <h2 className="text-white font-bold italic tracking-tighter text-xl uppercase">
              Student_Database
            </h2>
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-2.5 text-zinc-600"
                size={16}
              />
              <input
                type="text"
                placeholder="Search Name, NIM, or UID..."
                className="w-full bg-[#111113] border border-zinc-800 p-2 pl-10 rounded-lg text-xs outline-none focus:border-emerald-500"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-zinc-400">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/50 text-zinc-600 border-b border-zinc-800 uppercase font-bold text-[9px]">
                <tr>
                  <th className="p-4 w-12 text-center">No.</th>
                  <th className="p-4">UID_Kartu</th>
                  <th className="p-4">Nama_Lengkap</th>
                  <th className="p-4">NIM</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {filteredStudents.map((s, index) => (
                  <tr
                    key={s.id}
                    className="hover:bg-emerald-500/[0.02] transition group"
                  >
                    <td className="p-4 text-center text-zinc-600 font-bold">
                      {index + 1}.
                    </td>
                    <td className="p-4 font-bold text-emerald-500">
                      {editingId === s.id ? (
                        <input
                          className="bg-black border border-zinc-700 p-1 rounded text-emerald-400 outline-none w-full"
                          value={editData.uid}
                          onChange={(e) =>
                            setEditData({ ...editData, uid: e.target.value })
                          }
                        />
                      ) : (
                        s.uid_kartu
                      )}
                    </td>
                    <td className="p-4 text-zinc-200">
                      {editingId === s.id ? (
                        <input
                          className="bg-black border border-zinc-700 p-1 rounded text-white outline-none w-full"
                          value={editData.nama}
                          onChange={(e) =>
                            setEditData({ ...editData, nama: e.target.value })
                          }
                        />
                      ) : (
                        s.nama
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === s.id ? (
                        <input
                          className="bg-black border border-zinc-700 p-1 rounded text-white outline-none w-full"
                          value={editData.nim}
                          onChange={(e) =>
                            setEditData({ ...editData, nim: e.target.value })
                          }
                        />
                      ) : (
                        s.nim
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === s.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(s.id)}
                              className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500/40 transition"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(s.id);
                                setEditData({
                                  uid: s.uid_kartu,
                                  nama: s.nama,
                                  nim: s.nim,
                                });
                              }}
                              className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="p-10 text-center text-zinc-700 italic text-[10px]">
                No student records found in this sector.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
