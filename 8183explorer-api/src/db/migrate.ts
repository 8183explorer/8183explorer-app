import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pool } from './client.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8')

console.log('[migrate] Running schema migration...')
await pool.query(sql)
console.log('[migrate] Done.')
await pool.end()
