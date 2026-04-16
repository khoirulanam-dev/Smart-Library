import { Book, Users, Activity, Clock } from "lucide-react";

export default function StatsGrid({ totalLogs }: { totalLogs: number }) {
  const stats = [
    {
      label: "Total Scans",
      value: totalLogs,
      icon: Activity,
      color: "text-cyan-400",
    },
    {
      label: "Active Members",
      value: "124",
      icon: Users,
      color: "text-emerald-400",
    },
    {
      label: "Books Issued",
      value: "45",
      icon: Book,
      color: "text-purple-400",
    },
    {
      label: "Avg. Latency",
      value: "124ms",
      icon: Clock,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-[#111113] border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition"
        >
          <div className="flex justify-between items-start mb-2">
            <stat.icon size={18} className={stat.color} />
            <span className="text-[10px] text-zinc-600 font-mono">STABLE</span>
          </div>
          <div className="text-2xl font-black text-white">{stat.value}</div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
