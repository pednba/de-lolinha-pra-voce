// Página de resultados: exibe os kits curados sugeridos para a cliente.
import Link from "next/link";
import { fetchProducts } from "@/lib/google-sheets";
import { buildKits } from "@/lib/catalog";
import { sanitizeNecessidades } from "@/lib/necessidades";
import { KitCard } from "@/components/KitCard";
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
        <h1 className="text-2xl font-semibold">Seus kits selecionados</h1>
        <p className="mt-2 text-neutral-600">
          Kits pensados especialmente para as suas necessidades.
        </p>

        {kits.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {kits.map((kit) => (
              <KitCard key={kit.id} kit={kit} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-neutral-200 p-6 text-neutral-600">
            <p>
              Ainda não temos kits para essas necessidades por aqui. Que tal
              ajustar sua seleção?
            </p>
            <Link
              href="/quiz"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-pink-600 px-5 py-2 font-medium text-white transition-colors hover:bg-pink-700"
            >
              Refazer curadoria
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
