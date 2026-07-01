import { createRequire } from 'node:module'
import { mkdir, readdir, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { chromium } from 'playwright'

const require = createRequire(import.meta.url)
const ffmpeg = require('@ffmpeg-installer/ffmpeg')

const root = process.cwd()
const outputDir = path.join(root, 'exports')
const tempDir = path.join(root, '.export-tmp')
const port = Number(process.env.EXPORT_PORT ?? 4173)
const baseUrl = `http://127.0.0.1:${port}`
const width = Number(process.env.EXPORT_WIDTH ?? 1920)
const height = Number(process.env.EXPORT_HEIGHT ?? 1080)
const durationSeconds = Number(process.env.EXPORT_DURATION ?? 40)
const takeCount = Number(process.env.EXPORT_COUNT ?? 3)
const promoSlug = process.env.EXPORT_PROMO ?? 'creator-project-manager'

function waitForServer(url) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now()
    const tick = async () => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          resolve()
          return
        }
      } catch {
        // Vite is still starting.
      }

      if (Date.now() - startedAt > 15000) {
        reject(new Error(`Timed out waiting for ${url}`))
        return
      }

      setTimeout(tick, 250)
    }

    tick()
  })
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} exited with code ${code}`))
    })
  })
}

async function startPreview() {
  const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
  const child = spawn(process.execPath, [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (data) => process.stdout.write(data))
  child.stderr.on('data', (data) => process.stderr.write(data))
  await waitForServer(baseUrl)
  return child
}

async function latestWebmFile(dir) {
  const files = await readdir(dir)
  const webmFiles = files.filter((file) => file.endsWith('.webm'))
  if (webmFiles.length === 0) {
    throw new Error('No WebM recording was created.')
  }
  return path.join(dir, webmFiles[webmFiles.length - 1])
}

async function exportTake(browser, takeNumber) {
  const takeName = `${promoSlug}-take-${String(takeNumber).padStart(2, '0')}`
  const takeTempDir = path.join(tempDir, takeName)
  const mp4Path = path.join(outputDir, `${takeName}-1920x1080.mp4`)

  await rm(takeTempDir, { force: true, recursive: true })
  await mkdir(takeTempDir, { recursive: true })

  const context = await browser.newContext({
    deviceScaleFactor: 1,
    recordVideo: {
      dir: takeTempDir,
      size: { width, height },
    },
    viewport: { width, height },
  })

  const page = await context.newPage()
  await page.goto(`${baseUrl}/?promo=${promoSlug}&export=1`, { waitUntil: 'networkidle' })
  await page.waitForTimeout((durationSeconds + 0.75) * 1000)
  await context.close()

  const webmPath = await latestWebmFile(takeTempDir)
  await run(ffmpeg.path, [
    '-y',
    '-i',
    webmPath,
    '-t',
    String(durationSeconds),
    '-vf',
    `fps=60,scale=${width}:${height}:flags=lanczos,format=yuv420p`,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '18',
    '-movflags',
    '+faststart',
    mp4Path,
  ])

  return mp4Path
}

await mkdir(outputDir, { recursive: true })
await mkdir(tempDir, { recursive: true })

const preview = await startPreview()
const browser = await chromium.launch({
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
})

try {
  const outputs = []
  for (let takeNumber = 1; takeNumber <= takeCount; takeNumber += 1) {
    outputs.push(await exportTake(browser, takeNumber))
  }
  console.log('\nExported MP4 files:')
  for (const output of outputs) {
    console.log(`- ${output}`)
  }
} finally {
  await browser.close()
  preview.kill('SIGTERM')
}
