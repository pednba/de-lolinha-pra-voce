// Lista de kits com campo de nome da cliente (personaliza a mensagem do WhatsApp).
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Kit } from "@/types";
import { KitCard } from "@/components/KitCard";

export function KitsView({ kits }: { kits: Kit[] }) {
  const [nome, setNome] = useState("");

  if (kits.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-pink-100 bg-white/70 p-6 text-neutral-600">
        <p>
          Ainda não temos kits para essas necessidades por aqui. Que tal ajustar
          sua seleção?
        </p>
        <Link
          href="/quiz"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-pink-600 px-5 py-2 font-medium text-white transition-colors hover:bg-pink-700"
        >
          Refazer curadoria
        </Link>
      </div>
    );
  }

  return (
    <>
      <label className="mt-6 block">
        <span className="text-sm font-medium text-neutral-700">
          Seu nome (opcional)
        </span>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Pra Lolinha já te chamar pelo nome 💕"
          className="mt-1 w-full max-w-sm rounded-xl border border-pink-200 bg-white px-4 py-2.5 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
        />
      </label>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {kits.map((kit) => (
          <KitCard key={kit.id} kit={kit} clienteNome={nome.trim() || undefined} />
        ))}
      </div>
    </>
  );
}
