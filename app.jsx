import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import ArticleDetail from "./pages/ArticleDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
      </Routes>
    </Router>
  );
}
