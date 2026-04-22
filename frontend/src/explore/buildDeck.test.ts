import type { Animal } from '@/api/animals'
import { describe, expect, it } from 'vitest'
import { buildDeck } from '@/explore/buildDeck'

const sample = (over: Partial<Animal> & { id: string }): Animal => ({
  id: over.id,
  shelterId: over.shelterId ?? 's1',
  city: over.city ?? 'Amsterdam',
  name: over.name ?? 'Pet',
  description: over.description ?? 'Hi',
  species: over.species ?? 'dog',
  status: over.status ?? 'available',
  published: over.published ?? true,
  imageUrl: over.imageUrl ?? null,
  externalUrl: over.externalUrl ?? null,
})

describe('buildDeck', () => {
  it('returns empty for empty input', () => {
    expect(
      buildDeck([], {
        shortlistIds: [],
        passedIds: [],
        sessionYesNotMatchIds: [],
        speciesMode: 'all',
      }),
    ).toEqual([])
  })

  it('excludes shortlist and passed', () => {
    const a = [sample({ id: '1' }), sample({ id: '2' }), sample({ id: '3' })]
    expect(
      buildDeck(a, {
        shortlistIds: ['1'],
        passedIds: ['2'],
        sessionYesNotMatchIds: [],
        speciesMode: 'all',
      }).map((x) => x.id),
    ).toEqual(['3'])
  })

  it('excludes session yes-without-match ids', () => {
    const a = [sample({ id: '1' }), sample({ id: '2' })]
    expect(
      buildDeck(a, {
        shortlistIds: [],
        passedIds: [],
        sessionYesNotMatchIds: ['1'],
        speciesMode: 'all',
      }).map((x) => x.id),
    ).toEqual(['2'])
  })

  it('filters by species when not all', () => {
    const a = [
      sample({ id: '1', species: 'cat' }),
      sample({ id: '2', species: 'dog' }),
    ]
    expect(
      buildDeck(a, {
        shortlistIds: [],
        passedIds: [],
        sessionYesNotMatchIds: [],
        speciesMode: 'cat',
      }).map((x) => x.id),
    ).toEqual(['1'])
  })
})
