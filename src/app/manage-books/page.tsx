"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  BookPlus, Hash, Bookmark, Trash2, 
  Edit3, Save, X, Loader2, Search 
} from "lucide-react";

export default function ManageBooks() {
  const [book, setBook] = useState({ uid: "", title: "" });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ uid: "", title: "" });

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("buku_item")
      .select(`
        id,
        uid_buku,
        status,
        master_id,
        buku_master (id, judul, total_stok, stok_tersedia)
      `)
      .order("id", { ascending: false });
    
    if (data) setItems(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let { data: master } = await supabase
        .from("buku_master")
        .select("id, total_stok, stok_tersedia")
        .eq("judul", book.title)
        .single();

      let masterId;
      if (!master) {
        const { data: newMaster, error: mErr } = await supabase
          .from("buku_master")
          .insert([{ judul: book.title, total_stok: 1, stok_tersedia: 1 }])
          .select().single();
        if (mErr) throw mErr;
        masterId = newMaster.id;
      } else {
        await supabase.from("buku_master")
          .update({ total_stok: master.total_stok + 1, stok_tersedia: master.stok_tersedia + 1 })
          .eq("id", master.id);
        masterId = master.id;
      }

      await supabase.from("buku_item").insert([{ uid_buku: book.uid.toUpperCase(), master_id: masterId }]);
      toast.success("Buku Berhasil Terdaftar!");
      setBook({ uid: "", title: "" });
      fetchData();
    } catch (error: any) {
      toast.error("Gagal mendaftar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: number, masterId: number, status: string) => {
    if (!confirm("Yakin ingin menghapus unit buku ini? Stok akan berkurang otomatis.")) return;

    try {
      const { data: master } = await supabase.from("buku_master").select("*").eq("id", masterId).single();
      
      if (master) {
        await supabase.from("buku_master").update({
          total_stok: Math.max(0, master.total_stok - 1),
          stok_tersedia: status === 'tersedia' ? Math.max(0, master.stok_tersedia - 1) : master.stok_tersedia
        }).eq("id", masterId);
      }

      await supabase.from("buku_item").delete().eq("id", itemId);
      toast.success("Unit Buku Berhasil Dihapus");
      fetchData();
    } catch (error: any) {
      toast.error("Gagal menghapus");
    }
  };

  const handleUpdate = async (itemId: number, masterId: number) => {
    try {
      await supabase.from("buku_item").update({ uid_buku: editData.uid.toUpperCase() }).eq("id", itemId);
      await supabase.from("buku_master").update({ judul: editData.title }).eq("id", masterId);
      
      toast.success("Data Berhasil Diperbarui");
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error("Gagal memperbarui data");
    }
  };

  const filteredItems = items.filter(item => 
    item.buku_master?.judul.toLowerCase().includes(search.toLowerCase()) || 
    item.uid_buku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0d0f] p-6 md:p-12 font-mono text-zinc-300">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* FORM REGISTER */}
        <section className="max-w-lg mx-auto bg-[#111113] border border-zinc-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <h2 className="text-white font-bold mb-8 italic tracking-tighter text-2xl flex items-center gap-3">
            <BookPlus className="text-cyan-500" /> Tambah Buku
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Hash size={12}/> UID Buku</label>
              <input type="text" required value={book.uid} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-cyan-500 text-cyan-400 outline-none" onChange={(e) => setBook({ ...book, uid: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Bookmark size={12}/> Judul Buku </label>
              <input type="text" required value={book.title} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-cyan-500 text-white outline-none" onChange={(e) => setBook({ ...book, title: e.target.value })} />
            </div>
            <button disabled={loading} className="w-full py-4 bg-white text-black font-black rounded-xl text-xs uppercase hover:bg-cyan-400 transition-all flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={16}/> : "Submit Buku"}
            </button>
          </form>
        </section>

        {/* INVENTORY TABLE DENGAN NO. URUT */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
            <h2 className="text-white font-bold italic tracking-tighter text-xl uppercase">Management Buku</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-zinc-600" size={16} />
              <input 
                type="text" 
                placeholder="Search UID or Title..." 
                className="w-full bg-[#111113] border border-zinc-800 p-2 pl-10 rounded-lg text-xs outline-none focus:border-cyan-500"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/50 text-zinc-600 border-b border-zinc-800 uppercase font-bold text-[9px]">
                <tr>
                  <th className="p-4 w-12 text-center">No.</th>
                  <th className="p-4">UID Buku</th>
                  <th className="p-4">Judul Buku</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-zinc-800/20 transition group">
                    <td className="p-4 text-center text-zinc-600 font-bold">{index + 1}.</td>
                    <td className="p-4 font-bold text-cyan-500">
                      {editingId === item.id ? (
                        <input 
                          className="bg-black border border-zinc-700 p-1 rounded text-cyan-400 outline-none w-full"
                          value={editData.uid}
                          onChange={(e) => setEditData({...editData, uid: e.target.value})}
                        />
                      ) : item.uid_buku}
                    </td>
                    <td className="p-4 text-zinc-200">
                      {editingId === item.id ? (
                        <input 
                          className="bg-black border border-zinc-700 p-1 rounded text-white outline-none w-full"
                          value={editData.title}
                          onChange={(e) => setEditData({...editData, title: e.target.value})}
                        />
                      ) : item.buku_master?.judul}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${item.status === 'pinjam' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === item.id ? (
                          <>
                            <button onClick={() => handleUpdate(item.id, item.master_id)} className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500/40 transition"><Save size={14}/></button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition"><X size={14}/></button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => {
                                setEditingId(item.id);
                                setEditData({ uid: item.uid_buku, title: item.buku_master?.judul });
                              }} 
                              className="p-2 bg-cyan-500/10 text-cyan-500 rounded-lg hover:bg-cyan-500/20 transition opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 size={14}/>
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id, item.master_id, item.status)} 
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14}/>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 && <div className="p-10 text-center text-zinc-700 italic text-[10px]">No inventory records detected in the local node.</div>}
          </div>
        </section>

      </div>
    </div>
  );
}