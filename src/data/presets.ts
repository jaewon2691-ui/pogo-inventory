import type { PokemonData } from '../types'

export interface Preset {
  id: string
  label: string
  data: PokemonData
}

export const presets: Preset[] = [
  {
    id: 'houndour',
    label: 'Houndour ★4',
    data: {
      name: 'Houndour', cp: 543, attackIv: 15, defenseIv: 15, hpIv: 15,
      shiny: false, shadow: false, purified: false, legendary: false,
      canMega: true, xxlOrXxs: false, legacyMove: false, purpose: 'raid',
    },
  },
  {
    id: 'gyarados',
    label: 'Gyarados ★4',
    data: {
      name: 'Gyarados', cp: 3281, attackIv: 15, defenseIv: 15, hpIv: 15,
      shiny: false, shadow: false, purified: false, legendary: false,
      canMega: true, xxlOrXxs: false, legacyMove: false, purpose: 'raid',
    },
  },
  {
    id: 'shadow-dialga',
    label: 'Shadow Dialga',
    data: {
      name: 'Dialga', cp: 2890, attackIv: 12, defenseIv: 10, hpIv: 13,
      shiny: false, shadow: true, purified: false, legendary: true,
      canMega: false, xxlOrXxs: false, legacyMove: false, purpose: 'raid',
    },
  },
  {
    id: 'dragonite',
    label: 'Dragonite',
    data: {
      name: 'Dragonite', cp: 2745, attackIv: 11, defenseIv: 9, hpIv: 12,
      shiny: false, shadow: false, purified: false, legendary: false,
      canMega: false, xxlOrXxs: false, legacyMove: true, purpose: 'unsure',
    },
  },
  {
    id: 'shiny-gastly',
    label: 'Shiny Gastly',
    data: {
      name: 'Gastly', cp: 412, attackIv: 6, defenseIv: 8, hpIv: 5,
      shiny: true, shadow: false, purified: false, legendary: false,
      canMega: true, xxlOrXxs: false, legacyMove: false, purpose: 'collection',
    },
  },
  {
    id: 'tapu-fini',
    label: 'Tapu Fini',
    data: {
      name: 'Tapu Fini', cp: 1730, attackIv: 5, defenseIv: 14, hpIv: 13,
      shiny: false, shadow: false, purified: false, legendary: true,
      canMega: false, xxlOrXxs: true, legacyMove: false, purpose: 'pvp',
    },
  },
]
