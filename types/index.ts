// Tipos compartilhados do projeto "De Lolinha pra Você"

/** Um produto individual do catálogo (vindo da Google Sheet da Lolinha). */
export interface Product {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  imagemUrl?: string;
  /** Tags de necessidade que esse produto atende (ex.: "pele oleosa", "antiidade"). */
  necessidades: string[];
  ativo: boolean;
}

/** Um kit curado: combinação de produtos sugerida para um conjunto de necessidades. */
export interface Kit {
  id: string;
  nome: string;
  descricao: string;
  produtos: Product[];
  precoTotal: number;
  necessidades: string[];
}

/** Necessidade de beleza escolhida pela cliente no quiz. */
export interface Necessidade {
  id: string;
  label: string;
  categoria: string;
  emoji?: string;
}

/** Pedido salvo no Supabase e enviado para fechamento via WhatsApp. */
export interface Pedido {
  id: string;
  clienteNome?: string;
  necessidades: string[];
  kitId: string;
  produtoIds: string[];
  valorTotal: number;
  status: "novo" | "enviado_whatsapp" | "concluido" | "cancelado";
  criadoEm: string;
}
