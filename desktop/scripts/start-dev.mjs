import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '../..')
const viteCli = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const electronBinary = require('electron')
const devServerUrl = 'http://127.0.0.1:5173'

const vite = spawn(process.execPath, [viteCli, '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
  cwd: projectRoot,
  stdio: 'inherit',
  windowsHide: true,
})

let desktop
let shuttingDown = false

vite.on('error', (error) => {
  console.error(`Could not launch Vite: ${error.message}`)
  stopAll()
  process.exitCode = 1
})

function stopChild(child) {
  if (child && child.exitCode === null) child.kill()
}

function stopAll(signal) {
  if (shuttingDown) return
  shuttingDown = true
  stopChild(desktop)
  stopChild(vite)
  if (signal) process.exitCode = 0
}

process.on('SIGINT', () => stopAll('SIGINT'))
process.on('SIGTERM', () => stopAll('SIGTERM'))

async function waitForVite() {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    if (vite.exitCode !== null) {
      throw new Error(`Vite exited before becoming ready (code ${vite.exitCode}).`)
    }

    try {
      const response = await fetch(devServerUrl, { signal: AbortSignal.timeout(1_000) })
      if (response.ok) return
    } catch {
      // Vite is still starting.
    }

    await delay(250)
  }

  throw new Error(`Vite did not become available at ${devServerUrl}.`)
}

try {
  await waitForVite()
  desktop = spawn(electronBinary, [projectRoot], {
    cwd: projectRoot,
    env: { ...process.env, VITE_DEV_SERVER_URL: devServerUrl },
    stdio: 'inherit',
    windowsHide: false,
  })

  desktop.on('error', (error) => {
    console.error(`Could not launch Electron: ${error.message}`)
    stopAll()
    process.exitCode = 1
  })

  desktop.on('exit', (code) => {
    const wasAlreadyShuttingDown = shuttingDown
    stopAll()
    if (!wasAlreadyShuttingDown) process.exitCode = code ?? 1
  })
} catch (error) {
  stopAll()
  console.error(error.message)
  process.exitCode = 1
}
