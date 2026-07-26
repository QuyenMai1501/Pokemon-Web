'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "", email: "", name: "", password: "", confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) newErrors.username = "Username là bắt buộc";
    if (!formData.email) newErrors.email = "Email là bắt buộc";
    if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";
    else if (!PASSWORD_REGEX.test(formData.password)) {
      newErrors.password = "Mật khẩu phải ≥8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt (@$!%*?&)";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          name: formData.name,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error });
      } else {
        router.push("/auth/signin");
      }
    } catch {
      setErrors({ general: "Lỗi kết nối" });
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-gray-500 mt-1">Tạo tài khoản Trainer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder-gray-400 transition"
              placeholder="TrainerName"
            />
            {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder-gray-400 transition"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên hiển thị</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder-gray-400 transition"
              placeholder="(tuỳ chọn)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder-gray-400 transition"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder-gray-400 transition"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {errors.general && (
            <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
              {errors.general}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition disabled:opacity-50 shadow-lg shadow-red-600/25"
          >
            {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-500 text-sm">Đã có tài khoản? </span>
          <Link
            href="/auth/signin"
            className="text-red-600 hover:text-red-700 font-semibold text-sm transition"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
