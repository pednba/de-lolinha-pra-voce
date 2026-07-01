// Página do quiz: a cliente escolhe suas necessidades de beleza.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NECESSIDADES } from "@/lib/necessidades";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function QuizPage() {
  const router = useRouter();
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function continuar() {
    const query = Array.from(selecionadas).join(",");
    router.push(`/kits?necessidades=${encodeURIComponent(query)}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          Conte pra Lolinha o que você precisa
        </h1>
        <p className="mt-2 text-neutral-600">
          Escolha uma ou mais necessidades de beleza e receba kits curados pra
          você.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {NECESSIDADES.map((n) => {
            const ativa = selecionadas.has(n.id);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => toggle(n.id)}
                aria-pressed={ativa}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                  ativa
                    ? "border-pink-500 bg-pink-50 ring-2 ring-pink-200"
                    : "border-neutral-200 bg-white/70 hover:border-pink-300"
                }`}
              >
                <span className="text-2xl">{n.emoji}</span>
                <span className="flex-1">
                  <span className="block font-medium">{n.label}</span>
                  <span className="text-sm text-neutral-500">{n.categoria}</span>
                </span>
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full border text-sm ${
                    ativa
                      ? "border-pink-500 bg-pink-500 text-white"
                      : "border-neutral-300 text-transparent"
                  }`}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>

        <div className="sticky bottom-4 mt-8">
          <button
            type="button"
            onClick={continuar}
            disabled={selecionadas.size === 0}
            className="w-full rounded-full bg-pink-600 px-6 py-3.5 text-lg font-medium text-white shadow-lg shadow-pink-600/20 transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {selecionadas.size === 0
              ? "Escolha ao menos uma necessidade"
              : `Ver meus kits (${selecionadas.size})`}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
