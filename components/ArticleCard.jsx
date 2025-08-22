import React from "react";
import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  return (
    <div className="border rounded-lg shadow p-4 mb-4">
      {article.img && <img src={article.img} alt={article.title} className="w-full h-48 object-cover rounded" />}
      <h2 className="text-xl font-bold mt-2">{article.title}</h2>
      <p className="text-gray-600 mt-1">{article.summary}</p>
      <Link to={`/article/${article.id}`} className="text-blue-600 mt-2 inline-block">
        Xem chi tiết
      </Link>
    </div>
  );
}
