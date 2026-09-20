# Vendinhas da Loly (fase 1)

Web app do Google Apps Script para registrar vendas e pagamentos de clientes
e ver quanto cada uma deve. Os dados ficam numa planilha do Google.

| Arquivo | Papel |
|---|---|
| `Code.gs` | Servidor: planilha, PIN, funções chamadas pela tela |
| `Logica.gs` | Regras (validação, saldo, extrato), sem dependência do Google |
| `Index.html` | Tela do celular |
| `appsscript.json` | Manifesto (fuso, acesso do web app) |
| `testes/rodar.js` | `node testes/rodar.js`: lógica + servidor com planilha simulada |

## Publicar (uma vez, ~10 min)

1. Crie uma planilha no Google Sheets chamada **Vendinhas da Loly**.
2. **Extensões → Apps Script**. Apague o conteúdo do arquivo que vem aberto e cole o `Code.gs`
   (renomeie o arquivo para `Code`).
3. Clique em **+ → Script**, nome `Logica`, cole o `Logica.gs`.
4. Clique em **+ → HTML**, nome `Index`, cole o `Index.html`.
5. **Configurações do projeto** (engrenagem) → marque *Mostrar o arquivo de manifesto "appsscript.json"*
   → volte ao editor e cole o `appsscript.json`.
6. Ainda em Configurações → **Propriedades do script** → adicionar `PIN` com 6 dígitos.
7. No editor, escolha a função `configurar` e clique em **Executar**. Autorize
   (o aviso de "app não verificado" é esperado: *Avançado → Acessar*).
8. **Implantar → Nova implantação → App da Web**. Executar como: **Eu**.
   Quem pode acessar: **Qualquer pessoa**. Copie a URL.
9. No celular dela, abra a URL.
   Android/Chrome: **⋮ → Adicionar à tela inicial**. iPhone/Safari: **Compartilhar → Adicionar à Tela de Início**.

## Atualizar o código depois

**Implantar → Gerenciar implantações → lápis → Versão: Nova versão**.
Não use "Nova implantação" de novo: isso gera outra URL e o atalho do celular para de funcionar.

## Segurança

- A URL não é adivinhável, o PIN é exigido, e 5 erros bloqueiam por 10 minutos.
- Cada celular fica conectado por 180 dias. Trocou o PIN? Rode `revogarAcessos()`.
- A planilha tem nomes e dívidas de clientes (dado pessoal): **não compartilhe**.

## Na planilha

- `lancamentos`: uma linha por venda/pagamento. Apagar no app só preenche `cancelado_em`; nada some.
- `saldos`: conferência por fórmula, independente do app.
- Se editar à mão, mantenha `data` no formato `2026-09-13` e `tipo` como `venda` ou `pagamento`.

## Fora da fase 1

Parcelamento com datas, lembrete de cobrança e conciliação com o extrato do InfinitePay.
O campo `meio` (dinheiro, pix, infinitepay, outro) já é gravado para permitir a conciliação.
