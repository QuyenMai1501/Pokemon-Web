'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import styles from "./Navbar.module.css";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/pokedex", label: "Pokédex" },
  { href: "/items", label: "Vật phẩm" },
  { href: "/team-builder", label: "Xây Team" },
  { href: "/battle", label: "Đấu trường" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Pokémon Web
        </Link>

        <div className={styles.links}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? styles.linkActive : styles.link}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className={styles.actions}>
          {session?.user && (
            <>
              <span className={styles.userName}>
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className={styles.logoutBtn}
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
