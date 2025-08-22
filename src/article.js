import React, { useEffect, useState } from 'https://esm.sh/react';
import ReactDOM from 'https://esm.sh/react-dom';
import { supabase } from './supabaseClient.js';

function useQuery(){
  return new URLSearchParams(window.location.search);
}

function Article(){
  const q = useQuery();
  const id = q.get('id');
  const [a, setA] = useState(null);

  useEffect(()=>{
    if(!id) return;
    (async ()=>{
      const { data, error } = await supabase.from('articles').select('*').eq('id', id).maybeSingle();
      if(!error) setA(data);
    })();
  }, [id]);

  if(!id) return <p className="text-red-600">Thiếu id</p>;
  if(!a) return <p>Đang tải…</p>;

  return (
    <article className="bg-white rounded-xl shadow p-4">
      <h1 className="text-2xl font-bold">{a.title}</h1>
      <div className="text-xs text-gray-500 mb-2">{new Date(a.created_at).toLocaleString('vi-VN')}</div>
      {a.img && <img src={a.img} className="w-full rounded mb-4 object-cover" alt=""/>}
      <div className="whitespace-pre-line text-gray-800">{a.content || a.summary}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(a.hashtags||'').split(',').map(t=>t.trim()).filter(Boolean).map(t=><span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded border">{t}</span>)}
      </div>
    </article>
  );
}

ReactDOM.render(<Article/>, document.getElementById('root'));
