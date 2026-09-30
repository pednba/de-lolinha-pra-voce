// Vendinhas da Loly — web app do Google Apps Script.
//
// Os dados ficam na aba "lancamentos" da planilha à qual este script está
// vinculado. As regras de negócio estão em Logica.gs; aqui fica só o que toca
// o Google: planilha, acesso por PIN e as funções chamadas pelo navegador.

var ABA = 'lancamentos';
var COLUNAS = ['id', 'data', 'cliente', 'tipo', 'valor', 'descricao', 'meio', 'obs',
               'criado_em', 'cancelado_em', 'valor_assinado'];
var FUSO = 'America/Sao_Paulo';
var VALIDADE_ACESSO_DIAS = 180;
var MAX_TENTATIVAS_PIN = 5;

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Vendinhas da Loly')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Rode uma vez pelo editor: cria as abas, o cabeçalho e a aba de conferência. */
function configurar() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA) || planilha.insertSheet(ABA);
  if (aba.getLastRow() === 0) {
    aba.getRange(1, 1, 1, COLUNAS.length).setValues([COLUNAS]).setFontWeight('bold');
    aba.setFrozenRows(1);
  }
  // Texto puro: impede o Sheets de converter "2026-09-13" em data e mudar o formato.
  aba.getRange('B:B').setNumberFormat('@');
  aba.getRange('I:J').setNumberFormat('@');
  aba.getRange('E:E').setNumberFormat('#,##0.00');
  aba.getRange('K:K').setNumberFormat('#,##0.00');

  // Conferência independente do app: o saldo sai de fórmula, direto dos lançamentos.
  var saldos = planilha.getSheetByName('saldos') || planilha.insertSheet('saldos');
  saldos.getRange('A1').setFormula(
    '=QUERY(' + ABA + '!A1:K, "select C, sum(K) where A is not null group by C ' +
    'order by sum(K) desc label C \'cliente\', sum(K) \'saldo\'", 1)');

  if (precisaDefinirPin()) {
    Logger.log('Nenhum PIN ainda: o primeiro acesso ao app vai pedir a criação de um.');
  }
}

/** Invalida todos os celulares conectados (ex.: depois de trocar o PIN). */
function revogarAcessos() {
  PropertiesService.getScriptProperties().deleteProperty('TOKENS');
}

// ---------------------------------------------------------------------------
// Funções chamadas pelo navegador (google.script.run)
// ---------------------------------------------------------------------------

/** Só é verdadeiro antes de existir um PIN, no primeiro acesso ao app. */
function precisaDefinirPin() {
  return !PropertiesService.getScriptProperties().getProperty('PIN');
}

/**
 * Cria o PIN no primeiro acesso e já devolve o acesso.
 * Recusa se já existir um PIN, então ninguém troca o PIN de fora.
 */
function definirPin(pin) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var props = PropertiesService.getScriptProperties();
    if (props.getProperty('PIN')) throw new Error('O PIN já foi criado. Digite o seu PIN.');
    var limpo = String(pin == null ? '' : pin).trim();
    if (!/^\d{4,8}$/.test(limpo)) throw new Error('O PIN precisa ter de 4 a 8 números.');
    props.setProperty('PIN', limpo);
    abaLancamentos_();
    return acessoNovo_(props);
  } finally {
    lock.releaseLock();
  }
}

function acessoNovo_(props) {
  var tokens = lerTokens_(props);
  var token = Utilities.getUuid();
  tokens[token] = Date.now() + VALIDADE_ACESSO_DIAS * 86400000;
  props.setProperty('TOKENS', JSON.stringify(tokens));
  return token;
}

function entrar(pin) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var cache = CacheService.getScriptCache();
    var tentativas = Number(cache.get('tentativas_pin') || 0);
    if (tentativas >= MAX_TENTATIVAS_PIN) throw new Error('Muitas tentativas erradas. Espere 10 minutos.');

    var props = PropertiesService.getScriptProperties();
    var pinCerto = props.getProperty('PIN');
    if (!pinCerto) throw new Error('O PIN ainda não foi configurado.');
    if (String(pin == null ? '' : pin).trim() !== String(pinCerto).trim()) {
      cache.put('tentativas_pin', String(tentativas + 1), 600);
      throw new Error('PIN incorreto.');
    }
    cache.remove('tentativas_pin');
    return acessoNovo_(props);
  } finally {
    lock.releaseLock();
  }
}

function estado(token) {
  exigirAcesso_(token);
  return estadoDe_(lerLancamentos_());
}

function extratoCliente(token, cliente) {
  exigirAcesso_(token);
  return extrato_(lerLancamentos_(), cliente);
}

function registrar(token, dados) {
  exigirAcesso_(token);
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var todos = lerLancamentos_();
    var envio = /^[A-Za-z0-9-]{8,40}$/.test(String(dados && dados.envioId))
      ? String(dados.envioId) : Utilities.getUuid();

    // Toque duplo ou reenvio depois de falha de rede: devolve o que já foi gravado.
    var jaGravados = todos.filter(function (l) { return l.id.indexOf(envio + '-') === 0; });
    if (jaGravados.length) return respostaRegistro_(todos, jaGravados, false);

    var r = validarLancamento_(dados, nomesClientes_(todos), hoje_());
    if (!r.ok) throw new Error(r.erros.join(' '));

    var agora = agora_();
    var novos = r.lancamentos.map(function (l, i) {
      return { id: envio + '-' + (i + 1), data: l.data, cliente: l.cliente, tipo: l.tipo, valor: l.valor,
               descricao: l.descricao, meio: l.meio, obs: l.obs, criadoEm: agora, canceladoEm: '' };
    });
    gravar_(novos);
    return respostaRegistro_(todos.concat(novos), novos, r.clienteNovo);
  } finally {
    lock.releaseLock();
  }
}

/** Apagar é marcar cancelado_em: nada some da planilha, e dá para auditar. */
function cancelar(token, ids) {
  exigirAcesso_(token);
  if (!Array.isArray(ids) || !ids.length) throw new Error('Nada para apagar.');
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var todos = lerLancamentos_();
    var alvos = todos.filter(function (l) { return ids.indexOf(l.id) >= 0; });
    if (!alvos.length) throw new Error('Lançamento não encontrado.');

    var aba = abaLancamentos_();
    var agora = agora_();
    alvos.forEach(function (l) {
      if (l.canceladoEm) return;
      aba.getRange(l.linha, 10).setValue(agora);
      l.canceladoEm = agora;
    });
    return { cliente: alvos[0].cliente, extrato: extrato_(todos, alvos[0].cliente), estado: estadoDe_(todos) };
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Internos
// ---------------------------------------------------------------------------

function lerTokens_(props) {
  var tokens = JSON.parse(props.getProperty('TOKENS') || '{}');
  var agora = Date.now();
  Object.keys(tokens).forEach(function (t) { if (tokens[t] < agora) delete tokens[t]; });
  return tokens;
}

function exigirAcesso_(token) {
  var tokens = lerTokens_(PropertiesService.getScriptProperties());
  if (!token || !tokens[token]) throw new Error('ACESSO_EXPIRADO');
}

function abaLancamentos_() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA);
  if (!aba) {
    // Primeiro uso, ou alguém apagou a aba: monta de novo em vez de quebrar.
    configurar();
    aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA);
  }
  return aba;
}

function lerLancamentos_() {
  var linhas = abaLancamentos_().getDataRange().getValues();
  var lista = [];
  for (var i = 1; i < linhas.length; i++) {
    var r = linhas[i];
    if (!r[0]) continue;
    lista.push({
      id: String(r[0]), data: comoData_(r[1]), cliente: String(r[2]), tipo: String(r[3]),
      valor: Number(r[4]), descricao: String(r[5] || ''), meio: String(r[6] || ''), obs: String(r[7] || ''),
      criadoEm: comoInstante_(r[8]), canceladoEm: r[9] ? comoInstante_(r[9]) : '', linha: i + 1
    });
  }
  return lista;
}

function gravar_(novos) {
  var aba = abaLancamentos_();
  var inicio = aba.getLastRow() + 1;
  aba.getRange(inicio, 1, novos.length, 10).setValues(novos.map(function (l) {
    return [l.id, l.data, l.cliente, l.tipo, l.valor, l.descricao, l.meio, l.obs, l.criadoEm, ''];
  }));
  // valor_assinado: + venda, − pagamento, 0 se cancelado. Alimenta a aba "saldos".
  aba.getRange(inicio, 11, novos.length, 1)
    .setFormulaR1C1('=IF(R[0]C[-1]<>"",0,IF(R[0]C[-7]="pagamento",-R[0]C[-6],R[0]C[-6]))');
}

function estadoDe_(todos) {
  var saldos = calcularSaldos_(todos);
  return { hoje: hoje_(), saldos: saldos, resumo: resumir_(saldos), clientes: nomesClientes_(todos) };
}

function respostaRegistro_(todos, registrados, clienteNovo) {
  var cliente = registrados[0].cliente;
  return {
    ids: registrados.map(function (l) { return l.id; }),
    cliente: cliente,
    clienteNovo: clienteNovo,
    lancamentos: registrados.map(function (l) {
      return { tipo: l.tipo, valor: l.valor, descricao: l.descricao, meio: l.meio, data: l.data };
    }),
    saldo: extrato_(todos, cliente).saldo,
    estado: estadoDe_(todos)
  };
}

// O navegador não recebe objetos Date via google.script.run: tudo vira texto aqui.
function comoData_(v) {
  return v instanceof Date ? Utilities.formatDate(v, FUSO, 'yyyy-MM-dd') : String(v);
}

function comoInstante_(v) {
  return v instanceof Date ? Utilities.formatDate(v, FUSO, 'yyyy-MM-dd HH:mm:ss') : String(v || '');
}

function hoje_() {
  return Utilities.formatDate(new Date(), FUSO, 'yyyy-MM-dd');
}

function agora_() {
  return Utilities.formatDate(new Date(), FUSO, 'yyyy-MM-dd HH:mm:ss');
}
