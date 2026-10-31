#!/usr/bin/env node
// The Deployer's listener: tells the coding agent in this session when The Deployer hands it a code problem
// (a "fix request"), so a deploy that stops on the code gets fixed without anyone copying errors back and forth.
//
// Claude Code runs this as a plugin monitor (monitors/monitors.json): every line it prints reaches Claude as a
// notification. So it prints only The Deployer's own sentences (a fix request id, its project and what to do),
// never a log line or anything from a repository, and the agent reads the details through the MCP fix tool.
//
// First run: it shows a short code to approve in The Deployer (with your password), then keeps an inbox token in
// ~/.config/thedeployer/listener.json (readable by you only). The token can only hear which fix requests changed:
// The Deployer refuses it everywhere else. Disconnect it on the Connections page, or run this with --logout.
//
//   THEDEPLOYER_URL   The Deployer's address, when it isn't https://app.thedploy.com
//
// No dependencies; Node.js 18 or newer.

import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, hostname } from 'node:os'
import { join } from 'node:path'

const DEFAULT_BASE = 'https://app.thedploy.com'
const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]'])
const DIR = join(homedir(), '.config', 'thedeployer')
const FILE = join(DIR, 'listener.json')

function say(line) {
  // One line, printable, capped: this text becomes part of the agent's prompt.
  const clean = String(line).replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g, ' ')
  process.stdout.write(clean.slice(0, 600) + '\n')
}

function warn(text) {
  process.stderr.write(`thedeployer-listen: ${text}\n`)
}

function baseUrl() {
  const raw = (process.env.THEDEPLOYER_URL || DEFAULT_BASE).trim().replace(/\/+$/, '')
  let url
  try {
    url = new URL(raw)
  } catch {
    warn("THEDEPLOYER_URL isn't a valid address.")
    process.exit(0)
  }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && LOOPBACK.has(url.hostname))) {
    warn('THEDEPLOYER_URL must start with https:// (plain http only for localhost).')
    process.exit(0)
  }
  if (url.username || url.password) {
    warn("THEDEPLOYER_URL can't contain a user name or password.")
    process.exit(0)
  }
  return url.origin + url.pathname.replace(/\/+$/, '')
}

const BASE = baseUrl()

function loadToken() {
  try {
    const saved = JSON.parse(readFileSync(FILE, 'utf8'))
    return saved && saved.base === BASE && /^dpi_[A-Za-z0-9_-]{20,}$/.test(saved.token || '') ? saved.token : ''
  } catch {
    return ''
  }
}

function saveToken(token) {
  mkdirSync(DIR, { recursive: true, mode: 0o700 })
  writeFileSync(FILE, JSON.stringify({ base: BASE, token }), { mode: 0o600 })
  chmodSync(FILE, 0o600)
}

function forget() {
  if (existsSync(FILE)) rmSync(FILE)
}

if (process.argv.includes('--logout')) {
  forget()
  warn('Signed out. Disconnect the listener on the Connections page too, to revoke its token.')
  process.exit(0)
}

// The repository this session works in, so only its project's fix requests are told here.
function currentRepo() {
  try {
    const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8', timeout: 5000,
      stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    const m = remote.match(/(?:github\.com|gitlab\.com|bitbucket\.org)[:/]([^/\s]+\/[^/\s]+?)(?:\.git)?\/?$/i)
    return m ? m[1] : ''
  } catch {
    return ''
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function form(path, fields) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams(fields).toString(),
    redirect: 'error',
  })
  let data = {}
  try {
    data = await res.json()
  } catch {
    // an answer without JSON counts as a refusal below
  }
  return { status: res.status, data }
}

async function signIn() {
  const name = `Listener on ${hostname().slice(0, 60)}`
  const start = await form('/oauth/device_authorization', { client_name: name })
  if (start.status !== 200 || !start.data.device_code) {
    warn(`couldn't start signing in (${start.status}).`)
    return ''
  }
  const { device_code: deviceCode, user_code: code, verification_uri_complete: link } = start.data
  let interval = Math.max(5, Number(start.data.interval) || 5) * 1000
  const until = Date.now() + (Number(start.data.expires_in) || 600) * 1000
  say(`The Deployer: to hear here when a deploy stops on a code problem, ask the person to open ${link} and approve the code ${code}.`)
  while (Date.now() < until) {
    await sleep(interval)
    let answer
    try {
      answer = await form('/oauth/token', { grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: deviceCode })
    } catch {
      continue
    }
    if (answer.status === 200 && answer.data.access_token) {
      saveToken(answer.data.access_token)
      say('The Deployer listener is connected: when a deploy stops on a code problem in this repository, it will say so here.')
      return answer.data.access_token
    }
    const error = answer.data.error
    if (error === 'slow_down') interval += 5000
    else if (error !== 'authorization_pending') {
      warn(`signing in stopped: ${error || answer.status}.`)
      return ''
    }
  }
  warn('the code expired before it was approved.')
  return ''
}

async function listen(token, repo) {
  const told = new Map()
  let backoff = 5000
  for (;;) {
    let res
    try {
      res = await fetch(`${BASE}/api/v1/agent-inbox/stream?repo=${encodeURIComponent(repo)}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
        redirect: 'error',
      })
    } catch {
      await sleep(backoff)
      backoff = Math.min(backoff * 2, 60000)
      continue
    }
    if (res.status === 401) {
      forget()
      say('The Deployer listener was disconnected. It signs in again next session.')
      return
    }
    if (res.status !== 200 || !res.body) {
      await sleep(backoff)
      backoff = Math.min(backoff * 2, 60000)
      continue
    }
    backoff = 5000
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    try {
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let cut
        while ((cut = buffer.indexOf('\n\n')) >= 0) {
          const block = buffer.slice(0, cut)
          buffer = buffer.slice(cut + 2)
          if (buffer.length > 100000) buffer = ''
          let event = ''
          let data = ''
          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) event = line.slice(7)
            else if (line.startsWith('data: ')) data += line.slice(6)
          }
          if (event !== 'fix' || !data) continue
          let item
          try {
            item = JSON.parse(data)
          } catch {
            continue
          }
          if (!/^fr_[A-Za-z0-9]{6,20}$/.test(item.id || '')) continue
          const key = `${item.status}|${item.message}`
          if (told.get(item.id) === key) continue
          told.set(item.id, key)
          say(item.message || `The Deployer: fix request ${item.id} changed. Call the thedeployer fix tool with id ${item.id}.`)
        }
      }
    } catch {
      // the stream broke: connect again
    }
    await sleep(2000)
  }
}

const token = loadToken() || await signIn()
if (token) await listen(token, currentRepo())
