# The Deployer

This extension helps you deploy the user's app into their own AWS, Google Cloud, Azure or DigitalOcean account, or
move it off Heroku, Railway, Render or Vercel. The step-by-step instructions are in `skills/`:

- `skills/check-deploy-readiness/SKILL.md`: find what would stop a deploy, with the fix for each.
- `skills/deploy-to-own-cloud/SKILL.md`: put the app live in the user's own cloud account.
- `skills/migrate-off-platform/SKILL.md`: move an app off a platform, keeping the old one as the rollback.

The `thedeployer` MCP server's `check_repo` tool checks a public repository without a key. Never ask the user to paste
cloud credentials into the chat: they connect their cloud account in The Deployer's app.
