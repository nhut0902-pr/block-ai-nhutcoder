import React, { useState } from "react";

export default function AdminPanel() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleFetch = async () => {
    const res = await fetch("/api/fetchAndSummarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (res.ok) {
      const data = await res.json();
      await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      setMessage("Đăng bài thành công!");
    } else {
      setMessage("Lấy bài thất bại!");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Đăng bài tự động</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Dán link bài viết"
        className="w-full border p-2 mb-4 rounded"
      />
      <button onClick={handleFetch} className="w-full bg-green-500 text-white p-2 rounded">
        Lấy & Đăng bài
      </button>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}
