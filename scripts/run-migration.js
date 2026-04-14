#!/usr/bin/env node

import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 检查环境变量
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in environment variables')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

async function runMigration(migrationFile) {
  try {
    console.log(`📦 Running migration: ${migrationFile}`)
    
    const migrationPath = join(__dirname, '..', 'db', 'migrations', migrationFile)
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    // 执行 migration
    await sql(migrationSQL)
    
    console.log(`✅ Migration ${migrationFile} completed successfully`)
  } catch (error) {
    console.error(`❌ Migration ${migrationFile} failed:`, error)
    throw error
  }
}

async function main() {
  // 获取要运行的 migration 文件
  const migrationFile = process.argv[2]
  
  if (!migrationFile) {
    console.error('❌ Please specify a migration file')
    console.log('Usage: node scripts/run-migration.js <migration-file>')
    console.log('Example: node scripts/run-migration.js 001_add_clerk_integration.sql')
    process.exit(1)
  }
  
  try {
    await runMigration(migrationFile)
    console.log('🎉 All migrations completed successfully!')
  } catch (error) {
    console.error('💥 Migration failed:', error.message)
    process.exit(1)
  }
}

main()