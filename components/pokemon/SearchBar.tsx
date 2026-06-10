'use client';

interface Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function SearchBar({ searchTerm, setSearchTerm }: Props) {
  return (
    <div className="max-w-md mx-auto mb-10">
      <input
        type="text"
        placeholder="Tìm Pokémon (ví dụ: pikachu, charizard...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-6 py-4 bg-gray-900 border border-gray-700 rounded-full text-lg focus:outline-none focus:border-red-500 placeholder-gray-500"
      />
    </div>
  );
}