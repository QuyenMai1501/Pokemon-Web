import { cache } from "react";

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
        next: { revalidate: 86400 }
    });
    if (!res.ok) throw new Error('Pokemon không tồn tại');
    return res.json();
}

export const getPokemonDetailCached = cache(getPokemonDetail);

export async function getPokemonSpecies(id: string | number) {
    const res = await fetch(`${BASE_URL}/pokemon-species/${id}`, {
        next: { revalidate: 3600 }
    });
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

export async function getTypeDefense(types: string[]) {
    const damageRelations: any = {};

    for (const typeName of types) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`, {
                next: { revalidate: 3600 }
            });
            if (!res.ok) continue;

            const data = await res.json();

            damageRelations[typeName] = {
                doubleDamageFrom: data.damage_relations.double_damage_from.map((t: any) => t.name),
                halfDamageFrom: data.damage_relations.half_damage_from.map((t: any) => t.name),
                noDamageFrom: data.damage_relations.no_damage_from.map((t: any) => t.name),
            };
        } catch (e) {
            console.error(`Failed to load type relations for ${typeName}`);
        }
    }

    return damageRelations;
}

export async function getAbilityDetail(abilityUrl: string) {
    const res = await fetch(abilityUrl, {next: {revalidate: 86400}});
    if (!res.ok) return null;
    return res.json();
}

export const getAbilityDetailCached = cache(getAbilityDetail);