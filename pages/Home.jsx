import React, { useEffect, useState } from "react";
import ArticleList from "../components/ArticleList";

export default function Home() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch("/api/articles")
      .then(res => res.json())
      .then(data => setArticles(data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Nhutcoder - Công Nghệ</h1>
      <ArticleList articles={articles} />
    </div>
  );
}
