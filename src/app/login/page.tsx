"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j?.error || "Login gagal");
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Masuk</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Masuk
          </button>
        </form>

        {/* <p className="text-sm text-center text-gray-600">
          Belum punya akun?{" "}
          <span
            className="text-blue-600 font-medium cursor-pointer hover:underline"
            onClick={() => router.push("/register")}
          >
            Daftar
          </span>
        </p> */}
      </div>
    </div>
  );
}
