import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    fetch(`/api/articles?id=eq.${id}`)
      .then(res => res.json())
      .then(data => setArticle(data[0]));
  }, [id]);

  if (!article) return <p className="p-4">Đang tải bài viết...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      {article.img && <img src={article.img} alt={article.title} className="w-full h-96 object-cover rounded mb-4" />}
      <p className="whitespace-pre-line">{article.content}</p>
    </div>
  );
}
