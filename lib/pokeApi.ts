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
    moves: Array<{ move: { name: string; url: string }; version_group_details: any[] }>;
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

export async function getPokemonMoves(id: string) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
        next: { revalidate: 3600 }
    });
    const data = await res.json();
    return data.moves;
}

export async function getMoveDetail(moveUrl: string) {
    try {
        const res = await fetch(moveUrl, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null
    }
}

export async function getTypeDeffense(types: string[]) {
    const damageRelattions: any = {};

    for (const typeName of types) {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`, {
            next: { revalidate: 3600 }
        });
        const data = await res.json();

        damageRelattions[typeName] = {
            doubleDamgeFrom: data.damage_relations.double_damage_from.map((t: any) => t.name),
            halfDamageFrom: data.damage_relations.half_damage_from.map((t: any) => t.name),
            noDamageFrom: data.damage_relations.no_damage_from.map((t: any) => t.name),
        };
    }

    return damageRelattions;
}