import React, { useEffect, useMemo, useState } from 'https://esm.sh/react';
import ReactDOM from 'https://esm.sh/react-dom';
import { supabase } from './supabaseClient.js';

function formatDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleString('vi-VN');
}

function ArticleCard({a}) {
  return (
    <article className="bg-white rounded-xl shadow p-4">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold">{a.title}</h2>
        <div className="text-xs text-gray-500">{formatDate(a.created_at)}</div>
      </div>
      {a.img && <img src={a.img} className="mt-3 w-full max-h-72 object-cover rounded" alt=""/>}
      <p className="mt-3 text-gray-700">{a.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(a.hashtags||'').split(',').map(t => t.trim()).filter(Boolean).map(t => (
          <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded border">{t}</span>
        ))}
      </div>
      <a href={`/article.html?id=${a.id}`} className="inline-block mt-3 text-blue-600">Xem chi tiết →</a>
    </article>
  );
}

function App(){
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [q, setQ] = useState('');
  const [tagQ, setTagQ] = useState('');
  const [sortBy, setSortBy] = useState('created_at'); // created_at or title

  useEffect(()=>{ load(); }, [page, sortBy]);

  async function load(){
    const from = (page-1)*perPage;
    const to = page*perPage -1;
    const orderAsc = false;
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order(sortBy, { ascending: sortBy === 'title' ? true : false })
      .range(from, to);
    if (!error) setArticles(data || []);
  }

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    const tags = tagQ.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean);
    return articles.filter(a=>{
      const okText = !s || (a.title||'').toLowerCase().includes(s) || (a.summary||'').toLowerCase().includes(s);
      let okTag = true;
      if(tags.length){
        const src = (a.hashtags||'').split(',').map(t=>t.trim().toLowerCase());
        okTag = tags.every(t => src.includes(t));
      }
      return okText && okTag;
    });
  }, [articles, q, tagQ]);

  return (
    <div>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="border p-2 rounded" placeholder="Tìm kiếm..." value={q} onChange={e=>setQ(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Hashtag (ai,robot)" value={tagQ} onChange={e=>setTagQ(e.target.value)} />
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="border p-2 rounded">
          <option value="created_at">Mới nhất</option>
          <option value="title">Tiêu đề (A→Z)</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map(a => <ArticleCard key={a.id} a={a} />)}
        {filtered.length===0 && <p className="text-sm text-gray-500">Không có bài</p>}
      </div>

      <div className="mt-6 flex justify-between">
        <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-2 bg-gray-200 rounded">Prev</button>
        <div className="text-sm">Trang {page}</div>
        <button onClick={()=>setPage(p=>p+1)} className="px-3 py-2 bg-gray-200 rounded">Next</button>
      </div>
    </div>
  );
}

ReactDOM.render(<App/>, document.getElementById('root'));
