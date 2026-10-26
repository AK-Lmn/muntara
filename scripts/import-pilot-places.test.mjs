import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { test } from 'node:test'
import { createClient } from '@supabase/supabase-js'
import { importPlaces, validatePlaces } from './import-pilot-places.mjs'

function place() {
  return {
    sourceKey: 'test-health-center', name: 'Test Health Center', category: 'health',
    barangay: 'Tunasan', address: null, location: null, description: '', services: [],
    publicPhone: null, publicEmail: null,
    access: { entranceNotes: '', wheelchairAccess: 'unknown', parkingNotes: null, hoursNote: null, additionalNotes: null },
    sources: ['name', 'category', 'barangay'].map((fieldKey) => ({
      fieldKey, sourceName: 'Official test directory', sourceUrl: 'https://example.gov.ph/facility',
      sourceType: 'official', checkedAt: '2026-10-27',
    })),
  }
}

test('accepts a sourced pilot record with explicit unknown facts', () => {
  assert.deepEqual(validatePlaces([place()]), [place()])
})

test('rejects barangays and categories outside the pilot contract', () => {
  for (const [field, value] of [['barangay', 'Alabang'], ['category', 'food']]) {
    assert.throws(() => validatePlaces([{ ...place(), [field]: value }]), new RegExp(field))
  }
})

test('rejects duplicate stable place keys before importing', () => {
  assert.throws(() => validatePlaces([place(), place()]), /duplicate.*sourceKey/i)
})

test('rejects malformed, non-finite, and out-of-range coordinates', () => {
  for (const location of [{ lat: 91, lng: 121 }, { lat: 14, lng: -181 }, { lat: NaN, lng: 121 }, { lat: 14 }, { lat: '14', lng: 121 }]) {
    assert.throws(() => validatePlaces([{ ...place(), location }]), /location/)
  }
})

test('requires evidence for each claimed public fact including access and services', () => {
  for (const update of [{ publicPhone: '02 8000 0000' }, { services: ['Vaccination'] }, { location: { lat: 14.38, lng: 121.05 } }, { access: { ...place().access, hoursNote: 'Weekdays' } }]) {
    assert.throws(() => validatePlaces([{ ...place(), ...update }]), /evidence/i)
  }
})

test('rejects OSM evidence for service claims and malformed source metadata', () => {
  const osm = place()
  osm.sources[0].sourceType = 'openstreetmap'
  assert.throws(() => validatePlaces([osm]), /openstreetmap.*location/i)
  for (const update of [{ checkedAt: 'yesterday' }, { checkedAt: '2026-02-30' }, { sourceUrl: 'javascript:alert(1)' }, { fieldKey: 'verification' }]) {
    const record = place()
    Object.assign(record.sources[0], update)
    assert.throws(() => validatePlaces([record]), /sources/)
  }
})

test('rejects missing fields, malformed access, and duplicate source identities', () => {
  const missing = place()
  delete missing.publicEmail
  assert.throws(() => validatePlaces([missing]), /publicEmail/)
  assert.throws(() => validatePlaces([{ ...place(), access: null }]), /access/)
  const duplicate = place()
  duplicate.sources.push({ ...duplicate.sources[0], checkedAt: '2026-10-26' })
  assert.throws(() => validatePlaces([duplicate]), /duplicate.*source/i)
})

async function database(t, { failSources = false } = {}) {
  const state = { requests: [], places: new Map(), sources: new Map() }
  const server = createServer(async (request, response) => {
    let body = ''
    for await (const chunk of request) body += chunk
    const rows = JSON.parse(body || 'null')
    const url = new URL(request.url, 'http://localhost')
    state.requests.push({ method: request.method, url, rows })
    response.setHeader('Content-Type', 'application/json')
    if (url.pathname === '/rest/v1/places' && request.method === 'GET') {
      response.end(JSON.stringify([...state.places.values()].map(({ source_key, verification_state }) => ({ source_key, verification_state }))))
    } else if (url.pathname === '/rest/v1/places' && request.method === 'POST') {
      assert.equal(url.searchParams.get('on_conflict'), 'source_key')
      const saved = rows.map((row) => {
        const old = state.places.get(row.source_key)
        const id = old?.id ?? `00000000-0000-4000-8000-${String(state.places.size + 1).padStart(12, '0')}`
        state.places.set(row.source_key, { verification_state: 'awaiting_review', ...old, ...row, id })
        return { id, source_key: row.source_key }
      })
      response.end(JSON.stringify(saved))
    } else if (url.pathname === '/rest/v1/place_sources' && request.method === 'POST') {
      assert.equal(url.searchParams.get('on_conflict'), 'id')
      if (failSources) {
        response.statusCode = 400
        response.end(JSON.stringify({ code: 'XX000', message: 'Secret test-secret must not reach logs', details: null, hint: null }))
        return
      }
      for (const row of rows) state.sources.set(row.id, row)
      response.end('[]')
    } else if (url.pathname === '/rest/v1/places' && request.method === 'PATCH') {
      const ids = new Set(url.searchParams.get('id').slice(4, -1).split(','))
      for (const row of state.places.values()) if (ids.has(row.id)) Object.assign(row, rows)
      response.end('[]')
    } else {
      response.statusCode = 404
      response.end(JSON.stringify({ message: 'Unexpected database request' }))
    }
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise((resolve) => server.close(resolve)))
  const client = createClient(`http://127.0.0.1:${server.address().port}`, 'test-secret', { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  return { state, client }
}

test('validates every record before the first database request', async (t) => {
  const { state, client } = await database(t)
  await assert.rejects(importPlaces([place(), { ...place(), sourceKey: 'second', barangay: 'Alabang' }], client), /barangay/)
  assert.equal(state.requests.length, 0)
})

test('repeated imports keep place/source IDs stable and publish only after evidence is written', async (t) => {
  const { state, client } = await database(t)
  assert.deepEqual(await importPlaces([place()], client), { places: 1, sources: 3 })
  const firstSourceIds = [...state.sources.keys()]
  const firstPlaceId = state.places.get('test-health-center').id
  const updated = place()
  updated.sources.forEach((source) => { source.checkedAt = '2026-10-28' })
  await importPlaces([updated], client)
  assert.equal(state.places.size, 1)
  assert.equal(state.sources.size, 3)
  assert.equal(state.places.get('test-health-center').id, firstPlaceId)
  assert.deepEqual([...state.sources.keys()], firstSourceIds)
  assert.equal(state.places.get('test-health-center').publication_state, 'published')
  assert.equal(state.places.get('test-health-center').verification_state, 'awaiting_review')
  assert.equal(state.requests[1].rows[0].publication_state, 'draft')
  assert.equal(state.requests[2].url.pathname, '/rest/v1/place_sources')
  assert.equal(state.requests[3].rows.publication_state, 'published')
  assert.equal(state.sources.values().next().value.checked_at, '2026-10-28')
})

test('failed source writes leave places unpublished and redact database error details', async (t) => {
  const { state, client } = await database(t, { failSources: true })
  await assert.rejects(importPlaces([place()], client), (error) => {
    assert.match(error.message, /sources/i)
    assert.doesNotMatch(error.message, /test-secret/)
    return true
  })
  assert.equal(state.places.get('test-health-center').publication_state, 'draft')
  assert.equal(state.requests.length, 3)
})

test('the reviewed pilot JSON satisfies the same validator used before import', async () => {
  const records = JSON.parse(await readFile(new URL('../data/pilot-places.json', import.meta.url), 'utf8'))
  assert.ok(validatePlaces(records).length > 0)
})

test('refuses to overwrite places after moderation or a field check', async (t) => {
  const { state, client } = await database(t)
  await importPlaces([place()], client)
  state.places.get('test-health-center').verification_state = 'verified'
  const requestsBefore = state.requests.length
  const changed = place()
  changed.name = 'Changed name'
  await assert.rejects(importPlaces([changed], client), /moderated|field.check/i)
  assert.equal(state.places.get('test-health-center').name, 'Test Health Center')
  assert.equal(state.requests.slice(requestsBefore).filter((request) => request.method !== 'GET').length, 0)
})
