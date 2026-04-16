"use client";
import { useState } from "react";
import mqtt from "mqtt";
import { Lock, Unlock, Power } from "lucide-react";

export default function ControlPanel() {
  const [loading, setLoading] = useState(false);

  const triggerAction = (cmd: string) => {
    setLoading(true);
    const client = mqtt.connect(
      "wss://ID_CLUSTER.s1.eu.hivemq.cloud:8884/mqtt",
      {
        username: "Anam05",
        password: "PASSWORD",
      },
    );
    client.on("connect", () => {
      client.publish("perpus/control", cmd);
      setTimeout(() => {
        client.end();
        setLoading(false);
      }, 500);
    });
  };

  return (
    <div className="bg-[#111113] border border-zinc-800 p-6 rounded-2xl mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
          Security Protocols
        </h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => triggerAction("OPEN")}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition text-xs font-bold uppercase tracking-widest"
        >
          <Unlock size={16} /> Override Open
        </button>
        <button
          onClick={() => triggerAction("CLOSE")}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition text-xs font-bold uppercase tracking-widest"
        >
          <Lock size={16} /> Force Lock
        </button>
      </div>
    </div>
  );
}
