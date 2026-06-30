// Card que exibe um kit curado.
// TODO: renderizar produtos, preço e botão de WhatsApp.
import type { Kit } from "@/types";
import { formatBRL } from "@/lib/utils";

export function KitCard({ kit }: { kit: Kit }) {
  return (
    <article className="rounded-xl border border-neutral-200 p-5">
      <h3 className="font-semibold">{kit.nome}</h3>
      <p className="mt-1 text-sm text-neutral-600">{kit.descricao}</p>
      <p className="mt-3 font-medium">{formatBRL(kit.precoTotal)}</p>
    </article>
  );
}
