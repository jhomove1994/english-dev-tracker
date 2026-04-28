import { NextRequest, NextResponse } from 'next/server'
import { PERSISTENT_STORAGE_KEYS } from '@/lib/persistence'
import { getDatabasePath, getStorageEntries, setStorageEntries } from '@/lib/server/sqlite'

export const runtime = 'nodejs'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function sanitizeKeys(keys: string[]) {
  const allowedKeys = new Set(PERSISTENT_STORAGE_KEYS)
  return keys.filter((key) => allowedKeys.has(key as (typeof PERSISTENT_STORAGE_KEYS)[number]))
}

export async function GET(request: NextRequest) {
  const rawKeys = request.nextUrl.searchParams.get('keys')
  const requestedKeys = rawKeys ? rawKeys.split(',').map((key) => key.trim()).filter(Boolean) : PERSISTENT_STORAGE_KEYS
  const keys = sanitizeKeys(requestedKeys)
  const entries = getStorageEntries(keys)

  return NextResponse.json({
    entries,
    keys: Object.keys(entries),
    databasePath: getDatabasePath(),
  })
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as unknown

  if (!isRecord(body) || !isRecord(body.entries)) {
    return NextResponse.json({ error: 'Invalid storage payload.' }, { status: 400 })
  }

  const entries = Object.entries(body.entries)
    .filter(([key]) => sanitizeKeys([key]).length > 0)
    .map(([key, value]) => ({ key, value }))

  if (entries.length === 0) {
    return NextResponse.json({ error: 'No valid storage entries were provided.' }, { status: 400 })
  }

  setStorageEntries(entries)

  return NextResponse.json({ ok: true, savedKeys: entries.map((entry) => entry.key) })
}
