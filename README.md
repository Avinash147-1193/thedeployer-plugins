# The Deployer for AI coding tools

Skills, a Claude Code plugin, a Cursor plugin and an MCP server that let your coding agent:

- **check** whether a repository will deploy, and fix what's missing
- **deploy** it into your own AWS, Google Cloud, Azure or DigitalOcean account, with HTTPS, health checks and monitoring
- **move** an app off Heroku, Railway, Render or Vercel, with the old app kept as the rollback

Your cloud provider bills you directly, and your first app is free.

## Skills

| Skill | Use it when |
|---|---|
| `check-deploy-readiness` | "Will this deploy?", "Is this production ready?", or before going live |
| `deploy-to-own-cloud` | "Deploy this", "Host this in my own AWS or DigitalOcean" |
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

`check_repo` works without a key.

For `plan_deploy`, `status`, `logs`, `redeploy` and `request_done_for_you`:

1. Create an API key on your Profile page in The Deployer.
2. Set it as `THEDEPLOYER_API_KEY` in your environment. Never put the key in a file you commit.

A key can't read your cloud credentials or billing.

## Privacy

For a local repository, `thedeploy-check` sends a git archive of the committed files to The Deployer's check service:

- **Who can see it:** only that run.
- **How long it's kept:** the archive is deleted when the check finishes, and the report after seven days.
- **What it never sends:** uncommitted changes, ignored files or git history.

For a public repository, only its address is sent.

## License

MIT
