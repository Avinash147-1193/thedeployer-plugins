---
name: check-deploy-readiness
description: Checks whether this repository will deploy, and what to fix first. Use when the user asks "will this deploy", "is this production ready", what's missing before going live, or wants committed secrets and keys exposed to the browser found before shipping. Works for Next.js, Vite, Express, FastAPI, Django, Rails and more, including apps built with Lovable, Bolt, Cursor or Claude Code.
---

# Check deploy readiness

The Deployer's free check reads a repository and reports:

- **Services:** what it runs, and how each service builds, starts and listens.
- **Blockers:** what would stop a deploy, each with the fix.
- **Environment variables:** the ones the app needs.
- **Secrets:** committed secrets, and secret keys compiled into browser code.
- **Cost:** what it would cost a month in the user's own cloud account.

## Run it

1. **A local repository.** Tell the user the check sends a git archive of the committed files to The Deployer's
   free check service. It is private to this run and deleted after the check. Ask before running it. Then run:

   ```sh
   npx -y thedeploy-check . --json
   ```

   It needs git and Node.js 18 or newer. It checks committed files only, so mention any uncommitted changes.
2. **A public GitHub, GitLab or Bitbucket repository.** Use the `check_repo` tool from The Deployer's MCP server,
   or run `npx -y thedeploy-check github.com/owner/repo --json`. Nothing is uploaded.

## Read the result

- `result.verdict` is `auto` (ready), `partial` (almost ready) or `manual` (needs work).
- `result.report.findings`: items with `severity: "fix"` block a deploy. Each has a `fix`: a short `text`, and often
  a `file` and `code` to add. Offer to make these changes in the code yourself: they are small and specific (a
  health endpoint, listening on `0.0.0.0` instead of `localhost`, a missing lockfile).
- `result.report.env_needed` lists variables the user must supply. Never invent their values.
- `security.secrets` lists committed credentials by kind, file and line. Tell the user to revoke and rotate each one
  with its provider. Deleting the file isn't enough, because git history keeps it.
- `result.report.costs` is the monthly range per cloud, billed by the cloud provider directly.

## Keep it in CI

To stop a pull request that commits a secret:

```yaml
- uses: actions/checkout@v4
- uses: Avinash147-1193/deploy-check@v0
  with:
    fail-on: secrets
```

## Next step

When the check is clean, use the `deploy-to-own-cloud` skill.
