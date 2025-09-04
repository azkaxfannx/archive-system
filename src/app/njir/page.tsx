"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (role: "admin" | "user") => {
    setErr(null);

    const res = await fetch(`/api/auth/register/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, email, password }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j?.error || `Registrasi ${role} gagal`);
      return;
    }

    router.push("/login");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Daftar</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nama Lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
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

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleRegister("user")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Daftar User
            </button>
            <button
              type="button"
              onClick={() => handleRegister("admin")}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Daftar Admin
            </button>
          </div>
        </form>

        {/* <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{" "}
          <span
            className="text-blue-600 font-medium cursor-pointer hover:underline"
            onClick={() => router.push("/login")}
          >
            Masuk
          </span>
        </p> */}
      </div>
    </div>
  );
}
