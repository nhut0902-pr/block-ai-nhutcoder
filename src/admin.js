import React, { useEffect, useState } from 'https://esm.sh/react';
import ReactDOM from 'https://esm.sh/react-dom';
import { supabase } from './supabaseClient.js';

// Helper calls to functions
async function crawlURL(url){
  const res = await fetch('/.netlify/functions/crawl', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({url})});
  return res.json();
}
async function summarizeWithGemini(text){
  const res = await fetch('/.netlify/functions/gemini', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({text})});
  return res.json();
}
async function apiArticles(action, payload){
  // action: 'create'|'update'|'delete'
  const headers = {'Content-Type':'application/json', 'x-admin-password': ADMIN_PASSWORD};
  return fetch('/.netlify/functions/articles', {method:'POST', headers, body: JSON.stringify({action,payload})}).then(r=>r.json());
}

// IMPORTANT: client-side must set ADMIN_PASSWORD for calling articles function,
// safer: use a login that stores it in memory only.
const ADMIN_PASSWORD = prompt("Nhập mật khẩu admin để thực hiện thao tác (chỉ dùng lần này):") || '';

function Admin(){
  const [logged, setLogged] = useState(false);
  const [pw, setPw] = useState('');
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);

  // form fields
  const [url, setUrl] = useState('');
  const [title,setTitle] = useState('');
  const [summary,setSummary] = useState('');
  const [content,setContent] = useState('');
  const [img,setImg] = useState('');
  const [hashtags,setHashtags] = useState('');
  const [author,setAuthor] = useState('Nhutcoder');
  const [file, setFile] = useState(null);

  useEffect(()=>{ load(); }, []);

  async function load(){
    const { data } = await supabase.from('articles').select('*').order('id', {ascending:false});
    setList(data || []);
  }

  function login(){
    if(pw === window.ADMIN_PASSWORD || pw === ADMIN_PASSWORD){ setLogged(true); } else alert('Sai mật khẩu');
  }

  async function handleCrawl(){
    if(!url) return alert('Nhập URL');
    const res = await crawlURL(url);
    if(res?.title) {
      setTitle(res.title || '');
      setSummary(res.summary || '');
      setContent(res.content || '');
      setImg(res.img || '');
      alert('Đã lấy nội dung thô. Bạn có thể tóm tắt bằng Gemini hoặc chỉnh tay.');
    } else {
      alert('Không lấy được nội dung: ' + (res?.error || ''));
    }
  }

  async function handleSummarize(){
    const text = content || summary || title;
    if(!text) return alert('Không có nội dung để tóm tắt');
    const res = await summarizeWithGemini(text);
    if(res?.summary) {
      setSummary(res.summary);
      if(!title && res.title) setTitle(res.title);
      if(res.img) setImg(res.img);
      alert('Tóm tắt hoàn tất.');
    } else {
      alert('AI trả về lỗi: ' + JSON.stringify(res));
    }
  }

  async function uploadFile(){
    if(!file) return alert('Chọn file');
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if(error) return alert('Upload lỗi: '+error.message);
    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    setImg(data.publicUrl);
    alert('Upload thành công');
  }

  async function createArticle(){
    if(!title) return alert('Thiếu tiêu đề');
    const payload = { title, summary, content, img, hashtags, author };
    const r = await apiArticles('create', payload);
    if(r?.error) alert('Lỗi: '+r.error);
    else { alert('Tạo xong'); setTimeout(load,500); }
  }

  async function deleteArticle(id){
    if(!confirm('Xác nhận xóa bài?')) return;
    const r = await apiArticles('delete', {id});
    if(r?.error) alert('Lỗi: '+r.error);
    else { alert('Đã xóa'); setTimeout(load,500); }
  }

  async function editArticle(){
    if(!selected) return alert('Chọn bài để sửa');
    const payload = { id: selected.id, title, summary, content, img, hashtags, author };
    const r = await apiArticles('update', payload);
    if(r?.error) alert('Lỗi: '+r.error);
    else { alert('Đã cập nhật'); setTimeout(load,500); }
  }

  function pickArticle(a){
    setSelected(a);
    setTitle(a.title); setSummary(a.summary || ''); setContent(a.content || ''); setImg(a.img||''); setHashtags(a.hashtags||''); setAuthor(a.author||'Nhutcoder');
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="logo" className="w-12 h-12 rounded-full"/>
          <h1 className="text-xl font-bold">Nhutcoder - Admin</h1>
        </div>
        {!logged ? (
          <div className="flex gap-2">
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Mật khẩu admin" className="border p-2 rounded"/>
            <button onClick={login} className="bg-blue-600 text-white px-3 py-2 rounded">Đăng nhập</button>
          </div>
        ) : <div className="text-sm text-green-600">Đã đăng nhập</div>}
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white p-4 rounded shadow">
            <label className="text-sm font-medium">URL để crawl</label>
            <div className="flex gap-2 mt-2">
              <input className="border p-2 flex-1 rounded" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..."/>
              <button onClick={handleCrawl} className="bg-indigo-600 text-white px-3 py-2 rounded">Crawl</button>
              <button onClick={handleSummarize} className="bg-purple-600 text-white px-3 py-2 rounded">Tóm tắt AI</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow space-y-2">
            <input className="border p-2 w-full rounded" placeholder="Tiêu đề" value={title} onChange={e=>setTitle(e.target.value)}/>
            <textarea className="border p-2 w-full rounded" rows="4" placeholder="Tóm tắt" value={summary} onChange={e=>setSummary(e.target.value)}></textarea>
            <textarea className="border p-2 w-full rounded" rows="6" placeholder="Nội dung (tùy chọn)" value={content} onChange={e=>setContent(e.target.value)}></textarea>

            <div className="flex gap-2">
              <input type="file" onChange={e=>setFile(e.target.files[0])}/>
              <button onClick={uploadFile} className="bg-blue-500 text-white px-3 py-1 rounded">Upload</button>
              <input className="border p-2 flex-1 rounded" placeholder="Hoặc dán link ảnh" value={img} onChange={e=>setImg(e.target.value)}/>
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <input className="border p-2 rounded" placeholder="Hashtags (ai,robot)" value={hashtags} onChange={e=>setHashtags(e.target.value)}/>
              <input className="border p-2 rounded" placeholder="Author" value={author} onChange={e=>setAuthor(e.target.value)}/>
            </div>

            <div className="flex gap-2">
              <button onClick={createArticle} className="bg-green-600 text-white px-3 py-2 rounded">Tạo mới</button>
              <button onClick={editArticle} className="bg-yellow-500 px-3 py-2 rounded">Cập nhật</button>
              <button onClick={()=>{ setTitle(''); setSummary(''); setContent(''); setImg(''); setHashtags(''); setAuthor('Nhutcoder'); setSelected(null); }} className="bg-gray-200 px-3 py-2 rounded">Reset</button>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Danh sách bài</h3>
            <div className="max-h-[60vh] overflow-auto space-y-2">
              {list.map(a => (
                <div key={a.id} className="flex items-start justify-between gap-2 border-b pb-2">
                  <div>
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="text-xs text-gray-500">{a.author} • {new Date(a.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={()=>pickArticle(a)} className="text-xs bg-blue-100 px-2 rounded">Edit</button>
                    <button onClick={()=>deleteArticle(a.id)} className="text-xs bg-red-100 px-2 rounded">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

ReactDOM.render(<Admin />, document.getElementById('root'));
