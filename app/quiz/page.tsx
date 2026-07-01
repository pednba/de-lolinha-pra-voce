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
        <h1 className="text-2xl font-semibold">
          Conte pra Lolinha o que você precisa
        </h1>
        <p className="mt-2 text-neutral-600">
          Escolha suas necessidades de beleza e receba kits curados pra você.
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
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  ativa
                    ? "border-pink-600 bg-pink-50 text-pink-800"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <span className="block font-medium">{n.label}</span>
                <span className="text-sm text-neutral-500">{n.categoria}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={continuar}
          disabled={selecionadas.size === 0}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ver meus kits ({selecionadas.size})
        </button>
      </main>
      <Footer />
    </div>
  );
}
