const fetch = require("node-fetch");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event) => {
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "GET") {
    // Lấy tất cả bài viết
    const { id } = event.queryStringParameters;
    const url = id
      ? `${SUPABASE_URL}/rest/v1/articles?id=${id}`
      : `${SUPABASE_URL}/rest/v1/articles?select=*`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  if (event.httpMethod === "POST") {
    const article = JSON.parse(event.body || "{}");
    const res = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
      method: "POST",
      headers,
      body: JSON.stringify(article),
    });
    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
