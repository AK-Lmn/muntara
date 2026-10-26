import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { createClient } from '@supabase/supabase-js'

const placeFields = ['sourceKey', 'name', 'category', 'barangay', 'address', 'location', 'description', 'services', 'publicPhone', 'publicEmail', 'access', 'sources']
const accessFields = ['entranceNotes', 'wheelchairAccess', 'parkingNotes', 'hoursNote', 'additionalNotes']
const sourceFields = ['fieldKey', 'sourceName', 'sourceUrl', 'sourceType', 'checkedAt']

function fail(path, message) {
  throw new Error(`${path}: ${message}`)
}

function object(value, path, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path, 'expected an object')
  for (const field of fields) if (!Object.hasOwn(value, field)) fail(`${path}.${field}`, 'required')
  for (const field of Object.keys(value)) if (!fields.includes(field)) fail(path, 'contains an unsupported field')
}

function string(value, path, { nullable = false, empty = false } = {}) {
  if (nullable && value === null) return
  if (typeof value !== 'string' || (!empty && !value.trim())) fail(path, 'expected a non-empty string')
}

function sourceIdentity(sourceKey, source) {
  return JSON.stringify([sourceKey, source.fieldKey, source.sourceType, source.sourceUrl, source.sourceName])
}

export function validatePlaces(records) {
  if (!Array.isArray(records) || records.length === 0) fail('inventory', 'expected a non-empty array')
  const keys = new Set()
  for (const [index, record] of records.entries()) {
    const path = `places[${index}]`
    object(record, path, placeFields)
    string(record.sourceKey, `${path}.sourceKey`)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.sourceKey)) fail(`${path}.sourceKey`, 'use a stable lowercase slug')
    if (keys.has(record.sourceKey)) fail(path, 'duplicate sourceKey')
    keys.add(record.sourceKey)
    string(record.name, `${path}.name`)
    if (!['government', 'health', 'education'].includes(record.category)) fail(`${path}.category`, 'unsupported pilot category')
    if (!['Tunasan', 'Poblacion'].includes(record.barangay)) fail(`${path}.barangay`, 'outside the pilot')
    string(record.address, `${path}.address`, { nullable: true })
    string(record.description, `${path}.description`, { empty: true })
    string(record.publicPhone, `${path}.publicPhone`, { nullable: true })
    string(record.publicEmail, `${path}.publicEmail`, { nullable: true })
    if (record.publicEmail !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.publicEmail)) fail(`${path}.publicEmail`, 'invalid email address')
    if (!Array.isArray(record.services)) fail(`${path}.services`, 'expected an array')
    record.services.forEach((value) => string(value, `${path}.services`))
    if (record.location !== null) {
      object(record.location, `${path}.location`, ['lat', 'lng'])
      const { lat, lng } = record.location
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) fail(`${path}.location`, 'invalid coordinates')
    }
    object(record.access, `${path}.access`, accessFields)
    string(record.access.entranceNotes, `${path}.access.entranceNotes`, { empty: true })
    if (!['yes', 'no', 'partial', 'unknown'].includes(record.access.wheelchairAccess)) fail(`${path}.access.wheelchairAccess`, 'invalid access state')
    for (const field of ['parkingNotes', 'hoursNote', 'additionalNotes']) string(record.access[field], `${path}.access.${field}`, { nullable: true })

    const facts = {
      name: record.name, category: record.category, barangay: record.barangay,
      address: record.address, location: record.location, description: record.description,
      services: record.services, publicPhone: record.publicPhone, publicEmail: record.publicEmail,
      ...Object.fromEntries(accessFields.map((field) => [`access.${field}`, record.access[field]])),
    }
    if (!Array.isArray(record.sources)) fail(`${path}.sources`, 'expected an array')
    const identities = new Set()
    for (const [sourceIndex, source] of record.sources.entries()) {
      const sourcePath = `${path}.sources[${sourceIndex}]`
      object(source, sourcePath, sourceFields)
      if (!Object.hasOwn(facts, source.fieldKey)) fail(sourcePath, 'unsupported fieldKey')
      string(source.sourceName, `${sourcePath}.sourceName`)
      if (!['official', 'field_visit', 'openstreetmap'].includes(source.sourceType)) fail(sourcePath, 'unsupported sourceType')
      if (source.sourceType === 'openstreetmap' && source.fieldKey !== 'location') fail(sourcePath, 'openstreetmap may support location only')
      if (source.sourceUrl === null && source.sourceType !== 'field_visit') fail(sourcePath, 'sourceUrl is required for a published source')
      if (source.sourceUrl !== null) {
        let url
        try { url = new URL(source.sourceUrl) } catch { fail(sourcePath, 'invalid sourceUrl') }
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) fail(sourcePath, 'invalid sourceUrl')
      }
      string(source.checkedAt, `${sourcePath}.checkedAt`)
      const checked = new Date(source.checkedAt)
      if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(source.checkedAt) || Number.isNaN(checked.getTime()) || checked.toISOString().slice(0, 10) !== source.checkedAt.slice(0, 10)) fail(sourcePath, 'invalid checkedAt date')
      const identity = sourceIdentity(record.sourceKey, source)
      if (identities.has(identity)) fail(sourcePath, 'duplicate source identity')
      identities.add(identity)
    }
    for (const [field, value] of Object.entries(facts)) {
      const unknown = value === null || value === '' || (Array.isArray(value) && value.length === 0) || (field === 'access.wheelchairAccess' && value === 'unknown')
      if (!unknown && !record.sources.some((source) => source.fieldKey === field)) fail(`${path}.${field}`, 'missing source evidence')
    }
  }
  return records
}

function sourceId(sourceKey, source) {
  // UUID v5 identity excludes checkedAt so rechecks update the existing evidence row.
  const namespace = Buffer.from('f29d7681d1f84fdb9e41d9901c02836a', 'hex')
  const bytes = createHash('sha1').update(namespace).update(sourceIdentity(sourceKey, source)).digest().subarray(0, 16)
  bytes[6] = (bytes[6] & 0x0f) | 0x50
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytes.toString('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

async function request(query, stage) {
  try {
    const { data, error } = await query
    if (error) throw error
    return data
  } catch {
    // Database messages may contain request details; keep privileged import failures generic.
    throw new Error(`Import failed during ${stage}. Check the database privately, then rerun the import.`)
  }
}

export async function importPlaces(records, client) {
  validatePlaces(records)
  const existing = await request(client.from('places').select('source_key,verification_state').in('source_key', records.map((record) => record.sourceKey)), 'preflight')
  if (existing?.some((record) => record.verification_state !== 'awaiting_review')) {
    throw new Error('Refusing to overwrite moderated or field-checked places. Review these records manually.')
  }
  const rows = records.map((record) => ({
    source_key: record.sourceKey, name: record.name, category: record.category,
    barangay: record.barangay, address: record.address,
    latitude: record.location?.lat ?? null, longitude: record.location?.lng ?? null,
    description: record.description, services: record.services,
    public_phone: record.publicPhone, public_email: record.publicEmail,
    entrance_notes: record.access.entranceNotes, wheelchair_access: record.access.wheelchairAccess,
    parking_notes: record.access.parkingNotes, hours_note: record.access.hoursNote,
    additional_notes: record.access.additionalNotes, publication_state: 'draft',
  }))
  const saved = await request(client.from('places').upsert(rows, { onConflict: 'source_key' }).select('id,source_key'), 'places')
  const ids = new Map(saved?.map((row) => [row.source_key, row.id]))
  if (records.some((record) => !ids.get(record.sourceKey))) throw new Error('Import did not receive every place ID; places remain unpublished.')
  const sources = records.flatMap((record) => record.sources.map((source) => ({
    id: sourceId(record.sourceKey, source), place_id: ids.get(record.sourceKey),
    field_key: source.fieldKey, source_name: source.sourceName, source_url: source.sourceUrl,
    source_type: source.sourceType, checked_at: source.checkedAt,
  })))
  await request(client.from('place_sources').upsert(sources, { onConflict: 'id' }), 'sources')
  await request(client.from('places').update({ publication_state: 'published' }).in('id', [...ids.values()]), 'publication')
  return { places: records.length, sources: sources.length }
}

async function main() {
  const { values } = parseArgs({ options: { input: { type: 'string', default: 'data/pilot-places.json' } } })
  let records
  try { records = JSON.parse(await readFile(values.input, 'utf8')) } catch { throw new Error('Could not read input JSON. Check --input and the file syntax.') }
  validatePlaces(records)
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in the local process environment.')
  let endpoint
  try { endpoint = new URL(url) } catch { throw new Error('SUPABASE_URL must be a valid project URL.') }
  if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password || (endpoint.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname))) throw new Error('SUPABASE_URL must use HTTPS, or HTTP on localhost.')
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const result = await importPlaces(records, client)
  console.log(`Imported ${result.places} places and ${result.sources} source rows. Coverage: pilot listings in progress.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
