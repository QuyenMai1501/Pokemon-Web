'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

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
          <p className={styles.subtitle}>Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className={styles.footer}>
          <span className={styles.footerText}>Chưa có tài khoản? </span>
          <Link href="/auth/register" className={styles.footerLink}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
