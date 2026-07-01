import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PASSOS = [
  { emoji: "📝", titulo: "Conte o que você precisa", texto: "Escolha suas necessidades de beleza num quiz rapidinho." },
  { emoji: "✨", titulo: "Receba kits curados", texto: "A Lolinha monta combinações feitas pra você." },
  { emoji: "💬", titulo: "Feche no WhatsApp", texto: "Confirme o pedido direto com a Lolinha, sem complicação." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-16 text-center">
        <span className="rounded-full bg-pink-100 px-4 py-1 text-sm font-medium text-pink-700">
          Curadoria de cosméticos ✦ feita à mão
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Kits de beleza feitos <span className="text-pink-600">pra você</span> 💄
        </h1>
        <p className="mt-5 max-w-xl text-lg text-neutral-600 text-balance">
          Conte pra Lolinha quais são as suas necessidades de beleza e receba uma
          curadoria de kits pensada especialmente pra você. O fechamento é
          rapidinho, direto no WhatsApp.
        </p>
        <Link
          href="/quiz"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-pink-600 px-8 py-3.5 text-lg font-medium text-white shadow-lg shadow-pink-600/20 transition-colors hover:bg-pink-700"
        >
          Começar minha curadoria →
        </Link>

        <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {PASSOS.map((p, i) => (
            <div
              key={p.titulo}
              className="rounded-2xl border border-pink-100 bg-white/70 p-5 text-left"
            >
              <div className="text-2xl">{p.emoji}</div>
              <div className="mt-3 text-sm font-medium text-pink-600">
                Passo {i + 1}
              </div>
              <h3 className="mt-1 font-semibold">{p.titulo}</h3>
              <p className="mt-1 text-sm text-neutral-600">{p.texto}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
