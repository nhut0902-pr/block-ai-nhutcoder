import React, { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      window.location.href = "/admin";
    } else {
      setMessage("Sai mật khẩu hoặc lỗi hệ thống!");
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-20 p-4 shadow rounded bg-white">
      <h2 className="text-xl font-bold mb-4">Đăng nhập Admin</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        placeholder="Nhập mật khẩu"
      />
      <button className="w-full bg-blue-500 text-white p-2 rounded">Đăng nhập</button>
      {message && <p className="text-red-600 mt-2">{message}</p>}
    </form>
  );
}
