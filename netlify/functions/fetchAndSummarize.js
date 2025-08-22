const cheerio = require('cheerio');
const fetch = require('node-fetch');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function summarizeWithGemini(text) {
  const prompt = `Tóm tắt đoạn văn sau thành 3-4 câu ngắn gọn, dễ hiểu:\n\n${text}`;

  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    })
  });

  const data = await res.json();
  const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || text.slice(0, 80) + '...';
  return summary;
}

function isAuthenticated(headers) {
  const cookie = headers.cookie || '';
  return cookie.includes('admin_session=');
}

exports.handler = async (event) => {
  if (!isAuthenticated(event.headers)) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  const { url } = JSON.parse(event.body || '{}');
  if (!url) return { statusCode: 400, body: 'Thiếu URL' };

  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const img = $('img').first().attr('src') || '';
    const paragraphs = $('p').map((i, el) => $(el).text()).get().join(' ');

    const summary = await summarizeWithGemini(paragraphs);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, img, summary, content: paragraphs })
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};
