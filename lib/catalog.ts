// Lógica de curadoria: a partir das necessidades escolhidas pela cliente,
// monta sugestões de kits com os produtos do catálogo.
import type { Kit, Product } from "@/types";
import { necessidadeLabel } from "@/lib/necessidades";

/** Filtra produtos ativos que atendem a pelo menos uma das necessidades. */
export function matchProducts(
  products: Product[],
  necessidades: string[],
): Product[] {
  return products.filter(
    (p) => p.ativo && p.necessidades.some((n) => necessidades.includes(n)),
  );
}

/**
 * Monta um kit curado por necessidade escolhida, com os produtos que atendem
 * àquela necessidade. Necessidades sem produtos no catálogo são ignoradas.
 */
export function buildKits(
  products: Product[],
  necessidades: string[],
): Kit[] {
  return necessidades
    .map((need) => {
      const produtos = matchProducts(products, [need]);
      if (produtos.length === 0) return null;

      const precoTotal = produtos.reduce((total, p) => total + p.preco, 0);
      const label = necessidadeLabel(need);

      return {
        id: `kit-${need}`,
        nome: `Kit ${label}`,
        descricao: `Seleção da Lolinha para ${label.toLowerCase()}.`,
        produtos,
        precoTotal,
        necessidades: [need],
      } satisfies Kit;
    })
    .filter((kit): kit is Kit => kit !== null);
}
