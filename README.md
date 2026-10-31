# The Deployer for AI coding tools

Skills, a Claude Code plugin, a Cursor plugin and an MCP server that let your coding agent:

- **check** whether a repository will deploy, and fix what's missing
- **deploy** it into your own AWS, Google Cloud, Azure or DigitalOcean account end to end, with HTTPS, health checks and
  monitoring, asking you before anything that costs money
- **fix** a failed deployment, in your code when that's the cause, and retry
- **run** it afterwards: redeploys, env, domains, scaling, start and stop schedules, databases and access
- **move** an app off Heroku, Railway, Render or Vercel, with the old app kept as the rollback

Your cloud provider bills you directly, and your first app is free.

## Skills

| Skill | Use it when |
|---|---|
| `check-deploy-readiness` | "Will this deploy?", "Is this production ready?", or before going live |
| `deploy-to-own-cloud` | "Deploy this", "Host this in my own AWS or DigitalOcean" |
| `fix-failed-deployment` | "My deploy failed", "Why won't it start?" |
| `operate-live-app` | "Add my domain", "Scale it up", "Stop it at night", "Attach a database" |
| `migrate-off-platform` | The repository has a Procfile, app.json, render.yaml, railway.json or railway.toml, or you're leaving a platform |

## Install

**Any agent the `skills` CLI supports** (Claude Code, Cursor, Codex, GitHub Copilot, Gemini, Cline, Windsurf and more):

```sh
npx skills add Avinash147-1193/thedeployer-plugins
```

**Claude Code plugin** (skills plus the MCP server):

```sh
claude plugin marketplace add Avinash147-1193/thedeployer-plugins
claude plugin install thedeployer@thedeployer
```

**Cursor:** install **The Deployer** from the Cursor marketplace. To try it locally first, copy this folder to
`~/.cursor/plugins/local/thedeployer` and restart Cursor.

**Gemini CLI:**

```sh
gemini extensions install https://github.com/Avinash147-1193/thedeployer-plugins
```

## The MCP server

Every install above connects to `https://app.thedploy.com/mcp`. The first time the agent uses it, it opens The
Deployer in your browser: sign in and approve, and there's no key to create or paste. `check_repo` and `guide` work
before you sign in. You can also connect any agent from **Connections → Coding agents** in The Deployer.

An agent can't read your cloud credentials, your env values or billing, and anything that costs money waits for your
yes.

**Codex:**

```sh
codex mcp add thedeployer --url https://app.thedploy.com/mcp
```

For tools that can't sign in (or CI), create an API key on your Profile page and use the `thedeployer-mcp` npm
package with `THEDEPLOYER_API_KEY` set. Never put the key in a file you commit.

## Privacy

For a local repository, `thedeploy-check` sends a git archive of the committed files to The Deployer's check service:

- **Who can see it:** only that run.
- **How long it's kept:** the archive is deleted when the check finishes, and the report after seven days.
- **What it never sends:** uncommitted changes, ignored files or git history.

For a public repository, only its address is sent.

## License

MIT
