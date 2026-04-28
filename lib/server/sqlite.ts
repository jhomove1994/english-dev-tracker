import 'server-only'

import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

const DATABASE_DIRECTORY = path.join(process.cwd(), 'data')
const DATABASE_PATH = path.join(DATABASE_DIRECTORY, 'english-dev-tracker.sqlite')

fs.mkdirSync(DATABASE_DIRECTORY, { recursive: true })

const database = new Database(DATABASE_PATH)

database.pragma('journal_mode = WAL')
database.exec(`
  CREATE TABLE IF NOT EXISTS app_storage (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

interface StorageRow {
  key: string
  value: string
}

const getStorageRowStatement = database.prepare<[string], StorageRow | undefined>(
  'SELECT key, value FROM app_storage WHERE key = ?'
)
const getStorageRowsStatement = database.prepare<string[], StorageRow>(
  `SELECT key, value FROM app_storage WHERE key IN (${new Array(32).fill('?').join(',')})`
)
const upsertStorageRowStatement = database.prepare(
  `
    INSERT INTO app_storage (key, value, updated_at)
    VALUES (@key, @value, @updatedAt)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `
)

interface StorageEntryInput {
  key: string
  value: unknown
}

function parseStorageRowValue(row: StorageRow) {
  return JSON.parse(row.value) as unknown
}

export function getStorageEntry(key: string) {
  const row = getStorageRowStatement.get(key)
  if (!row) return undefined
  return parseStorageRowValue(row)
}

export function getStorageEntries(keys: string[]) {
  if (keys.length === 0) {
    return {}
  }

  if (keys.length === 1) {
    const value = getStorageEntry(keys[0])
    return value === undefined ? {} : { [keys[0]]: value }
  }

  const paddedKeys = keys.concat(new Array(Math.max(0, 32 - keys.length)).fill('__missing__'))
  const rows = getStorageRowsStatement.all(...paddedKeys.slice(0, 32))

  return rows.reduce<Record<string, unknown>>((accumulator, row) => {
    accumulator[row.key] = parseStorageRowValue(row)
    return accumulator
  }, {})
}

export function setStorageEntries(entries: StorageEntryInput[]) {
  const now = new Date().toISOString()
  const transaction = database.transaction((records: StorageEntryInput[]) => {
    records.forEach((entry) => {
      upsertStorageRowStatement.run({
        key: entry.key,
        value: JSON.stringify(entry.value),
        updatedAt: now,
      })
    })
  })

  transaction(entries)
}

export function getDatabasePath() {
  return DATABASE_PATH
}
