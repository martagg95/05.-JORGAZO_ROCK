/**
 * Automatización Segura y Gratuita para "El Altavoz del Jorgazo"
 * Sin dependencias externas de npm (100% Node.js nativo) + Integración con:
 *  - Texto: Ollama local (por defecto qwen3.5:4b) o Gemini API Free Tier
 *  - Imagen: Realistic Vision V5.1 en Python (Apple Silicon MPS) con fallback a cartel SVG punk-rock
 *  - Aviso por email: conectado automáticamente a tu Google Apps Script mediante
 *    scripts/apps-script/altavoz_local.config.json (ignorado por Git).
 *
 * Uso directo (sin tener que configurar variables a mano):
 *  1) Generar borradores y recibir aviso por email:
 *     node scripts/altavoz_automation.js
 *  2) Ver borradores pendientes:
 *     node scripts/altavoz_automation.js --list
 *  3) Aprobar y publicar en la web (news_data.js y news_staging.json):
 *     node scripts/altavoz_automation.js --approve-all
 *     node scripts/altavoz_automation.js --approve <id>
 *  4) Ejecutar auto-test completo (incluyendo prueba en vivo con tu qwen3.5:4b):
 *     node scripts/altavoz_automation.js --test
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SOURCES_PATH = path.join(ROOT, 'data', 'sources.json');
const STAGING_PATH = path.join(ROOT, 'data', 'news_staging.json');
const NEWS_DATA_PATH = path.join(ROOT, 'data', 'news_data.js');
const DRAFTS_PATH = path.join(ROOT, 'data', 'news_drafts.json');
const BLOG_IMG_DIR = path.join(ROOT, 'assets', 'gallery', 'blog');
const LOCAL_CONFIG_PATH = path.join(__dirname, 'apps-script', 'altavoz_local.config.json');
const RV_SCRIPT_PATH = path.join(__dirname, 'generate_realistic_vision.py');

function loadLocalConfig() {
  if (fs.existsSync(LOCAL_CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_CONFIG_PATH, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

const LOCAL_CFG = loadLocalConfig();

function getCfg(key, fallback = '') {
  if (process.env[key] !== undefined && process.env[key] !== '') return process.env[key];
  if (LOCAL_CFG[key] !== undefined && LOCAL_CFG[key] !== '') return LOCAL_CFG[key];
  return fallback;
}

const BANNED_KEYWORDS = ['extremúsika', 'extremusika'];
const RELEVANT_KEYWORDS = [
  'extremadura', 'cáceres', 'caceres', 'badajoz', 'plasencia', 'mérida', 'merida',
  'cabeza la vaca', 'bellota', 'guadiana', 'jerte', 'almendralejo', 'don benito',
  'villanueva', 'valdencín', 'ceclavín', 'pinofranqueado', 'bellota rock',
  'sanguijuelas', 'sinkope', 'extremoduro', 'fefa', 'punk', 'autogestion',
  'autogestión', 'riot grrrl', 'banda femenina', 'mujeres', 'femenina'
];

function isSafeExternalHttpsUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host.startsWith('127.') ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function isRelevantContent(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (BANNED_KEYWORDS.some(b => text.includes(b))) return false;
  return RELEVANT_KEYWORDS.some(kw => text.includes(kw));
}

function cleanText(raw) {
  return String(raw || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, ' ')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#8216;|&#8217;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(str) {
  return String(str || 'noticia')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Genera una imagen SVG estilo fanzine punk-rock localmente (respaldo instantáneo).
 */
function generateLocalPosterSvg(id, title, source) {
  if (!fs.existsSync(BLOG_IMG_DIR)) fs.mkdirSync(BLOG_IMG_DIR, { recursive: true });
  const filename = `${id}.svg`;
  const absPath = path.join(BLOG_IMG_DIR, filename);

  const words = cleanText(title).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > 26 && lines.length < 3) {
      lines.push(line.trim());
      line = w;
    } else {
      line += ' ' + w;
    }
  }
  if (line.trim() && lines.length < 4) lines.push(line.trim());

  const titleSvg = lines
    .map((l, idx) => `<text x="60" y="${210 + idx * 52}" fill="#ffffff" font-family="Impact, Arial Black, sans-serif" font-size="40" letter-spacing="1">${escapeXml(l.toUpperCase())}</text>`)
    .join('\n  ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0b0b"/>
      <stop offset="100%" stop-color="#1b0505"/>
    </linearGradient>
  </defs>
  <rect width="900" height="500" fill="url(#bg)"/>
  <polygon points="0,0 900,0 900,88 0,115" fill="#e60000"/>
  <rect x="30" y="30" width="840" height="440" fill="none" stroke="#e60000" stroke-width="4" stroke-dasharray="14 8"/>
  <text x="60" y="72" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="24">EL ALTAVOZ DEL JORGAZO // ${escapeXml(String(source || 'ROCK RURAL').toUpperCase().slice(0, 32))}</text>
  ${titleSvg}
  <line x1="60" y1="405" x2="840" y2="405" stroke="#444" stroke-width="2"/>
  <text x="60" y="445" fill="#e60000" font-family="monospace" font-weight="bold" font-size="20">RESISTENCIA CULTURAL · CABEZA LA VACA · AUTOGESTIÓN</text>
</svg>\n`;

  fs.writeFileSync(absPath, svg, 'utf8');
  return `assets/gallery/blog/${filename}`;
}

function findPythonWithDiffusers() {
  const candidates = [
    path.join(ROOT, '.venv', 'bin', 'python'),
    path.join(ROOT, 'venv', 'bin', 'python'),
    'python3'
  ];
  for (const py of candidates) {
    if (py.includes(path.sep) && !fs.existsSync(py)) continue;
    const chk = spawnSync(py, ['-c', 'import torch, diffusers'], { timeout: 8000 });
    if (chk.status === 0) return py;
  }
  return null;
}

async function generatePhotoPromptWithOllama(item) {
  const model = getCfg('OLLAMA_MODEL', 'qwen3.5:4b');
  const prompt = [
    'Write a short English photographic scene description (maximum 30 words) for Stable Diffusion Realistic Vision.',
    'Theme: a live underground punk rock concert or rural cultural festival in a scenic Spanish mountain village, instruments, stage lights, crowd, authentic documentary photography.',
    'Do NOT include any text, words, letters, or band logos in the description.',
    `News context: ${item.title}`,
    'Return ONLY the English description.'
  ].join('\n');

  try {
    const res = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false, think: false }),
      signal: AbortSignal.timeout(30000)
    });
    if (res.ok) {
      const data = await res.json();
      const out = cleanText(data.response || '');
      if (out) return out;
    }
  } catch { /* fallback below */ }

  return 'live underground punk rock concert in a Spanish stone mountain village at dusk, electric guitars, warm stage lights, energetic crowd, authentic documentary photography';
}

async function generateArticleImage(id, item) {
  const imgMode = getCfg('IMAGE_MODE', 'realistic_vision').toLowerCase();
  if (imgMode === 'realistic_vision' && fs.existsSync(RV_SCRIPT_PATH)) {
    const pyBin = findPythonWithDiffusers();
    if (pyBin) {
      if (!fs.existsSync(BLOG_IMG_DIR)) fs.mkdirSync(BLOG_IMG_DIR, { recursive: true });
      const outAbs = path.join(BLOG_IMG_DIR, `${id}.png`);
      const photoPrompt = await generatePhotoPromptWithOllama(item);
      console.log(`📸 Generando foto con Realistic Vision V5.1 (${photoPrompt})...`);
      const run = spawnSync(pyBin, [RV_SCRIPT_PATH, '--prompt', photoPrompt, '--output', outAbs], {
        stdio: 'inherit',
        timeout: 300000
      });
      if (run.status === 0 && fs.existsSync(outAbs)) {
        return `assets/gallery/blog/${id}.png`;
      }
      console.warn('⚠️ Realistic Vision no pudo completar la imagen; usando cartel SVG punk-rock de respaldo.');
    } else {
      console.log('ℹ️ [Realistic Vision] Entorno Python (.venv con torch+diffusers) aún no instalado; generando cartel SVG punk-rock.');
    }
  }
  return generateLocalPosterSvg(id, item.title, item.source);
}

async function fetchRssSource(source) {
  const baseUrl = source.url.endsWith('/') ? source.url : `${source.url}/`;
  const rssUrl = `${baseUrl}feed/`;
  if (!isSafeExternalHttpsUrl(rssUrl)) return [];

  try {
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'JorgazoAltavozBot/2.0 (+https://jorgazorock.es)' },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const results = [];

    for (const item of items.slice(0, 5)) {
      const title = cleanText(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
      const link = cleanText(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '');
      const pubDate = cleanText(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '') || new Date().toISOString();
      const desc = cleanText(item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '');

      if (!title || !isSafeExternalHttpsUrl(link)) continue;
      if (!isRelevantContent(title, desc)) continue;

      results.push({ title, link, pubDate, description: desc.slice(0, 500), source: source.nombre });
    }
    return results;
  } catch (err) {
    console.warn(`[RSS] No se pudo leer ${source.nombre}: ${err.message}`);
    return [];
  }
}

async function rewriteWithOllama(item) {
  const model = getCfg('OLLAMA_MODEL', 'qwen3.5:4b');
  const prompt = [
    'Redacta un resumen breve (máximo 70 palabras) para la sección "El Altavoz" del festival punk-rock rural Jorgazo Rock (Cabeza la Vaca, Extremadura).',
    'Usa un tono cañero, cercano y lenguaje inclusivo con "x" cuando proceda (ej. todxs, compañerxs). No inventes datos ni fechas. Cita la fuente original.',
    `Título: ${item.title}`,
    `Fuente: ${item.source}`,
    `Extracto: ${item.description}`,
    'Devuelve SOLO el párrafo del resumen en español, sin títulos ni comillas.'
  ].join('\n');

  const res = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false, think: false }),
    signal: AbortSignal.timeout(45000)
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  return cleanText(data.response || '');
}

async function rewriteWithGeminiFree(item) {
  const apiKey = getCfg('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada');

  const model = getCfg('GEMINI_MODEL', 'gemini-2.5-flash');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const prompt = [
    'Eres redactor/a del blog "El Altavoz" del festival punk-rock rural y gratuito Jorgazo Rock (Cabeza la Vaca, Extremadura).',
    'Redacta un resumen breve (máximo 70 palabras) sobre esta noticia con tono punk rural cercano, lenguaje inclusivo con "x" cuando proceda y sin inventar hechos.',
    `Título: ${item.title}`,
    `Fuente: ${item.source}`,
    `Extracto: ${item.description}`,
    'Devuelve únicamente el párrafo final en español.'
  ].join('\n');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 220 }
    }),
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return cleanText(text);
}

async function generateSummary(item) {
  const provider = (getCfg('ALTAVOZ_AI_PROVIDER') || getCfg('AI_PROVIDER', 'ollama')).toLowerCase();
  try {
    if (provider === 'ollama') {
      const out = await rewriteWithOllama(item);
      if (out) return out;
    } else if (provider === 'gemini') {
      const out = await rewriteWithGeminiFree(item);
      if (out) return out;
    }
  } catch (err) {
    console.warn(`[IA fallback] ${err.message}. Usando plantilla segura.`);
  }

  const shortDesc = item.description.split(/\s+/).slice(0, 24).join(' ');
  return `Desde ${item.source} nos llega ruido fresco: "${shortDesc}...". Apoya la escena rural e independiente y lee la noticia completa en la fuente original.`;
}

function readExistingNews() {
  if (fs.existsSync(STAGING_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
    } catch { /* fallthrough */ }
  }
  return [];
}

function approveDrafts(targetId) {
  if (!fs.existsSync(DRAFTS_PATH)) {
    console.log('No hay borradores pendientes en data/news_drafts.json.');
    return;
  }
  const drafts = JSON.parse(fs.readFileSync(DRAFTS_PATH, 'utf8'));
  const toPublish = targetId === '--all' ? drafts : drafts.filter(d => d.id === targetId);
  if (toPublish.length === 0) {
    console.log('No se encontraron borradores coincidentes para aprobar.');
    return;
  }

  const existing = readExistingNews();
  const existingLinks = new Set(existing.map(n => n.link));
  const cleanPublished = toPublish
    .filter(d => !existingLinks.has(d.link))
    .map(({ status, ...item }) => item);

  const merged = [...cleanPublished, ...existing].slice(0, 50);
  fs.writeFileSync(STAGING_PATH, JSON.stringify(merged, null, 2));
  fs.writeFileSync(NEWS_DATA_PATH, `const JORGAZO_NEWS = ${JSON.stringify(merged, null, 2)};\n`);

  const remaining = drafts.filter(d => !toPublish.some(p => p.id === d.id));
  fs.writeFileSync(DRAFTS_PATH, JSON.stringify(remaining, null, 2));
  console.log(`✅ Publicado(s) ${cleanPublished.length} artículo(s) en news_data.js y news_staging.json.`);
}

async function notifyByEmail(drafts) {
  const notifyUrl = getCfg('BLOG_NOTIFY_URL') || getCfg('ALTAVOZ_APPS_SCRIPT_URL');
  const notifySecret = getCfg('BLOG_NOTIFY_SECRET');
  if (!notifyUrl || !notifySecret || drafts.length === 0) return;

  try {
    const res = await fetch(notifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'notify_blog_draft',
        secret: notifySecret,
        drafts: drafts.map(d => ({ id: d.id, title: d.title, source: d.source, link: d.link }))
      }),
      signal: AbortSignal.timeout(12000)
    });
    const out = await res.json();
    if (out && out.ok) {
      console.log('📧 Aviso enviado por correo a asociacionjorgazorock@gmail.com para revisión.');
    } else {
      console.warn('⚠️ No se pudo enviar el aviso por email (¿has actualizado ya el Code.gs en Google Apps Script?):', out);
    }
  } catch (err) {
    console.warn('⚠️ Error enviando notificación de borrador:', err.message);
  }
}

async function notifyOnMac(drafts) {
  if (process.platform !== 'darwin' || !Array.isArray(drafts) || drafts.length === 0) return;

  const firstTitle = String(drafts[0].title || 'Novedad').replace(/["\\]/g, '').slice(0, 70);
  const approveCmd = `cd ${ROOT} && node scripts/altavoz_automation.js --approve-all`;
  const publishCmd = `cd ${ROOT} && git add data/news_data.js data/news_staging.json assets/gallery/blog/ && git commit -m "Nuevas noticias en El Altavoz" && git push`;

  try {
    spawnSync('osascript', [
      '-e',
      `display notification "${drafts.length} borrador(es) listo(s): ${firstTitle}" with title "🎸 El Altavoz del Jorgazo" sound name "Hero"`
    ], { timeout: 5000 });
  } catch { /* sin bloqueo si notificaciones desactivadas */ }

  const listPreview = drafts.slice(0, 3)
    .map((d, i) => `${i + 1}. ${String(d.title || '').replace(/["\\]/g, '').slice(0, 65)}`)
    .join('\\n');

  const dialogScript = [
    `display dialog "🎸 El Altavoz ha generado ${drafts.length} borrador(es) nuevo(s):\\n\\n${listPreview}\\n\\n¿Qué quieres hacer?"`,
    `with title "El Altavoz · Jorgazo Rock"`,
    `buttons {"Dejar pendiente", "Copiar comando", "Aprobar en local"}`,
    `default button "Copiar comando"`,
    `giving up after 60`
  ].join(' ');

  const dlg = spawnSync('osascript', ['-e', dialogScript], { encoding: 'utf8', timeout: 65000 });
  const out = (dlg.stdout || '').trim();
  if (out.includes('button returned:Copiar comando')) {
    spawnSync('pbcopy', [], { input: approveCmd, encoding: 'utf8', timeout: 5000 });
    console.log(`📋 Comando copiado al portapapeles:\n   ${approveCmd}`);
  } else if (out.includes('button returned:Aprobar en local')) {
    approveDrafts('--all');
    spawnSync('pbcopy', [], { input: publishCmd, encoding: 'utf8', timeout: 5000 });
    console.log(`📋 Comando de subida a GitHub copiado al portapapeles:\n   ${publishCmd}`);
  }
}

async function runGeneration() {
  if (!fs.existsSync(SOURCES_PATH)) {
    console.error('No se encuentra data/sources.json');
    process.exit(1);
  }
  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
  const existing = readExistingNews();
  const existingDrafts = fs.existsSync(DRAFTS_PATH) ? JSON.parse(fs.readFileSync(DRAFTS_PATH, 'utf8')) : [];
  const knownLinks = new Set([...existing.map(n => n.link), ...existingDrafts.map(d => d.link)]);

  const collected = [];
  for (const blog of (sources.blogs_y_medios || [])) {
    if (blog.tipo !== 'rss') continue;
    const items = await fetchRssSource(blog);
    collected.push(...items);
  }

  const fresh = collected.filter(item => !knownLinks.has(item.link)).slice(0, 5);
  if (fresh.length === 0) {
    console.log('Sin novedades relevantes nuevas en las fuentes RSS.');
    return;
  }

  const newDrafts = [];
  for (const item of fresh) {
    const id = `auto-${slugify(item.title)}-${Date.now().toString(36)}`;
    const imagePath = await generateArticleImage(id, item);
    const summary = await generateSummary(item);
    newDrafts.push({
      id,
      title: item.title,
      link: item.link,
      linkText: 'LEER EN FUENTE ORIGINAL →',
      date: new Date(item.pubDate).toISOString(),
      source: item.source,
      type: 'rss',
      image: imagePath,
      summary,
      status: 'draft'
    });
  }

  const allDrafts = [...newDrafts, ...existingDrafts];
  fs.writeFileSync(DRAFTS_PATH, JSON.stringify(allDrafts, null, 2));
  console.log(`📝 Guardados ${newDrafts.length} borrador(es) en data/news_drafts.json (pendientes de tu revisión).`);
  await notifyByEmail(newDrafts);
  await notifyOnMac(newDrafts);
}

function printHelp() {
  console.log(`Uso: node scripts/altavoz_automation.js [opción]

Opciones:
  --fetch          Busca novedades RSS, redacta borradores con qwen3.5:4b y genera imágenes (opción por defecto)
  --list           Muestra los borradores pendientes en data/news_drafts.json
  --approve <id>   Aprueba y publica un borrador concreto en data/news_data.js y data/news_staging.json
  --approve-all    Aprueba y publica todos los borradores pendientes
  --notify-test    Muestra una prueba del aviso interactivo en macOS (copia al portapapeles sin tocar archivos)
  --test           Ejecuta auto-test de seguridad y prueba en vivo tu modelo Ollama local (qwen3.5:4b)
  --help           Muestra esta ayuda`);
}

function listDrafts() {
  if (!fs.existsSync(DRAFTS_PATH)) {
    console.log('No hay borradores pendientes en data/news_drafts.json.');
    return;
  }
  const drafts = JSON.parse(fs.readFileSync(DRAFTS_PATH, 'utf8'));
  if (!Array.isArray(drafts) || drafts.length === 0) {
    console.log('No hay borradores pendientes en data/news_drafts.json.');
    return;
  }
  console.log(`📋 Borradores pendientes (${drafts.length}):`);
  drafts.forEach((d, i) => {
    console.log(`${i + 1}. [${d.id}] ${d.title} (${d.source}) -> img: ${d.image}`);
  });
}

async function runSelfTest() {
  const assert = require('assert');
  console.log('🧪 Iniciando auto-test de El Altavoz (seguridad + conexión con Ollama qwen3.5:4b)...');

  // 1. Validación SSRF / XSS en URLs
  assert.strictEqual(isSafeExternalHttpsUrl('https://ejemplo.com/noticia'), true);
  assert.strictEqual(isSafeExternalHttpsUrl('http://127.0.0.1:8080/'), false);
  assert.strictEqual(isSafeExternalHttpsUrl('http://localhost/admin'), false);
  assert.strictEqual(isSafeExternalHttpsUrl('https://169.254.169.254/latest/meta-data/'), false);
  assert.strictEqual(isSafeExternalHttpsUrl('https://192.168.1.1/'), false);
  assert.strictEqual(isSafeExternalHttpsUrl('javascript:alert(1)'), false);

  // 2. Filtro de relevancia y palabras prohibidas
  assert.strictEqual(isRelevantContent('Festival punk rural en Cabeza la Vaca', 'Bandas de Extremadura'), true);
  assert.strictEqual(isRelevantContent('Cartel de Extremúsika 2026', 'Concierto en Cáceres'), false);
  assert.strictEqual(isRelevantContent('Receta de tortilla', 'Cocina tradicional sin música'), false);

  // 3. Limpieza de texto CDATA/HTML/<think>
  const cleaned = cleanText('<think>razonamiento interno</think><![CDATA[<p>Punk &amp; Rock en <b>Fuente Lunara</b></p>]]>');
  assert.strictEqual(cleaned, 'Punk & Rock en Fuente Lunara');

  // 4. Prueba en vivo con tu Ollama local (qwen3.5:4b)
  const sampleItem = {
    title: 'Las bandas autogestionadas de Extremadura se unen en el sur de Badajoz',
    source: 'Insonoro',
    description: 'Ocho grupos de punk, rock y ska llenarán de música libre la sierra de Tentudía en una jornada gratuita.'
  };
  try {
    const liveSummary = await rewriteWithOllama(sampleItem);
    const livePhotoPrompt = await generatePhotoPromptWithOllama(sampleItem);
    assert.ok(liveSummary.length > 20, 'El resumen de Ollama debe tener contenido');
    console.log(`🤖 [Ollama ${getCfg('OLLAMA_MODEL', 'qwen3.5:4b')}] Resumen generado en vivo:\n   "${liveSummary}"`);
    console.log(`📸 [Prompt Realistic Vision] Generado en vivo:\n   "${livePhotoPrompt}"`);
  } catch (err) {
    console.warn(`⚠️ Ollama no respondió en vivo (${err.message}), probando plantilla de respaldo...`);
    const fallbackSummary = await generateSummary(sampleItem);
    assert.ok(fallbackSummary.includes('Insonoro'));
  }

  // 5. Generación de cartel SVG con escapado XML y limpieza inmediata
  const testId = '_selftest_poster';
  const absSvg = path.join(BLOG_IMG_DIR, `${testId}.svg`);
  try {
    const relPath = generateLocalPosterSvg(testId, 'Concierto <Punk> & "Ruido"', 'Fuente & Test <1>');
    assert.strictEqual(relPath, `assets/gallery/blog/${testId}.svg`);
    assert.ok(fs.existsSync(absSvg));
    const svgContent = fs.readFileSync(absSvg, 'utf8');
    assert.ok(svgContent.includes('<svg') && svgContent.includes('&amp;') && !svgContent.includes('<Punk>'));
  } finally {
    if (fs.existsSync(absSvg)) fs.unlinkSync(absSvg);
  }

  const pyWithDiffusers = findPythonWithDiffusers();
  if (pyWithDiffusers) {
    console.log(`✅ Entorno Python para Realistic Vision detectado en: ${pyWithDiffusers}`);
  } else {
    console.log('ℹ️ Entorno Python para Realistic Vision (.venv) pendiente de instalar paquetes (actualmente activo el cartel SVG automático).');
  }

  console.log('✅ Auto-test completado con éxito.');
}

async function main() {
  const arg = process.argv[2];
  if (arg === '--help' || arg === '-h') {
    printHelp();
    return;
  }
  if (arg === '--list') {
    listDrafts();
    return;
  }
  if (arg === '--notify-test') {
    await notifyOnMac([{ id: 'demo-test', title: 'Prueba de aviso de El Altavoz (sin cambios en disco)' }]);
    return;
  }
  if (arg === '--test') {
    await runSelfTest();
    return;
  }
  if (arg === '--approve-all') {
    approveDrafts('--all');
    return;
  }
  if (arg === '--approve' && process.argv[3]) {
    approveDrafts(process.argv[3]);
    return;
  }
  if (!arg || arg === '--fetch') {
    await runGeneration();
    return;
  }
  console.error(`Opción no reconocida: ${arg}`);
  printHelp();
  process.exit(1);
}

main();
