// app/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-bold text-red-500">Pokémon Web</h1>
            <p className="text-2xl text-gray-400 mt-2">
              Chào mừng Trainer{" "}
              <span className="text-white">
                {session.user.name || session.user.image}
              </span>
              !
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/team-builder"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold">
              Xây Team
            </Link>
            <Link
              href="/pokedex"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold">
              Pokédex
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-semibold mb-4">Team Builder</h3>
            <p className="text-gray-400">
              Xây dựng đội hình 6 Pokémon mạnh nhất của bạn.
            </p>
          </div>
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-semibold mb-4">Chiến đấu</h3>
            <p className="text-gray-400">
              Thách đấu với Trainer khác theo thời gian thực.
            </p>
          </div>
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-semibold mb-4">Pokédex</h3>
            <p className="text-gray-400">Tra cứu thông tin hơn 1000 Pokémon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
