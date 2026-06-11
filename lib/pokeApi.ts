const BASE_URL = 'https://pokeapi.co/api/v2';

export interface Pokemon {
    id: number;
    name: string;
    sprites: {
        front_default: string;
        other: {
            'official-artwork': { front_default: string };
        };
    };
    types: Array<{ type: { name: string } }>;
    stats: Array<{ base_stat: number; stat: { name: string } }>;
    height: number;
    weight: number;
    abilities: Array<{ ability: { name: string } }>
}

export async function getPokemonList(limit = 151, offset = 0) {
    const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    return res.json();
}

export async function getPokemonDetail(nameOrId: string | number): Promise<Pokemon> {
    const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`, {
        next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Pokemon không tồn tại');
    return res.json();
}

export async function getPokemonSpecies(nameOrId: string | number) {
    const res = await fetch(`${BASE_URL}/pokemon-species/${nameOrId}`);
    return res.json();
}

export async function getEvolutionChain(chainUrl: string) {
    const res = await fetch(chainUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
}