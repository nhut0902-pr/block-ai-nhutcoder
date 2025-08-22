const fetch = require('node-fetch');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.handler = async function(event) {
  try {
    const { text } = JSON.parse(event.body || '{}');
    if (!text) return { statusCode: 400, body: JSON.stringify({ error: 'Missing text' }) };
    if (!GEMINI_API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not set' }) };

    const prompt = `Tóm tắt nội dung sau thành 3-5 câu tiếng Việt ngắn gọn. Nếu có thể, gợi ý 1 ảnh đại diện phù hợp (trả về dưới khóa "img" là URL hoặc empty string). Cuối cùng trả về JSON thuần có keys: title, summary, img.\n\n${text}`;

    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const j = await r.json();
    const raw = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    // Try extract JSON inside
    let s = raw.trim();
    const fence = /```json([\s\S]*?)```/i.exec(s);
    if(fence?.[1]) s = fence[1].trim();
    const braceStart = s.indexOf('{');
    const braceEnd = s.lastIndexOf('}');
    if(braceStart !== -1 && braceEnd !== -1) s = s.slice(braceStart, braceEnd+1);

    let parsed = {};
    try { parsed = JSON.parse(s); } catch (e) {
      // fallback: build summary only
      parsed = { title: '', summary: raw.slice(0,500), img: '' };
    }

    return { statusCode: 200, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
