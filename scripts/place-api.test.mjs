import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer as createHttpServer } from 'node:http'
import { createServer as createViteServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const id = '830cffbf-3384-4d78-912b-a7c0630210ee'
const row = {
  id, name: 'Public library', category: 'government', barangay: 'Poblacion',
  address: null, latitude: null, longitude: null, description: '', services: ['Reading services'],
  public_phone: '8800-8187', public_email: null, entrance_notes: '', wheelchair_access: 'unknown',
  parking_notes: null, hours_note: 'Monday to Friday', additional_notes: null,
  nearby_landmarks: [], tags: [], alternate_names: ['City library'],
  verification_state: 'awaiting_review', last_checked_at: null, verification_method: null,
  checked_by: null, corroborations: 0, photo_placeholder_count: 0,
  place_sources: [{ id: 'source-1', field_key: 'publicPhone', source_name: 'Official office directory',
    source_url: 'https://example.gov.ph/library', source_type: 'official', checked_at: '2026-10-27T00:00:00Z' }],
}
let api
let vite
let http
let response = { body: [], status: 200 }
const requests = []

before(async () => {
  http = createHttpServer((request, reply) => {
    requests.push(new URL(request.url, 'http://localhost'))
    reply.writeHead(response.status, { 'content-type': 'application/json' })
    reply.end(JSON.stringify(response.body))
  })
  await new Promise((resolve) => http.listen(0, '127.0.0.1', resolve))
  process.env.VITE_SUPABASE_URL = `http://127.0.0.1:${http.address().port}`
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test-only'
  vite = await createViteServer({ server: { middlewareMode: true }, appType: 'custom' })
  api = await vite.ssrLoadModule('/src/lib/placeApi.ts')
})
after(async () => {
  await vite?.close()
  if (http) await new Promise((resolve) => http.close(resolve))
  delete process.env.VITE_SUPABASE_URL
  delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY
})

test('published directory reads retain unknowns and map field evidence into Place', async () => {
  response = { body: [row], status: 200 }
  const [place] = await api.fetchPlaces()
  assert.equal(place.address, null)
  assert.equal(place.location, null)
  assert.equal(place.publicPhone, '8800-8187')
  assert.equal(place.access.hoursNote, 'Monday to Friday')
  assert.deepEqual(place.services, ['Reading services'])
  assert.deepEqual(place.alternateNames, ['City library'])
  assert.equal(place.verification.lastCheckedAt, null)
  assert.deepEqual(place.sources, [{ id: 'source-1', fieldKey: 'publicPhone', sourceName: 'Official office directory',
    sourceUrl: 'https://example.gov.ph/library', sourceType: 'official', checkedAt: '2026-10-27T00:00:00Z' }])
  const request = requests.at(-1)
  assert.equal(request.pathname, '/rest/v1/places')
  assert.equal(request.searchParams.get('publication_state'), 'eq.published')
  assert.match(request.searchParams.get('select'), /place_sources\(/)
  assert.equal(request.searchParams.get('order'), 'name.asc')
})

test('detail reads constrain the id and map actual coordinates', async () => {
  response = { body: [{ ...row, latitude: 14.3891958, longitude: 121.0442405 }], status: 200 }
  const place = await api.fetchPlaceById(id)
  assert.deepEqual(place.location, { lat: 14.3891958, lng: 121.0442405 })
  assert.equal(requests.at(-1).searchParams.get('id'), `eq.${id}`)
  assert.equal(requests.at(-1).searchParams.get('publication_state'), 'eq.published')
})

test('missing published place returns null', async () => {
  response = { body: [], status: 200 }
  assert.equal(await api.fetchPlaceById(id), null)
})

test('failed reads reject instead of becoming an empty directory', async () => {
  response = { body: { message: 'private backend detail', code: '42501' }, status: 403 }
  await assert.rejects(api.fetchPlaces(), (error) => error instanceof Error && !error.message.includes('private backend detail'))
  await assert.rejects(api.fetchPlaceById(id), (error) => error instanceof Error && !error.message.includes('private backend detail'))
})

test('official evidence never becomes an in-person visit in freshness details', async () => {
  const { FreshnessNote } = await vite.ssrLoadModule('/src/components/verification/FreshnessNote.tsx')
  const markup = renderToStaticMarkup(createElement(FreshnessNote, {
    verification: { state: 'verified', lastCheckedAt: '2026-10-27', method: 'Official directory', checkedBy: null, corroborations: 0 },
    sources: [{ id: 'evidence', fieldKey: 'publicPhone', sourceName: 'Official directory', sourceUrl: null, sourceType: 'official', checkedAt: '2026-10-27' }],
  }))
  assert.match(markup, /Official source checked/)
  assert.match(markup, /Visited in person:<\/span> Not confirmed/)
})

test('unknown access fields stay visible', async () => {
  const { AccessInfoPanel } = await vite.ssrLoadModule('/src/components/places/AccessInfoPanel.tsx')
  const markup = renderToStaticMarkup(createElement(AccessInfoPanel, { access: {
    entranceNotes: '', wheelchairAccess: 'unknown', parkingNotes: null, hoursNote: null, additionalNotes: null,
  } }))
  for (const field of ['Entrance', 'Wheelchair access', 'Parking', 'Opening hours']) {
    assert.ok(markup.includes(field), `${field} must stay visible`)
  }
  assert.equal((markup.match(/Not confirmed/g) ?? []).length, 5)
})

test('source panel identifies checked fields and rejects executable source links', async () => {
  const { PlaceSourcesPanel } = await vite.ssrLoadModule('/src/components/places/PlaceSourcesPanel.tsx')
  const markup = renderToStaticMarkup(createElement(PlaceSourcesPanel, { sources: [
    { id: 'safe', fieldKey: 'publicPhone', sourceName: 'Official office', sourceUrl: 'https://example.gov.ph/office', sourceType: 'official', checkedAt: '2026-10-27' },
    { id: 'unsafe', fieldKey: 'location', sourceName: 'Unsafe address', sourceUrl: 'javascript:alert(1)', sourceType: 'openstreetmap', checkedAt: '2026-10-27' },
  ] }))
  assert.match(markup, /Public phone/)
  assert.match(markup, /href="https:\/\/example.gov.ph\/office"/)
  assert.doesNotMatch(markup, /href="javascript:/)
  assert.match(markup, /OpenStreetMap/)
})
