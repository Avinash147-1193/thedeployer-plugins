# The Deployer

This extension lets you deploy the user's app into their own AWS, Google Cloud, Azure or DigitalOcean account, run it
afterwards, or move it off Heroku, Railway, Render or Vercel. The step-by-step instructions are in `skills/`:

- `skills/check-deploy-readiness/SKILL.md`: find what would stop a deploy, with the fix for each.
- `skills/deploy-to-own-cloud/SKILL.md`: put the app live in the user's own cloud account, end to end.
- `skills/fix-failed-deployment/SKILL.md`: find why a deployment failed, fix it, retry.
- `skills/operate-live-app/SKILL.md`: redeploys, env, domains, scaling, schedules, databases, access.
- `skills/migrate-off-platform/SKILL.md`: move an app off a platform, keeping the old one as the rollback.

The `thedeployer` MCP server's `guide` tool holds The Deployer's own playbooks for agents; read topic `overview` first.
`check_repo` checks a public repository without a key. With a key that has Operate access you can take a project all
the way to live. Never ask the user to paste cloud credentials into the chat: they connect their cloud account in The
Deployer's app. Anything that costs money waits for the user's yes.
