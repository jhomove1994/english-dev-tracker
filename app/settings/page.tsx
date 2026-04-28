'use client'

import { useState, useRef } from 'react'
import { Download, Upload, Trash2, Check, AlertTriangle } from 'lucide-react'
import { PERSISTENT_STORAGE_KEYS } from '@/lib/persistence'
import { setLocalStorage } from '@/lib/utils'

type ExportStatus = 'idle' | 'loading' | 'done' | 'error'
type ImportStatus = 'idle' | 'loading' | 'done' | 'error'
type ClearStatus = 'idle' | 'confirm' | 'done'

export default function SettingsPage() {
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle')
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle')
  const [importMessage, setImportMessage] = useState('')
  const [clearStatus, setClearStatus] = useState<ClearStatus>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setExportStatus('loading')
    try {
      const keysParam = PERSISTENT_STORAGE_KEYS.join(',')
      const res = await fetch(`/api/storage?keys=${encodeURIComponent(keysParam)}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load data from server')
      const payload = await res.json() as { entries?: Record<string, unknown> }
      const entries = payload.entries ?? {}

      // Also include any keys that are only in localStorage
      const localEntries: Record<string, unknown> = {}
      for (const key of PERSISTENT_STORAGE_KEYS) {
        if (!(key in entries)) {
          try {
            const raw = window.localStorage.getItem(key)
            if (raw !== null) localEntries[key] = JSON.parse(raw) as unknown
          } catch {
            // ignore
          }
        }
      }

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: 1,
        entries: { ...localEntries, ...entries },
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `english-dev-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportStatus('done')
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch {
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus('loading')
    setImportMessage('')
    try {
      const text = await file.text()
      const data = JSON.parse(text) as { version?: number; entries?: Record<string, unknown>; exportedAt?: string }

      if (!data.entries || typeof data.entries !== 'object') {
        throw new Error('Invalid backup file: missing entries.')
      }

      // Validate keys
      const allowedKeys = new Set(PERSISTENT_STORAGE_KEYS as readonly string[])
      const validEntries = Object.entries(data.entries).filter(([k]) => allowedKeys.has(k))

      if (validEntries.length === 0) {
        throw new Error('No recognised storage keys found in the backup file.')
      }

      // Save to localStorage (and trigger SQLite sync via setLocalStorage)
      for (const [key, value] of validEntries) {
        setLocalStorage(key, value)
      }

      setImportMessage(`✅ Imported ${validEntries.length} storage keys from backup (${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : 'unknown date'}). Reloading…`)
      setImportStatus('done')
      setTimeout(() => { window.location.reload() }, 1500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setImportMessage(`❌ Import failed: ${msg}`)
      setImportStatus('error')
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClearData = () => {
    for (const key of PERSISTENT_STORAGE_KEYS) {
      try { window.localStorage.removeItem(key) } catch { /* ignore */ }
    }
    setClearStatus('done')
    setTimeout(() => {
      setClearStatus('idle')
      window.location.reload()
    }, 1500)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Settings & Data</h2>
        <p className="text-sm text-gray-400 mt-1">Manage your progress data. Export a backup or import from a previous backup file.</p>
      </div>

      {/* Export */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-white mb-1">Export Data</h3>
          <p className="text-sm text-gray-400">Download all your progress as a JSON file. Includes study sessions, flashcard states, milestones, errors, and more.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exportStatus === 'loading'}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50 ${
            exportStatus === 'done'
              ? 'border-green-500 bg-green-500/10 text-green-400'
              : exportStatus === 'error'
              ? 'border-red-500 bg-red-500/10 text-red-400'
              : 'border-[#2a2a2a] text-gray-300 hover:border-[#3a3a3a] hover:text-white'
          }`}
        >
          {exportStatus === 'done' ? (
            <><Check size={15} /> Downloaded!</>
          ) : exportStatus === 'error' ? (
            <><AlertTriangle size={15} /> Export failed — try again</>
          ) : exportStatus === 'loading' ? (
            <><Download size={15} className="animate-bounce" /> Preparing…</>
          ) : (
            <><Download size={15} /> Export backup (JSON)</>
          )}
        </button>
      </div>

      {/* Import */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-white mb-1">Import Data</h3>
          <p className="text-sm text-gray-400">Restore progress from a previously exported backup file. Existing data with the same keys will be overwritten.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFile}
          className="hidden"
          id="import-file"
        />
        <label
          htmlFor="import-file"
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors w-fit ${
            importStatus === 'loading'
              ? 'border-[#2a2a2a] text-gray-500 opacity-50 cursor-not-allowed'
              : 'border-[#2a2a2a] text-gray-300 hover:border-[#3a3a3a] hover:text-white'
          }`}
        >
          <Upload size={15} /> Choose backup file…
        </label>
        {importMessage && (
          <p className={`text-sm ${importStatus === 'done' ? 'text-green-400' : 'text-red-400'}`}>{importMessage}</p>
        )}
        <p className="text-xs text-gray-600">Accepted format: JSON file exported from this app.</p>
      </div>

      {/* Clear data */}
      <div className="bg-[#111111] border border-red-500/20 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-white mb-1">Clear All Data</h3>
          <p className="text-sm text-gray-400">Permanently delete all local progress data. This cannot be undone. Export a backup first if you want to keep your data.</p>
        </div>
        {clearStatus === 'idle' && (
          <button
            onClick={() => setClearStatus('confirm')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={15} /> Clear all data
          </button>
        )}
        {clearStatus === 'confirm' && (
          <div className="space-y-3">
            <p className="text-sm text-red-300 font-medium">⚠️ Are you sure? This will delete all your progress permanently.</p>
            <div className="flex gap-3">
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <Trash2 size={15} /> Yes, delete everything
              </button>
              <button
                onClick={() => setClearStatus('idle')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {clearStatus === 'done' && (
          <p className="text-sm text-green-400">✅ Data cleared. Reloading…</p>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 space-y-1">
        <p className="font-medium">💡 About your data</p>
        <p className="text-gray-400">All progress is stored locally in your browser (localStorage) and optionally synced to a local SQLite file (<code className="text-gray-300">data/english-dev-tracker.sqlite</code>) when running on your own machine. No data is sent to any cloud service.</p>
      </div>
    </div>
  )
}
