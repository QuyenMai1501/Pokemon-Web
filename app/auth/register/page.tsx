'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

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
    <div className={styles.container}>
      <Image
        src="/background.jpg"
        alt=""
        fill
        style={{ objectFit: 'cover' }}
        priority
      />
      <div className={styles.overlay} />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.iconBox}>
            <span className={styles.icon}>⚡</span>
          </div>
          <h1 className={styles.title}>Pokémon Web</h1>
          <p className={styles.subtitle}>Tạo tài khoản Trainer</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={styles.input}
              placeholder="TrainerName"
            />
            {errors.username && <p className={styles.fieldError}>{errors.username}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={styles.input}
              placeholder="your@email.com"
            />
            {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tên hiển thị</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={styles.input}
              placeholder="(tuỳ chọn)"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Mật khẩu</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={styles.input}
              placeholder="••••••••"
            />
            {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Xác nhận mật khẩu</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={styles.input}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className={styles.fieldError}>{errors.confirmPassword}</p>}
          </div>

          {errors.general && <p className={styles.generalError}>{errors.general}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>
        </form>

        <div className={styles.footer}>
          <span className={styles.footerText}>Đã có tài khoản? </span>
          <Link href="/auth/signin" className={styles.footerLink}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
