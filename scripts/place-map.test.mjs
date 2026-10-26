import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

let vite
let PlaceMap
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  ;({ PlaceMap } = await vite.ssrLoadModule('/src/components/map/PlaceMap.tsx'))
})
after(async () => { await vite?.close() })

const places = [
  { id: 'muntinlupa-es', name: 'Muntinlupa Elementary School', location: { lat: 14.3891958, lng: 121.0442405 } },
  { id: 'tunasan-es', name: 'Tunasan Elementary School', location: { lat: 14.3811, lng: 121.0516 } },
  { id: 'no-coordinate', name: 'Barangay office', location: null },
]

test('unknown coordinates show an honest fallback without a map surface', () => {
  const markup = renderToStaticMarkup(createElement(PlaceMap, { places: [places[2]] }))
  assert.match(markup, /Map location not confirmed/)
  assert.doesNotMatch(markup, /data-map-surface/)
  assert.match(markup, /https:\/\/www.openstreetmap.org\/fixthemap/)
})

test('mapped listings retain a visible notice for records missing coordinates', () => {
  const markup = renderToStaticMarkup(createElement(PlaceMap, { places }))
  assert.match(markup, /data-map-surface/)
  assert.match(markup, /role="region"/)
  assert.match(markup, /2 mapped listings/)
  assert.match(markup, /1 listing without confirmed coordinates/)
  assert.match(markup, /Report a map issue/)
})
