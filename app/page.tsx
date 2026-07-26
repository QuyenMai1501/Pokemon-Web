// app/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="text-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        <header className="mb-12">
          <h1 className="text-5xl font-bold text-red-500 mb-2">Pokémon Web</h1>
          <p className="text-2xl text-gray-600">
            Chào mừng, Trainer{" "}
            <span className="font-semibold text-gray-900">{session.user.name}</span>!
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 text-gray-800 font-semibold">Team Builder</div>
          <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 text-gray-800 font-semibold">Battle Arena</div>
          <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 text-gray-800 font-semibold">Pokédex</div>
        </div>
      </div>
    </div>
  );
}
