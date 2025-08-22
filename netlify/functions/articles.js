const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAuth(headers) {
  // Accept header x-admin-password or Authorization Bearer
  const hp = headers['x-admin-password'] || headers['X-Admin-Password'] || '';
  const auth = headers['authorization'] || headers['Authorization'] || '';
  if(hp && hp === ADMIN_PASSWORD) return true;
  if(auth.startsWith('Bearer ') && auth.slice(7) === ADMIN_PASSWORD) return true;
  return false;
}

exports.handler = async function(event) {
  try {
    const { action, payload } = JSON.parse(event.body || '{}');

    // Allow GET unauthenticated for reading via REST directly, but here we implement POST-based actions.
    if (event.httpMethod === 'GET') {
      // Redirect to Supabase REST
      const url = `${SUPABASE_URL}/rest/v1/articles?select=*&order=id.desc`;
      const r = await fetch(url, { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` }});
      const data = await r.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    // POST endpoints: create/update/delete require admin password
    if (!checkAuth(event.headers)) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' })};
    }

    if (action === 'create') {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    if (action === 'update') {
      const { id, ...rest } = payload;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(rest)
      });
      const data = await r.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    if (action === 'delete') {
      const { id } = payload;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      });
      const data = await r.json();
      return { statusCode: 200, body: JSON.stringify({ deleted: true, detail: data }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
