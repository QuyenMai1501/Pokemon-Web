// app/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="text-white">
      <div className="max-w-6xl mx-auto p-8">
        <header className="mb-12">
          <p className="text-2xl mt-2">
            Chào mừng, Trainer{" "}
            <span className="font-semibold">{session.user.name}</span>!
          </p>
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
