// Card que exibe um kit curado: produtos, preço e fechamento via WhatsApp.
import type { Kit } from "@/types";
import { formatBRL } from "@/lib/utils";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function KitCard({ kit }: { kit: Kit }) {
  return (
    <article className="flex flex-col rounded-xl border border-neutral-200 p-5">
      <h3 className="font-semibold">{kit.nome}</h3>
      <p className="mt-1 text-sm text-neutral-600">{kit.descricao}</p>

      <ul className="mt-4 flex-1 space-y-2">
        {kit.produtos.map((produto) => (
          <li
            key={produto.id}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span>{produto.nome}</span>
            <span className="whitespace-nowrap text-neutral-500">
              {formatBRL(produto.preco)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
        <span className="font-medium">{formatBRL(kit.precoTotal)}</span>
        <WhatsAppButton kit={kit} />
      </div>
    </article>
  );
}
