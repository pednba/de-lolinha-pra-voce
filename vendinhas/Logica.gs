// Regras do Vendinhas da Loly, sem nenhuma dependência do Apps Script.
// Ficam isoladas aqui para poderem ser testadas fora do Google (ver testes/).
// Nomes terminados em "_" são privados: o navegador não consegue chamá-los.

var TIPOS = ['venda', 'pagamento'];
var MEIOS = ['dinheiro', 'pix', 'infinitepay', 'outro'];
var VALOR_MAXIMO = 100000;
var DATA_MINIMA = '2020-01-01';

function limparTexto_(texto) {
  return String(texto == null ? '' : texto).trim().replace(/\s+/g, ' ');
}

/** Chave de comparação: "Simône " e "simone" são a mesma cliente. */
function chaveNome_(nome) {
  return limparTexto_(nome).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Reaproveita a grafia já cadastrada, para não nascer uma cliente duplicada. */
function resolverCliente_(nome, existentes) {
  var chave = chaveNome_(nome);
  for (var i = 0; i < existentes.length; i++) {
    if (chaveNome_(existentes[i]) === chave) return { nome: existentes[i], novo: false };
  }
  return { nome: limparTexto_(nome), novo: true };
}

/** Aceita o que sai do teclado brasileiro: "80", "80,50", "1.300", "1.300,50". */
function parseValor_(entrada) {
  if (typeof entrada === 'number') {
    return isFinite(entrada) ? Math.round(entrada * 100) / 100 : NaN;
  }
  var bruto = String(entrada == null ? '' : entrada);
  if (bruto.indexOf('-') >= 0) return NaN;
  var s = bruto.replace(/[^\d.,]/g, '');
  if (!s) return NaN;
  if (s.indexOf(',') >= 0) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '');
  }
  var n = Number(s);
  return isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

function dataValida_(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) return false;
  var p = String(iso).split('-').map(Number);
  var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return d.getUTCFullYear() === p[0] && d.getUTCMonth() === p[1] - 1 && d.getUTCDate() === p[2];
}

function somarDias_(iso, dias) {
  var p = String(iso).split('-').map(Number);
  return new Date(Date.UTC(p[0], p[1] - 1, p[2] + dias)).toISOString().slice(0, 10);
}

/**
 * Valida o que veio do formulário e devolve os lançamentos a gravar.
 * Uma venda "paga na hora" vira dois lançamentos (venda + pagamento): o saldo
 * não muda, mas a venda fica registrada para controle e conciliação futura.
 */
function validarLancamento_(dados, clientesExistentes, hoje) {
  dados = dados || {};
  var erros = [];

  var tipo = String(dados.tipo || '');
  if (TIPOS.indexOf(tipo) < 0) erros.push('Escolha se foi venda ou pagamento.');

  var nome = limparTexto_(dados.cliente);
  if (!nome) erros.push('Diga quem é a cliente.');
  else if (nome.length > 60) erros.push('O nome da cliente está longo demais.');

  var valor = parseValor_(dados.valor);
  if (!(valor > 0)) erros.push('Coloque um valor maior que zero.');
  else if (valor > VALOR_MAXIMO) erros.push('Valor alto demais, confira.');

  var pagoNaHora = tipo === 'venda' && dados.pagoNaHora === true;
  var precisaMeio = tipo === 'pagamento' || pagoNaHora;
  var meio = precisaMeio ? String(dados.meio || '') : '';
  if (precisaMeio && MEIOS.indexOf(meio) < 0) erros.push('Escolha como foi pago.');

  var data = String(dados.data || hoje);
  if (!dataValida_(data)) erros.push('Data inválida.');
  else if (data > somarDias_(hoje, 1)) erros.push('A data está no futuro.');
  else if (data < DATA_MINIMA) erros.push('Data muito antiga, confira.');

  if (erros.length) return { ok: false, erros: erros };

  var cliente = resolverCliente_(nome, clientesExistentes || []);
  var base = { cliente: cliente.nome, valor: valor, data: data, obs: limparTexto_(dados.obs).slice(0, 200) };
  var descricao = limparTexto_(dados.descricao).slice(0, 120);
  var lancamentos = [];

  if (tipo === 'venda') {
    lancamentos.push(Object.assign({ tipo: 'venda', descricao: descricao, meio: '' }, base));
    if (pagoNaHora) lancamentos.push(Object.assign({ tipo: 'pagamento', descricao: 'pago na hora', meio: meio }, base));
  } else {
    lancamentos.push(Object.assign({ tipo: 'pagamento', descricao: descricao, meio: meio }, base));
  }

  return { ok: true, erros: [], cliente: cliente.nome, clienteNovo: cliente.novo, lancamentos: lancamentos };
}

/** Nomes distintos já usados (inclusive de lançamentos apagados), em ordem alfabética. */
function nomesClientes_(lancamentos) {
  var vistos = {};
  var nomes = [];
  lancamentos.forEach(function (l) {
    var chave = chaveNome_(l.cliente);
    if (chave && !vistos[chave]) {
      vistos[chave] = true;
      nomes.push(l.cliente);
    }
  });
  return nomes.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
}

/** Saldo por cliente em centavos inteiros, para 0,10 + 0,20 dar 0,30 e não 0,30000000000000004. */
function calcularSaldos_(lancamentos) {
  var porCliente = {};
  lancamentos.forEach(function (l) {
    if (l.canceladoEm) return;
    var chave = chaveNome_(l.cliente);
    var c = porCliente[chave] || (porCliente[chave] = { cliente: l.cliente, vendido: 0, pago: 0, ultimaData: '' });
    var centavos = Math.round(Number(l.valor) * 100);
    if (l.tipo === 'venda') c.vendido += centavos;
    else if (l.tipo === 'pagamento') c.pago += centavos;
    if (l.data > c.ultimaData) c.ultimaData = l.data;
  });

  return Object.keys(porCliente).map(function (k) {
    var c = porCliente[k];
    return { cliente: c.cliente, vendido: c.vendido / 100, pago: c.pago / 100,
             saldo: (c.vendido - c.pago) / 100, ultimaData: c.ultimaData };
  }).sort(function (a, b) {
    return b.saldo - a.saldo || a.cliente.localeCompare(b.cliente, 'pt-BR');
  });
}

function resumir_(saldos) {
  var receber = 0, credito = 0, devendo = 0;
  saldos.forEach(function (s) {
    var centavos = Math.round(s.saldo * 100);
    if (centavos > 0) { receber += centavos; devendo++; }
    else if (centavos < 0) credito -= centavos;
  });
  return { totalReceber: receber / 100, totalCredito: credito / 100, clientesDevendo: devendo };
}

/** Histórico de uma cliente, do mais recente ao mais antigo, com o saldo depois de cada lançamento. */
function extrato_(lancamentos, nomeCliente) {
  var chave = chaveNome_(nomeCliente);
  var itens = lancamentos
    .filter(function (l) { return chaveNome_(l.cliente) === chave; })
    .sort(function (a, b) {
      return a.data < b.data ? -1 : a.data > b.data ? 1 : String(a.criadoEm).localeCompare(String(b.criadoEm));
    });

  var saldo = 0;
  var resultado = itens.map(function (l) {
    var cancelado = Boolean(l.canceladoEm);
    if (!cancelado) saldo += (l.tipo === 'venda' ? 1 : -1) * Math.round(Number(l.valor) * 100);
    return { id: l.id, data: l.data, tipo: l.tipo, valor: Number(l.valor), descricao: l.descricao,
             meio: l.meio, obs: l.obs, cancelado: cancelado, saldoApos: cancelado ? null : saldo / 100 };
  });

  return { cliente: itens.length ? itens[0].cliente : limparTexto_(nomeCliente), saldo: saldo / 100,
           itens: resultado.reverse() };
}
