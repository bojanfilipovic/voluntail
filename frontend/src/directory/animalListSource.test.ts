import { describe, expect, it } from 'vitest'
import type { Animal } from '@/api/animals'
import { animalsRowsForDirectoryList } from '@/directory/animalListSource'

const sample = (overrides: Partial<Animal>): Animal => ({
  id: 'a1',
  shelterId: 's1',
  city: 'Amsterdam',
  name: 'X',
  description: '',
  species: 'dog',
  status: 'available',
  published: true,
  imageUrls: [],
  imageUrl: null,
  externalUrl: null,
  createdAt: '2026-01-01T00:00:00Z',
  heartCount: 0,
  ...overrides,
})

describe('animalsRowsForDirectoryList', () => {
  it('returns scoped animals when not favorites/matches only', () => {
    const scoped = [sample({ id: '1' })]
    expect(
      animalsRowsForDirectoryList({
        favoritesOrMatchesOnly: false,
        scopedAnimals: scoped,
        unscopedAnimals: [sample({ id: '2' })],
        speciesFilter: null,
      }),
    ).toEqual(scoped)
  })

  it('uses unscoped rows filtered by species when favorites/matches only', () => {
    const unscopedRows = [sample({ id: '1', species: 'dog' }), sample({ id: '2', species: 'cat' })]
    expect(
      animalsRowsForDirectoryList({
        favoritesOrMatchesOnly: true,
        scopedAnimals: [sample({ id: '1' })],
        unscopedAnimals: unscopedRows,
        speciesFilter: 'cat',
      }),
    ).toEqual([sample({ id: '2', species: 'cat' })])
  })

  it('returns undefined while unscoped data not yet available', () => {
    expect(
      animalsRowsForDirectoryList({
        favoritesOrMatchesOnly: true,
        scopedAnimals: [],
        unscopedAnimals: undefined,
        speciesFilter: null,
      }),
    ).toBeUndefined()
  })
})
