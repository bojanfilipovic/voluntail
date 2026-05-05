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
  createdAt: over.createdAt ?? '2026-05-01T00:00:00Z',
  heartCount: over.heartCount ?? 0,
})

describe('buildDeck', () => {
  it('returns empty for empty input', () => {
    expect(
      buildDeck([], {
        shortlistIds: [],
        passedIds: [],
        sessionYesNotMatchIds: [],
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
      }).map((x) => x.id),
    ).toEqual(['2'])
  })

  it('excludes unpublished rows', () => {
    const a = [
      sample({ id: '1', published: true }),
      sample({ id: '2', published: false }),
    ]
    expect(
      buildDeck(a, {
        shortlistIds: [],
        passedIds: [],
        sessionYesNotMatchIds: [],
      }).map((x) => x.id),
    ).toEqual(['1'])
  })

  it('includes all species (no species filter)', () => {
    const a = [
      sample({ id: '1', species: 'cat' }),
      sample({ id: '2', species: 'dog' }),
    ]
    expect(
      buildDeck(a, {
        shortlistIds: [],
        passedIds: [],
        sessionYesNotMatchIds: [],
      }).map((x) => x.id),
    ).toEqual(['1', '2'])
  })
})
