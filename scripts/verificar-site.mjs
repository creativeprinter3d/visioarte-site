#!/usr/bin/env node
/**
 * VISIOARTE | Auditoria estática sem dependências externas.
 * Executar: node scripts/verificar-site.mjs
 * Objetivo: detectar regressões antes de publicar, não mudar o site.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'node_modules', '.cache', 'dist', 'coverage']);
let errors = 0;
let warnings = 0;
let checks = 0;

function walk(dir) {
  const out = [];
  for (const item of readdirSync(dir, {withFileTypes:true})) {
    if (ignored.has(item.name)) continue;
    const path = join(dir, item.name);
    if (item.isDirectory()) out.push(...walk(path));
    else if (item.isFile()) out.push(path);
  }
  return out;
}

const all = walk(root);
const htmlFiles = all.filter(p => extname(p) === '.html');
const cssFiles = all.filter(p => extname(p) === '.css');
const jsFiles = all.filter(p => extname(p) === '.js' || extname(p) === '.mjs');

const short = p => relative(root, p).split(sep).join('/');
function fail(description, path='') {
  console.error('✘ ' + description + (path ? ' [' + short(path) + ']' : ''));
  errors++;
}
function warn(description, path='') {
  console.warn('! ' + description + (path ? ' [' + short(path) + ']' : ''));
  warnings++;
}
function ok(description) {
  console.log('✓ ' + description);
  checks++;
}
function source(path) {return readFileSync(path, 'utf8');}

function checkLocalReference(from, raw, context) {
  let address = raw.trim().replaceAll('&amp;', '&');
  if (!address || /^(?:#|\?|https?:|data:|blob:|mailto:|tel:|javascript:|\/\/)/i.test(address)) return;
  const part = address.split(/[?#]/)[0];
  if (!part || part === '.' || part === './' || part === '..' || part === '../') return;
  let target;
  try {
    target = part.startsWith('/') ? resolve(root, '.' + part) : resolve(dirname(from), decodeURIComponent(part));
  } catch {
    return fail('URL local inválida ' + raw + ' em ' + context, from);
  }
  if (!(target === root || target.startsWith(root + sep))) return fail('URL escapa da raiz: ' + raw, from);
  if (!existsSync(target)) fail('Arquivo local inexistente: ' + raw + ' (' + context + ')', from);
}

for (const file of htmlFiles) {
  const doc = source(file);
  const ids = [...doc.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) fail('ID duplicado: ' + id, file);
    seen.add(id);
  }
  for (const match of doc.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) {
    checkLocalReference(file, match[1], 'HTML');
  }
  for (const match of doc.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=\s*["'][^"']*["']/i.test(match[0])) fail('Imagem sem atributo alt', file);
  }
  for (const match of doc.matchAll(/<a\b[^>]*\btarget\s*=\s*["']_blank["'][^>]*>/gi)) {
    if (!/\brel\s*=\s*["'][^"']*noopener/i.test(match[0])) fail('Link em outra aba sem rel=noopener', file);
  }
  for (const script of doc.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const attrs = script[1];
    if (/\bsrc\s*=/.test(attrs) || /\btype\s*=\s*["'](?:application\/|text\/)/i.test(attrs)) continue;
    if (!script[2].trim()) continue;
    try { new vm.Script(script[2], {filename:short(file) + ':inline'}); }
    catch (e) { fail('Erro sintático em script inline: ' + e.message, file); }
  }
}
ok(htmlFiles.length + ' páginas HTML inspecionadas (IDs, arquivos, imagens, links e scripts inline)');

for (const file of cssFiles) {
  const css = source(file);
  for (const match of css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^)\s]+))\s*\)/gi)) {
    checkLocalReference(file, match[1] || match[2] || match[3], 'CSS');
  }
}
ok(cssFiles.length + ' arquivos CSS verificados quanto a recursos locais');

for (const file of jsFiles) {
  const test = spawnSync(process.execPath, ['--check', file], {encoding:'utf8'});
  if (test.status !== 0) fail('JavaScript com sintaxe inválida: ' + (test.stderr || test.stdout).trim(), file);
}
ok(jsFiles.length + ' scripts verificados com node --check');

const mainHtml = source(join(root,'index.html'));
const pages = [...mainHtml.matchAll(/<main\b[^>]*\bid=["']page-([^"']+)["'][^>]*\bdata-page=["']([^"']+)["']/gi)];
const pageIds = new Set();
for (const p of pages) {
  if (p[1] !== p[2]) fail('Inconsistência entre id e data-page: ' + p[1] + '/' + p[2], join(root,'index.html'));
  if (pageIds.has(p[2])) fail('Página duplicada no roteador: ' + p[2], join(root,'index.html'));
  pageIds.add(p[2]);
}
for (const name of ['inicio','areas','pecas','como-fazemos','material-reciclagem','maquinas',
                    'firmware','visio-tekna','software','a-maquina','sobre','contato','projetos']) {
  if (!pageIds.has(name)) fail('Página principal ausente: ' + name, join(root,'index.html'));
}
for (const area of ['casa-decoracao','moveis-exteriores','arquitetura','projetos-sob-medida','tecnologia']) {
  if (!mainHtml.includes('data-area="' + area + '"')) fail('Área ausente: ' + area, join(root,'index.html'));
}
ok('Integridade das 13 rotas principais e das 5 áreas');

for (const path of ['assets/brand/visioarte-logo.svg','assets/luminarias/onda.webp',
                    'assets/reciclagem/coleta.webp','assets/reciclagem/pellets.webp',
                    'assets/reciclagem/impressao.webp','comparar-animacoes-site.html',
                    'comparar-experiencias.html','comparar-iluminacao.html',
                    'site-animacoes.js','experiencias-visioarte.js']) {
  if (!existsSync(join(root,path))) fail('Arquivo essencial ausente: '+path);
}
if (!mainHtml.includes('assets/brand/visioarte-logo.svg')) fail('Logotipo oficial não aparece no index.html');
ok('Recursos essenciais e logotipo da VISIOARTE');

const heavy = all.filter(file => {
  const ext = extname(file).toLowerCase();
  return ['.png','.jpg','.jpeg','.webp','.mp4','.mov','.gif','.glb','.gltf'].includes(ext) &&
         statSync(file).size > 5 * 1024 * 1024;
});
if (heavy.length) {
  warn(heavy.length + ' arquivos de mídia maiores que 5 MiB (acompanhar o peso de carregamento)');
  for (const file of heavy.slice(0,8)) console.warn('  - ' + short(file) + ': ' + (statSync(file).size / 1024 / 1024).toFixed(1) + ' MiB');
}

console.log('\nResultado: ' + checks + ' grupos de verificações, ' + warnings + ' avisos, ' + errors + ' erros.');
if (errors) process.exitCode = 1;
