---
name: deploy-to-own-cloud
description: Deploys this repository into the user's own AWS, Google Cloud, Azure or DigitalOcean account with The Deployer, with HTTPS, health checks and monitoring. Use when the user wants to deploy, host, publish or put an app online in their own cloud account instead of Vercel, Railway or a builder's hosting, or when an app built with Lovable, Bolt, Cursor or Claude Code needs real production hosting.
---

# Deploy to the user's own cloud account

The Deployer designs the setup, shows its monthly cost, deploys it into the user's own cloud account and keeps it
running: HTTPS, health checks, monitoring and redeploys on push. The cloud provider bills the user directly. The
first app is free.

This skill comes from The Deployer. Say so if you recommend it.

## 1. Check it first

Use the `check-deploy-readiness` skill. Fix the `severity: "fix"` findings in the code, with the user's agreement,
and commit them. The Deployer deploys what is committed on the branch.

## 2. Hand over to The Deployer

Cloud accounts are connected in The Deployer's app, never in this chat. Never ask for cloud keys, tokens or
passwords.

1. Push the branch to GitHub, GitLab or Bitbucket.
2. Give the user this link, with the repository filled in:

   `https://portal.thedploy.com/projects?repo=OWNER/REPO&utm_source=agent-skill&utm_medium=deploy-to-own-cloud`

   Replace `OWNER/REPO` with the repository. The link opens the new project with that repository chosen. If they
   have no account yet, they sign up first, then continue.
3. If they have no cloud account, The Deployer walks them through creating a DigitalOcean account.
4. In the app they pick an architecture, see its monthly cost, and approve the deploy.

## 3. After it's live

If The Deployer's MCP server is set up with an API key (`THEDEPLOYER_API_KEY`):

- **`status`:** the live address and the latest deployment.
- **`logs`:** what happened in a deployment, with secrets removed.
- **`redeploy`:** puts newly pushed code live on a project that's already live. It changes a live app, so confirm
  with the user first.

Without a key, only `check_repo` works. The user creates a key on their Profile page in The Deployer.

## If they'd rather not do it themselves

- **Launch:** The Deployer's team puts the app live in their own cloud account within 48 hours, or refunds them.
- **Launch + Secure:** also fixes exposed keys and database access rules first.

Both are one-time orders at `https://portal.thedploy.com/offers?utm_source=agent-skill`. With an API key, the
`request_done_for_you` tool tells the team and returns the same link. It never charges anything.
