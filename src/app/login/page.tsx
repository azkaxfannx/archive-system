"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setIsLoading(true);

    try {
      console.log("Attempting login..."); // Debug log

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookies
      });

      console.log("Login response status:", res.status); // Debug log

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Login failed:", errorData);
        setErr(errorData?.error || "Login gagal");
        return;
      }

      const data = await res.json();
      console.log("Login successful:", data); // Debug log

      // Add small delay to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify authentication before redirecting
      try {
        const authCheck = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Post-login auth check:", authCheck.status);

        if (authCheck.ok) {
          const authData = await authCheck.json();
          console.log("Auth verified:", authData);

          // Use replace instead of push to avoid back navigation to login
          router.replace("/");
        } else {
          throw new Error("Auth verification failed after login");
        }
      } catch (authError) {
        console.error("Auth verification failed:", authError);
        setErr("Login berhasil tapi verifikasi gagal. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErr("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
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
            required
            disabled={isLoading}
          />
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
