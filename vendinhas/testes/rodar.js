// Roda Logica.gs + Code.gs no Node, com uma imitação mínima dos serviços do
// Apps Script (planilha em memória, propriedades, cache, lock). Não prova o
// comportamento real do Google Sheets, mas exercita todos os caminhos do código.
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const raiz = path.join(__dirname, '..');
let falhas = 0, passou = 0;
function teste(nome, fn) {
  try { fn(); passou++; console.log('  ok   ' + nome); }
  catch (e) { falhas++; console.log('  FALHOU ' + nome + '\n         ' + e.message); }
}

function criarAmbiente() {
  const abas = {};
  function criarAba(nome) {
    const dados = [];
    const garantir = (i) => { while (dados.length <= i) dados.push([]); };
    return {
      dados,
      getLastRow: () => dados.length,
      setFrozenRows() {},
      getDataRange: () => ({ getValues: () => dados.map(r => { const c = r.slice(); while (c.length < 11) c.push(''); return c; }) }),
      getRange(a, b, c, d) {
        if (typeof a === 'string') return { setNumberFormat() { return this; }, setFormula(f) { this.formula = f; abas[nome].formulaA1 = f; return this; } };
        const linha = a, col = b, nl = c || 1;
        return {
          setValues(v) { v.forEach((r, i) => { garantir(linha - 1 + i); r.forEach((x, j) => { dados[linha - 1 + i][col - 1 + j] = x; }); }); return this; },
          setValue(x) { garantir(linha - 1); dados[linha - 1][col - 1] = x; return this; },
          setFormulaR1C1(f) { for (let i = 0; i < nl; i++) { garantir(linha - 1 + i); dados[linha - 1 + i][col - 1] = 'R1C1' + f; } return this; },
          setFontWeight() { return this; },
        };
      },
    };
  }
  const props = new Map();
  const cache = new Map();
  const ctx = {
    console,
    SpreadsheetApp: { getActiveSpreadsheet: () => ({
      getSheetByName: (n) => abas[n] || null,
      insertSheet: (n) => (abas[n] = criarAba(n)),
    }) },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (k) => (props.has(k) ? props.get(k) : null),
      setProperty: (k, v) => props.set(k, String(v)),
      deleteProperty: (k) => props.delete(k),
    }) },
    CacheService: { getScriptCache: () => ({
      get: (k) => (cache.has(k) ? cache.get(k) : null),
      put: (k, v) => cache.set(k, v),
      remove: (k) => cache.delete(k),
    }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    Logger: { log() {} },
    HtmlService: {},
    Utilities: {
      getUuid: () => require('crypto').randomUUID(),
      formatDate(data, fuso, formato) {
        const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
          timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
        }).formatToParts(data).map(x => [x.type, x.value]));
        const d = `${p.year}-${p.month}-${p.day}`;
        return formato === 'yyyy-MM-dd' ? d : `${d} ${p.hour}:${p.minute}:${p.second}`;
      },
    },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(raiz, 'Logica.gs'), 'utf8'), ctx, { filename: 'Logica.gs' });
  vm.runInContext(fs.readFileSync(path.join(raiz, 'Code.gs'), 'utf8'), ctx, { filename: 'Code.gs' });
  return { ctx, abas, props, cache };
}

function lanca(fn) { try { fn(); } catch (e) { return e.message; } throw new Error('deveria ter lançado erro'); }

// ---------------------------------------------------------------------------
console.log('\nLogica.gs');
{
  const { ctx } = criarAmbiente();
  teste('parseValor aceita formatos do teclado brasileiro', () => {
    const casos = { '80': 80, '80,5': 80.5, '80,50': 80.5, '1.300': 1300, '1.300,50': 1300.5,
                    '12.5': 12.5, 'R$ 45,90': 45.9, '1.234.567,89': 1234567.89 };
    for (const [entrada, esperado] of Object.entries(casos)) assert.strictEqual(ctx.parseValor_(entrada), esperado, entrada);
    for (const ruim of ['', 'abc', '-10', '-10,00']) assert.ok(Number.isNaN(ctx.parseValor_(ruim)), ruim);
  });
  teste('mesma cliente com acento, caixa e espaço diferentes', () => {
    const r = ctx.resolverCliente_('  simône ', ['Simone', 'Léo']);
    assert.deepStrictEqual({ ...r }, { nome: 'Simone', novo: false });
    assert.strictEqual(ctx.resolverCliente_('Gisela', ['Simone']).novo, true);
  });
  teste('datas inválidas e fora da faixa', () => {
    assert.strictEqual(ctx.dataValida_('2026-02-30'), false);
    assert.strictEqual(ctx.dataValida_('2028-02-29'), true);
    assert.strictEqual(ctx.somarDias_('2026-12-31', 1), '2027-01-01');
  });
  teste('centavos não acumulam erro de ponto flutuante', () => {
    const l = [0.1, 0.2, 0.3].map((v, i) => ({ cliente: 'Ana', tipo: 'venda', valor: v, data: '2026-09-0' + (i + 1) }));
    assert.strictEqual(ctx.calcularSaldos_(l)[0].saldo, 0.6);
  });
  teste('validação recusa entradas incompletas', () => {
    const hoje = '2026-09-13';
    const v = (d) => ctx.validarLancamento_(d, [], hoje);
    assert.strictEqual(v({ tipo: 'venda', cliente: '', valor: '10' }).ok, false);
    assert.strictEqual(v({ tipo: 'venda', cliente: 'Ana', valor: '0' }).ok, false);
    assert.strictEqual(v({ tipo: 'pagamento', cliente: 'Ana', valor: '10' }).ok, false, 'pagamento sem meio');
    assert.strictEqual(v({ tipo: 'venda', cliente: 'Ana', valor: '10', pagoNaHora: true }).ok, false, 'pago na hora sem meio');
    assert.strictEqual(v({ tipo: 'venda', cliente: 'Ana', valor: '10', data: '2026-09-20' }).ok, false, 'futuro');
    assert.strictEqual(v({ tipo: 'venda', cliente: 'Ana', valor: '10', data: '2026-09-14' }).ok, true, 'amanhã tolerado (fuso)');
    assert.strictEqual(v({ tipo: 'emprestimo', cliente: 'Ana', valor: '10' }).ok, false);
  });
  teste('venda paga na hora gera venda + pagamento', () => {
    const r = ctx.validarLancamento_({ tipo: 'venda', cliente: 'Léo', valor: '50', pagoNaHora: true, meio: 'pix' }, [], '2026-09-13');
    assert.deepStrictEqual(Array.from(r.lancamentos, l => l.tipo), ['venda', 'pagamento']);
    assert.strictEqual(r.lancamentos[0].meio, '');
    assert.strictEqual(r.lancamentos[1].meio, 'pix');
  });
  teste('extrato mostra saldo acumulado e ignora apagados', () => {
    const l = [
      { id: 'a', cliente: 'Ana', tipo: 'venda', valor: 100, data: '2026-09-01', criadoEm: '1' },
      { id: 'b', cliente: 'Ana', tipo: 'pagamento', valor: 30, data: '2026-09-02', criadoEm: '2' },
      { id: 'c', cliente: 'Ana', tipo: 'venda', valor: 999, data: '2026-09-03', criadoEm: '3', canceladoEm: 'x' },
      { id: 'd', cliente: 'Bia', tipo: 'venda', valor: 5, data: '2026-09-03', criadoEm: '4' },
    ];
    const x = ctx.extrato_(l, 'ana');
    assert.strictEqual(x.saldo, 70);
    assert.deepStrictEqual(x.itens.map(i => i.id), ['c', 'b', 'a']);
    assert.deepStrictEqual(x.itens.map(i => i.saldoApos), [null, 70, 100]);
  });
}

// ---------------------------------------------------------------------------
console.log('\nCode.gs (planilha simulada)');
{
  const { ctx, abas, props, cache } = criarAmbiente();
  let token;

  teste('configurar cria cabeçalho e aba de saldos', () => {
    ctx.configurar();
    assert.deepStrictEqual(abas.lancamentos.dados[0], Array.from(ctx.COLUNAS));
    assert.match(abas.saldos.formulaA1, /QUERY\(lancamentos!A1:K/);
    ctx.configurar(); // idempotente
    assert.strictEqual(abas.lancamentos.dados.length, 1);
  });

  teste('sem PIN configurado não entra', () => {
    assert.match(lanca(() => ctx.entrar('1234')), /não foi configurado/);
  });

  teste('PIN errado bloqueia após 5 tentativas', () => {
    props.set('PIN', '482913');
    for (let i = 0; i < 5; i++) assert.match(lanca(() => ctx.entrar('000000')), /incorreto/);
    assert.match(lanca(() => ctx.entrar('482913')), /Muitas tentativas/);
    cache.clear();
  });

  teste('PIN certo devolve acesso; sem acesso nada funciona', () => {
    token = ctx.entrar('482913');
    assert.match(token, /^[0-9a-f-]{36}$/);
    assert.match(lanca(() => ctx.estado('')), /ACESSO_EXPIRADO/);
    assert.match(lanca(() => ctx.registrar('token-falso', {})), /ACESSO_EXPIRADO/);
  });

  let venda;
  teste('registra venda a prazo e calcula saldo', () => {
    venda = ctx.registrar(token, { envioId: 'envio-0001', tipo: 'venda', cliente: 'Simone', valor: '80,00', descricao: '2 sutiãs', data: ctx.hoje_() });
    assert.strictEqual(venda.saldo, 80);
    assert.strictEqual(venda.clienteNovo, true);
    const linha = abas.lancamentos.dados[1];
    assert.deepStrictEqual(linha.slice(0, 8), ['envio-0001-1', ctx.hoje_(), 'Simone', 'venda', 80, '2 sutiãs', '', '']);
    assert.match(String(linha[10]), /^R1C1=IF/);
  });

  teste('toque duplo com o mesmo envio não duplica', () => {
    const de_novo = ctx.registrar(token, { envioId: 'envio-0001', tipo: 'venda', cliente: 'Simone', valor: '80,00' });
    assert.strictEqual(abas.lancamentos.dados.length, 2);
    assert.deepStrictEqual(Array.from(de_novo.ids), ['envio-0001-1']);
    assert.strictEqual(de_novo.saldo, 80);
  });

  teste('grafia diferente cai na mesma cliente', () => {
    const r = ctx.registrar(token, { envioId: 'envio-0002', tipo: 'venda', cliente: ' SIMÔNE ', valor: '1.300', descricao: 'perfume' });
    assert.strictEqual(r.cliente, 'Simone');
    assert.strictEqual(r.clienteNovo, false);
    assert.strictEqual(r.saldo, 1380);
  });

  teste('pagamento parcial desce o saldo', () => {
    const r = ctx.registrar(token, { envioId: 'envio-0003', tipo: 'pagamento', cliente: 'simone', valor: '270', meio: 'dinheiro' });
    assert.strictEqual(r.saldo, 1110);
  });

  teste('venda paga na hora não altera saldo, mas fica registrada', () => {
    const r = ctx.registrar(token, { envioId: 'envio-0004', tipo: 'venda', cliente: 'Léo', valor: '50', pagoNaHora: true, meio: 'infinitepay' });
    assert.strictEqual(r.saldo, 0);
    assert.strictEqual(r.ids.length, 2);
    assert.strictEqual(abas.lancamentos.dados.length, 6);
  });

  teste('erro de validação chega com mensagem legível e não grava', () => {
    assert.match(lanca(() => ctx.registrar(token, { envioId: 'envio-0005', tipo: 'pagamento', cliente: 'Ana', valor: '10' })), /Escolha como foi pago/);
    assert.strictEqual(abas.lancamentos.dados.length, 6);
  });

  teste('estado resume total a receber e ordena por saldo', () => {
    const e = ctx.estado(token);
    assert.strictEqual(e.resumo.totalReceber, 1110);
    assert.strictEqual(e.resumo.clientesDevendo, 1);
    assert.deepStrictEqual(Array.from(e.saldos, s => s.cliente), ['Simone', 'Léo']);
    assert.deepStrictEqual(Array.from(e.clientes), ['Léo', 'Simone']);
  });

  teste('desfazer marca cancelado e devolve saldo anterior', () => {
    const pag = abas.lancamentos.dados.findIndex(r => r[0] === 'envio-0003-1');
    const r = ctx.cancelar(token, ['envio-0003-1']);
    assert.strictEqual(r.extrato.saldo, 1380);
    assert.ok(abas.lancamentos.dados[pag][9], 'cancelado_em preenchido');
    assert.strictEqual(abas.lancamentos.dados.length, 6, 'nada é apagado da planilha');
    const outraVez = ctx.cancelar(token, ['envio-0003-1']);
    assert.strictEqual(outraVez.extrato.saldo, 1380, 'cancelar de novo não muda nada');
  });

  teste('lê datas que o Sheets tenha convertido em Date', () => {
    abas.lancamentos.dados[1][1] = vm.runInContext('new Date(Date.UTC(2026, 8, 1, 15))', ctx);
    const x = ctx.extratoCliente(token, 'Simone');
    assert.ok(x.itens.some(i => i.data === '2026-09-01'));
  });

  teste('acesso vencido é recusado', () => {
    const tokens = JSON.parse(props.get('TOKENS'));
    tokens[token] = Date.now() - 1;
    props.set('TOKENS', JSON.stringify(tokens));
    assert.match(lanca(() => ctx.estado(token)), /ACESSO_EXPIRADO/);
  });
}

// ---------------------------------------------------------------------------
console.log('\nIndex.html');
{
  const html = fs.readFileSync(path.join(raiz, 'Index.html'), 'utf8');
  const code = fs.readFileSync(path.join(raiz, 'Code.gs'), 'utf8');
  const script = html.match(/<script>([\s\S]*)<\/script>/)[1];

  teste('script do navegador compila', () => { new vm.Script(script); });

  teste('todo handler inline existe no script', () => {
    const chamados = [...html.matchAll(/on(?:click|input|change|keydown)="(?:if \([^)]*\) )?(\w+)\(/g)].map(m => m[1]);
    for (const nome of new Set(chamados)) assert.match(script, new RegExp('function ' + nome + '\\('), nome);
  });

  teste('todo id usado no script existe no HTML', () => {
    const ids = new Set([...html.matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
    const usados = [...script.matchAll(/\$\('([\w-]+)'\)/g)].map(m => m[1]);
    for (const id of new Set(usados)) assert.ok(ids.has(id), id);
  });

  teste('funções chamadas via google.script.run são públicas no Code.gs', () => {
    const chamadas = [...script.matchAll(/chamar\('(\w+)'/g)].map(m => m[1]);
    for (const nome of new Set(chamadas)) {
      assert.ok(!nome.endsWith('_'), nome + ' é privada');
      assert.match(code, new RegExp('^function ' + nome + '\\(', 'm'), nome);
    }
  });
}

console.log(`\n${passou} passaram, ${falhas} falharam`);
process.exit(falhas ? 1 : 0);
