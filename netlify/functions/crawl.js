const fetch = require('node-fetch');
const cheerio = require('cheerio');

exports.handler = async function(event) {
  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return { statusCode: 400, body: JSON.stringify({ error: 'Missing url' }) };

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } });
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim() || $('title').text().trim();
    const paragraphs = $('p').map((i,el)=>$(el).text().trim()).get().join('\n\n');
    let img = $('img').first().attr('src') || '';

    // if relative img
    if(img && img.startsWith('/') && url.startsWith('http')) {
      const base = new URL(url).origin;
      img = base + img;
    }

    return { statusCode: 200, body: JSON.stringify({ title, content: paragraphs, summary: paragraphs.slice(0,500), img }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
