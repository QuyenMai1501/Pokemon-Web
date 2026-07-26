'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email hoặc mật khẩu không đúng");
    } else {
      router.push("/");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Image
        src="/background.jpg"
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Pokémon Web</h1>
          <p className="text-gray-500 mt-1">Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder-gray-400 transition"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder-gray-400 transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition disabled:opacity-50 shadow-lg shadow-red-600/25"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-500 text-sm">Chưa có tài khoản? </span>
          <Link
            href="/auth/register"
            className="text-red-600 hover:text-red-700 font-semibold text-sm transition"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
