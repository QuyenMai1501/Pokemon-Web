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
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-bold text-red-500">Pokémon Web</h1>
            <p className="text-2xl mt-2">
              Chào mừng, Trainer{" "}
              <span className="font-semibold">{session.user.name}</span>!
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/pokedex"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
              Pokédex
            </Link>
            <Link
              href="/team-builder"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium">
              Xây Team
            </Link>
          </div>
        </header>

        {/* Nội dung dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-8 rounded-3xl">Team Builder</div>
          <div className="bg-gray-900 p-8 rounded-3xl">Battle Arena</div>
          <div className="bg-gray-900 p-8 rounded-3xl">Pokédex</div>
        </div>
      </div>
    </div>
  );
}
