// Card que exibe um kit curado: produtos, preço e fechamento via WhatsApp.
import type { Kit } from "@/types";
import { formatBRL } from "@/lib/utils";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const EMOJI_CATEGORIA: Record<string, string> = {
  Skincare: "🧴",
  Makeup: "💄",
  Cabelo: "💇‍♀️",
  Perfumaria: "🌸",
};

export function KitCard({
  kit,
  clienteNome,
}: {
  kit: Kit;
  clienteNome?: string;
}) {
  const destaque = kit.id === "kit-completo";

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white/80 p-5 ${
        destaque ? "border-pink-400 ring-2 ring-pink-200" : "border-pink-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{kit.nome}</h3>
        {destaque && (
          <span className="rounded-full bg-pink-600 px-2.5 py-0.5 text-xs font-medium text-white">
            Recomendado
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-neutral-600">{kit.descricao}</p>

      <ul className="mt-4 flex-1 space-y-2.5">
        {kit.produtos.map((produto) => (
          <li key={produto.id} className="flex items-baseline gap-2.5 text-sm">
            <span className="text-base">
              {EMOJI_CATEGORIA[produto.categoria] ?? "🛍️"}
            </span>
            <span className="flex-1">{produto.nome}</span>
            <span className="whitespace-nowrap text-neutral-500">
              {formatBRL(produto.preco)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between border-t border-pink-100 pt-4">
        <div>
          <div className="text-xs text-neutral-500">Total do kit</div>
          <div className="text-lg font-semibold">{formatBRL(kit.precoTotal)}</div>
        </div>
        <WhatsAppButton kit={kit} clienteNome={clienteNome} />
      </div>
    </article>
  );
}
