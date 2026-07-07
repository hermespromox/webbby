const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-5.4-nano';

import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    db: { schema: 'webbby' },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

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

function detectQuestionLanguage(criteria) {
  const text = criteria.map(c => `${c.key || ''} ${c.label || ''}`).join(' ').toLowerCase();
  const frenchHits = (text.match(/\b(entreprise|client|cible|est[- ]ce|quel|quelle|qui|budget|offres|achat|prospect|montre|signaux|réponse|oui|non|site|vente|commercial|français)\b/g) || []).length;
  const englishHits = (text.match(/\b(company|customer|target|does|is|are|who|what|which|budget|offer|buying|purchase|prospect|signals|answer|yes|no|website|sales|english)\b/g) || []).length;
  if (englishHits > frenchHits) return 'English';
  if (frenchHits > englishHits) return 'French';
  return /[éèêëàâîïôùûçœ]/i.test(text) ? 'French' : 'English';
}

function languageCode(language) {
  return language === 'French' ? 'fr' : 'en';
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
      response_language: { type: 'string', enum: ['en', 'fr'] },
      summary: { type: 'string' },
      fields: {
        type: 'object',
        additionalProperties: false,
        properties,
        required
      }
    },
    required: ['url', 'company_name', 'response_language', 'summary', 'fields']
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
      .map((c, i) => {
        const displayKey = String(c.key || `Signal ${i + 1}`).trim();
        return {
          key: normalizeKey(displayKey || `field_${i + 1}`),
          displayKey,
          label: String(c.label || c.question || c.value || c.key || '').trim(),
          type: ['boolean', 'string', 'number'].includes(c.type) ? c.type : 'string'
        };
      })
      .filter(c => c.key && c.label)
      .slice(0, 12);

    if (!criteria.length) return json(res, 400, { ok: false, error: 'At least one criterion is required' });

    const site = await fetchWebsite(url.toString());
    if (!site.text || site.text.length < 100) {
      return json(res, 422, { ok: false, error: 'Could not extract enough text from this website', status: site.status });
    }

    const responseLanguage = detectQuestionLanguage(criteria);
    const responseLanguageCode = languageCode(responseLanguage);
    const schema = schemaFor(criteria);
    const criteriaText = criteria.map(c => `- ${c.key} (${c.type}): ${c.label}`).join('\n');
    const prompt = `You help a sales team qualify a prospect from its website. Analyze only the supplied information; do not invent. The user's criteria/questions are in ${responseLanguage}. Return ALL human-readable fields in ${responseLanguage}: company_name when possible, summary, every field title, answer when it is a string, reasoning, and evidence. Set response_language exactly to ${responseLanguageCode}. Boolean answers must remain JSON booleans. For every signal, provide a sales-readable title, a short answer, confidence, concise reasoning, and concrete evidence as short phrases.\n\nRequested site: ${url.toString()}\nFinal site: ${site.finalUrl}\nMeta: ${JSON.stringify(site.meta)}\n\nCriteria/questions to check:\n${criteriaText}\n\nWebsite text:\n${site.text}`;

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
          { role: 'system', content: 'You are Webbby, a B2B prospecting analyst. Help sales teams decide whether an account deserves outreach. Always answer in the same language as the user criteria/questions. Keep answers short, use concrete evidence, invent nothing. Evidence must always be an array of strings.' },
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

    // Save to Supabase
    await saveSearch(url.toString(), criteria, analysis);

    return json(res, 200, { ok: true, analysis, criteria, usage: payload.usage || null, model: payload.model || DEFAULT_MODEL, extracted: { status: site.status, finalUrl: site.finalUrl, chars: site.text.length } });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message || 'Unexpected error' });
  }
}

async function saveSearch(url, criteria, result) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.from('searches').insert({ url, criteria, result });
  } catch {
    // silent
  }
}
