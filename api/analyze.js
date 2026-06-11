const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-5.4-nano';

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function cleanText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 30000);
}

function extractMeta(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1]
    || '';
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i)?.[1] || '';
  const ogDescription = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] || '';
  return { title, description, ogTitle, ogDescription };
}

function normalizeKey(key) {
  return String(key || '')
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .slice(0, 48);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 120000) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function schemaFor(criteria) {
  const properties = {};
  const required = [];
  for (const c of criteria) {
    const key = normalizeKey(c.key);
    const type = ['boolean', 'string', 'number'].includes(c.type) ? c.type : 'string';
    required.push(key);
    properties[key] = {
      type: 'object',
      additionalProperties: false,
      properties: {
        title: { type: 'string', maxLength: 60 },
        answer: type === 'string' ? { type, maxLength: 140 } : { type },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        evidence: { type: 'array', items: { type: 'string', maxLength: 180 }, minItems: 1, maxItems: 4 },
        reasoning: { type: 'string', maxLength: 260 }
      },
      required: ['title', 'answer', 'confidence', 'evidence', 'reasoning']
    };
  }
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      url: { type: 'string' },
      company_name: { type: 'string' },
      summary: { type: 'string' },
      fields: {
        type: 'object',
        additionalProperties: false,
        properties,
        required
      }
    },
    required: ['url', 'company_name', 'summary', 'fields']
  };
}

async function fetchWebsite(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 WebbbyBot/0.1 (+https://webbby.artikle.org)',
        'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8'
      }
    });
    const html = await response.text();
    return { status: response.status, finalUrl: response.url, html, meta: extractMeta(html), text: cleanText(html) };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }
  if (!process.env.OPENROUTER_API_KEY) {
    return json(res, 500, { ok: false, error: 'OPENROUTER_API_KEY is not configured' });
  }

  try {
    const body = await parseBody(req);
    const inputUrl = String(body.url || '').trim();
    let url;
    try { url = new URL(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`); }
    catch { return json(res, 400, { ok: false, error: 'Invalid URL' }); }

    const rawCriteria = Array.isArray(body.criteria) ? body.criteria : [];
    const criteria = rawCriteria
      .map((c, i) => ({
        key: normalizeKey(c.key || `field_${i + 1}`),
        label: String(c.label || c.question || c.value || c.key || '').trim(),
        type: ['boolean', 'string', 'number'].includes(c.type) ? c.type : 'string'
      }))
      .filter(c => c.key && c.label)
      .slice(0, 12);

    if (!criteria.length) return json(res, 400, { ok: false, error: 'At least one criterion is required' });

    const site = await fetchWebsite(url.toString());
    if (!site.text || site.text.length < 100) {
      return json(res, 422, { ok: false, error: 'Could not extract enough text from this website', status: site.status });
    }

    const schema = schemaFor(criteria);
    const criteriaText = criteria.map(c => `- ${c.key} (${c.type}): ${c.label}`).join('\n');
    const prompt = `Tu aides une équipe commerciale à qualifier un prospect à partir de son site web. Analyse uniquement les informations fournies, sans inventer. Pour chaque signal, donne un titre lisible côté sales, une réponse courte, un niveau de confiance, une raison concise et des preuves sous forme de liste de phrases courtes.\n\nSite demandé: ${url.toString()}\nSite final: ${site.finalUrl}\nMeta: ${JSON.stringify(site.meta)}\n\nSignaux à vérifier:\n${criteriaText}\n\nTexte du site:\n${site.text}`;

    const openrouterResponse = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.PUBLIC_SITE_URL || 'https://webbby.artikle.org',
        'X-Title': 'Webbby'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        reasoning: { effort: 'xhigh' },
        temperature: 0.1,
        messages: [
          { role: 'system', content: 'Tu es Webbby, un analyste de prospection B2B. Tu dois aider des équipes sales à décider si un compte mérite un message. Réponses courtes, preuves concrètes, aucun élément inventé. Les preuves doivent toujours être une liste de chaînes de texte.' },
          { role: 'user', content: prompt }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'webbby_website_analysis',
            strict: true,
            schema
          }
        }
      })
    });

    const payload = await openrouterResponse.json().catch(() => ({}));
    if (!openrouterResponse.ok) {
      return json(res, openrouterResponse.status, { ok: false, error: 'OpenRouter request failed', detail: payload?.error?.message || payload });
    }

    const content = payload?.choices?.[0]?.message?.content;
    let analysis;
    try { analysis = typeof content === 'string' ? JSON.parse(content) : content; }
    catch { return json(res, 502, { ok: false, error: 'Model did not return valid JSON', raw: content }); }

    // Fire and forget — save to Supabase without blocking response
    saveSearch(url.toString(), criteria, analysis).catch(() => {});

    return json(res, 200, { ok: true, analysis, usage: payload.usage || null, model: payload.model || DEFAULT_MODEL, extracted: { status: site.status, finalUrl: site.finalUrl, chars: site.text.length } });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message || 'Unexpected error' });
  }
}

async function saveSearch(url, criteria, result) {
  try {
    const { getSupabase } = await import('./_lib/supabase.js');
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('searches').insert({
      url,
      criteria,
      result
    });
  } catch {
    // silent — don't block the user if saving fails
  }
}
