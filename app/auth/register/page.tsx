// app/auth/register/page.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-500">Pokémon Web</h1>
          <p className="text-gray-400 mt-2">Tạo tài khoản Trainer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              placeholder="TrainerName"
            />
            {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tên hiển thị</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              placeholder="(tuỳ chọn)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {errors.general && <p className="text-red-500 text-center">{errors.general}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>
        </form>

        <div className="text-center mt-6">
          Đã có tài khoản? <Link href="/auth/signin" className="text-red-500 hover:underline">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}