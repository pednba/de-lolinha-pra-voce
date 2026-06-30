import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Kits de beleza feitos pra você 💄
        </h1>
        <p className="mt-4 max-w-xl text-neutral-600">
          Conte pra Lolinha quais são as suas necessidades de beleza e receba
          uma curadoria de kits pensada especialmente pra você. O fechamento é
          rapidinho, direto no WhatsApp.
        </p>
        <Link
          href="/quiz"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700"
        >
          Começar minha curadoria
        </Link>
      </main>
      <Footer />
    </div>
  );
}
