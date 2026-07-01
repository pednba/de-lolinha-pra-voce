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
 * Monta as sugestões de kits para a cliente:
 * - um kit por necessidade escolhida (necessidades sem produtos são ignoradas);
 * - quando há mais de uma necessidade, um "Kit Completo" no topo, reunindo os
 *   produtos de todas elas sem duplicar itens.
 */
export function buildKits(
  products: Product[],
  necessidades: string[],
): Kit[] {
  const porNecessidade = necessidades
    .map((need) => {
      const produtos = matchProducts(products, [need]);
      if (produtos.length === 0) return null;

      const label = necessidadeLabel(need);
      return {
        id: `kit-${need}`,
        nome: `Kit ${label}`,
        descricao: `Seleção da Lolinha para ${label.toLowerCase()}.`,
        produtos,
        precoTotal: somaPrecos(produtos),
        necessidades: [need],
      } satisfies Kit;
    })
    .filter((kit): kit is Kit => kit !== null);

  if (necessidades.length > 1) {
    const produtos = dedupeById(matchProducts(products, necessidades));
    if (produtos.length > 0) {
      const completo: Kit = {
        id: "kit-completo",
        nome: "Kit Completo",
        descricao: "Tudo que a Lolinha selecionou pra você, num kit só.",
        produtos,
        precoTotal: somaPrecos(produtos),
        necessidades,
      };
      return [completo, ...porNecessidade];
    }
  }

  return porNecessidade;
}

function somaPrecos(produtos: Product[]): number {
  return produtos.reduce((total, p) => total + p.preco, 0);
}

function dedupeById(produtos: Product[]): Product[] {
  const vistos = new Set<string>();
  return produtos.filter((p) => {
    if (vistos.has(p.id)) return false;
    vistos.add(p.id);
    return true;
  });
}
