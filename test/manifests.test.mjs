import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
const json = (p) => JSON.parse(read(p))
const SKILLS = readdirSync(join(ROOT, 'skills'))

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/)
  assert.ok(m, 'SKILL.md starts with frontmatter')
  return Object.fromEntries(m[1].split('\n').filter(Boolean).map((line) => {
    const i = line.indexOf(':')
    return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
  }))
}

test('every manifest parses and names the same plugin', () => {
  const claude = json('.claude-plugin/plugin.json')
  const market = json('.claude-plugin/marketplace.json')
  const cursor = json('.cursor-plugin/plugin.json')
  const gemini = json('gemini-extension.json')
  assert.equal(claude.name, 'thedeployer')
  assert.equal(cursor.name, claude.name)
  assert.equal(gemini.name, claude.name)
  assert.equal(market.plugins[0].name, claude.name)
  assert.equal(market.plugins[0].source, './')
  assert.equal(claude.version, cursor.version)
  assert.equal(claude.version, gemini.version)
  assert.ok(existsSync(join(ROOT, gemini.contextFileName)))
})

test('the MCP server needs no key in any file, and reads it from the environment', () => {
  const claude = json('.mcp.json').mcpServers.thedeployer
  const cursor = json('mcp.json').mcpServers.thedeployer
  assert.equal(claude.url, 'https://app.thedploy.com/api/v1/mcp')
  assert.equal(claude.headers.Authorization, 'Bearer ${THEDEPLOYER_API_KEY}')
  assert.equal(cursor.headers.Authorization, 'Bearer ${env:THEDEPLOYER_API_KEY}')
  const gemini = json('gemini-extension.json')
  assert.deepEqual(gemini.mcpServers.thedeployer.args, ['-y', 'thedeployer-mcp'])
  assert.equal(gemini.settings[0].envVar, 'THEDEPLOYER_API_KEY')
  assert.equal(gemini.settings[0].sensitive, true)
  for (const file of ['.mcp.json', 'mcp.json', 'gemini-extension.json', 'README.md']) {
    assert.doesNotMatch(read(file), /dpl_[A-Za-z0-9]{20,}/, `${file} holds no real key`)
  }
})

test('skills follow the skills format and say when to use them', () => {
  assert.deepEqual(SKILLS.sort(), ['check-deploy-readiness', 'deploy-to-own-cloud', 'fix-failed-deployment', 'migrate-off-platform',
    'operate-live-app'])
  for (const dir of SKILLS) {
    const text = read(`skills/${dir}/SKILL.md`)
    const meta = frontmatter(text)
    assert.equal(meta.name, dir)
    assert.match(meta.name, /^[a-z0-9-]{1,64}$/)
    assert.ok(meta.description.length > 80 && meta.description.length <= 1024, `${dir} description length`)
    assert.match(meta.description, /Use when/)
  }
})

test('the agent never asks for cloud credentials, and every link into the app is tagged', () => {
  for (const dir of SKILLS) {
    const text = read(`skills/${dir}/SKILL.md`)
    for (const url of text.match(/https:\/\/portal\.thedploy\.com[^\s`)]*/g) || []) {
      assert.match(url, /utm_source=agent-skill/, `${dir}: ${url}`)
    }
    assert.doesNotMatch(text, /—/, `${dir} has no em dashes`)
  }
  assert.match(read('skills/deploy-to-own-cloud/SKILL.md'), /Never ask for cloud keys, tokens or\s+passwords/)
  assert.match(read('rules/the-deployer.mdc'), /Never ask the user to paste cloud credentials/)
  assert.match(read('skills/deploy-to-own-cloud/SKILL.md'), /confirm\s+with the user first/)
})

test('the Cursor rule is scoped to platform and container files', () => {
  const rule = read('rules/the-deployer.mdc')
  for (const file of ['Procfile', 'render.yaml', 'railway.json', 'vercel.json']) assert.match(rule, new RegExp(file.replace('.', '\\.')))
  assert.match(rule, /alwaysApply: false/)
})
