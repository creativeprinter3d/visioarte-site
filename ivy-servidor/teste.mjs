/* Teste local do servidor da Ivy, sem rede e sem gastar nada: `node ivy-servidor/teste.mjs` */
import worker from './worker.js';
import assert from 'node:assert/strict';

const kv = new Map();
const KV = { get: async k => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } };
const env = { ANTHROPIC_API_KEY: 'chave-falsa', LIMITES: KV, MAX_IP_DIA: '3', MAX_DIA: '5' };
let chamadas = [];
globalThis.fetch = async (url, opt) => {
  chamadas.push({ url, corpo: JSON.parse(opt.body) });
  return new Response(JSON.stringify({ content: [{ type: 'text', text: 'Resposta de teste.' }] }), { status: 200 });
};
const O = 'https://www.visioarte.com.br';
const req = (corpo, o = O, ip = '1.1.1.1', metodo = 'POST') => new Request('https://x/', { method: metodo, headers: { Origin: o, 'CF-Connecting-IP': ip, 'content-type': 'application/json' }, body: metodo === 'POST' ? JSON.stringify(corpo) : undefined });
const msg = (t) => ({ mensagens: [{ role: 'user', content: t }] });

let r = await worker.fetch(req(msg('O que é a Visioarte?')), env);
assert.equal(r.status, 200); assert.equal((await r.json()).resposta, 'Resposta de teste.');
assert.equal(r.headers.get('Access-Control-Allow-Origin'), O);
assert.equal(chamadas[0].corpo.model, 'claude-haiku-5-5');
assert.equal(chamadas[0].corpo.max_tokens, 300);
assert.ok(chamadas[0].corpo.system[0].text.includes('Israel Tomas'));
assert.ok(chamadas[0].corpo.system[0].cache_control);

r = await worker.fetch(req(msg('oi'), 'https://site-malicioso.com'), env); assert.equal(r.status, 403);
r = await worker.fetch(req({ mensagens: [] }), env); assert.equal(r.status, 400);
r = await worker.fetch(req({ mensagens: [{ role: 'assistant', content: 'x' }] }), env); assert.equal(r.status, 400);
r = await worker.fetch(req(null, O, '1.1.1.1', 'GET'), env); assert.equal(r.status, 405);
r = await worker.fetch(req(null, O, '1.1.1.1', 'OPTIONS'), env); assert.equal(r.status, 204);

chamadas = [];
await worker.fetch(req(msg('x'.repeat(5000))), env);
assert.equal(chamadas[0].corpo.messages[0].content.length, 300, 'corta mensagens longas');

const longo = { mensagens: Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'm' + i })).concat([{ role: 'user', content: 'final' }]) };
chamadas = [];
await worker.fetch(req(longo, O, '9.9.9.9'), env);
const m = chamadas[0].corpo.messages;
assert.ok(m.length <= 6 && m[0].role === 'user' && m.at(-1).content === 'final', 'histórico cortado e começa por user');

// limite por IP: 3 por dia (a de cima do 1.1.1.1 já usou 2: duas ok + a longa)
r = await worker.fetch(req(msg('a')), env); assert.equal(r.status, 200);
r = await worker.fetch(req(msg('b')), env); assert.equal(r.status, 429); assert.equal((await r.json()).erro, 'limite');
// limite total: 5 no dia
r = await worker.fetch(req(msg('c'), O, '2.2.2.2'), env); assert.equal(r.status, 200);
r = await worker.fetch(req(msg('d'), O, '3.3.3.3'), env); assert.equal(r.status, 429); assert.equal((await r.json()).erro, 'pausa');

// sem chave: indisponível, sem chamar a API
chamadas = [];
r = await worker.fetch(req(msg('oi')), { ...env, ANTHROPIC_API_KEY: '' }); assert.equal(r.status, 503); assert.equal(chamadas.length, 0);

// erro da API: nunca vaza detalhe
globalThis.fetch = async () => new Response('{"error":{"message":"segredo"}}', { status: 500 });
r = await worker.fetch(req(msg('oi'), O, '4.4.4.4'), { ...env, LIMITES: undefined });
const j = await r.json(); assert.equal(r.status, 502); assert.equal(JSON.stringify(j).includes('segredo'), false);

console.log('servidor da Ivy: todos os testes passaram');
