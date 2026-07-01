// Página de resultados: exibe os kits curados sugeridos para a cliente.
import Link from "next/link";
import { fetchProducts } from "@/lib/google-sheets";
import { buildKits } from "@/lib/catalog";
import { sanitizeNecessidades, necessidadeLabel } from "@/lib/necessidades";
import { KitsView } from "@/components/KitsView";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function KitsPage({
  searchParams,
}: {
  searchParams: { necessidades?: string };
}) {
  const raw = searchParams.necessidades ?? "";
  const necessidades = sanitizeNecessidades(
    raw.split(",").map((s) => s.trim()).filter(Boolean),
  );

  const products = await fetchProducts();
  const kits = buildKits(products, necessidades);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <Link href="/quiz" className="text-sm text-pink-600 hover:underline">
          ← Refazer curadoria
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Seus kits selecionados
        </h1>
        <p className="mt-2 text-neutral-600">
          {necessidades.length > 0
            ? `Com base em: ${necessidades.map(necessidadeLabel).join(", ")}.`
            : "Kits pensados especialmente para as suas necessidades."}
        </p>

        <KitsView kits={kits} />
      </main>
      <Footer />
    </div>
  );
}
