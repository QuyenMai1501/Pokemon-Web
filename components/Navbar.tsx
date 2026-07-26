'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/pokedex", label: "Pokédex" },
  { href: "/team-builder", label: "Xây Team" },
  { href: "/battle", label: "Đấu trường" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-red-500 tracking-tight">
          Pokémon Web
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "text-white font-semibold border-b-2 border-red-500 pb-0.5"
                    : "text-gray-400 hover:text-white transition-colors"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <span className="text-gray-300 text-sm hidden sm:inline">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
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
