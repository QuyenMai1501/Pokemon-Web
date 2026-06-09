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
        alert("Đăng ký thành công!");
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
          {/* Các field username, email, name, password, confirmPassword giống trước */}
          {/* ... (giữ nguyên code field cũ, chỉ thêm error hiển thị) */}

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