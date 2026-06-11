import { getSupabase } from './_lib/supabase.js';

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabase();
    if (!supabase) {
      return json(res, 500, { ok: false, error: 'Supabase not configured' });
    }

    const limit = Math.min(Math.max(parseInt(req.query?.limit) || 50, 1), 200);

    const { data, error } = await supabase
      .from('searches')
      .select('id, url, criteria, result, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return json(res, 200, { ok: true, searches: data, count: data.length });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message || 'Unexpected error' });
  }
}
